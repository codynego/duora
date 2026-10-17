import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('rooms', '0003_room_discovery_fields'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [migrations.CreateModel(name='RoomInvite', fields=[
        ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
        ('token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)), ('expires_at', models.DateTimeField()),
        ('accepted_at', models.DateTimeField(blank=True, null=True)), ('revoked_at', models.DateTimeField(blank=True, null=True)),
        ('accepted_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='accepted_room_invites', to=settings.AUTH_USER_MODEL)),
        ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='room_invites', to=settings.AUTH_USER_MODEL)),
        ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invites', to='rooms.room')),
    ])]
