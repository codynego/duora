import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ('rooms', '0002_alter_room_id_alter_roommembership_id')]
    operations = [
        migrations.CreateModel(name='SafetyExclusion', fields=[
            ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ('reason', models.CharField(choices=[('block', 'Block'), ('no_rematch', 'No rematch')], max_length=16)), ('created_at', models.DateTimeField(auto_now_add=True)),
            ('excluded_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='excluded_by', to=settings.AUTH_USER_MODEL)),
            ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='safety_exclusions', to=settings.AUTH_USER_MODEL)),
        ], options={'constraints': [models.UniqueConstraint(fields=('user', 'excluded_user'), name='unique_safety_exclusion')]}),
        migrations.CreateModel(name='Report', fields=[
            ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ('reason', models.CharField(max_length=80)), ('details', models.TextField(blank=True, max_length=2000)),
            ('status', models.CharField(choices=[('open', 'Open'), ('reviewed', 'Reviewed'), ('actioned', 'Actioned')], default='open', max_length=12)), ('created_at', models.DateTimeField(auto_now_add=True)), ('reviewed_at', models.DateTimeField(blank=True, null=True)),
            ('reported_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports_received', to=settings.AUTH_USER_MODEL)), ('reporter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports_made', to=settings.AUTH_USER_MODEL)),
            ('room', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports', to='rooms.room')),
        ]),
    ]
