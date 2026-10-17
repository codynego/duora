import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from apps.rooms.routing import websocket_urlpatterns
from apps.accounts.realtime import JwtSubprotocolAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(JwtSubprotocolAuthMiddleware(URLRouter(websocket_urlpatterns))),
})
