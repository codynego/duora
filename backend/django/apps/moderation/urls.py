from django.urls import path
from .views import MyReportCreateView, SafetyExclusionListCreateView

urlpatterns = [
    path('exclusions/', SafetyExclusionListCreateView.as_view()),
    path('reports/', MyReportCreateView.as_view()),
]
