from django.conf import settings
from rest_framework.response import Response
from rest_framework import status


def is_trusted_origin(request):
    """Allow non-browser API clients while rejecting cross-site browser writes."""
    origin = request.headers.get('Origin')
    return not origin or origin in settings.CORS_ALLOWED_ORIGINS


def reject_untrusted_origin(request):
    if is_trusted_origin(request):
        return None
    return Response({'detail': 'This request origin is not allowed.'}, status=status.HTTP_403_FORBIDDEN)
