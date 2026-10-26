from django.urls import path

from .views import MarketplaceOrderListView, MarketplaceReservationView, SellerOfferDetailView, SellerOfferListView, SubscriptionDashboardView, SubscriptionMembershipDetailView, SubscriptionMembershipListView, SubscriptionOfferListView, SubscriptionPreferenceView, SubscriptionServiceListView


urlpatterns = [
    path('dashboard/', SubscriptionDashboardView.as_view()),
    path('memberships/', SubscriptionMembershipListView.as_view()),
    path('memberships/<uuid:membership_id>/', SubscriptionMembershipDetailView.as_view()),
    path('offers/', SubscriptionOfferListView.as_view()),
    path('services/', SubscriptionServiceListView.as_view()),
    path('offers/mine/', SellerOfferListView.as_view()),
    path('offers/<uuid:offer_id>/', SellerOfferDetailView.as_view()),
    path('offers/<uuid:offer_id>/reserve/', MarketplaceReservationView.as_view()),
    path('orders/', MarketplaceOrderListView.as_view()),
    path('preferences/', SubscriptionPreferenceView.as_view()),
]
