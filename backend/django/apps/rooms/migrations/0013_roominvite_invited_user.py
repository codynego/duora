from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0012_room_archived_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='roominvite',
            name='invited_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='direct_room_invites', to=settings.AUTH_USER_MODEL),
        ),
    ]
