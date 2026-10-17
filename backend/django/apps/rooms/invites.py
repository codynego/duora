from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Room, RoomInvite
from .services import accept_invite


class CreateInviteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, room_id):
        room = get_object_or_404(Room, pk=room_id, created_by=request.user)
        invite = RoomInvite.objects.create(room=room, created_by=request.user, expires_at=timezone.now() + timedelta(hours=24))
        return Response({'data': {'id': str(invite.id), 'token': str(invite.token), 'expires_at': invite.expires_at}}, status=status.HTTP_201_CREATED)


class InvitePreviewView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, token):
        invite = get_object_or_404(RoomInvite.objects.select_related('room', 'created_by'), token=token)
        if not invite.is_active: return Response({'detail': 'This invite is no longer available.'}, status=status.HTTP_410_GONE)
        return Response({'data': {'room': {'id': str(invite.room_id), 'title': invite.room.title, 'duration_minutes': invite.room.duration_minutes}, 'invited_by': invite.created_by.username, 'expires_at': invite.expires_at}})


class AcceptInviteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, token):
        invite = get_object_or_404(RoomInvite, token=token)
        membership = accept_invite(invite=invite, user=request.user)
        return Response({'data': {'room_id': str(membership.room_id), 'membership_id': str(membership.id)}})
