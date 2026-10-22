import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('connections', '0004_alter_connectionrequest_source'),
    ]
    operations = [
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('text', models.CharField(max_length=300)),
                ('category', models.CharField(blank=True, max_length=64)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')], default='draft', max_length=12)),
                ('published_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ('-published_at', '-created_at')},
        ),
        migrations.CreateModel(
            name='Thought',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('body', models.TextField(max_length=2000)),
                ('moderation_status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('quarantined', 'Quarantined'), ('removed', 'Removed')], default='pending', max_length=16)),
                ('published_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='social_thoughts', to=settings.AUTH_USER_MODEL)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='thoughts', to='social.question')),
            ],
            options={'ordering': ('-published_at', '-created_at')},
        ),
        migrations.CreateModel(
            name='DiscussionReply',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('body', models.TextField(max_length=2000)),
                ('moderation_status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('quarantined', 'Quarantined'), ('removed', 'Removed')], default='pending', max_length=16)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='social_replies', to=settings.AUTH_USER_MODEL)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='social.discussionreply')),
                ('thought', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='social.thought')),
            ],
            options={'ordering': ('created_at',)},
        ),
        migrations.CreateModel(
            name='ThoughtReaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('kind', models.CharField(choices=[('relate', 'I relate')], default='relate', max_length=16)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('thought', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reactions', to='social.thought')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='thought_reactions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='IdentityConsent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('consented_at', models.DateTimeField(blank=True, null=True)),
                ('revoked_at', models.DateTimeField(blank=True, null=True)),
                ('connection_request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='identity_consents', to='connections.connectionrequest')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='identity_consents', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(model_name='thoughtreaction', constraint=models.UniqueConstraint(fields=('thought', 'user', 'kind'), name='unique_thought_reaction')),
        migrations.AddConstraint(model_name='identityconsent', constraint=models.UniqueConstraint(fields=('connection_request', 'user'), name='unique_identity_consent')),
        migrations.AddIndex(model_name='question', index=models.Index(fields=['status', '-published_at'], name='social_ques_status_58a2fe_idx')),
        migrations.AddIndex(model_name='thought', index=models.Index(fields=['moderation_status', '-published_at'], name='social_thou_moderat_98f1ab_idx')),
        migrations.AddIndex(model_name='thought', index=models.Index(fields=['author', '-created_at'], name='social_thou_author__28f053_idx')),
        migrations.AddIndex(model_name='discussionreply', index=models.Index(fields=['thought', 'moderation_status', 'created_at'], name='social_disc_thought_41063f_idx')),
        migrations.RunPython(
            code=lambda apps, schema_editor: apps.get_model('social', 'Question').objects.bulk_create([
                apps.get_model('social', 'Question')(text='What is something you wish people understood about you?', category='Relationships', status='published'),
                apps.get_model('social', 'Question')(text='What kind of friendship are you ready for right now?', category='Friendship', status='published'),
                apps.get_model('social', 'Question')(text='What are you quietly working toward?', category='Business & ambition', status='published'),
                apps.get_model('social', 'Question')(text='What are you learning to be gentler with yourself about?', category='Personal growth', status='published'),
                apps.get_model('social', 'Question')(text='What belief have you changed your mind about?', category='Deep conversations', status='published'),
                apps.get_model('social', 'Question')(text='What small thing made your week better?', category='Fun & everyday life', status='published'),
            ]),
            reverse_code=migrations.RunPython.noop,
        ),
    ]
