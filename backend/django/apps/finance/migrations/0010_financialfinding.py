import uuid

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0009_rename_finance_aius_business_2e6e3d_idx_finance_aiu_busines_89d6d2_idx'),
    ]

    operations = [
        migrations.CreateModel(
            name='FinancialFinding',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('fingerprint', models.CharField(max_length=180)),
                ('finding_type', models.CharField(max_length=80)),
                ('severity', models.CharField(max_length=12)),
                ('status', models.CharField(choices=[('new', 'Needs attention'), ('planning', 'Under review'), ('resolved', 'Resolved')], default='new', max_length=12)),
                ('feedback', models.CharField(blank=True, choices=[('', 'No feedback'), ('useful', 'Useful'), ('not_relevant', 'Not relevant'), ('handled', 'Already handled')], default='', max_length=20)),
                ('content_hash', models.CharField(max_length=64)),
                ('payload', models.JSONField(default=dict)),
                ('is_active', models.BooleanField(default=True)),
                ('first_seen_at', models.DateTimeField(auto_now_add=True)),
                ('last_seen_at', models.DateTimeField()),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('business', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='financial_findings', to='finance.business')),
            ],
            options={
                'ordering': ('-last_seen_at',),
            },
        ),
        migrations.AddConstraint(
            model_name='financialfinding',
            constraint=models.UniqueConstraint(fields=('business', 'fingerprint'), name='finance_unique_finding_fingerprint'),
        ),
        migrations.AddIndex(
            model_name='financialfinding',
            index=models.Index(fields=['business', 'is_active', 'status'], name='finance_fin_busines_8c3c7d_idx'),
        ),
    ]
