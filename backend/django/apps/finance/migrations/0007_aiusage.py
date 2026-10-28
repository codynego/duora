from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0006_alter_obligation_amount_alter_transaction_amount'),
    ]

    operations = [
        migrations.CreateModel(
            name='AiUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('feature', models.CharField(default='intelligence_chat', max_length=40)),
                ('period_start', models.DateField()),
                ('used', models.PositiveIntegerField(default=0)),
                ('business', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_usage', to='finance.business')),
            ],
        ),
        migrations.AddConstraint(
            model_name='aiusage',
            constraint=models.UniqueConstraint(fields=('business', 'feature', 'period_start'), name='finance_unique_ai_usage_period'),
        ),
        migrations.AddIndex(
            model_name='aiusage',
            index=models.Index(fields=['business', 'feature', 'period_start'], name='finance_aius_business_2e6e3d_idx'),
        ),
    ]
