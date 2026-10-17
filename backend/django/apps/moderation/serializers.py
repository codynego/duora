from rest_framework import serializers
from .models import Report, SafetyExclusion


class SafetyExclusionSerializer(serializers.ModelSerializer):
    excluded_user_id = serializers.IntegerField(source='excluded_user_id')
    class Meta:
        model = SafetyExclusion
        fields = ('id', 'excluded_user_id', 'reason', 'created_at')
        read_only_fields = ('id', 'created_at')


class ReportSerializer(serializers.ModelSerializer):
    reported_user_id = serializers.IntegerField(source='reported_user_id')
    room_id = serializers.UUIDField(required=False, allow_null=True, source='room_id')
    class Meta:
        model = Report
        fields = ('id', 'reported_user_id', 'room_id', 'reason', 'details', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')
