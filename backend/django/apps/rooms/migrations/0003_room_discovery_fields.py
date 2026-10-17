from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('rooms', '0002_alter_room_id_alter_roommembership_id')]
    operations = [
        migrations.AddField(model_name='room', name='intent', field=models.CharField(default='conversation', max_length=20)),
        migrations.AddField(model_name='room', name='city', field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name='room', name='is_discovery_room', field=models.BooleanField(default=True)),
    ]
