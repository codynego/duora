from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ConnectionRequest
from .serializers import ConnectionCreateSerializer, ConnectionRequestSerializer


class ConnectionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        base = ConnectionRequest.objects.select_related('requester', 'recipient').filter(status=ConnectionRequest.Status.ACCEPTED)
        connections = base.filter(requester=request.user) | base.filter(recipient=request.user)
        incoming = ConnectionRequest.objects.select_related('requester', 'recipient').filter(recipient=request.user, status=ConnectionRequest.Status.PENDING)
        invites = ConnectionRequest.objects.select_related('requester', 'recipient').filter(requester=request.user, status=ConnectionRequest.Status.PENDING)
        context = {'request': request}
        return Response({'connections': ConnectionRequestSerializer(connections.distinct(), many=True, context=context).data, 'requests': ConnectionRequestSerializer(incoming, many=True, context=context).data, 'invites': ConnectionRequestSerializer(invites, many=True, context=context).data})

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
