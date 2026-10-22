import uuid

from django.conf import settings
from django.db import models


class Question(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=300)
    category = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-published_at', '-created_at')
        indexes = [models.Index(fields=('status', '-published_at'))]


class DailyQuestionAssignment(models.Model):
    class AssignmentType(models.TextChoices):
        PERSONALIZED = 'personalized', 'Personalized'
        SHARED = 'shared', 'Shared'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_question_assignments')
    question = models.ForeignKey(Question, on_delete=models.PROTECT, related_name='daily_assignments')
    assignment_date = models.DateField()
    assigned_at = models.DateTimeField(auto_now_add=True)
    answered_at = models.DateTimeField(null=True, blank=True)
    assignment_type = models.CharField(max_length=16, choices=AssignmentType.choices, default=AssignmentType.PERSONALIZED)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('user', 'assignment_date'), name='unique_daily_question_assignment')]
        indexes = [models.Index(fields=('assignment_date', 'question'))]


class Thought(models.Model):
    class ModerationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        QUARANTINED = 'quarantined', 'Quarantined'
        REMOVED = 'removed', 'Removed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_thoughts')
    question = models.ForeignKey(Question, on_delete=models.PROTECT, related_name='thoughts')
    body = models.TextField(max_length=2_000)
    moderation_status = models.CharField(max_length=16, choices=ModerationStatus.choices, default=ModerationStatus.PENDING)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-published_at', '-created_at')
        indexes = [models.Index(fields=('moderation_status', '-published_at')), models.Index(fields=('author', '-created_at'))]


class ThoughtReaction(models.Model):
    class Kind(models.TextChoices):
        RELATE = 'relate', 'I relate'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thought = models.ForeignKey(Thought, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='thought_reactions')
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.RELATE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('thought', 'user', 'kind'), name='unique_thought_reaction')]


class SavedThought(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thought = models.ForeignKey(Thought, on_delete=models.CASCADE, related_name='saves')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_thoughts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('thought', 'user'), name='unique_saved_thought')]


class DiscussionReply(models.Model):
    class ModerationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        QUARANTINED = 'quarantined', 'Quarantined'
        REMOVED = 'removed', 'Removed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thought = models.ForeignKey(Thought, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_replies')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    body = models.TextField(max_length=2_000)
    moderation_status = models.CharField(max_length=16, choices=ModerationStatus.choices, default=ModerationStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('created_at',)
        indexes = [models.Index(fields=('thought', 'moderation_status', 'created_at'))]


class ReplyReaction(models.Model):
    reply = models.ForeignKey(DiscussionReply, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_reply_reactions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('reply', 'user'), name='unique_reply_reaction')]


class IdentityConsent(models.Model):
    connection_request = models.ForeignKey('connections.ConnectionRequest', on_delete=models.CASCADE, related_name='identity_consents')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='identity_consents')
    consented_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('connection_request', 'user'), name='unique_identity_consent')]
