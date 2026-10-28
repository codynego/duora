from django.urls import path

from .views import (BusinessListView, BusinessOverviewView, BusinessSettingsView, ContactListView,
                    FinanceInsightsView, FinancialAccountListView, IntelligenceChatView, ObligationDetailView, ObligationListView,
                    PerformanceView, TransactionDetailView, TransactionListView, TransactionParseView)

urlpatterns = [
    path('businesses/', BusinessListView.as_view()),
    path('businesses/<uuid:business_id>/', BusinessSettingsView.as_view()),
    path('businesses/<uuid:business_id>/overview/', BusinessOverviewView.as_view()),
    path('businesses/<uuid:business_id>/transactions/', TransactionListView.as_view()),
    path('businesses/<uuid:business_id>/transactions/parse/', TransactionParseView.as_view()),
    path('businesses/<uuid:business_id>/transactions/<uuid:transaction_id>/', TransactionDetailView.as_view()),
    path('businesses/<uuid:business_id>/accounts/', FinancialAccountListView.as_view()),
    path('businesses/<uuid:business_id>/contacts/', ContactListView.as_view()),
    path('businesses/<uuid:business_id>/obligations/', ObligationListView.as_view()),
    path('businesses/<uuid:business_id>/obligations/<uuid:obligation_id>/', ObligationDetailView.as_view()),
    path('businesses/<uuid:business_id>/performance/', PerformanceView.as_view()),
    path('businesses/<uuid:business_id>/intelligence/', FinanceInsightsView.as_view()),
    path('businesses/<uuid:business_id>/intelligence/chat/', IntelligenceChatView.as_view()),
]
