import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Business(models.Model):
    class Plan(models.TextChoices):
        FREE = 'free', 'Free'
        CONTROL = 'control', 'Control'
        INTELLIGENCE = 'intelligence', 'Intelligence'
        BUSINESS = 'business', 'Business'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='businesses')
    name = models.CharField(max_length=100)
    business_type = models.CharField(max_length=40)
    industry = models.CharField(max_length=60)
    country = models.CharField(max_length=2, default='NG')
    currency = models.CharField(max_length=3, default='NGN')
    record_keeping = models.CharField(max_length=20, blank=True)
    setup_choice = models.CharField(max_length=20, default='skipped')
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.FREE)
    opening_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('created_at',)

    def __str__(self):
        return self.name


class AiUsage(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='ai_usage')
    feature = models.CharField(max_length=40, default='intelligence_chat')
    period_start = models.DateField()
    used = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('business', 'feature', 'period_start'), name='finance_unique_ai_usage_period')]
        indexes = [models.Index(fields=('business', 'feature', 'period_start'))]


class Transaction(models.Model):
    class Kind(models.TextChoices):
        INCOME = 'income', 'Money in'
        EXPENSE = 'expense', 'Money out'
        TRANSFER = 'transfer', 'Account transfer'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='transactions')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='financial_transactions')
    kind = models.CharField(max_length=8, choices=Kind.choices)
    description = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    category = models.CharField(max_length=60, blank=True)
    counterparty = models.CharField(max_length=100, blank=True)
    account = models.ForeignKey('FinancialAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    transfer_account = models.ForeignKey('FinancialAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_transfers')
    contact = models.ForeignKey('Contact', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    obligation = models.ForeignKey('Obligation', on_delete=models.PROTECT, null=True, blank=True, related_name='payments')
    occurred_on = models.DateField()
    occurred_at = models.DateTimeField(null=True, blank=True)
    is_voided = models.BooleanField(default=False)
    voided_at = models.DateTimeField(null=True, blank=True)
    voided_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='voided_financial_transactions')
    void_reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-occurred_on', '-created_at')
        indexes = [models.Index(fields=('business', 'occurred_on'))]

    def __str__(self):
        return f'{self.kind}: {self.description}'


class TransactionAudit(models.Model):
    class Action(models.TextChoices):
        CREATED = 'created', 'Created'
        UPDATED = 'updated', 'Updated'
        VOIDED = 'voided', 'Voided'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='audit_events')
    action = models.CharField(max_length=12, choices=Action.choices)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='financial_transaction_audits')
    changes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)


class FinancialAccount(models.Model):
    class Kind(models.TextChoices):
        CASH = 'cash', 'Cash'
        BANK = 'bank', 'Bank account'
        OTHER = 'other', 'Other account'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=100)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.CASH)
    currency = models.CharField(max_length=3)
    opening_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class Contact(models.Model):
    class Kind(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        SUPPLIER = 'supplier', 'Supplier'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='contacts')
    kind = models.CharField(max_length=10, choices=Kind.choices)
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)
        constraints = [models.UniqueConstraint(fields=('business', 'kind', 'name'), name='finance_unique_contact_per_kind')]

    def __str__(self):
        return self.name


class Obligation(models.Model):
    class Kind(models.TextChoices):
        RECEIVABLE = 'receivable', 'Customer receivable'
        PAYABLE = 'payable', 'Supplier payable'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        PARTIAL = 'partial', 'Partially paid'
        DISPUTED = 'disputed', 'Disputed'
        SETTLED = 'settled', 'Settled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='obligations')
    contact = models.ForeignKey(Contact, on_delete=models.PROTECT, related_name='obligations')
    kind = models.CharField(max_length=12, choices=Kind.choices)
    description = models.CharField(max_length=160)
    reference = models.CharField(max_length=80, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    balance = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    affects_performance = models.BooleanField(default=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('due_date', 'created_at')
        indexes = [models.Index(fields=('business', 'kind', 'due_date'))]

    def __str__(self):
        return f'{self.get_kind_display()}: {self.description}'
