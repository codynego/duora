from django.urls import path

from .views import BusinessListView, BusinessOverviewView, TransactionListView

urlpatterns = [
    path('businesses/', BusinessListView.as_view()),
    path('businesses/<uuid:business_id>/overview/', BusinessOverviewView.as_view()),
    path('businesses/<uuid:business_id>/transactions/', TransactionListView.as_view()),
]
