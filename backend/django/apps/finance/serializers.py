from rest_framework import serializers

from .models import Business, Transaction


class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ('id', 'name', 'business_type', 'industry', 'country', 'currency', 'record_keeping', 'setup_choice', 'plan', 'opening_balance', 'created_at')
        read_only_fields = ('id', 'plan', 'created_at')
        extra_kwargs = {'opening_balance': {'required': False}}

    def validate_currency(self, value):
        value = value.upper()
        if len(value) != 3 or not value.isalpha():
            raise serializers.ValidationError('Use a three-letter currency code.')
        return value

    def validate_country(self, value):
        value = value.upper()
        if len(value) != 2 or not value.isalpha():
            raise serializers.ValidationError('Use a two-letter country code.')
        return value


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'kind', 'description', 'amount', 'category', 'counterparty', 'occurred_on', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value
