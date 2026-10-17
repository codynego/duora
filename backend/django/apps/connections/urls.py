from django.urls import path
from .views import ConnectionDecisionView, ConnectionsView

urlpatterns = [
    path('', ConnectionsView.as_view()),
    path('<uuid:connection_id>/<str:decision>/', ConnectionDecisionView.as_view()),
]
