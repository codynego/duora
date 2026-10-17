from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


@database_sync_to_async
def user_from_token(raw_token):
    try:
        auth = JWTAuthentication()
        token = auth.get_validated_token(raw_token)
        return auth.get_user(token)
    except Exception:
        return AnonymousUser()


class JwtSubprotocolAuthMiddleware:
    """Authenticates browser sockets from `new WebSocket(url, ['bearer', accessToken])`."""
    def __init__(self, app): self.app = app

    async def __call__(self, scope, receive, send):
        protocols = scope.get('subprotocols', [])
        scope['user'] = await user_from_token(protocols[1]) if len(protocols) == 2 and protocols[0] == 'bearer' else AnonymousUser()
        return await self.app(scope, receive, send)
