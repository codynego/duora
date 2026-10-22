import uuid

from django.conf import settings
from django.db import models


class AnonymousIdentity(models.Model):
    """The recognizable identity a person uses inside Dorah."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='anonymous_identity')
    username = models.SlugField(max_length=32, unique=True)
    display_name = models.CharField(max_length=64)
    avatar_variant = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('username',)

    def __str__(self):
        return f'{self.display_name} (@{self.username})'


class Notification(models.Model):
    class Kind(models.TextChoices):
        REPLY = 'reply', 'Reply'
        CONNECTION_REQUEST = 'connection_request', 'Connection request'
        CONNECTION_ACCEPTED = 'connection_accepted', 'Connection accepted'
        IDENTITY_REVEAL = 'identity_reveal', 'Identity reveal'
        MESSAGE = 'message', 'Message'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='notifications_created')
    kind = models.CharField(max_length=32, choices=Kind.choices)
    title = models.CharField(max_length=120)
    body = models.CharField(max_length=240)
    href = models.CharField(max_length=240)
    target_id = models.UUIDField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        indexes = [models.Index(fields=('recipient', 'read_at', 'created_at'))]
