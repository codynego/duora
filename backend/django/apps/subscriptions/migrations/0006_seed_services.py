from django.db import migrations


SERVICES = [
    ('Canva Teams', 'canva-teams', 'creative', 'Ca', '#8058FF', ['team_seat', 'workspace_invitation']),
    ('ChatGPT Team', 'chatgpt-team', 'ai', 'AI', '#0B8F70', ['team_seat', 'workspace_invitation']),
    ('Microsoft 365 Family', 'microsoft-365-family', 'productivity', 'M', '#EF6C35', ['family_invitation']),
    ('MasterClass', 'masterclass', 'learning', 'M+', '#B3262E', ['member_profile', 'family_invitation']),
    ('Notion Plus', 'notion-plus', 'productivity', 'N', '#111B33', ['workspace_invitation', 'team_seat']),
]


def seed_services(apps, schema_editor):
    Service = apps.get_model('subscriptions', 'SubscriptionService')
    for name, slug, category, icon_label, icon_color, access_methods in SERVICES:
        Service.objects.update_or_create(
            slug=slug,
            defaults={
                'name': name,
                'category': category,
                'icon_label': icon_label,
                'icon_color': icon_color,
                'permitted_access_methods': access_methods,
                'is_active': True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [('subscriptions', '0005_rename_subscription_order_indexes')]
    operations = [migrations.RunPython(seed_services, migrations.RunPython.noop)]
