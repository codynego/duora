import uuid

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


class Transaction(models.Model):
    class Kind(models.TextChoices):
        INCOME = 'income', 'Money in'
        EXPENSE = 'expense', 'Money out'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='transactions')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='financial_transactions')
    kind = models.CharField(max_length=8, choices=Kind.choices)
    description = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0.01)])
    category = models.CharField(max_length=60, blank=True)
    counterparty = models.CharField(max_length=100, blank=True)
    occurred_on = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-occurred_on', '-created_at')
        indexes = [models.Index(fields=('business', 'occurred_on'))]

    def __str__(self):
        return f'{self.kind}: {self.description}'
