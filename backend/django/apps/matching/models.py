import uuid

from django.conf import settings
from django.db import models


class DiscoveryProfile(models.Model):
    class Intent(models.TextChoices):
        FRIENDSHIP = 'friendship', 'Meet new friends'
        CONVERSATION = 'conversation', 'Light conversation'
        DATING = 'dating', 'Dating'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='discovery_profile')
    intents = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    city = models.CharField(max_length=100, blank=True)
    is_discoverable = models.BooleanField(default=False)
    onboarding_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        allowed = {choice.value for choice in self.Intent}
        if not set(self.intents).issubset(allowed):
            raise ValueError('Unsupported discovery intent.')
