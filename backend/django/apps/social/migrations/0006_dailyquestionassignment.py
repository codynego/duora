import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('social', '0005_normalize_question_counts'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyQuestionAssignment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('assignment_date', models.DateField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='daily_assignments', to='social.question')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='daily_question_assignments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'indexes': [models.Index(fields=['assignment_date', 'question'], name='social_dail_assignm_b6a21a_idx')],
                'constraints': [models.UniqueConstraint(fields=('user', 'assignment_date'), name='unique_daily_question_assignment')],
            },
        ),
    ]
