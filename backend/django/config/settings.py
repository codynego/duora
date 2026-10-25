import os
from datetime import timedelta
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'unsafe-development-key-replace-before-production')
DEBUG = os.environ.get('DJANGO_DEBUG', 'true').lower() == 'true'
ALLOWED_HOSTS = [host.strip() for host in os.environ.get('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost,.vercel.app').split(',') if host.strip()]

if not DEBUG and (SECRET_KEY.startswith('unsafe-') or len(SECRET_KEY) < 32):
    raise RuntimeError('DJANGO_SECRET_KEY must be a strong secret in production.')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'apps.accounts',
    'apps.rooms',
    'apps.matching',
    'apps.connections',
    'apps.moderation',
    'apps.social',
    'apps.studio',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': {'context_processors': [
    'django.template.context_processors.request', 'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
]}}]
WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=0,
        conn_health_checks=True,
    )
}
if not DEBUG and DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
    raise RuntimeError('DATABASE_URL must point to Postgres in production.')
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Lagos'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

configured_cors_origins = [origin.strip() for origin in os.environ.get('DUORA_CORS_ORIGINS', 'http://127.0.0.1:3000,http://localhost:3000').split(',') if origin.strip()]
trusted_frontend_origins = ['https://dorah.me', 'https://www.dorah.me', 'https://duorah.vercel.app']
CORS_ALLOWED_ORIGINS = list(dict.fromkeys(configured_cors_origins + trusted_frontend_origins))
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
SECURE_SSL_REDIRECT = os.environ.get('DJANGO_SECURE_SSL_REDIRECT', 'false').lower() == 'true'
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31_536_000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('apps.accounts.authentication.CookieJWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_THROTTLE_CLASSES': ('rest_framework.throttling.UserRateThrottle', 'rest_framework.throttling.AnonRateThrottle'),
    'DEFAULT_THROTTLE_RATES': {'user': '120/minute', 'anon': '30/minute', 'room_join': '10/minute', 'login': '5/minute', 'token_refresh': '15/minute', 'registration': '20/hour', 'password_reset': '5/hour'},
    'DEFAULT_RENDERER_CLASSES': ('rest_framework.renderers.JSONRenderer',),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}

AUTH_ACCESS_COOKIE_NAME = os.environ.get('DUORA_ACCESS_COOKIE_NAME', 'duora_access')
AUTH_REFRESH_COOKIE_NAME = os.environ.get('DUORA_REFRESH_COOKIE_NAME', 'duora_refresh')
AUTH_COOKIE_SAMESITE = os.environ.get('DUORA_COOKIE_SAMESITE', 'Lax' if DEBUG else 'None')
AUTH_COOKIE_SECURE = not DEBUG
