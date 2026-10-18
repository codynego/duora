from datetime import timedelta

from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ConnectionRequest, ConnectionThread, ThreadMessage
from .serializers import ConnectionCreateSerializer, ConnectionRequestSerializer
from apps.moderation.models import SafetyExclusion
from apps.rooms.models import Room, RoomMembership, RoomNextStep


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
        return Response(ConnectionRequestSerializer(connection, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ConnectionDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, connection_id, decision):
        connection = ConnectionRequest.objects.filter(id=connection_id, recipient=request.user, status=ConnectionRequest.Status.PENDING).first()
        if not connection:
            return Response({'detail': 'Connection request not found.'}, status=status.HTTP_404_NOT_FOUND)
        if decision not in ('accept', 'decline'):
            return Response({'detail': 'Unsupported decision.'}, status=status.HTTP_400_BAD_REQUEST)
        connection.status = ConnectionRequest.Status.ACCEPTED if decision == 'accept' else ConnectionRequest.Status.DECLINED
        connection.responded_at = timezone.now()
        connection.save(update_fields=('status', 'responded_at'))
        return Response(ConnectionRequestSerializer(connection, context={'request': request}).data)


class ThreadsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        threads = ConnectionThread.objects.filter(user_one=request.user) | ConnectionThread.objects.filter(user_two=request.user)
        data = []
        for thread in threads.select_related('user_one', 'user_two', 'room').prefetch_related('messages'):
            person = thread.user_two if thread.user_one_id == request.user.id else thread.user_one
            latest = thread.messages.last()
            data.append({'id': str(thread.id), 'person': {'id': str(person.id), 'name': person.get_full_name().strip() or person.username, 'initial': (person.get_full_name().strip() or person.username)[:1].upper()}, 'room': thread.room.title if thread.room else None, 'last_message': latest.body if latest else None, 'last_message_at': thread.last_message_at})
        return Response({'data': data})


class ThreadMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def _thread(self, thread_id, user):
        thread = ConnectionThread.objects.filter(id=thread_id).select_related('user_one', 'user_two').first()
        if not thread or user.id not in {thread.user_one_id, thread.user_two_id}:
            return None
        other_id = thread.user_two_id if thread.user_one_id == user.id else thread.user_one_id
        if SafetyExclusion.objects.filter(Q(user=user, excluded_user_id=other_id) | Q(user_id=other_id, excluded_user=user)).exists():
            return None
        return thread

    def get(self, request, thread_id):
        thread = self._thread(thread_id, request.user)
        if not thread:
            return Response({'detail': 'Connection thread not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': [{'id': str(message.id), 'body': message.body, 'sender_id': message.sender_id, 'is_you': message.sender_id == request.user.id, 'sender': {'name': message.sender.get_full_name().strip() or message.sender.username, 'initial': (message.sender.get_full_name().strip() or message.sender.username)[:1].upper()}, 'created_at': message.created_at} for message in thread.messages.select_related('sender')[:100]]})

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
        return Response({'data': {'id': str(message.id), 'body': message.body, 'sender_id': message.sender_id, 'is_you': True, 'sender': {'name': request.user.get_full_name().strip() or request.user.username, 'initial': (request.user.get_full_name().strip() or request.user.username)[:1].upper()}, 'created_at': message.created_at}}, status=status.HTTP_201_CREATED)
