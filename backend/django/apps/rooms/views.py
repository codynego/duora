from datetime import timedelta

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from .models import Moment, Room, RoomActivity, RoomAnswer, RoomGameState, RoomMembership, RoomNextStep
from .serializers import PublicRoomCreateSerializer, RoomSerializer
from .services import create_private_room, create_public_room, join_room


class RoomViewSet(ReadOnlyModelViewSet):
    serializer_class = RoomSerializer
    lookup_field = 'code'
    throttle_scope = None
    queryset = Room.objects.prefetch_related('memberships').order_by('starts_at')

    def get_queryset(self):
        candidates = self.queryset.filter(
            is_discovery_room=True,
            status__in=[Room.Status.SCHEDULED, Room.Status.OPEN, Room.Status.ACTIVE],
        )
        now = timezone.now()
        active_ids = [
            room.id for room in candidates
            if room.starts_at + timedelta(minutes=room.duration_minutes) > now
        ]
        return self.queryset.filter(id__in=active_ids, archived_at__isnull=True)

    def get_permissions(self):
        if self.action in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['delete'])
    def archive(self, request, code=None):
        room = get_object_or_404(Room, code=code, created_by=request.user)
        room.archived_at = timezone.now()
        room.status = Room.Status.ENDED
        room.save(update_fields=('archived_at', 'status'))
        room.invites.filter(revoked_at__isnull=True).update(revoked_at=timezone.now())
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        rooms = Room.objects.filter(created_by=request.user).prefetch_related('memberships').order_by('-created_at')[:6]
        return Response({'data': RoomSerializer(rooms, many=True).data})

    @action(detail=True, methods=['post'], throttle_classes=[ScopedRateThrottle], throttle_scope='room_join')
    def join(self, request, code=None):
        membership = join_room(room=self.get_object(), user=request.user)
        return Response({'data': {'room_code': membership.room.code, 'status': membership.disposition}}, status=status.HTTP_201_CREATED)


class CreatePrivateRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        starts_at = request.data.get('starts_at') or None
        if starts_at:
            starts_at = parse_datetime(starts_at)
            if starts_at is None:
                raise ValidationError({'starts_at': 'Use a valid ISO-8601 datetime.'})
            if timezone.is_naive(starts_at):
                starts_at = timezone.make_aware(starts_at, timezone.get_current_timezone())
            if starts_at <= timezone.now():
                raise ValidationError({'starts_at': 'Choose a time in the future, or start the experience now.'})
        room, invite = create_private_room(user=request.user, experience=request.data.get('experience', ''), topic=request.data.get('topic', ''), discussion_description=request.data.get('discussion_description', ''), starts_at=starts_at)
        return Response({'data': {
            'room': {'id': str(room.id), 'code': room.code, 'title': room.title},
            'invite': {'token': str(invite.token), 'expires_at': invite.expires_at},
        }}, status=status.HTTP_201_CREATED)


class CreatePublicRoomView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'room_join'

    def post(self, request):
        serializer = PublicRoomCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        room = create_public_room(user=request.user, **serializer.validated_data)
        return Response({'data': RoomSerializer(room).data}, status=status.HTTP_201_CREATED)


def _member_room(room_id, user):
    room = Room.objects.filter(id=room_id).first()
    if not room or not RoomMembership.objects.filter(room=room, user=user, disposition=RoomMembership.Disposition.PRESENT).exists():
        raise ValidationError({'room': 'You do not have access to this room.'})
    return room


