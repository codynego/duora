from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'duora-django-api'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health),
    path('api/v1/rooms/', include('apps.rooms.urls')),
]
