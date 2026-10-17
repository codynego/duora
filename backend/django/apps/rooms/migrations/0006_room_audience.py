from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('rooms', '0005_roomactivity')]

    operations = [
        migrations.AddField(
            model_name='room',
            name='audience',
            field=models.CharField(choices=[('adults', 'Adults (18+)'), ('all', 'Everyone')], default='adults', max_length=12),
        ),
    ]