class RoomActivityView(APIView):
    """Request-driven room updates, designed for serverless deployments."""
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = _member_room(room_id, request.user)
        activities = room.activity.select_related('actor').order_by('-created_at')[:100]
        data = []
        for activity in reversed(activities):
            data.append({'id': str(activity.id), 'event': activity.event, 'payload': activity.payload, 'user_id': activity.actor_id, 'created_at': activity.created_at})
        return Response({'data': data})

    def post(self, request, room_id):
        room = _member_room(room_id, request.user)
        event = request.data.get('event')
        payload = request.data.get('payload', {})
        if event not in RoomActivity.Event.values or not isinstance(payload, dict):
            raise ValidationError({'event': 'Unsupported room action.'})
        if event == RoomActivity.Event.ANSWER_SAVED:
            payload = {'has_answer': bool(payload.get('answer'))}
        elif event == RoomActivity.Event.CHAT_SENT:
            message = str(payload.get('message', '')).strip()
            if not message or len(message) > 500:
                raise ValidationError({'message': 'Messages must be between 1 and 500 characters.'})
            payload = {'message': message, 'actor_name': request.user.get_full_name().strip() or request.user.username}
        elif event == RoomActivity.Event.REACTION_SENT:
            kind = str(payload.get('kind', '')).strip().lower()
            if kind not in {'heart', 'laugh', 'support', 'cheer'}:
                raise ValidationError({'kind': 'That reaction is not available.'})
            payload = {'kind': kind, 'actor_name': request.user.get_full_name().strip() or request.user.username}
        activity = RoomActivity.objects.create(room=room, actor=request.user, event=event, payload=payload)
        return Response({'data': {'id': str(activity.id), 'event': activity.event, 'payload': activity.payload, 'user_id': activity.actor_id, 'created_at': activity.created_at}}, status=status.HTTP_201_CREATED)


class RoomAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = _member_room(room_id, request.user)
        answers = RoomAnswer.objects.filter(room=room).select_related('user')
        data = []
        for answer in answers:
            data.append({'id': str(answer.id), 'prompt_key': answer.prompt_key, 'author_id': answer.user_id, 'author_name': answer.user.get_full_name().strip() or answer.user.username, 'body': answer.body if answer.user_id == request.user.id or answer.revealed_at else None, 'revealed': bool(answer.revealed_at), 'updated_at': answer.updated_at})
        return Response({'data': data})

    def post(self, request, room_id):
        room = _member_room(room_id, request.user)
        prompt_key = str(request.data.get('prompt_key', 'round-1')).strip()[:80]
        body = str(request.data.get('body', '')).strip()
        if not body or len(body) > 2_000:
            raise ValidationError({'body': 'Your response must be between 1 and 2,000 characters.'})
        answer, _ = RoomAnswer.objects.update_or_create(room=room, user=request.user, prompt_key=prompt_key, defaults={'body': body, 'revealed_at': None})
        return Response({'data': {'id': str(answer.id), 'prompt_key': answer.prompt_key, 'saved': True, 'revealed': False}}, status=status.HTTP_201_CREATED)


class RoomParticipantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = _member_room(room_id, request.user)
        memberships = room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).select_related('user')
        members = [{'id': str(item.user_id), 'name': item.user.get_full_name().strip() or item.user.username, 'initial': (item.user.get_full_name().strip() or item.user.username)[:1].upper(), 'is_you': item.user_id == request.user.id, 'is_host': item.user_id == room.created_by_id, 'ready': item.ready_at is not None} for item in memberships]
        return Response({'data': members, 'meta': {'members_count': len(members), 'max_members': room.max_members, 'ready_count': sum(member['ready'] for member in members), 'all_ready': bool(members) and all(member['ready'] for member in members)}})


class RoomReadyView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, room_id):
        room = Room.objects.select_for_update().filter(id=room_id).first()
        if not room:
            raise ValidationError({'room': 'This room is unavailable.'})
        membership = RoomMembership.objects.select_for_update().filter(room=room, user=request.user, disposition=RoomMembership.Disposition.PRESENT).first()
        if not membership:
            raise ValidationError({'room': 'You do not have access to this room.'})
        if membership.ready_at is None:
            membership.ready_at = timezone.now()
            membership.save(update_fields=('ready_at',))
        present = list(room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).values_list('ready_at', flat=True))
        return Response({'data': {'ready': True, 'members_count': len(present), 'max_members': room.max_members, 'ready_count': sum(value is not None for value in present), 'all_ready': bool(present) and all(value is not None for value in present)}})


class RoomGameStateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = _member_room(room_id, request.user)
        state, _ = RoomGameState.objects.get_or_create(room=room)
        return Response({'data': state.state, 'updated_at': state.updated_at})

    @transaction.atomic
    def patch(self, request, room_id):
        room = _member_room(room_id, request.user)
        if timezone.now() < room.starts_at:
            raise ValidationError({'room': 'This room has not started yet.'})
        state, _ = RoomGameState.objects.select_for_update().get_or_create(room=room)
        next_state = request.data.get('state')
        if not isinstance(next_state, dict):
            raise ValidationError({'state': 'Game state must be an object.'})
        state.state = next_state
        state.save(update_fields=('state', 'updated_at'))
        return Response({'data': state.state, 'updated_at': state.updated_at})


