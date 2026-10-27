from django.urls import path

from .views import (BusinessListView, BusinessOverviewView, BusinessSettingsView, ContactListView,
                    FinanceInsightsView, FinancialAccountListView, ObligationListView,
                    PerformanceView, TransactionListView)

urlpatterns = [
    path('businesses/', BusinessListView.as_view()),
    path('businesses/<uuid:business_id>/', BusinessSettingsView.as_view()),
    path('businesses/<uuid:business_id>/overview/', BusinessOverviewView.as_view()),
    path('businesses/<uuid:business_id>/transactions/', TransactionListView.as_view()),
    path('businesses/<uuid:business_id>/accounts/', FinancialAccountListView.as_view()),
    path('businesses/<uuid:business_id>/contacts/', ContactListView.as_view()),
    path('businesses/<uuid:business_id>/obligations/', ObligationListView.as_view()),
    path('businesses/<uuid:business_id>/performance/', PerformanceView.as_view()),
    path('businesses/<uuid:business_id>/intelligence/', FinanceInsightsView.as_view()),
]
