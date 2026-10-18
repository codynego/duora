from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('rooms', '0011_roomgamestate')]

    operations = [
        migrations.AddField(
            model_name='room',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
