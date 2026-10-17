import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [migrations.CreateModel(name='DiscoveryProfile', fields=[
        ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
        ('intents', models.JSONField(default=list)), ('languages', models.JSONField(default=list)), ('interests', models.JSONField(default=list)),
        ('city', models.CharField(blank=True, max_length=100)), ('is_discoverable', models.BooleanField(default=False)), ('updated_at', models.DateTimeField(auto_now=True)),
        ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='discovery_profile', to=settings.AUTH_USER_MODEL)),
    ])]
