from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('rooms', '0009_roommembership_ready_at')]

    operations = [
        migrations.AddField(
            model_name='room',
            name='experience',
            field=models.CharField(default='open-conversation', max_length=40),
        ),
    ]
