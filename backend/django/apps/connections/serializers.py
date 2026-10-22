from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import serializers
from .models import ConnectionRequest, ConnectionThread
from apps.social.models import IdentityConsent
from apps.accounts.identity import get_or_create_anonymous_identity

User = get_user_model()


class ConnectionRequestSerializer(serializers.ModelSerializer):
    person = serializers.SerializerMethodField()
    thread_id = serializers.SerializerMethodField()
    my_reveal_consented = serializers.SerializerMethodField()
    other_reveal_consented = serializers.SerializerMethodField()
    reveal_ready = serializers.SerializerMethodField()

    class Meta:
        model = ConnectionRequest
        fields = ('id', 'status', 'source', 'last_experience', 'created_at', 'person', 'thread_id', 'my_reveal_consented', 'other_reveal_consented', 'reveal_ready')

    def get_person(self, obj):
        request = self.context.get('request')
        if not request:
            return {'id': '', 'name': 'Duora connection', 'username': '', 'initial': 'D'}
        person = obj.recipient if obj.requester_id == request.user.id else obj.requester
        identity = get_or_create_anonymous_identity(person)
        return {'id': '', 'name': identity.display_name, 'username': identity.username, 'initial': identity.display_name[:1].upper()}

    def get_thread_id(self, obj):
        if not self.get_reveal_ready(obj):
            return None
        request = self.context['request']
        person_id = obj.recipient_id if obj.requester_id == request.user.id else obj.requester_id
        thread = ConnectionThread.objects.filter(
            models.Q(user_one_id=request.user.id, user_two_id=person_id) |
            models.Q(user_one_id=person_id, user_two_id=request.user.id),
            room__isnull=True,
        ).order_by('-created_at').first()
        return str(thread.id) if thread else None

    def _consent(self, obj, user_id):
        return IdentityConsent.objects.filter(connection_request=obj, user_id=user_id, consented_at__isnull=False, revoked_at__isnull=True).exists()

    def get_my_reveal_consented(self, obj):
        request = self.context.get('request')
        return bool(request and self._consent(obj, request.user.id))

    def get_other_reveal_consented(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        other_id = obj.recipient_id if obj.requester_id == request.user.id else obj.requester_id
        return self._consent(obj, other_id)

    def get_reveal_ready(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        return self._consent(obj, obj.requester_id) and self._consent(obj, obj.recipient_id)


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
