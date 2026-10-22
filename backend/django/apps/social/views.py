from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.connections.models import ConnectionRequest
from .models import DiscussionReply, Question, Thought, ThoughtReaction
from .serializers import QuestionSerializer, ReplyCreateSerializer, ReplySerializer, ThoughtCreateSerializer, ThoughtSerializer


class QuestionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = Question.objects.filter(status=Question.Status.PUBLISHED).order_by('-published_at', '-created_at')[:50]
        return Response({'data': QuestionSerializer(questions, many=True).data})


class ExploreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category', '').strip()
        queryset = Thought.objects.filter(moderation_status=Thought.ModerationStatus.APPROVED, published_at__isnull=False).select_related('question')
        if category:
            queryset = queryset.filter(question__category=category)
        profile = getattr(request.user, 'discovery_profile', None)
        interests = set(profile.interests if profile else [])
        thoughts = list(queryset.annotate(reply_total=Count('replies', filter=Q(replies__moderation_status=DiscussionReply.ModerationStatus.APPROVED)))[:100])
        thoughts.sort(key=lambda thought: (thought.question.category in interests, thought.reply_total > 0, thought.published_at), reverse=True)
        return Response({'data': ThoughtSerializer(thoughts[:40], many=True, context={'request': request}).data})


class ThoughtCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ThoughtCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = Question.objects.filter(id=serializer.validated_data['question_id'], status=Question.Status.PUBLISHED).first()
        if not question:
            return Response({'detail': 'That question is not available.'}, status=status.HTTP_404_NOT_FOUND)
        thought = Thought.objects.create(author=request.user, question=question, body=serializer.validated_data['body'], moderation_status=Thought.ModerationStatus.APPROVED, published_at=timezone.now())
        return Response({'data': ThoughtSerializer(thought, context={'request': request}).data}, status=status.HTTP_201_CREATED)


class ThoughtDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, thought_id):
        return Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).select_related('question').first()

    def get(self, request, thought_id):
        thought = self.get_object(thought_id)
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        replies = thought.replies.filter(moderation_status=DiscussionReply.ModerationStatus.APPROVED)
        return Response({'data': ThoughtSerializer(thought, context={'request': request}).data, 'replies': ReplySerializer(replies, many=True).data})


class ThoughtReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).first()
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        reaction, created = ThoughtReaction.objects.get_or_create(thought=thought, user=request.user, kind=ThoughtReaction.Kind.RELATE)
        if not created:
            reaction.delete()
        return Response({'related': created, 'relate_count': thought.reactions.count()})


class DiscussionReplyCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).first()
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReplyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        parent_id = serializer.validated_data.get('parent_id')
        parent = thought.replies.filter(id=parent_id).first() if parent_id else None
        reply = DiscussionReply.objects.create(thought=thought, author=request.user, parent=parent, body=serializer.validated_data['body'], moderation_status=DiscussionReply.ModerationStatus.APPROVED)
        return Response({'data': ReplySerializer(reply).data}, status=status.HTTP_201_CREATED)


class ThoughtConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).first()
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        if thought.author_id == request.user.id:
            return Response({'detail': 'You cannot request yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        connection, created = ConnectionRequest.objects.get_or_create(requester=request.user, recipient=thought.author, defaults={'source': 'thought', 'last_experience': thought.question.text[:120]})
        if not created and connection.status != ConnectionRequest.Status.PENDING:
            connection.status = ConnectionRequest.Status.PENDING
            connection.responded_at = None
            connection.save(update_fields=('status', 'responded_at'))
        return Response({'data': {'id': str(connection.id), 'status': connection.status}}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
