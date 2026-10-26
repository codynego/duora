import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name='SubscriptionService',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)), ('slug', models.SlugField(max_length=110, unique=True)),
                ('category', models.CharField(choices=[('ai', 'AI'), ('creative', 'Creative'), ('productivity', 'Productivity'), ('learning', 'Learning'), ('entertainment', 'Entertainment'), ('other', 'Other')], default='other', max_length=24)),
                ('icon_label', models.CharField(blank=True, max_length=6)), ('icon_color', models.CharField(default='#3157F5', max_length=7)),
                ('permitted_access_methods', models.JSONField(blank=True, default=list)), ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True)),
            ], options={'ordering': ('name',)},
        ),
        migrations.CreateModel(
            name='SubscriptionOffer',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('access_method', models.CharField(choices=[('workspace_invitation', 'Workspace invitation'), ('team_seat', 'Team seat'), ('family_invitation', 'Family invitation'), ('member_profile', 'Member profile')], max_length=32)),
                ('price', models.DecimalField(decimal_places=2, max_digits=12, validators=[MinValueValidator(0)])), ('billing_period', models.CharField(default='monthly', max_length=12)),
                ('seats_total', models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])), ('seats_available', models.PositiveSmallIntegerField(validators=[MinValueValidator(0)])),
                ('renewal_day', models.PositiveSmallIntegerField(blank=True, null=True)), ('status', models.CharField(choices=[('draft', 'Draft'), ('pending_review', 'Pending review'), ('active', 'Active'), ('paused', 'Paused'), ('archived', 'Archived')], default='draft', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True)),
                ('seller', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='subscription_offers', to=settings.AUTH_USER_MODEL)),
                ('service', models.ForeignKey(on_delete=models.deletion.PROTECT, related_name='offers', to='subscriptions.subscriptionservice')),
            ], options={'ordering': ('service__name', 'price')},
        ),
        migrations.CreateModel(
            name='SubscriptionMembership',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('custom_name', models.CharField(blank=True, max_length=100)),
                ('category', models.CharField(choices=[('ai', 'AI'), ('creative', 'Creative'), ('productivity', 'Productivity'), ('learning', 'Learning'), ('entertainment', 'Entertainment'), ('other', 'Other')], default='other', max_length=24)),
                ('source', models.CharField(choices=[('marketplace', 'Marketplace'), ('manual', 'Manual')], default='manual', max_length=16)),
                ('access_method', models.CharField(blank=True, max_length=80)), ('monthly_cost', models.DecimalField(decimal_places=2, max_digits=12, validators=[MinValueValidator(0)])),
                ('status', models.CharField(choices=[('active', 'Active'), ('overdue', 'Overdue'), ('paused', 'Paused'), ('cancelled', 'Cancelled')], default='active', max_length=16)),
                ('next_renewal', models.DateField(blank=True, null=True)), ('last_paid_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True)),
                ('offer', models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name='memberships', to='subscriptions.subscriptionoffer')),
                ('service', models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name='memberships', to='subscriptions.subscriptionservice')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='subscription_memberships', to=settings.AUTH_USER_MODEL)),
            ], options={'ordering': ('next_renewal', 'created_at')},
        ),
        migrations.AddIndex(model_name='subscriptionmembership', index=models.Index(fields=['user', 'status', 'next_renewal'], name='subscriptio_user_id_47dbcd_idx')),
        migrations.AddConstraint(model_name='subscriptionoffer', constraint=models.CheckConstraint(condition=models.Q(('seats_available__lte', models.F('seats_total'))), name='offer_available_seats_not_over_total')),
    ]
