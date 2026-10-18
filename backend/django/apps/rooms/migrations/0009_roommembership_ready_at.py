from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('rooms', '0008_moment_roomanswer_roomnextstep')]

    operations = [
        migrations.AddField(
            model_name='roommembership',
            name='ready_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
