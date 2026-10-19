from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('matching', '0003_discoveryprofile_gender')]

    operations = [
        migrations.AddField(
            model_name='discoveryprofile',
            name='conversation_styles',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='discoveryprofile',
            name='conversation_depth',
            field=models.CharField(blank=True, max_length=24),
        ),
        migrations.AddField(
            model_name='discoveryprofile',
            name='social_energy',
            field=models.CharField(blank=True, max_length=24),
        ),
        migrations.AddField(
            model_name='discoveryprofile',
            name='availability',
            field=models.CharField(blank=True, max_length=24),
        ),
    ]
