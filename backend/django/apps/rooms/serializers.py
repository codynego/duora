from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(source='memberships.count', read_only=True)

    class Meta:
        model = Room
        fields = ('id', 'code', 'slug', 'title', 'description', 'tone', 'intent', 'audience', 'city', 'status', 'max_members', 'members_count', 'duration_minutes', 'starts_at')


class PublicRoomCreateSerializer(serializers.Serializer):
    experience = serializers.ChoiceField(choices=('predict-my-answer', 'better-question', 'make-a-plan', 'truth-or-dare'))
    tone = serializers.ChoiceField(choices=('Easygoing', 'Playful', 'Thoughtful', 'Flirty'))
    audience = serializers.ChoiceField(choices=Room.Audience.values, default=Room.Audience.ADULTS)
    max_members = serializers.IntegerField(min_value=2, max_value=6)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_max_members(self, value):
        if value not in {2, 4, 6}:
            raise serializers.ValidationError('Choose 2, 4, or 6 people.')
        return value
