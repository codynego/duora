from django.conf import settings
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .security import is_trusted_origin


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate browsers from an HttpOnly cookie and API clients by bearer token."""

    def authenticate(self, request):
        header = self.get_header(request)
        if header:
            raw_token = self.get_raw_token(header)
            # A harmless marker preserves existing frontend call sites during the
            # cookie-auth migration. It is never accepted as a JWT.
            if raw_token and raw_token != b'cookie':
                try:
                    validated_token = self.get_validated_token(raw_token)
                    return self.get_user(validated_token), validated_token
                except exceptions.AuthenticationFailed:
                    return None

        raw_token = request.COOKIES.get(settings.AUTH_ACCESS_COOKIE_NAME)
        if not raw_token:
            return None
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            if not is_trusted_origin(request):
                raise exceptions.PermissionDenied('Invalid request origin.')
        try:
            validated_token = self.get_validated_token(raw_token)
        except exceptions.AuthenticationFailed:
            return None
        try:
            return self.get_user(validated_token), validated_token
        except exceptions.AuthenticationFailed:
            return None
