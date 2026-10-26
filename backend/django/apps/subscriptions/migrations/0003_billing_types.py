from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('subscriptions', '0002_subscriptionpreference')]

    operations = [
        migrations.AddField(
            model_name='subscriptionoffer',
            name='billing_type',
            field=models.CharField(choices=[('recurring', 'Recurring'), ('one_time', 'One-time')], default='recurring', max_length=16),
        ),
        migrations.AddField(
            model_name='subscriptionmembership',
            name='billing_type',
            field=models.CharField(choices=[('recurring', 'Recurring'), ('one_time', 'One-time')], default='recurring', max_length=16),
        ),
    ]
