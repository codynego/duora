from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('social', '0006_dailyquestionassignment'),
    ]

    operations = [
        migrations.RenameField(
            model_name='dailyquestionassignment',
            old_name='created_at',
            new_name='assigned_at',
        ),
        migrations.AddField(
            model_name='dailyquestionassignment',
            name='answered_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dailyquestionassignment',
            name='assignment_type',
            field=models.CharField(choices=[('personalized', 'Personalized'), ('shared', 'Shared')], default='personalized', max_length=16),
        ),
    ]
