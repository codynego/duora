import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0004_obligation_affects_performance_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='occurred_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='is_voided',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='transaction',
            name='voided_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='void_reason',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='transaction',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='voided_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='voided_financial_transactions', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='TransactionAudit',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action', models.CharField(choices=[('created', 'Created'), ('updated', 'Updated'), ('voided', 'Voided')], max_length=12)),
                ('changes', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='financial_transaction_audits', to=settings.AUTH_USER_MODEL)),
                ('transaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='audit_events', to='finance.transaction')),
            ],
            options={'ordering': ('-created_at',)},
        ),
    ]
