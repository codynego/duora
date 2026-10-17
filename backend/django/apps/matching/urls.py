from django.urls import path
from .views import MyDiscoveryProfileView, RoomRecommendationView

urlpatterns = [
    path('me/', MyDiscoveryProfileView.as_view()),
    path('recommendation/', RoomRecommendationView.as_view()),
]
