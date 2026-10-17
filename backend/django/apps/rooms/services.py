import secrets
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Room, RoomMembership
from .models import RoomInvite


PRIVATE_EXPERIENCES = {
    'predict-my-answer': ('Predict My Answer', 'A playful way to see what you notice about each other.', 8, 2),
    'better-question': ('The Better Question', 'Prompts that take the pressure off the first real conversation.', 15, 4),
    'make-a-plan': ('Make a Plan', 'Turn shared taste into something you could actually do together.', 10, 2),
    'truth-or-dare': ('Truth or Dare', 'A playful prompt-led room for people ready to be a little more open.', 12, 6),
}


@transaction.atomic
def create_private_room(*, user, experience: str):
    try:
        title, description, duration_minutes, max_members = PRIVATE_EXPERIENCES[experience]
    except KeyError as error:
        raise ValidationError({'experience': 'Choose a supported private experience.'}) from error

    code = f'P-{secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].upper()}'
    room = Room.objects.create(
        code=code,
        slug=f'private-{code.lower()}',
        title=title,
        description=description,
        tone='Private',
        intent='connection',
        is_discovery_room=False,
        status=Room.Status.OPEN,
        max_members=2,
        duration_minutes=duration_minutes,
        starts_at=timezone.now(),
        created_by=user,
    )
    RoomMembership.objects.create(room=room, user=user)
    invite = RoomInvite.objects.create(room=room, created_by=user, expires_at=timezone.now() + timedelta(hours=24))
    return room, invite


@transaction.atomic
def create_public_room(*, user, experience: str, tone: str, audience: str, max_members: int, city: str):
    try:
        title, description, duration_minutes, experience_max_members = PRIVATE_EXPERIENCES[experience]
    except KeyError as error:
        raise ValidationError({'experience': 'Choose a supported experience.'}) from error
    if max_members > experience_max_members:
        raise ValidationError({'max_members': f'{title} supports up to {experience_max_members} people.'})
    code = f'R-{secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].upper()}'
    room = Room.objects.create(
        code=code,
        slug=f'room-{code.lower()}',
        title=title,
        description=description,
        tone=tone,
        intent='connection',
        audience=audience,
        city=city.strip(),
        is_discovery_room=True,
        status=Room.Status.OPEN,
        max_members=max_members,
        duration_minutes=duration_minutes,
        starts_at=timezone.now(),
        created_by=user,
    )
    RoomMembership.objects.create(room=room, user=user)
    return room


@transaction.atomic
def join_room(*, room: Room, user) -> RoomMembership:
    locked_room = Room.objects.select_for_update().get(pk=room.pk)
    if locked_room.status not in {Room.Status.OPEN, Room.Status.SCHEDULED}:
        raise PermissionDenied('This room is no longer available to join.')
    membership = RoomMembership.objects.filter(room=locked_room, user=user).first()
    if membership:
        return membership
    active_members = locked_room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).count()
    if active_members >= locked_room.max_members:
        raise ValidationError({'room': 'This room is full.'})
    return RoomMembership.objects.create(room=locked_room, user=user)


@transaction.atomic
def accept_invite(*, invite: RoomInvite, user):
    locked = RoomInvite.objects.select_for_update().select_related('room').get(pk=invite.pk)
    if not locked.is_active:
        raise ValidationError({'invite': 'This invite is no longer available.'})
    membership = join_room(room=locked.room, user=user)
    locked.accepted_by = user
    locked.accepted_at = timezone.now()
    locked.save(update_fields=('accepted_by', 'accepted_at'))
    return membership
