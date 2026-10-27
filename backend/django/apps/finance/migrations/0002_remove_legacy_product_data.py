from django.db import migrations


LEGACY_TABLE_PREFIXES = (
    'connections_',
    'matching_',
    'moderation_',
    'rooms_',
    'social_',
    'studio_',
    'subscriptions_',
)


def remove_legacy_product_tables(apps, schema_editor):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        tables = [
            table.name
            for table in connection.introspection.get_table_list(cursor)
            if table.name.startswith(LEGACY_TABLE_PREFIXES)
        ]
        if connection.vendor == 'sqlite':
            cursor.execute('PRAGMA foreign_keys = OFF')
        for table_name in tables:
            quoted_name = schema_editor.quote_name(table_name)
            cascade = ' CASCADE' if connection.vendor == 'postgresql' else ''
            cursor.execute(f'DROP TABLE IF EXISTS {quoted_name}{cascade}')
        if connection.vendor == 'sqlite':
            cursor.execute('PRAGMA foreign_keys = ON')


class Migration(migrations.Migration):
    dependencies = [('finance', '0001_initial')]

    operations = [migrations.RunPython(remove_legacy_product_tables)]
