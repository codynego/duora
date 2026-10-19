import uuid

from django.conf import settings
from django.db import models


class ConnectionRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        BLOCKED = 'blocked', 'Blocked'

    class Source(models.TextChoices):
        PUBLIC_ROOM = 'public_room', 'Public room'
        PRIVATE_INVITE = 'private_invite', 'Private invite'
        PROFILE = 'profile', 'Profile'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='connection_requests_sent')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='connection_requests_received')
    status = models.CharField(max_length=10, choices=Status, default=Status.PENDING)
    source = models.CharField(max_length=18, choices=Source, default=Source.PROFILE)
    room = models.ForeignKey('rooms.Room', null=True, blank=True, on_delete=models.SET_NULL, related_name='connection_requests')
    last_experience = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ('-created_at',)
        constraints = [models.UniqueConstraint(fields=('requester', 'recipient'), name='unique_connection_direction')]

    def __str__(self):
        return f'{self.requester} → {self.recipient} ({self.status})'


class ConnectionThread(models.Model):
    """A quiet private space created only after a mutual room choice."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_one = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='connection_threads_started')
    user_two = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='connection_threads_received')
    room = models.ForeignKey('rooms.Room', null=True, blank=True, on_delete=models.SET_NULL, related_name='connection_threads')
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('user_one', 'user_two', 'room'), name='unique_connection_thread_room')]
        ordering = ('-last_message_at', '-created_at')


class ThreadMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(ConnectionThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='thread_messages')
    body = models.TextField(max_length=1_000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)


class ThreadTypingPresence(models.Model):
    """A short-lived signal that is renewed while someone is composing."""

    thread = models.ForeignKey(ConnectionThread, on_delete=models.CASCADE, related_name='typing_presences')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='thread_typing_presences')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('thread', 'user'), name='unique_thread_typing_presence')]
