import uuid

from django.conf import settings
from django.db import models


class BrandKit(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='studio_brand_kit')
    name = models.CharField(max_length=80, default='My brand')
    website = models.URLField(blank=True)
    primary_color = models.CharField(max_length=7, default='#102126')
    accent_color = models.CharField(max_length=7, default='#FF6B4A')
    default_cta = models.CharField(max_length=120, default='Learn more')
    logo = models.FileField(upload_to='studio/logos/', blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudioProject(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        RENDERING = 'rendering', 'Rendering'
        READY = 'ready', 'Ready'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='studio_projects')
    brand_kit = models.ForeignKey(BrandKit, null=True, blank=True, on_delete=models.SET_NULL, related_name='projects')
    title = models.CharField(max_length=140)
    summary = models.TextField(max_length=2000)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    aspect_ratio = models.CharField(max_length=8, default='16:9')
    storyboard = models.JSONField(default=list, blank=True)
    video_file = models.FileField(upload_to='studio/renders/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-updated_at',)


class StudioAsset(models.Model):
    class Kind(models.TextChoices):
        SCREENSHOT = 'screenshot', 'Screenshot'
        RECORDING = 'recording', 'Recording'
        LOGO = 'logo', 'Logo'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='studio_assets')
    project = models.ForeignKey(StudioProject, null=True, blank=True, on_delete=models.SET_NULL, related_name='assets')
    file = models.FileField(upload_to='studio/assets/')
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.SCREENSHOT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)


class RenderJob(models.Model):
    class Status(models.TextChoices):
        QUEUED = 'queued', 'Queued'
        RUNNING = 'running', 'Running'
        READY = 'ready', 'Ready'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(StudioProject, on_delete=models.CASCADE, related_name='render_jobs')
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.QUEUED)
    error_message = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)
