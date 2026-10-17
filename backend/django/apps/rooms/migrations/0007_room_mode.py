from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('rooms', '0006_room_audience')]

    operations = [
        migrations.AddField(
            model_name='room',
            name='mode',
            field=models.CharField(choices=[('talk', 'Talk'), ('play', 'Play'), ('flirt', 'Flirt'), ('create', 'Create'), ('plan', 'Plan')], default='talk', max_length=12),
        ),
    ]
