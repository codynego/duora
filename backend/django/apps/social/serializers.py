from django.utils import timezone
from rest_framework import serializers

from apps.accounts.identity import get_or_create_anonymous_identity
from apps.matching.models import DiscoveryProfile
from .models import DiscussionReply, Question, Thought


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'text', 'category', 'published_at')


class ThoughtSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    reply_count = serializers.SerializerMethodField()
    relate_count = serializers.SerializerMethodField()
    viewer_related = serializers.SerializerMethodField()
    viewer_saved = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    common_ground = serializers.SerializerMethodField()

    class Meta:
        model = Thought
        fields = ('id', 'question', 'body', 'author', 'common_ground', 'reply_count', 'relate_count', 'viewer_related', 'viewer_saved', 'published_at', 'created_at')

    def get_author(self, obj):
        identity = get_or_create_anonymous_identity(obj.author)
        return {'anonymous': True, 'username': identity.username, 'display_name': identity.display_name, 'avatar_variant': identity.avatar_variant, 'label': f'{identity.display_name} · @{identity.username}'}

    def get_common_ground(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or obj.author_id == request.user.id:
            return None
        viewer_profile = getattr(request.user, 'discovery_profile', None)
        author_profile = DiscoveryProfile.objects.filter(user_id=obj.author_id).first()
        viewer_interests = {str(value).strip().lower(): str(value).strip() for value in (viewer_profile.interests if viewer_profile else [])}
        author_interests = {str(value).strip().lower(): str(value).strip() for value in (author_profile.interests if author_profile else [])}
        shared = [viewer_interests[key] for key in viewer_interests.keys() & author_interests.keys()]
        shared.sort()
        if not shared:
            return {'shared_count': 0, 'shared_interests': [], 'percentage': None, 'label': 'Still discovering your common ground'}
        if min(len(viewer_interests), len(author_interests)) < 2:
            label = f"{len(shared)} shared interest" if len(shared) == 1 else f"{len(shared)} shared interests"
            percentage = None
        else:
            percentage = round(len(shared) / max(len(viewer_interests), len(author_interests)) * 100)
            label = f'{percentage}% common ground'
        return {'shared_count': len(shared), 'shared_interests': shared, 'percentage': percentage, 'label': label}

    def get_reply_count(self, obj):
        return obj.replies.filter(moderation_status=DiscussionReply.ModerationStatus.APPROVED).count()

    def get_relate_count(self, obj):
        return obj.reactions.count()

    def get_viewer_related(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.reactions.filter(user=request.user).exists())

    def get_viewer_saved(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.saves.filter(user=request.user).exists())


class ThoughtCreateSerializer(serializers.Serializer):
    question_id = serializers.UUIDField()
    body = serializers.CharField(max_length=2_000, min_length=1, trim_whitespace=True)
    onboarding = serializers.BooleanField(required=False, default=False)


class ReplySerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    relate_count = serializers.SerializerMethodField()
    viewer_related = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionReply
        fields = ('id', 'body', 'author', 'parent', 'relate_count', 'viewer_related', 'created_at')

    def get_author(self, obj):
        identity = get_or_create_anonymous_identity(obj.author)
        return {'anonymous': True, 'username': identity.username, 'display_name': identity.display_name, 'avatar_variant': identity.avatar_variant, 'label': f'{identity.display_name} · @{identity.username}'}

    def get_relate_count(self, obj):
        return obj.reactions.count()

    def get_viewer_related(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.reactions.filter(user=request.user).exists())


class ReplyCreateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=2_000, min_length=1, trim_whitespace=True)
    parent_id = serializers.UUIDField(required=False, allow_null=True)
