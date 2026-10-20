from django.urls import path
from .views import AutoMatchView, MyDiscoveryProfileView, RoomRecommendationView

urlpatterns = [
    path('me/', MyDiscoveryProfileView.as_view()),
    path('recommendation/', RoomRecommendationView.as_view()),
    path('auto-match/', AutoMatchView.as_view()),
]
