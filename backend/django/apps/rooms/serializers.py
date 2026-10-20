from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()

    def get_members_count(self, room):
        return room.memberships.filter(disposition='present').count()

    class Meta:
        model = Room
        fields = ('id', 'code', 'slug', 'title', 'description', 'experience', 'tone', 'intent', 'mode', 'audience', 'city', 'is_discovery_room', 'status', 'archived_at', 'max_members', 'members_count', 'duration_minutes', 'starts_at')


class PublicRoomCreateSerializer(serializers.Serializer):
    experience = serializers.ChoiceField(choices=(
        'most-likely-to', 'truth-or-dare', 'guess-my-answer', 'word-battle', 'build-a-story',
        'open-conversation', 'guided-conversation', 'debate', 'quick-takes',
        'plan-something-together', 'shared-challenges', 'date-night-anywhere',
        'predict-my-answer', 'better-question', 'make-a-plan', 'first-spark', 'story-thread',
    ))
    tone = serializers.ChoiceField(choices=('Easygoing', 'Playful', 'Thoughtful', 'Flirty'))
    audience = serializers.ChoiceField(choices=Room.Audience.values, default=Room.Audience.ADULTS)
    max_members = serializers.IntegerField(min_value=2, max_value=10)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    topic = serializers.CharField(max_length=120, required=False, allow_blank=True)
    discussion_description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    starts_at = serializers.DateTimeField(required=False, allow_null=True, default=None)
    duration_minutes = serializers.IntegerField(min_value=0, required=False, default=None)

    def validate_duration_minutes(self, value):
        if value not in {0, 10, 30, 60}:
            raise serializers.ValidationError('Choose 10, 30, 60 minutes, or untimed.')
        return value

    def validate_max_members(self, value):
        if value not in {2, 4, 6, 8, 10}:
            raise serializers.ValidationError('Choose 2, 4, 6, 8, or 10 people.')
        return value
