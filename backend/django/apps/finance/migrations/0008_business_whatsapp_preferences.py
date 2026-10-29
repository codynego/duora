from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0007_aiusage'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='whatsapp_marketing_opt_in',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='business',
            name='whatsapp_number',
            field=models.CharField(blank=True, max_length=40),
        ),
    ]
