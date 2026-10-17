from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import ValidationError
from .models import Room
from .serializers import PublicRoomCreateSerializer, RoomSerializer
from .services import create_private_room, create_public_room, join_room


class RoomViewSet(ReadOnlyModelViewSet):
    serializer_class = RoomSerializer
    lookup_field = 'code'
    throttle_scope = None
    queryset = Room.objects.prefetch_related('memberships').order_by('starts_at')

    def get_queryset(self):
        return self.queryset.filter(is_discovery_room=True, status__in=[Room.Status.SCHEDULED, Room.Status.OPEN, Room.Status.ACTIVE])

    def get_permissions(self):
        if self.action in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsAuthenticated()]

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