class RoomRevealView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, room_id):
        room = _member_room(room_id, request.user)
        prompt_key = str(request.data.get('prompt_key', 'round-1')).strip()[:80]
        members = room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).count()
        answers = RoomAnswer.objects.select_for_update().filter(room=room, prompt_key=prompt_key)
        if answers.count() < members:
            raise ValidationError({'reveal': 'Everyone needs to save an answer before the reveal.'})
        answers.update(revealed_at=timezone.now())
        return Response({'data': [{'author_id': answer.user_id, 'author_name': answer.user.get_full_name().strip() or answer.user.username, 'body': answer.body} for answer in answers.select_related('user')]})


class RoomNextStepView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, room_id):
        room = _member_room(room_id, request.user)
        target_id = request.data.get('participant_id')
        choice = request.data.get('choice')
        if choice not in RoomNextStep.Choice.values:
            raise ValidationError({'choice': 'Choose continue_chat, reconnect, or end.'})
        if target_id is None:
            raise ValidationError({'participant_id': 'Choose a participant.'})
        target = RoomMembership.objects.select_related('user').filter(room=room, user_id=target_id, disposition=RoomMembership.Disposition.PRESENT).first()
        if not target or target.user_id == request.user.id:
            raise ValidationError({'participant_id': 'Choose another participant in this room.'})
        from apps.moderation.models import SafetyExclusion
        if SafetyExclusion.objects.filter(user=request.user, excluded_user=target.user).exists() or SafetyExclusion.objects.filter(user=target.user, excluded_user=request.user).exists():
            raise ValidationError({'participant_id': 'This person is not available for a future connection.'})
        step, _ = RoomNextStep.objects.update_or_create(room=room, user=request.user, participant_id=target.user_id, defaults={'choice': choice})
        mutual = RoomNextStep.objects.filter(room=room, user_id=target.user_id, participant=request.user, choice=choice).exists()
        thread_id = None
        if mutual and choice == RoomNextStep.Choice.CONTINUE_CHAT:
            from apps.connections.models import ConnectionRequest, ConnectionThread
            one, two = sorted((request.user.id, target.user_id))
            thread, _ = ConnectionThread.objects.get_or_create(room=room, user_one_id=one, user_two_id=two)
            existing_connection = ConnectionRequest.objects.filter(
                (Q(requester_id=one, recipient_id=two) | Q(requester_id=two, recipient_id=one))
            ).first()
            if not existing_connection:
                ConnectionRequest.objects.create(
                    requester_id=one, recipient_id=two, status=ConnectionRequest.Status.ACCEPTED,
                    source=ConnectionRequest.Source.PUBLIC_ROOM, room=room, last_experience=room.title,
                    responded_at=timezone.now(),
                )
            thread_id = str(thread.id)
        return Response({'data': {'id': str(step.id), 'choice': choice, 'mutual': mutual, 'thread_id': thread_id}})


class MomentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        moments = Moment.objects.filter(owner=request.user).select_related('room')[:50]
        return Response({'data': [{'id': str(moment.id), 'kind': moment.kind, 'title': moment.title, 'content': moment.content, 'room_code': moment.room.code if moment.room else None, 'created_at': moment.created_at} for moment in moments]})

    def post(self, request):
        room_id = request.data.get('room_id')
        room = _member_room(room_id, request.user) if room_id else None
        title = str(request.data.get('title', '')).strip()
        content = str(request.data.get('content', '')).strip()
        if not title or len(title) > 120 or len(content) > 2_000:
            raise ValidationError({'moment': 'Add a title under 120 characters and content under 2,000 characters.'})
        moment = Moment.objects.create(owner=request.user, room=room, kind=str(request.data.get('kind', 'shared_note'))[:32], title=title, content=content)
        return Response({'data': {'id': str(moment.id), 'title': moment.title}}, status=status.HTTP_201_CREATED)
