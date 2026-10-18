from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [('rooms', '0001_initial')]

    # UUID primary keys were moved into the initial schema so a fresh
    # PostgreSQL database never attempts an invalid bigint-to-UUID cast.
    operations = []
