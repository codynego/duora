from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name='Room', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('code', models.CharField(max_length=12, unique=True)),
            ('slug', models.SlugField(max_length=80, unique=True)),
            ('title', models.CharField(max_length=120)), ('description', models.CharField(max_length=280)), ('tone', models.CharField(default='Easygoing', max_length=32)),
            ('status', models.CharField(choices=[('scheduled', 'Scheduled'), ('open', 'Open'), ('active', 'Active'), ('ended', 'Ended')], default='scheduled', max_length=12)),
            ('max_members', models.PositiveSmallIntegerField(default=4)), ('duration_minutes', models.PositiveSmallIntegerField(default=12)),
            ('starts_at', models.DateTimeField()), ('created_at', models.DateTimeField(auto_now_add=True)),
            ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_rooms', to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name='RoomMembership', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('disposition', models.CharField(choices=[('present', 'Present'), ('left', 'Left'), ('removed', 'Removed')], default='present', max_length=10)),
            ('joined_at', models.DateTimeField(auto_now_add=True)),
            ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='rooms.room')),
            ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='room_memberships', to=settings.AUTH_USER_MODEL)),
        ], options={'constraints': [models.UniqueConstraint(fields=('room', 'user'), name='unique_room_member')]}),
    ]
