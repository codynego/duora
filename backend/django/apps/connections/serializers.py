from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ConnectionRequest

User = get_user_model()


class ConnectionRequestSerializer(serializers.ModelSerializer):
    person = serializers.SerializerMethodField()

    class Meta:
        model = ConnectionRequest
        fields = ('id', 'status', 'source', 'last_experience', 'created_at', 'person')

    def get_person(self, obj):
        request = self.context['request']
        person = obj.recipient if obj.requester_id == request.user.id else obj.requester
        return {'id': str(person.id), 'name': person.get_username(), 'initial': (person.get_username()[:1] or '?').upper()}


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
