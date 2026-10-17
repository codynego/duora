from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Room, RoomMembership


@transaction.atomic
def join_room(*, room: Room, user) -> RoomMembership:
    locked_room = Room.objects.select_for_update().get(pk=room.pk)
    if locked_room.status not in {Room.Status.OPEN, Room.Status.SCHEDULED}:
        raise PermissionDenied('This room is no longer available to join.')
    membership, created = RoomMembership.objects.get_or_create(room=locked_room, user=user)
    if not created:
        return membership
    active_members = locked_room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).count()
    if active_members > locked_room.max_members:
        membership.delete()
        raise ValidationError({'room': 'This room is full.'})
    return membership
