from django.urls import path
from .admin_views import AdminOperationsView
from .views import (LogoutView, MeView, PasswordResetConfirmView, PasswordResetRequestView,
                    RateLimitedTokenObtainPairView, RateLimitedTokenRefreshView, RegisterView,
                    ResendVerificationView, VerifyEmailView)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('token/', RateLimitedTokenObtainPairView.as_view()),
    path('token/refresh/', RateLimitedTokenRefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', MeView.as_view()),
    path('password-reset/', PasswordResetRequestView.as_view()),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view()),
    path('verify-email/', VerifyEmailView.as_view()),
    path('resend-verification/', ResendVerificationView.as_view()),
    path('admin/operations/', AdminOperationsView.as_view()),
]
