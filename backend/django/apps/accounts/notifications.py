from .models import Notification


def notify(*, recipient=None, recipient_id=None, kind, title, body, href, actor=None, target_id=None):
    if recipient is not None and actor is not None and recipient.id == actor.id:
        return None
    payload = {
        'actor': actor,
        'kind': kind,
        'title': title,
        'body': body,
        'href': href,
        'target_id': target_id,
    }
    if recipient_id is not None:
        payload['recipient_id'] = recipient_id
    else:
        payload['recipient'] = recipient
    return Notification.objects.create(**payload)
