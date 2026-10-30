from rest_framework import serializers
from decimal import Decimal

from django.db.models import Sum

from .models import Business, Contact, FinancialAccount, Obligation, Transaction
from .services.balances import financial_account_balance


class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ('id', 'name', 'business_type', 'industry', 'country', 'currency', 'record_keeping', 'setup_choice', 'whatsapp_number', 'whatsapp_marketing_opt_in', 'plan', 'opening_balance', 'created_at')
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
    transfer_account = serializers.PrimaryKeyRelatedField(queryset=FinancialAccount.objects.all(), required=False, allow_null=True)
    contact = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all(), required=False, allow_null=True)
    obligation = serializers.PrimaryKeyRelatedField(queryset=Obligation.objects.all(), required=False, allow_null=True)
    account_name = serializers.CharField(source='account.name', read_only=True, allow_null=True)
    transfer_account_name = serializers.CharField(source='transfer_account.name', read_only=True, allow_null=True)
    contact_name = serializers.CharField(source='contact.name', read_only=True, allow_null=True)
    obligation_description = serializers.CharField(source='obligation.description', read_only=True, allow_null=True)

    class Meta:
        model = Transaction
        fields = ('id', 'kind', 'description', 'amount', 'category', 'counterparty', 'account', 'account_name', 'transfer_account', 'transfer_account_name', 'contact', 'contact_name', 'obligation', 'obligation_description', 'occurred_on', 'occurred_at', 'is_voided', 'voided_at', 'void_reason', 'created_at', 'updated_at')
        read_only_fields = ('id', 'is_voided', 'voided_at', 'void_reason', 'created_at', 'updated_at')

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
        transfer_account = attrs.get('transfer_account')
        contact = attrs.get('contact')
        obligation = attrs.get('obligation')
        kind = attrs.get('kind')
        if business and account and account.business_id != business.id:
            raise serializers.ValidationError({'account': 'Choose an account in this business.'})
        if business and transfer_account and transfer_account.business_id != business.id:
            raise serializers.ValidationError({'transfer_account': 'Choose an account in this business.'})
        if business and contact and contact.business_id != business.id:
            raise serializers.ValidationError({'contact': 'Choose a contact in this business.'})
        if business and account and account.currency != business.currency:
            raise serializers.ValidationError({'account': 'The account currency must match the business primary currency.'})
        if kind == Transaction.Kind.TRANSFER:
            if not account or not transfer_account:
                raise serializers.ValidationError({'transfer_account': 'Choose both the account money leaves and the account receiving it.'})
            if account.pk == transfer_account.pk:
                raise serializers.ValidationError({'transfer_account': 'Choose a different destination account.'})
            if not account.is_active or not transfer_account.is_active:
                raise serializers.ValidationError({'account': 'Transfers require active accounts.'})
            if account.currency != transfer_account.currency:
                raise serializers.ValidationError({'transfer_account': 'Both accounts must use the same currency.'})
            if contact or obligation:
                raise serializers.ValidationError({'kind': 'Transfers cannot be linked to a customer, supplier, or outstanding balance.'})
        elif transfer_account:
            raise serializers.ValidationError({'transfer_account': 'A destination account is only used for transfers.'})
        if obligation:
            if obligation.business_id != business.id:
                raise serializers.ValidationError({'obligation': 'Choose a balance in this business.'})
            expected_kind = Transaction.Kind.INCOME if obligation.kind == Obligation.Kind.RECEIVABLE else Transaction.Kind.EXPENSE
            if kind != expected_kind:
                raise serializers.ValidationError({'kind': 'The payment direction must match the customer or supplier balance.'})
            if attrs.get('amount', 0) > obligation.balance:
                raise serializers.ValidationError({'amount': 'The payment cannot exceed the outstanding balance.'})
            if contact and contact.pk != obligation.contact_id:
                raise serializers.ValidationError({'contact': 'Choose the customer or supplier linked to this balance.'})
        if contact and ((kind == Transaction.Kind.INCOME and contact.kind != Contact.Kind.CUSTOMER)
                        or (kind == Transaction.Kind.EXPENSE and contact.kind != Contact.Kind.SUPPLIER)):
            raise serializers.ValidationError({'contact': 'Choose a customer for money received or a supplier for money paid.'})
        return attrs

class FinancialAccountSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = FinancialAccount
        fields = ('id', 'name', 'kind', 'currency', 'opening_balance', 'balance', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'balance', 'created_at', 'updated_at')

    def get_balance(self, obj):
        return financial_account_balance(obj)

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
        return obj.transactions.filter(is_voided=False).order_by('-occurred_on').values_list('occurred_on', flat=True).first()


class ObligationSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.name', read_only=True)

    class Meta:
        model = Obligation
        fields = ('id', 'contact', 'contact_name', 'kind', 'description', 'reference', 'amount', 'balance', 'due_date', 'status', 'affects_performance', 'created_at', 'updated_at')
        read_only_fields = ('id', 'contact_name', 'balance', 'status', 'created_at', 'updated_at')

    def validate(self, attrs):
        business = self.context['business']
        contact = attrs.get('contact', getattr(self.instance, 'contact', None))
        kind = attrs.get('kind', getattr(self.instance, 'kind', None))
        amount = attrs.get('amount', getattr(self.instance, 'amount', None))
        expected_contact_kind = Contact.Kind.CUSTOMER if kind == Obligation.Kind.RECEIVABLE else Contact.Kind.SUPPLIER
        if contact and (contact.business_id != business.id or contact.kind != expected_contact_kind):
            raise serializers.ValidationError({'contact': 'Choose a matching customer or supplier in this business.'})
        return attrs

    def create(self, validated_data):
        validated_data['balance'] = validated_data['amount']
        return super().create(validated_data)
