from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('rooms', '0010_room_experience')]

    operations = [
        migrations.CreateModel(
            name='RoomGameState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('state', models.JSONField(default=dict)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('room', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='game_state', to='rooms.room')),
            ],
        ),
    ]
