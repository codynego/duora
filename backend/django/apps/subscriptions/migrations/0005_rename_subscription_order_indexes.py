from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [('subscriptions', '0004_subscriptionorder')]

    operations = [
        migrations.RenameIndex(model_name='subscriptionorder', old_name='subscriptio_buyer_i_8f4863_idx', new_name='subscriptio_buyer_i_b84128_idx'),
        migrations.RenameIndex(model_name='subscriptionorder', old_name='subscriptio_offer_i_0c8f97_idx', new_name='subscriptio_offer_i_ac6404_idx'),
    ]
