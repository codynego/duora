from django.db import transaction

from .models import ConnectionThread, ThreadMessage


@transaction.atomic
def canonical_thread_for_users(user_a_id, user_b_id):
    """Return one durable conversation for a pair, preserving older room chats."""
    one, two = sorted((user_a_id, user_b_id))
    canonical = ConnectionThread.objects.select_for_update().filter(
        user_one_id=one, user_two_id=two, room__isnull=True,
    ).order_by('created_at').first()
    if not canonical:
        canonical = ConnectionThread.objects.create(user_one_id=one, user_two_id=two)

    # Older releases created a separate thread for each room. Fold their
    # messages into the durable direct conversation in original time order.
    legacy_threads = ConnectionThread.objects.select_for_update().filter(
        user_one_id=one, user_two_id=two,
    ).exclude(id=canonical.id)
    ThreadMessage.objects.filter(thread__in=legacy_threads).update(thread=canonical)
    legacy_threads.delete()
    latest = canonical.messages.order_by('-created_at').first()
    if canonical.last_message_at != (latest.created_at if latest else None):
        canonical.last_message_at = latest.created_at if latest else None
        canonical.save(update_fields=('last_message_at',))
    return canonical
