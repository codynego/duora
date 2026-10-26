from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static


def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'duora-django-api'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/discovery/', include('apps.matching.urls')),
    path('api/v1/safety/', include('apps.moderation.urls')),
    path('api/v1/connections/', include('apps.connections.urls')),
    path('api/v1/rooms/', include('apps.rooms.urls')),
    path('api/v1/social/', include('apps.social.urls')),
    path('api/v1/studio/', include('apps.studio.urls')),
    path('api/v1/subscriptions/', include('apps.subscriptions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
