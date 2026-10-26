from rest_framework import serializers

from .models import SubscriptionMembership, SubscriptionOffer, SubscriptionService


class SubscriptionServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionService
        fields = ('id', 'name', 'slug', 'category', 'icon_label', 'icon_color', 'permitted_access_methods')


class SubscriptionOfferSerializer(serializers.ModelSerializer):
    service = SubscriptionServiceSerializer(read_only=True)

    class Meta:
        model = SubscriptionOffer
        fields = ('id', 'service', 'access_method', 'price', 'billing_period', 'seats_available', 'renewal_day')


class SubscriptionMembershipSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name', read_only=True)
    icon_label = serializers.SerializerMethodField()
    icon_color = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionMembership
        fields = (
            'id', 'name', 'custom_name', 'category', 'source', 'access_method', 'monthly_cost',
            'status', 'next_renewal', 'last_paid_at', 'icon_label', 'icon_color', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'source', 'last_paid_at', 'created_at', 'updated_at')

    def get_icon_label(self, obj):
        return obj.service.icon_label if obj.service else obj.display_name[:2].upper()

    def get_icon_color(self, obj):
        return obj.service.icon_color if obj.service else '#3157F5'

    def validate(self, attrs):
        if self.instance is None and not attrs.get('custom_name', '').strip():
            raise serializers.ValidationError({'custom_name': 'Enter a subscription name.'})
        return attrs
