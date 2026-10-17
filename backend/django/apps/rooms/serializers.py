from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(source='memberships.count', read_only=True)

    class Meta:
        model = Room
        fields = ('code', 'slug', 'title', 'description', 'tone', 'status', 'max_members', 'members_count', 'duration_minutes', 'starts_at')
