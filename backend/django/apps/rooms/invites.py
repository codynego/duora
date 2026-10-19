from datetime import timedelta
import secrets
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.views import set_auth_cookies
from .models import Room, RoomInvite
from .services import accept_invite, room_invite_unavailable


class CreateInviteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, room_id):
        room = get_object_or_404(Room, pk=room_id, created_by=request.user)
        if room_invite_unavailable(room):
            raise ValidationError({'room': 'Ended or archived rooms cannot receive new invites.'})
        invite = RoomInvite.objects.create(room=room, created_by=request.user, expires_at=timezone.now() + timedelta(hours=24))
        return Response({'data': {'id': str(invite.id), 'token': str(invite.token), 'room_code': room.code, 'expires_at': invite.expires_at}}, status=status.HTTP_201_CREATED)


class DirectRoomInvitesView(APIView):
    """Private game invitations sent to an existing connection."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invites = RoomInvite.objects.filter(
            invited_user=request.user,
            accepted_at__isnull=True,
            revoked_at__isnull=True,
            expires_at__gt=timezone.now(),
            room__archived_at__isnull=True,
        ).select_related('room', 'created_by').exclude(room__status=Room.Status.ENDED).order_by('-room__created_at')
        return Response({'data': [{
            'token': str(invite.token),
            'room': {
                'id': str(invite.room_id),
                'title': invite.room.title,
                'experience': invite.room.experience,
                'duration_minutes': invite.room.duration_minutes,
            },
            'invited_by': invite.created_by.get_full_name().strip() or invite.created_by.username,
        } for invite in invites]})


class InvitePreviewView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, token):
        invite = get_object_or_404(RoomInvite.objects.select_related('room', 'created_by', 'accepted_by'), token=token)
        if invite.revoked_at is not None or room_invite_unavailable(invite.room):
            return Response({'detail': 'This room has ended or was archived.'}, status=status.HTTP_410_GONE)
        return Response({'data': {'room': {'id': str(invite.room_id), 'title': invite.room.title, 'duration_minutes': invite.room.duration_minutes}, 'invited_by': invite.created_by.username, 'creates_connection': invite.creates_connection, 'expires_at': invite.expires_at}})


class AcceptInviteView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, token):
        invite = get_object_or_404(RoomInvite.objects.select_related('invited_user'), token=token)
        guest_refresh = None
        user = request.user
        if invite.invited_user_id and (not user.is_authenticated or invite.invited_user_id != user.id):
            raise ValidationError({'invite': 'This room was created for a specific connection.'})
        if invite.revoked_at is not None or room_invite_unavailable(invite.room):
            raise ValidationError({'invite': 'This room has ended or was archived.'})
        if not user.is_authenticated:
            guest_name = str(request.data.get('guest_name', '')).strip()
            if not 2 <= len(guest_name) <= 60:
                raise ValidationError({'guest_name': 'Enter a name between 2 and 60 characters to join as a guest.'})
            User = get_user_model()
            username = f'guest_{secrets.token_urlsafe(9).replace("-", "").replace("_", "").lower()}'
            user = User.objects.create_user(username=username, password=None, first_name=guest_name)
            user.set_unusable_password()
            user.save(update_fields=('password',))
            refresh = RefreshToken.for_user(user)
            guest_refresh = refresh
        membership = accept_invite(invite=invite, user=user)
        data = {'room_id': str(membership.room_id), 'membership_id': str(membership.id)}
        if invite.creates_connection and invite.created_by_id != user.id:
            from apps.connections.models import ConnectionRequest
            from apps.connections.services import canonical_thread_for_users
            connection = ConnectionRequest.objects.filter(
                Q(requester=invite.created_by, recipient=user) | Q(requester=user, recipient=invite.created_by)
            ).first()
            if not connection:
                connection = ConnectionRequest.objects.create(
                    requester=invite.created_by, recipient=user,
                    status=ConnectionRequest.Status.ACCEPTED,
                    source=ConnectionRequest.Source.PRIVATE_INVITE,
                    room=invite.room, last_experience=invite.room.title,
                    responded_at=timezone.now(),
                )
            elif connection.status != ConnectionRequest.Status.ACCEPTED:
                connection.status = ConnectionRequest.Status.ACCEPTED
                connection.responded_at = timezone.now()
                connection.save(update_fields=('status', 'responded_at'))
            thread = canonical_thread_for_users(invite.created_by_id, user.id)
            data.update({'connection_id': str(connection.id), 'thread_id': str(thread.id)})
        response = Response({'data': data})
        return set_auth_cookies(response, guest_refresh) if guest_refresh else response
