from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('matching', '0002_discoveryprofile_onboarding_completed')]

    operations = [
        migrations.AddField(
            model_name='discoveryprofile',
            name='gender',
            field=models.CharField(blank=True, choices=[('woman', 'Woman'), ('man', 'Man'), ('non_binary', 'Non-binary'), ('prefer_not_to_say', 'Prefer not to say')], max_length=24),
        ),
    ]
