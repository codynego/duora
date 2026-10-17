from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Report, SafetyExclusion
from .serializers import ReportSerializer, SafetyExclusionSerializer


class SafetyExclusionListCreateView(generics.ListCreateAPIView):
    serializer_class = SafetyExclusionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return SafetyExclusion.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MyReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
