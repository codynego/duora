from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
import logging
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from .emailing import EmailDeliveryError, send_password_reset_email, send_verification_email
from .serializers import MeSerializer, MeUpdateSerializer, RegisterSerializer
from .security import reject_untrusted_origin

User = get_user_model()
logger = logging.getLogger(__name__)


def set_auth_cookies(response, refresh):
    response.set_cookie(settings.AUTH_ACCESS_COOKIE_NAME, str(refresh.access_token), max_age=15 * 60, httponly=True, secure=settings.AUTH_COOKIE_SECURE, samesite=settings.AUTH_COOKIE_SAMESITE)
    response.set_cookie(settings.AUTH_REFRESH_COOKIE_NAME, str(refresh), max_age=30 * 24 * 60 * 60, httponly=True, secure=settings.AUTH_COOKIE_SECURE, samesite=settings.AUTH_COOKIE_SAMESITE)
    return response


def clear_auth_cookies(response):
    response.delete_cookie(settings.AUTH_ACCESS_COOKIE_NAME, samesite=settings.AUTH_COOKIE_SAMESITE)
    response.delete_cookie(settings.AUTH_REFRESH_COOKIE_NAME, samesite=settings.AUTH_COOKIE_SAMESITE)
    return response


class RateLimitedTokenObtainPairView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        user = User.objects.filter(username=request.data.get('username', '')).first()
        if not user or not user.check_password(request.data.get('password', '')) or not user.is_active:
            return Response({'detail': 'No active account found with the given credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return set_auth_cookies(Response({'user': {'id': user.pk, 'username': user.username}}), refresh)


class RateLimitedTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'token_refresh'

    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        raw_refresh = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if not raw_refresh:
            return clear_auth_cookies(Response({'detail': 'Session expired.'}, status=status.HTTP_401_UNAUTHORIZED))
        try:
            refresh = RefreshToken(raw_refresh)
            refresh.blacklist()
            user = User.objects.get(id=refresh['user_id'])
            if not user.is_active:
                return clear_auth_cookies(Response({'detail': 'Session expired.'}, status=status.HTTP_401_UNAUTHORIZED))
            replacement = RefreshToken.for_user(user)
        except (TokenError, User.DoesNotExist):
            return clear_auth_cookies(Response({'detail': 'Session expired.'}, status=status.HTTP_401_UNAUTHORIZED))
        return set_auth_cookies(Response({'authenticated': True}), replacement)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        raw_refresh = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass
        return clear_auth_cookies(Response(status=status.HTTP_204_NO_CONTENT))


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'registration'
    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        verification_token = default_token_generator.make_token(user)
        verification_uid = urlsafe_base64_encode(force_bytes(user.pk))
        verification_url = f'{settings.DUORA_FRONTEND_URL}/verify-email?uid={verification_uid}&token={verification_token}'
        try:
            send_verification_email(user, verification_url)
        except EmailDeliveryError:
            logger.exception('Could not send verification email: user_id=%s', user.pk)
            return Response({'detail': 'Your account was created, but we could not send the verification email. Try again shortly.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'email': user.email, 'verification_required': True}, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'data': MeSerializer(request.user).data})

    def patch(self, request):
        serializer = MeUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': MeSerializer(request.user).data})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'
    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        email = str(request.data.get('email') or '').strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f'{settings.DUORA_FRONTEND_URL}/reset-password?uid={uid}&token={token}'
            try:
                send_password_reset_email(user, reset_url)
            except EmailDeliveryError:
                logger.exception('Could not send password reset email: user_id=%s', user.pk)
        # Deliberately generic: never reveal whether an address exists.
        return Response({'detail': 'If an account matches that email, reset instructions will be sent.'}, status=status.HTTP_202_ACCEPTED)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        email = str(request.data.get('email') or '').strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=False).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verification_url = f'{settings.DUORA_FRONTEND_URL}/verify-email?uid={uid}&token={token}'
            try:
                send_verification_email(user, verification_url)
            except EmailDeliveryError:
                logger.exception('Could not resend verification email: user_id=%s', user.pk)
        return Response({'detail': 'If an unverified account matches this email, a new verification link is on its way.'}, status=status.HTTP_202_ACCEPTED)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        try:
            user_id = force_str(urlsafe_base64_decode(str(request.data.get('uid') or '')))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, UnicodeDecodeError, User.DoesNotExist):
            return Response({'detail': 'This verification link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        token = str(request.data.get('token') or '')
        if user.is_active or not default_token_generator.check_token(user, token):
            return Response({'detail': 'This verification link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = True
        user.save(update_fields=('is_active',))
        refresh = RefreshToken.for_user(user)
        return set_auth_cookies(Response({'email': user.email, 'verified': True}), refresh)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        if rejected := reject_untrusted_origin(request):
            return rejected
        try:
            user_id = force_str(urlsafe_base64_decode(str(request.data.get('uid') or '')))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, UnicodeDecodeError, User.DoesNotExist):
            return Response({'detail': 'This reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        token = str(request.data.get('token') or '')
        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'This reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        password = str(request.data.get('password') or '')
        confirmation = str(request.data.get('password_confirm') or '')
        if password != confirmation:
            return Response({'password_confirm': ['Passwords do not match.']}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(password, user=user)
        except ValidationError as error:
            return Response({'password': list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save(update_fields=('password',))
        for outstanding in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=outstanding)
        return Response({'detail': 'Your password has been reset. You can sign in now.'})
