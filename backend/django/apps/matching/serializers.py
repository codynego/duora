from rest_framework import serializers
from .models import DiscoveryProfile


class DiscoveryProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscoveryProfile
        fields = ('id', 'intents', 'languages', 'interests', 'gender', 'city', 'is_discoverable', 'onboarding_completed', 'updated_at')
        read_only_fields = ('id', 'updated_at')

    def validate_intents(self, value):
        allowed = {choice.value for choice in DiscoveryProfile.Intent}
        if not value or not set(value).issubset(allowed):
            raise serializers.ValidationError('Choose at least one supported discovery intent.')
        return value

    def validate_gender(self, value):
        if value and value not in {choice.value for choice in DiscoveryProfile.Gender}:
            raise serializers.ValidationError('Choose a supported gender option.')
        return value
