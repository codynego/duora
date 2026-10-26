from rest_framework import serializers

from .models import SubscriptionMembership, SubscriptionOffer, SubscriptionOrder, SubscriptionPreference, SubscriptionService


class SubscriptionServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionService
        fields = ('id', 'name', 'slug', 'category', 'icon_label', 'icon_color', 'permitted_access_methods')


class SubscriptionOfferSerializer(serializers.ModelSerializer):
    service = SubscriptionServiceSerializer(read_only=True)

    class Meta:
        model = SubscriptionOffer
        fields = ('id', 'service', 'access_method', 'price', 'billing_type', 'billing_period', 'seats_available', 'renewal_day')


class SubscriptionOfferWriteSerializer(serializers.ModelSerializer):
    service = SubscriptionServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(source='service', queryset=SubscriptionService.objects.filter(is_active=True), write_only=True)

    class Meta:
        model = SubscriptionOffer
        fields = ('id', 'service', 'service_id', 'access_method', 'price', 'billing_type', 'billing_period', 'seats_total', 'seats_available', 'renewal_day', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')

    def validate(self, attrs):
        service = attrs.get('service', getattr(self.instance, 'service', None))
        access_method = attrs.get('access_method', getattr(self.instance, 'access_method', None))
        if service and service.permitted_access_methods and access_method not in service.permitted_access_methods:
            raise serializers.ValidationError({'access_method': 'This access method is not approved for the selected service.'})
        if attrs.get('billing_type', getattr(self.instance, 'billing_type', None)) == SubscriptionOffer.BillingType.ONE_TIME:
            attrs['billing_period'] = 'one_time'
            attrs['renewal_day'] = None
        return attrs


class SubscriptionOrderSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='offer.service.name', read_only=True)
    access_method = serializers.CharField(source='offer.access_method', read_only=True)

    class Meta:
        model = SubscriptionOrder
        fields = ('id', 'status', 'amount', 'billing_type', 'expires_at', 'paid_at', 'provisioned_at', 'created_at', 'service_name', 'access_method')


class SubscriptionMembershipSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name', read_only=True)
    icon_label = serializers.SerializerMethodField()
    icon_color = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionMembership
        fields = (
            'id', 'name', 'custom_name', 'category', 'source', 'access_method', 'monthly_cost', 'billing_type',
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
        billing_type = attrs.get('billing_type', self.instance.billing_type if self.instance else SubscriptionMembership.BillingType.RECURRING)
        if billing_type == SubscriptionMembership.BillingType.ONE_TIME:
            attrs['next_renewal'] = None
        return attrs


class SubscriptionPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPreference
        fields = ('id', 'renewal_reminders', 'weekly_spend_digest', 'updated_at')
        read_only_fields = ('id', 'updated_at')
