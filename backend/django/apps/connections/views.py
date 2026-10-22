from datetime import timedelta

from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ConnectionRequest, ConnectionThread, ThreadMessage, ThreadTypingPresence
from .serializers import ConnectionCreateSerializer, ConnectionRequestSerializer
from .services import canonical_thread_for_users
from apps.moderation.models import SafetyExclusion
from apps.rooms.models import Room, RoomMembership, RoomNextStep
from apps.social.models import IdentityConsent
from apps.accounts.identity import get_or_create_anonymous_identity
from apps.accounts.notifications import notify


class ConnectionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        base = ConnectionRequest.objects.select_related('requester', 'recipient').filter(status=ConnectionRequest.Status.ACCEPTED)
        excluded_ids = SafetyExclusion.objects.filter(user=request.user).values('excluded_user_id')
        base = base.exclude(Q(requester_id__in=excluded_ids) | Q(recipient_id__in=excluded_ids))
        connections = base.filter(requester=request.user) | base.filter(recipient=request.user)
        incoming = ConnectionRequest.objects.select_related('requester', 'recipient').filter(recipient=request.user, status=ConnectionRequest.Status.PENDING)
        invites = ConnectionRequest.objects.select_related('requester', 'recipient').filter(requester=request.user, status=ConnectionRequest.Status.PENDING)
        context = {'request': request}
        now = timezone.now()
        completed_rooms = sum(
            membership.room.status == Room.Status.ENDED
            or membership.room.starts_at + timedelta(minutes=membership.room.duration_minutes) <= now
            for membership in RoomMembership.objects.filter(user=request.user).select_related('room')
        )
        saved_for_later = RoomNextStep.objects.filter(user=request.user, choice=RoomNextStep.Choice.RECONNECT).values('participant_id').distinct().count()
        return Response({
            'connections': ConnectionRequestSerializer(connections.distinct(), many=True, context=context).data,
            'requests': ConnectionRequestSerializer(incoming, many=True, context=context).data,
            'invites': ConnectionRequestSerializer(invites, many=True, context=context).data,
            'activity': {
                'rooms_completed': completed_rooms,
                'people_connected': connections.distinct().count(),
                'saved_for_later': saved_for_later,
            },
        })

    def post(self, request):
        serializer = ConnectionCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if ConnectionRequest.objects.filter(requester=request.user, recipient_id=data['recipient_id'], status__in=[ConnectionRequest.Status.PENDING, ConnectionRequest.Status.ACCEPTED]).exists():
            return Response({'detail': 'A connection request already exists.'}, status=status.HTTP_409_CONFLICT)
        room = None
        if data.get('room_code'):
            from apps.rooms.models import Room
            room = Room.objects.filter(code=data['room_code']).first()
        connection = ConnectionRequest.objects.create(requester=request.user, recipient_id=data['recipient_id'], source=data['source'], room=room, last_experience=data.get('last_experience', ''))
        notify(
            recipient=connection.recipient,
            actor=request.user,
            kind='connection_request',
            title='Someone wants to connect',
            body='A Duorah identity sent you a connection request.',
            href='/connections',
            target_id=connection.id,
        )
        return Response(ConnectionRequestSerializer(connection, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ConnectionDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, connection_id, decision):
        connection_query = ConnectionRequest.objects.filter(id=connection_id, status=ConnectionRequest.Status.PENDING)
        connection = connection_query.filter(recipient=request.user).first()
        if not connection:
            connection = connection_query.filter(requester=request.user, source=ConnectionRequest.Source.AUTO_MATCH).first()
        if not connection:
            return Response({'detail': 'Connection request not found.'}, status=status.HTTP_404_NOT_FOUND)
        if decision not in ('accept', 'decline'):
            return Response({'detail': 'Unsupported decision.'}, status=status.HTTP_400_BAD_REQUEST)
        connection.status = ConnectionRequest.Status.ACCEPTED if decision == 'accept' else ConnectionRequest.Status.DECLINED
        connection.responded_at = timezone.now()
        connection.save(update_fields=('status', 'responded_at'))
        if connection.status == ConnectionRequest.Status.ACCEPTED:
            notify(
                recipient=connection.requester,
                actor=request.user,
                kind='connection_accepted',
                title='Your connection request was accepted',
                body='You can now continue getting to know each other.',
                href='/connections',
                target_id=connection.id,
            )
        data = ConnectionRequestSerializer(connection, context={'request': request}).data
        if connection.source == ConnectionRequest.Source.AUTO_MATCH and connection.status == ConnectionRequest.Status.ACCEPTED:
            other_id = connection.recipient_id if connection.requester_id == request.user.id else connection.requester_id
            data['thread_id'] = str(canonical_thread_for_users(request.user.id, other_id).id)
        return Response(data)


class ConnectionThreadStartView(APIView):
    """Open the durable direct chat available to an accepted connection."""
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, connection_id):
        connection = ConnectionRequest.objects.filter(
            id=connection_id,
            status=ConnectionRequest.Status.ACCEPTED,
        ).filter(Q(requester=request.user) | Q(recipient=request.user)).first()
        if not connection:
            return Response({'detail': 'Connection not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not IdentityConsent.objects.filter(connection_request=connection, consented_at__isnull=False, revoked_at__isnull=True).values('user_id').distinct().count() == 2:
            return Response({'detail': 'Both people must choose to reveal before private chat opens.', 'code': 'reveal_required'}, status=status.HTTP_403_FORBIDDEN)
        other_id = connection.recipient_id if connection.requester_id == request.user.id else connection.requester_id
        if SafetyExclusion.objects.filter(Q(user=request.user, excluded_user_id=other_id) | Q(user_id=other_id, excluded_user=request.user)).exists():
            return Response({'detail': 'This connection is not available for chat.'}, status=status.HTTP_403_FORBIDDEN)
        thread = canonical_thread_for_users(request.user.id, other_id)
        return Response({'data': {'id': str(thread.id)}}, status=status.HTTP_201_CREATED)


class ConnectionBlockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, connection_id):
        connection = ConnectionRequest.objects.filter(id=connection_id).filter(Q(requester=request.user) | Q(recipient=request.user)).first()
        if not connection:
            return Response({'detail': 'Connection not found.'}, status=status.HTTP_404_NOT_FOUND)
        other_id = connection.recipient_id if connection.requester_id == request.user.id else connection.requester_id
        SafetyExclusion.objects.update_or_create(user=request.user, excluded_user_id=other_id, defaults={'reason': 'block'})
        connection.status = ConnectionRequest.Status.BLOCKED
        connection.responded_at = timezone.now()
        connection.save(update_fields=('status', 'responded_at'))
        return Response({'blocked': True})


class ThreadsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        threads = list(ConnectionThread.objects.filter(user_one=request.user) | ConnectionThread.objects.filter(user_two=request.user))
        canonical_ids = set()
        for thread in threads:
            canonical_ids.add(canonical_thread_for_users(thread.user_one_id, thread.user_two_id).id)
        data = []
        for thread in ConnectionThread.objects.filter(id__in=canonical_ids).select_related('user_one', 'user_two').prefetch_related('messages'):
            connection = ConnectionRequest.objects.filter(
                Q(requester_id=thread.user_one_id, recipient_id=thread.user_two_id) |
                Q(requester_id=thread.user_two_id, recipient_id=thread.user_one_id),
                status=ConnectionRequest.Status.ACCEPTED,
            ).first()
            if not connection or IdentityConsent.objects.filter(connection_request=connection, consented_at__isnull=False, revoked_at__isnull=True).values('user_id').distinct().count() != 2:
                continue
            latest = thread.messages.last()
            other = thread.user_two if thread.user_one_id == request.user.id else thread.user_one
            identity = get_or_create_anonymous_identity(other)
            data.append({'id': str(thread.id), 'person': {'id': '', 'name': identity.display_name, 'username': identity.username, 'avatar_variant': identity.avatar_variant, 'initial': identity.display_name[:1].upper()}, 'room': None, 'last_message': latest.body if latest else None, 'last_message_at': thread.last_message_at})
        return Response({'data': data})


class ThreadMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def _thread(self, thread_id, user):
        thread = ConnectionThread.objects.filter(id=thread_id).select_related('user_one', 'user_two').first()
        if not thread or user.id not in {thread.user_one_id, thread.user_two_id}:
            return None
        other_id = thread.user_two_id if thread.user_one_id == user.id else thread.user_one_id
        connection = ConnectionRequest.objects.filter(
            Q(requester_id=user.id, recipient_id=other_id) | Q(requester_id=other_id, recipient_id=user.id),
            status=ConnectionRequest.Status.ACCEPTED,
        ).first()
        if not connection or IdentityConsent.objects.filter(connection_request=connection, consented_at__isnull=False, revoked_at__isnull=True).values('user_id').distinct().count() != 2:
            return None
        if SafetyExclusion.objects.filter(Q(user=user, excluded_user_id=other_id) | Q(user_id=other_id, excluded_user=user)).exists():
            return None
        return canonical_thread_for_users(thread.user_one_id, thread.user_two_id)


class IdentityConsentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, connection_id):
        connection = ConnectionRequest.objects.filter(id=connection_id, status=ConnectionRequest.Status.ACCEPTED).filter(Q(requester=request.user) | Q(recipient=request.user)).first()
        if not connection:
            return Response({'detail': 'Connection not found.'}, status=status.HTTP_404_NOT_FOUND)
        IdentityConsent.objects.update_or_create(connection_request=connection, user=request.user, defaults={'consented_at': timezone.now(), 'revoked_at': None})
        ready = IdentityConsent.objects.filter(connection_request=connection, consented_at__isnull=False, revoked_at__isnull=True).values('user_id').distinct().count() == 2
        data = {'ready': ready}
        if ready:
            other_id = connection.recipient_id if connection.requester_id == request.user.id else connection.requester_id
            notify(
                recipient_id=other_id,
                actor=request.user,
                kind='identity_reveal',
                title='Your identity reveal is mutual',
                body='You both chose to reveal your identities.',
                href='/connections',
                target_id=connection.id,
            )
            data['thread_id'] = str(canonical_thread_for_users(request.user.id, other_id).id)
        return Response(data, status=status.HTTP_201_CREATED)

    def delete(self, request, connection_id):
        connection = ConnectionRequest.objects.filter(id=connection_id, status=ConnectionRequest.Status.ACCEPTED).filter(Q(requester=request.user) | Q(recipient=request.user)).first()
        if not connection:
            return Response({'detail': 'Connection not found.'}, status=status.HTTP_404_NOT_FOUND)
        consent = IdentityConsent.objects.filter(connection_request=connection, user=request.user, revoked_at__isnull=True).first()
        if consent:
            consent.revoked_at = timezone.now()
            consent.save(update_fields=('revoked_at',))
        return Response({'revealed': False})

    def get(self, request, thread_id):
        thread = self._thread(thread_id, request.user)
        if not thread:
            return Response({'detail': 'Connection thread not found.'}, status=status.HTTP_404_NOT_FOUND)
        match = ConnectionRequest.objects.filter(
            Q(requester=request.user, recipient_id=thread.user_two_id if thread.user_one_id == request.user.id else thread.user_one_id) |
            Q(recipient=request.user, requester_id=thread.user_two_id if thread.user_one_id == request.user.id else thread.user_one_id),
            source=ConnectionRequest.Source.AUTO_MATCH,
            status=ConnectionRequest.Status.PENDING,
        ).first()
        messages = []
        for message in thread.messages.select_related('sender')[:100]:
            sender = {'name': 'You', 'username': '', 'initial': 'Y'} if message.sender_id == request.user.id else None
            if sender is None:
                identity = get_or_create_anonymous_identity(message.sender)
                sender = {'name': f'{identity.display_name} · @{identity.username}', 'username': identity.username, 'avatar_variant': identity.avatar_variant, 'initial': identity.display_name[:1].upper()}
            messages.append({'id': str(message.id), 'body': message.body, 'sender_id': message.sender_id, 'is_you': message.sender_id == request.user.id, 'sender': sender, 'created_at': message.created_at})
        return Response({'data': messages, 'match': {'connection_id': str(match.id), 'shared_interest': match.last_experience} if match else None})

    def post(self, request, thread_id):
        thread = self._thread(thread_id, request.user)
        if not thread:
            return Response({'detail': 'Connection thread not found.'}, status=status.HTTP_404_NOT_FOUND)
        body = str(request.data.get('body', '')).strip()
        if not body or len(body) > 1_000:
            return Response({'detail': 'Messages must be between 1 and 1,000 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        message = ThreadMessage.objects.create(thread=thread, sender=request.user, body=body)
        thread.last_message_at = message.created_at
        thread.save(update_fields=('last_message_at',))
        other_id = thread.user_two_id if thread.user_one_id == request.user.id else thread.user_one_id
        notify(
            recipient_id=other_id,
            actor=request.user,
            kind='message',
            title='New private message',
            body='Someone in your private connection sent you a message.',
            href='/connections',
            target_id=thread.id,
        )
        identity = get_or_create_anonymous_identity(request.user)
        return Response({'data': {'id': str(message.id), 'body': message.body, 'sender_id': message.sender_id, 'is_you': True, 'sender': {'name': identity.display_name, 'username': identity.username, 'avatar_variant': identity.avatar_variant, 'initial': identity.display_name[:1].upper()}, 'created_at': message.created_at}}, status=status.HTTP_201_CREATED)


class ThreadTypingView(ThreadMessageView):
    """Expose a deliberately brief, best-effort typing signal for a direct chat."""

    def get(self, request, thread_id):
        thread = self._thread(thread_id, request.user)
        if not thread:
            return Response({'detail': 'Connection thread not found.'}, status=status.HTTP_404_NOT_FOUND)
        cutoff = timezone.now() - timedelta(seconds=5)
        names = ThreadTypingPresence.objects.filter(thread=thread, updated_at__gte=cutoff).exclude(user=request.user).select_related('user')
        return Response({'data': [get_or_create_anonymous_identity(presence.user).display_name for presence in names]})

    def post(self, request, thread_id):
        thread = self._thread(thread_id, request.user)
        if not thread:
            return Response({'detail': 'Connection thread not found.'}, status=status.HTTP_404_NOT_FOUND)
        is_typing = bool(request.data.get('is_typing'))
        if is_typing:
            ThreadTypingPresence.objects.update_or_create(thread=thread, user=request.user)
        else:
            ThreadTypingPresence.objects.filter(thread=thread, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
