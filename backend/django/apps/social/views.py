from datetime import timedelta
import random

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.connections.models import ConnectionRequest
from apps.moderation.models import Report, SafetyExclusion
from .models import DailyQuestionAssignment, DiscussionReply, Question, ReplyReaction, SavedThought, Thought, ThoughtReaction
from .serializers import QuestionSerializer, ReplyCreateSerializer, ReplySerializer, ThoughtCreateSerializer, ThoughtSerializer


def daily_question_window():
    now = timezone.now()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    next_reset = start + timedelta(days=1)
    questions = list(Question.objects.filter(status=Question.Status.PUBLISHED).order_by('published_at', 'created_at', 'id'))
    question = questions[now.date().toordinal() % len(questions)] if questions else None
    return question, start, next_reset, now


def daily_question_for_user(user, assignment_date):
    assignment = DailyQuestionAssignment.objects.filter(
        user=user,
        assignment_date=assignment_date.date(),
    ).select_related('question').first()
    if assignment:
        return assignment.question

    answered_question_ids = Thought.objects.filter(author=user).values_list('question_id', flat=True)
    recent_question_ids = DailyQuestionAssignment.objects.filter(
        user=user,
        assignment_date__gte=assignment_date.date() - timedelta(days=30),
    ).values_list('question_id', flat=True)
    excluded_question_ids = set(answered_question_ids) | set(recent_question_ids)
    candidates = list(Question.objects.filter(status=Question.Status.PUBLISHED).exclude(id__in=excluded_question_ids))
    if not candidates:
        candidates = list(Question.objects.filter(status=Question.Status.PUBLISHED).exclude(id__in=answered_question_ids))
    if not candidates:
        candidates = list(Question.objects.filter(status=Question.Status.PUBLISHED))
    if not candidates:
        return None
    assignment_counts = dict(
        DailyQuestionAssignment.objects.filter(assignment_date=assignment_date.date())
        .values('question_id')
        .annotate(total=Count('id'))
        .values_list('question_id', 'total')
    )
    lowest_count = min(assignment_counts.get(question.id, 0) for question in candidates)
    least_assigned = [question for question in candidates if assignment_counts.get(question.id, 0) == lowest_count]
    question = random.choice(least_assigned)
    assignment_type = DailyQuestionAssignment.AssignmentType.PERSONALIZED
    if random.random() < 0.3:
        shared_assignment = DailyQuestionAssignment.objects.filter(
            assignment_date=assignment_date.date(),
            assignment_type=DailyQuestionAssignment.AssignmentType.SHARED,
        ).select_related('question').first()
        if shared_assignment and shared_assignment.question.id not in excluded_question_ids:
            question = shared_assignment.question
            assignment_type = DailyQuestionAssignment.AssignmentType.SHARED
        elif shared_assignment is None:
            assignment_type = DailyQuestionAssignment.AssignmentType.SHARED
    assignment, _ = DailyQuestionAssignment.objects.get_or_create(
        user=user,
        assignment_date=assignment_date.date(),
        defaults={'question': question, 'assignment_type': assignment_type},
    )
    return assignment.question


class QuestionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = Question.objects.filter(status=Question.Status.PUBLISHED).order_by('-published_at', '-created_at')[:200]
        return Response({'data': QuestionSerializer(questions, many=True).data})


class DailyQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _, start, next_reset, now = daily_question_window()
        question = daily_question_for_user(request.user, start)
        profile = getattr(request.user, 'discovery_profile', None)
        onboarding_question = None
        onboarding_answer = None
        if profile and profile.onboarding_question_id:
            onboarding_question = Question.objects.filter(
                id=profile.onboarding_question_id,
                status=Question.Status.PUBLISHED,
            ).first()
            if onboarding_question:
                onboarding_answer = Thought.objects.filter(
                    author=request.user,
                    question=onboarding_question,
                ).order_by('-created_at').first()
        if not question:
            return Response({
                'data': None,
                'server_now': now.isoformat(),
                'next_reset_at': next_reset.isoformat(),
                'onboarding_question': QuestionSerializer(onboarding_question).data if onboarding_question else None,
                'onboarding_answered': bool(onboarding_answer),
                'answer_cooldown_until': profile.answer_cooldown_until.isoformat() if profile and profile.answer_cooldown_until else None,
            })
        thought = Thought.objects.filter(author=request.user, question=question, created_at__gte=start, created_at__lt=next_reset).first()
        return Response({
            'data': QuestionSerializer(question).data,
            'answer': ThoughtSerializer(thought, context={'request': request}).data if thought else None,
            'completed': bool(thought),
            'server_now': now.isoformat(),
            'next_reset_at': next_reset.isoformat(),
            'onboarding_question': QuestionSerializer(onboarding_question).data if onboarding_question else None,
            'onboarding_answered': bool(onboarding_answer),
            'answer_cooldown_until': profile.answer_cooldown_until.isoformat() if profile and profile.answer_cooldown_until else None,
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
        blocked_ids = SafetyExclusion.objects.filter(user=request.user, reason='block').values('excluded_user_id')
        queryset = queryset.exclude(author_id__in=blocked_ids)
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
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        live_thoughts = list(
            Thought.objects.filter(
                moderation_status=Thought.ModerationStatus.APPROVED,
                published_at__isnull=False,
                created_at__gte=today_start,
            )
            .exclude(author=request.user)
            .exclude(author_id__in=blocked_ids)
            .select_related('question')
            .annotate(reply_total=Count('replies', filter=Q(replies__moderation_status=DiscussionReply.ModerationStatus.APPROVED)))
        )
        live_thoughts.sort(key=lambda thought: (recommendation_score(thought) + (thought.reply_total * 4), thought.reply_total, thought.published_at), reverse=True)
        my_thoughts = Thought.objects.filter(
            author=request.user,
            moderation_status=Thought.ModerationStatus.APPROVED,
            published_at__isnull=False,
        ).select_related('question').order_by('-published_at', '-created_at')[:100]
        context = {'request': request}
        return Response({
            'data': ThoughtSerializer(thoughts[:40], many=True, context=context).data,
            'featured': ThoughtSerializer(live_thoughts[0], context=context).data if live_thoughts else None,
            'my_thoughts': ThoughtSerializer(my_thoughts, many=True, context=context).data,
        })


class ThoughtCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ThoughtCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        onboarding = serializer.validated_data.get('onboarding', False)
        profile = getattr(request.user, 'discovery_profile', None)
        now = timezone.now()
        if profile and profile.answer_cooldown_until and profile.answer_cooldown_until > now and not onboarding:
            return Response({
                'detail': 'You can share another thought after your short reflection break.',
                'code': 'answer_cooldown',
                'cooldown_until': profile.answer_cooldown_until.isoformat(),
            }, status=status.HTTP_409_CONFLICT)
        question = Question.objects.filter(id=serializer.validated_data['question_id'], status=Question.Status.PUBLISHED).first()
        if not question:
            return Response({'detail': 'That question is not available.'}, status=status.HTTP_404_NOT_FOUND)
        _, start, next_reset, _ = daily_question_window()
        daily = daily_question_for_user(request.user, start)
        if daily and question.id == daily.id and Thought.objects.filter(author=request.user, question=question, created_at__gte=start, created_at__lt=next_reset).exists():
            return Response({'detail': 'You have already shared today’s thought.', 'code': 'daily_question_completed'}, status=status.HTTP_409_CONFLICT)
        if onboarding and profile and profile.onboarding_question_id and question.id != profile.onboarding_question_id:
            return Response({'detail': 'That is not your onboarding question.'}, status=status.HTTP_400_BAD_REQUEST)
        if onboarding and Thought.objects.filter(author=request.user, question=question).exists():
            return Response({'detail': 'You have already shared your onboarding thought.', 'code': 'onboarding_completed'}, status=status.HTTP_409_CONFLICT)
        thought = Thought.objects.create(author=request.user, question=question, body=serializer.validated_data['body'], moderation_status=Thought.ModerationStatus.APPROVED, published_at=now)
        assignment = DailyQuestionAssignment.objects.filter(
            user=request.user,
            assignment_date=start.date(),
            question=question,
        ).first()
        if assignment and not assignment.answered_at:
            assignment.answered_at = now
            assignment.save(update_fields=('answered_at',))
        if onboarding and profile:
            profile.answer_cooldown_until = now + timedelta(hours=3)
            profile.save(update_fields=('answer_cooldown_until', 'updated_at'))
        return Response({
            'data': ThoughtSerializer(thought, context={'request': request}).data,
            'answer_cooldown_until': profile.answer_cooldown_until.isoformat() if onboarding and profile and profile.answer_cooldown_until else None,
        }, status=status.HTTP_201_CREATED)


class ThoughtDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, author=request.user).first()
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        thought.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ThoughtReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).first()
        if not thought or thought.author_id == request.user.id:
            return Response({'detail': 'That thought cannot be reported.'}, status=status.HTTP_400_BAD_REQUEST)
        reason = str(request.data.get('reason', 'Other')).strip()[:80] or 'Other'
        details = str(request.data.get('details', '')).strip()[:2_000]
        report, created = Report.objects.get_or_create(
            reporter=request.user,
            reported_user=thought.author,
            reason=reason,
            defaults={'details': details},
        )
        return Response({'reported': True, 'created': created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ThoughtBlockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).first()
        if not thought or thought.author_id == request.user.id:
            return Response({'detail': 'That person cannot be blocked.'}, status=status.HTTP_400_BAD_REQUEST)
        SafetyExclusion.objects.update_or_create(
            user=request.user,
            excluded_user=thought.author,
            defaults={'reason': 'block'},
        )
        return Response({'blocked': True}, status=status.HTTP_201_CREATED)


class ThoughtDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, thought_id):
        blocked_ids = SafetyExclusion.objects.filter(user=request.user, reason='block').values('excluded_user_id')
        return Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).exclude(author_id__in=blocked_ids).select_related('question').first()

    def get(self, request, thought_id):
        thought = self.get_object(request, thought_id)
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        replies = thought.replies.filter(
            moderation_status=DiscussionReply.ModerationStatus.APPROVED,
        ).select_related('author').order_by('created_at')
        return Response({
            'data': ThoughtSerializer(thought, context={'request': request}).data,
            'replies': ReplySerializer(replies, many=True, context={'request': request}).data,
            'reply_count': replies.count(),
        })


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

    @transaction.atomic
    def post(self, request, thought_id):
        thought = Thought.objects.filter(id=thought_id, moderation_status=Thought.ModerationStatus.APPROVED).first()
        if not thought:
            return Response({'detail': 'Thought not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReplyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        parent_id = serializer.validated_data.get('parent_id')
        parent = thought.replies.filter(id=parent_id).first() if parent_id else None
        reply = DiscussionReply.objects.create(thought=thought, author=request.user, parent=parent, body=serializer.validated_data['body'], moderation_status=DiscussionReply.ModerationStatus.APPROVED)
        return Response({'data': ReplySerializer(reply, context={'request': request}).data}, status=status.HTTP_201_CREATED)


class DiscussionReplyReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thought_id, reply_id):
        reply = DiscussionReply.objects.filter(
            id=reply_id,
            thought_id=thought_id,
            moderation_status=DiscussionReply.ModerationStatus.APPROVED,
        ).first()
        if not reply:
            return Response({'detail': 'Reply not found.'}, status=status.HTTP_404_NOT_FOUND)
        reaction, created = ReplyReaction.objects.get_or_create(reply=reply, user=request.user)
        if not created:
            reaction.delete()
        return Response({'related': created, 'relate_count': reply.reactions.count()})


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
