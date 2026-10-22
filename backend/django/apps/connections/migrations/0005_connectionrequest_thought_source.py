from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('connections', '0004_alter_connectionrequest_source')]

    operations = [migrations.AlterField(
        model_name='connectionrequest',
        name='source',
        field=models.CharField(choices=[('public_room', 'Public room'), ('auto_match', 'Auto-match'), ('private_invite', 'Private invite'), ('profile', 'Profile'), ('thought', 'Thought')], default='profile', max_length=18),
    )]
