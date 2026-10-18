from django.urls import path
from .views import ConnectionDecisionView, ConnectionsView, ThreadMessageView, ThreadsView

urlpatterns = [
    path('', ConnectionsView.as_view()),
    path('threads/', ThreadsView.as_view()),
    path('threads/<uuid:thread_id>/messages/', ThreadMessageView.as_view()),
    path('<uuid:connection_id>/<str:decision>/', ConnectionDecisionView.as_view()),
]
