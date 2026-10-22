from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from .identity import get_or_create_anonymous_identity, regenerate_anonymous_avatar, regenerate_anonymous_identity
from .serializers import MeSerializer, MeUpdateSerializer, RegisterSerializer

User = get_user_model()


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
        raw_refresh = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if not raw_refresh:
            return clear_auth_cookies(Response({'detail': 'Session expired.'}, status=status.HTTP_401_UNAUTHORIZED))
        try:
            refresh = RefreshToken(raw_refresh)
            refresh.blacklist()
            replacement = RefreshToken.for_user(User.objects.get(id=refresh['user_id']))
        except (TokenError, User.DoesNotExist):
            return clear_auth_cookies(Response({'detail': 'Session expired.'}, status=status.HTTP_401_UNAUTHORIZED))
        return set_auth_cookies(Response({'authenticated': True}), replacement)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = Response({'user': {'id': user.pk, 'username': user.username}}, status=status.HTTP_201_CREATED)
        return set_auth_cookies(response, refresh)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'data': MeSerializer(request.user).data})

    def patch(self, request):
        serializer = MeUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': MeSerializer(request.user).data})


class AnonymousIdentityRegenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        identity = regenerate_anonymous_identity(request.user)
        return Response({'data': {'username': identity.username, 'display_name': identity.display_name}})


class AnonymousAvatarRegenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        identity = regenerate_anonymous_avatar(request.user)
        return Response({'data': {'avatar_variant': identity.avatar_variant}})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'
    def post(self, request):
        # Deliberately generic: never reveal whether an address exists.
        return Response({'detail': 'If an account matches that email, reset instructions will be sent.'}, status=status.HTTP_202_ACCEPTED)
