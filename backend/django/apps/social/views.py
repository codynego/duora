from datetime import timedelta

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.connections.models import ConnectionRequest
from .models import DiscussionReply, Question, SavedThought, Thought, ThoughtReaction
from .serializers import QuestionSerializer, ReplyCreateSerializer, ReplySerializer, ThoughtCreateSerializer, ThoughtSerializer


def daily_question_window():
    now = timezone.now()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    next_reset = start + timedelta(days=1)
    questions = list(Question.objects.filter(status=Question.Status.PUBLISHED).order_by('published_at', 'created_at', 'id'))
    question = questions[now.date().toordinal() % len(questions)] if questions else None
    return question, start, next_reset, now


class QuestionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = Question.objects.filter(status=Question.Status.PUBLISHED).order_by('-published_at', '-created_at')[:50]
        return Response({'data': QuestionSerializer(questions, many=True).data})


class DailyQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        question, start, next_reset, now = daily_question_window()
        if not question:
            return Response({'data': None, 'server_now': now.isoformat(), 'next_reset_at': next_reset.isoformat()})
        thought = Thought.objects.filter(author=request.user, question=question, created_at__gte=start, created_at__lt=next_reset).first()
        return Response({
            'data': QuestionSerializer(question).data,
            'answer': ThoughtSerializer(thought, context={'request': request}).data if thought else None,
            'completed': bool(thought),
            'server_now': now.isoformat(),
            'next_reset_at': next_reset.isoformat(),
        })


class MySocialSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        context = {'request': request}
        answers = Thought.objects.filter(author=request.user, moderation_status=Thought.ModerationStatus.APPROVED, published_at__isnull=False).select_related('question')
        saved = Thought.objects.filter(saves__user=request.user, moderation_status=Thought.ModerationStatus.APPROVED, published_at__isnull=False).select_related('question').distinct()
        reactions = Thought.objects.filter(reactions__user=request.user, moderation_status=Thought.ModerationStatus.APPROVED, published_at__isnull=False).select_related('question').distinct()
        discussions = DiscussionReply.objects.filter(author=request.user, moderation_status=DiscussionReply.ModerationStatus.APPROVED).select_related('thought__question').order_by('-created_at')
        return Response({
            'counts': {
                'thoughts': answers.count(),
                'saved': saved.count(),
                'connections': ConnectionRequest.objects.filter(Q(requester=request.user) | Q(recipient=request.user), status=ConnectionRequest.Status.ACCEPTED).count(),
                'reactions': reactions.count(),
                'discussions': discussions.count(),
            },
            'answers': ThoughtSerializer(answers[:20], many=True, context=context).data,
            'saved': ThoughtSerializer(saved[:20], many=True, context=context).data,
            'reactions': ThoughtSerializer(reactions[:20], many=True, context=context).data,
            'discussions': ReplySerializer(discussions[:20], many=True).data,
        })


class ExploreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category', '').strip()
        queryset = Thought.objects.filter(moderation_status=Thought.ModerationStatus.APPROVED, published_at__isnull=False).select_related('question')
        if category:
            queryset = queryset.filter(question__category=category)
        if request.query_params.get('saved') == '1':
            queryset = queryset.filter(saves__user=request.user).distinct()
        profile = getattr(request.user, 'discovery_profile', None)
        interests = {str(value).strip().lower() for value in (profile.interests if profile else [])}
        related_ids = set(ThoughtReaction.objects.filter(user=request.user, kind=ThoughtReaction.Kind.RELATE).values_list('thought_id', flat=True))
        saved_ids = set(SavedThought.objects.filter(user=request.user).values_list('thought_id', flat=True))
        replied_ids = set(DiscussionReply.objects.filter(author=request.user).values_list('thought_id', flat=True))
        interaction_categories = set(Thought.objects.filter(id__in=related_ids | saved_ids | replied_ids).values_list('question__category', flat=True))
        interaction_categories = {str(value).strip().lower() for value in interaction_categories}
        thoughts = list(queryset.annotate(reply_total=Count('replies', filter=Q(replies__moderation_status=DiscussionReply.ModerationStatus.APPROVED)))[:100])
        def recommendation_score(thought):
            category = thought.question.category.strip().lower()
            score = 0
            if category in interests:
                score += 6
            if category in interaction_categories:
                score += 3
            if thought.id in related_ids:
                score += 4
            if thought.id in saved_ids:
                score += 4
            if thought.id in replied_ids:
                score += 5
            if thought.reply_total:
                score += 2
            return score

        thoughts.sort(key=lambda thought: (recommendation_score(thought), thought.reply_total > 0, thought.published_at), reverse=True)
        return Response({'data': ThoughtSerializer(thoughts[:40], many=True, context={'request': request}).data})


class ThoughtCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ThoughtCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = Question.objects.filter(id=serializer.validated_data['question_id'], status=Question.Status.PUBLISHED).first()
        if not question:
            return Response({'detail': 'That question is not available.'}, status=status.HTTP_404_NOT_FOUND)
        daily, start, next_reset, _ = daily_question_window()
        if daily and question.id == daily.id and Thought.objects.filter(author=request.user, question=question, created_at__gte=start, created_at__lt=next_reset).exists():
            return Response({'detail': 'You have already shared today’s thought.', 'code': 'daily_question_completed'}, status=status.HTTP_409_CONFLICT)
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


class ThoughtSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).first()
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        saved, created = SavedThought.objects.get_or_create(thought=thought, user=request.user)
        if not created:
            saved.delete()
        return Response({'saved': created})


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
