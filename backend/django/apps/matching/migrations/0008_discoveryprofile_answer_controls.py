from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('matching', '0007_discoveryprofile_date_of_birth'),
    ]

    operations = [
        migrations.AddField(
            model_name='discoveryprofile',
            name='answer_cooldown_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='discoveryprofile',
            name='onboarding_question_id',
            field=models.UUIDField(blank=True, null=True),
        ),
    ]
