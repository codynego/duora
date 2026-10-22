from django.conf import settings
from django.db import models


class AnonymousIdentity(models.Model):
    """The recognizable identity a person uses inside Duora."""

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
