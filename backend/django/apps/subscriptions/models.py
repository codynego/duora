import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class SubscriptionService(models.Model):
    """A service that Dorah has reviewed for catalogue or tracking use."""

    class Category(models.TextChoices):
        AI = 'ai', 'AI'
        CREATIVE = 'creative', 'Creative'
        PRODUCTIVITY = 'productivity', 'Productivity'
        LEARNING = 'learning', 'Learning'
        ENTERTAINMENT = 'entertainment', 'Entertainment'
        OTHER = 'other', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=110, unique=True)
    category = models.CharField(max_length=24, choices=Category.choices, default=Category.OTHER)
    icon_label = models.CharField(max_length=6, blank=True)
    icon_color = models.CharField(max_length=7, default='#3157F5')
    permitted_access_methods = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class SubscriptionOffer(models.Model):
    """A seller's reviewed, eligible offer. It never contains third-party credentials."""

    class AccessMethod(models.TextChoices):
        WORKSPACE_INVITATION = 'workspace_invitation', 'Workspace invitation'
        TEAM_SEAT = 'team_seat', 'Team seat'
        FAMILY_INVITATION = 'family_invitation', 'Family invitation'
        MEMBER_PROFILE = 'member_profile', 'Member profile'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING_REVIEW = 'pending_review', 'Pending review'
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        ARCHIVED = 'archived', 'Archived'

    class BillingType(models.TextChoices):
        RECURRING = 'recurring', 'Recurring'
        ONE_TIME = 'one_time', 'One-time'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription_offers')
    service = models.ForeignKey(SubscriptionService, on_delete=models.PROTECT, related_name='offers')
    access_method = models.CharField(max_length=32, choices=AccessMethod.choices)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    billing_type = models.CharField(max_length=16, choices=BillingType.choices, default=BillingType.RECURRING)
    billing_period = models.CharField(max_length=12, default='monthly')
    seats_total = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    seats_available = models.PositiveSmallIntegerField(validators=[MinValueValidator(0)])
    renewal_day = models.PositiveSmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('service__name', 'price')
        constraints = [models.CheckConstraint(condition=models.Q(seats_available__lte=models.F('seats_total')), name='offer_available_seats_not_over_total')]

    def __str__(self):
        return f'{self.service.name} · {self.seller_id}'


class SubscriptionMembership(models.Model):
    """A recurring subscription or one-time purchase a person tracks through Dorah."""

    class Source(models.TextChoices):
        MARKETPLACE = 'marketplace', 'Marketplace'
        MANUAL = 'manual', 'Manual'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        OVERDUE = 'overdue', 'Overdue'
        PAUSED = 'paused', 'Paused'
        CANCELLED = 'cancelled', 'Cancelled'

    class BillingType(models.TextChoices):
        RECURRING = 'recurring', 'Recurring'
        ONE_TIME = 'one_time', 'One-time'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription_memberships')
    service = models.ForeignKey(SubscriptionService, null=True, blank=True, on_delete=models.SET_NULL, related_name='memberships')
    offer = models.ForeignKey(SubscriptionOffer, null=True, blank=True, on_delete=models.SET_NULL, related_name='memberships')
    custom_name = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=24, choices=SubscriptionService.Category.choices, default=SubscriptionService.Category.OTHER)
    source = models.CharField(max_length=16, choices=Source.choices, default=Source.MANUAL)
    access_method = models.CharField(max_length=80, blank=True)
    monthly_cost = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    billing_type = models.CharField(max_length=16, choices=BillingType.choices, default=BillingType.RECURRING)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    next_renewal = models.DateField(null=True, blank=True)
    last_paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('next_renewal', 'created_at')
        indexes = [models.Index(fields=('user', 'status', 'next_renewal'))]

    @property
    def display_name(self):
        return self.service.name if self.service else self.custom_name

    def clean(self):
        from django.core.exceptions import ValidationError

        if not self.service and not self.custom_name.strip():
            raise ValidationError({'custom_name': 'Enter a subscription name.'})

    def __str__(self):
        return f'{self.display_name} · {self.user_id}'


class SubscriptionPreference(models.Model):
    """Private, user-owned delivery preferences for the subscriptions product."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription_preferences')
    renewal_reminders = models.BooleanField(default=True)
    weekly_spend_digest = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
