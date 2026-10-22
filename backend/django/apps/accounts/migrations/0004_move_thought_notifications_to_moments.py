from django.db import migrations


def move_thought_notifications(apps, schema_editor):
    Notification = apps.get_model("accounts", "Notification")
    notifications = Notification.objects.filter(
        kind="reply",
        href__startswith="/explore/",
    )
    for notification in notifications.iterator():
        notification.href = notification.href.replace("/explore/", "/moments/", 1)
        notification.save(update_fields=("href",))


class Migration(migrations.Migration):
    dependencies = [("accounts", "0003_notification")]
    operations = [
        migrations.RunPython(
            move_thought_notifications,
            migrations.RunPython.noop,
        ),
    ]
