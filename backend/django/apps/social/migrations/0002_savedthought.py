import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('social', '0001_initial')]

    operations = [
        migrations.CreateModel(
            name='SavedThought',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('thought', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saves', to='social.thought')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_thoughts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(model_name='savedthought', constraint=models.UniqueConstraint(fields=('thought', 'user'), name='unique_saved_thought')),
    ]
