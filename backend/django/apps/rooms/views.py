from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Room
from .serializers import RoomSerializer
from .services import join_room


class RoomViewSet(ReadOnlyModelViewSet):
    serializer_class = RoomSerializer
    lookup_field = 'code'
    throttle_scope = None
    queryset = Room.objects.prefetch_related('memberships').order_by('starts_at')

    def get_queryset(self):
        return self.queryset.filter(status__in=[Room.Status.SCHEDULED, Room.Status.OPEN, Room.Status.ACTIVE])

    def get_permissions(self):
        if self.action in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], throttle_classes=[ScopedRateThrottle], throttle_scope='room_join')
    def join(self, request, code=None):
        membership = join_room(room=self.get_object(), user=request.user)
        return Response({'data': {'room_code': membership.room.code, 'status': membership.disposition}}, status=status.HTTP_201_CREATED)
