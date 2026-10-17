from django.conf import settings
from django.db import models


class Room(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        OPEN = 'open', 'Open'
        ACTIVE = 'active', 'Active'
        ENDED = 'ended', 'Ended'

    code = models.CharField(max_length=12, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=280)
    tone = models.CharField(max_length=32, default='Easygoing')
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

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_memberships')
    disposition = models.CharField(max_length=10, choices=Disposition, default=Disposition.PRESENT)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('room', 'user'), name='unique_room_member')]
