import uuid

from django.conf import settings
from django.db import models


class Room(models.Model):
    class Audience(models.TextChoices):
        ADULTS = 'adults', 'Adults (18+)'
        ALL = 'all', 'Everyone'
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        OPEN = 'open', 'Open'
        ACTIVE = 'active', 'Active'
        ENDED = 'ended', 'Ended'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=12, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=280)
    tone = models.CharField(max_length=32, default='Easygoing')
    intent = models.CharField(max_length=20, default='conversation')
    audience = models.CharField(max_length=12, choices=Audience, default=Audience.ADULTS)
    city = models.CharField(max_length=100, blank=True)
    is_discovery_room = models.BooleanField(default=True)
    status = models.CharField(max_length=12, choices=Status, default=Status.SCHEDULED)
    max_members = models.PositiveSmallIntegerField(default=4)
    duration_minutes = models.PositiveSmallIntegerField(default=12)
    starts_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_rooms')

    def __str__(self) -> str:
        return f'{self.code} · {self.title}'


class RoomMembership(models.Model):
    class Disposition(models.TextChoices):
        PRESENT = 'present', 'Present'
        LEFT = 'left', 'Left'
        REMOVED = 'removed', 'Removed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_memberships')
    disposition = models.CharField(max_length=10, choices=Disposition, default=Disposition.PRESENT)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('room', 'user'), name='unique_room_member')]


class RoomInvite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='invites')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_invites')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    expires_at = models.DateTimeField()
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='accepted_room_invites')
    accepted_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_active(self):
        from django.utils import timezone
        return self.revoked_at is None and self.accepted_at is None and self.expires_at > timezone.now()


class RoomActivity(models.Model):
    """A durable, auditable record of the room actions people can see together."""

    class Event(models.TextChoices):
        ANSWER_SAVED = 'answer.saved', 'Answer saved'
        REACTION_SENT = 'reaction.sent', 'Reaction sent'
        CHAT_SENT = 'chat.sent', 'Chat sent'
        PROMPT_SKIPPED = 'prompt.skipped', 'Prompt skipped'
        ROOM_READY = 'room.ready', 'Room ready'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='activity')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_activity')
    event = models.CharField(max_length=32, choices=Event)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)
        indexes = [models.Index(fields=('room', 'created_at'))]

    def __str__(self) -> str:
        return f'{self.room.code} · {self.event}'
