from django.utils import timezone
from rest_framework import serializers

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

    class Meta:
        model = Thought
        fields = ('id', 'question', 'body', 'author', 'reply_count', 'relate_count', 'viewer_related', 'viewer_saved', 'published_at', 'created_at')

    def get_author(self, _obj):
        return {'anonymous': True, 'label': 'Someone you have not met yet'}

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


class ReplySerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionReply
        fields = ('id', 'body', 'author', 'parent', 'created_at')

    def get_author(self, _obj):
        return {'anonymous': True, 'label': 'A thoughtful stranger'}


class ReplyCreateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=2_000, min_length=1, trim_whitespace=True)
    parent_id = serializers.UUIDField(required=False, allow_null=True)
