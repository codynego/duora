from django.urls import path
from .views import AnonymousAvatarRegenerateView, AnonymousIdentityRegenerateView, LogoutView, MeView, PasswordResetRequestView, RateLimitedTokenObtainPairView, RateLimitedTokenRefreshView, RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('token/', RateLimitedTokenObtainPairView.as_view()),
    path('token/refresh/', RateLimitedTokenRefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', MeView.as_view()),
    path('me/identity/regenerate/', AnonymousIdentityRegenerateView.as_view()),
    path('me/avatar/regenerate/', AnonymousAvatarRegenerateView.as_view()),
    path('password-reset/', PasswordResetRequestView.as_view()),
]
