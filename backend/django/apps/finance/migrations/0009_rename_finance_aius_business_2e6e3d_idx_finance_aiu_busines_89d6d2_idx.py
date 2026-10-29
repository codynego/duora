from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0008_business_whatsapp_preferences'),
    ]

    operations = [
        migrations.RenameIndex(
            model_name='aiusage',
            old_name='finance_aius_business_2e6e3d_idx',
            new_name='finance_aiu_busines_89d6d2_idx',
        ),
    ]
