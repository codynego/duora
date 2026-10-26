from django.urls import path

from .views import SubscriptionDashboardView, SubscriptionMembershipDetailView, SubscriptionMembershipListView, SubscriptionOfferListView, SubscriptionPreferenceView


urlpatterns = [
    path('dashboard/', SubscriptionDashboardView.as_view()),
    path('memberships/', SubscriptionMembershipListView.as_view()),
    path('memberships/<uuid:membership_id>/', SubscriptionMembershipDetailView.as_view()),
    path('offers/', SubscriptionOfferListView.as_view()),
    path('preferences/', SubscriptionPreferenceView.as_view()),
]
