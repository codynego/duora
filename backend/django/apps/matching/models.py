import uuid

from django.conf import settings
from django.db import models


class DiscoveryProfile(models.Model):
    class Gender(models.TextChoices):
        WOMAN = 'woman', 'Woman'
        MAN = 'man', 'Man'
        NON_BINARY = 'non_binary', 'Non-binary'
        PREFER_NOT_TO_SAY = 'prefer_not_to_say', 'Prefer not to say'

    class Intent(models.TextChoices):
        FRIENDSHIP = 'friendship', 'Meet new friends'
        CONVERSATION = 'conversation', 'Light conversation'
        DATING = 'dating', 'Dating'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='discovery_profile')
    intents = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    conversation_styles = models.JSONField(default=list)
    conversation_depth = models.CharField(max_length=24, blank=True)
    social_energy = models.CharField(max_length=24, blank=True)
    availability = models.CharField(max_length=24, blank=True)
    gender = models.CharField(max_length=24, blank=True, choices=Gender.choices)
    city = models.CharField(max_length=100, blank=True)
    is_discoverable = models.BooleanField(default=False)
    onboarding_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        allowed = {choice.value for choice in self.Intent}
        if not set(self.intents).issubset(allowed):
            raise ValueError('Unsupported discovery intent.')
