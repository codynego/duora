from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'duora-django-api'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/discovery/', include('apps.matching.urls')),
    path('api/v1/safety/', include('apps.moderation.urls')),
    path('api/v1/rooms/', include('apps.rooms.urls')),
]
