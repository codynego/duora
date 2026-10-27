from rest_framework import serializers
from django.db.models import Sum

from .models import Business, Contact, FinancialAccount, Obligation, Transaction


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
    account = serializers.PrimaryKeyRelatedField(queryset=FinancialAccount.objects.all(), required=False, allow_null=True)
    contact = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Transaction
        fields = ('id', 'kind', 'description', 'amount', 'category', 'counterparty', 'account', 'contact', 'occurred_on', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_occurred_on(self, value):
        from django.utils import timezone

        if value > timezone.localdate():
            raise serializers.ValidationError('A recorded transaction cannot have a future date.')
        return value

    def validate(self, attrs):
        business = self.context.get('business')
        account = attrs.get('account')
        contact = attrs.get('contact')
        if business and account and account.business_id != business.id:
            raise serializers.ValidationError({'account': 'Choose an account in this business.'})
        if business and contact and contact.business_id != business.id:
            raise serializers.ValidationError({'contact': 'Choose a contact in this business.'})
        if business and account and account.currency != business.currency:
            raise serializers.ValidationError({'account': 'The account currency must match the business primary currency.'})
        return attrs

class FinancialAccountSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = FinancialAccount
        fields = ('id', 'name', 'kind', 'currency', 'opening_balance', 'balance', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'balance', 'created_at', 'updated_at')

    def get_balance(self, obj):
        totals = obj.transactions.values('kind').annotate(total=Sum('amount'))
        by_kind = {row['kind']: row['total'] or 0 for row in totals}
        return obj.opening_balance + by_kind.get(Transaction.Kind.INCOME, 0) - by_kind.get(Transaction.Kind.EXPENSE, 0)

    def validate_currency(self, value):
        value = value.upper()
        if len(value) != 3 or not value.isalpha():
            raise serializers.ValidationError('Use a three-letter currency code.')
        return value

    def validate(self, attrs):
        business = self.context.get('business')
        if business and attrs.get('currency', business.currency) != business.currency:
            raise serializers.ValidationError({'currency': 'Accounts must use the business primary currency for now.'})
        return attrs


class ContactSerializer(serializers.ModelSerializer):
    outstanding_balance = serializers.SerializerMethodField()
    last_transaction_on = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = ('id', 'kind', 'name', 'email', 'phone', 'notes', 'outstanding_balance', 'last_transaction_on', 'created_at', 'updated_at')
        read_only_fields = ('id', 'outstanding_balance', 'last_transaction_on', 'created_at', 'updated_at')

    def get_outstanding_balance(self, obj):
        kind = Obligation.Kind.RECEIVABLE if obj.kind == Contact.Kind.CUSTOMER else Obligation.Kind.PAYABLE
        return obj.obligations.filter(kind=kind).exclude(status=Obligation.Status.SETTLED).aggregate(total=Sum('balance'))['total'] or 0

    def get_last_transaction_on(self, obj):
        return obj.transactions.order_by('-occurred_on').values_list('occurred_on', flat=True).first()


class ObligationSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.name', read_only=True)

    class Meta:
        model = Obligation
        fields = ('id', 'contact', 'contact_name', 'kind', 'description', 'reference', 'amount', 'balance', 'due_date', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'contact_name', 'created_at', 'updated_at')
        extra_kwargs = {'balance': {'required': False}}

    def validate(self, attrs):
        business = self.context['business']
        contact = attrs.get('contact', getattr(self.instance, 'contact', None))
        kind = attrs.get('kind', getattr(self.instance, 'kind', None))
        amount = attrs.get('amount', getattr(self.instance, 'amount', None))
        balance = attrs.get('balance', getattr(self.instance, 'balance', amount))
        if self.instance is None and 'balance' not in attrs and amount is not None:
            attrs['balance'] = amount
            balance = amount
        expected_contact_kind = Contact.Kind.CUSTOMER if kind == Obligation.Kind.RECEIVABLE else Contact.Kind.SUPPLIER
        if contact and (contact.business_id != business.id or contact.kind != expected_contact_kind):
            raise serializers.ValidationError({'contact': 'Choose a matching customer or supplier in this business.'})
        if amount is not None and balance is not None and balance > amount:
            raise serializers.ValidationError({'balance': 'The outstanding balance cannot exceed the original amount.'})
        if balance == 0 and 'status' not in attrs:
            attrs['status'] = Obligation.Status.SETTLED
        return attrs
