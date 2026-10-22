from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import serializers
from .models import ConnectionRequest, ConnectionThread

User = get_user_model()


class ConnectionRequestSerializer(serializers.ModelSerializer):
    person = serializers.SerializerMethodField()
    thread_id = serializers.SerializerMethodField()

    class Meta:
        model = ConnectionRequest
        fields = ('id', 'status', 'source', 'last_experience', 'created_at', 'person', 'thread_id')

    def get_person(self, obj):
        return {'id': '', 'name': 'Anonymous connection', 'initial': '?'}

    def get_thread_id(self, obj):
        if obj.source != ConnectionRequest.Source.AUTO_MATCH:
            return None
        request = self.context['request']
        person_id = obj.recipient_id if obj.requester_id == request.user.id else obj.requester_id
        thread = ConnectionThread.objects.filter(
            models.Q(user_one_id=request.user.id, user_two_id=person_id) |
            models.Q(user_one_id=person_id, user_two_id=request.user.id),
            room__isnull=True,
        ).order_by('-created_at').first()
        return str(thread.id) if thread else None


class ConnectionCreateSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    source = serializers.ChoiceField(choices=ConnectionRequest.Source.values, default=ConnectionRequest.Source.PROFILE)
    room_code = serializers.CharField(required=False, allow_blank=True, max_length=32)
    last_experience = serializers.CharField(required=False, allow_blank=True, max_length=120)

    def validate_recipient_id(self, value):
        if value == self.context['request'].user.id:
            raise serializers.ValidationError('You cannot connect with yourself.')
        if not User.objects.filter(pk=value).exists():
            raise serializers.ValidationError('That person could not be found.')
        return value
