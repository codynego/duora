import uuid

from django.conf import settings
from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ('subscriptions', '0003_billing_types')]

    operations = [
        migrations.CreateModel(
            name='SubscriptionOrder',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('payment_pending', 'Payment pending'), ('paid', 'Paid'), ('provisioning', 'Provisioning'), ('active', 'Active'), ('cancelled', 'Cancelled'), ('refunded', 'Refunded')], default='payment_pending', max_length=24)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0)])),
                ('billing_type', models.CharField(choices=[('recurring', 'Recurring'), ('one_time', 'One-time')], max_length=16)),
                ('expires_at', models.DateTimeField()), ('paid_at', models.DateTimeField(blank=True, null=True)), ('provisioned_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True)),
                ('buyer', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='subscription_orders', to=settings.AUTH_USER_MODEL)),
                ('membership', models.OneToOneField(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name='marketplace_order', to='subscriptions.subscriptionmembership')),
                ('offer', models.ForeignKey(on_delete=models.deletion.PROTECT, related_name='orders', to='subscriptions.subscriptionoffer')),
            ],
            options={'ordering': ('-created_at',)},
        ),
        migrations.AddIndex(model_name='subscriptionorder', index=models.Index(fields=['buyer', 'status', 'created_at'], name='subscriptio_buyer_i_8f4863_idx')),
        migrations.AddIndex(model_name='subscriptionorder', index=models.Index(fields=['offer', 'status'], name='subscriptio_offer_i_0c8f97_idx')),
    ]
