from django.db import migrations, models
from django.conf import settings
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('matching', '0004_discoveryprofile_preferences'),
        ('rooms', '0014_roominvite_creates_connection'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AutoMatchQueue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('intent', models.CharField(max_length=20)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auto_match_queue', to='rooms.room')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='auto_match_queue', to=settings.AUTH_USER_MODEL)),
            ],
            options={'indexes': [models.Index(fields=['room', 'intent', 'expires_at'], name='matching_au_room_id_4a11d0_idx')]},
        ),
    ]
