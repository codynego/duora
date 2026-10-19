import secrets
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Room, RoomMembership
from .models import RoomInvite


PRIVATE_EXPERIENCES = {
    'most-likely-to': ('Most Likely To', 'Funny group voting, surprising reveals, and lighthearted banter.', 12, 6),
    'guess-my-answer': ('Guess My Answer', 'Test how well you know someone by predicting their answers.', 10, 4),
    'word-battle': ('Word Battle', 'Fast-paced word associations, prompt battles, and live scores.', 8, 4),
    'build-a-story': ('Build a Story', 'Collaborative storytelling where everyone adds one sentence.', 12, 6),
    'open-conversation': ('Open Conversation', 'A calm topic discussion with no scores or timer pressure.', 15, 6),
    'guided-conversation': ('Guided Conversation', 'A question journey with subtle progress and simultaneous reveals.', 15, 4),
    'debate': ('Debate', 'Private stance voting and group reveals for exploring different views.', 12, 6),
    'quick-takes': ('Quick Takes', 'Rapid-fire opinions on bold statements.', 8, 6),
    'plan-something-together': ('Plan Something Together', 'Compare time, budget, and mood to find overlapping ideas.', 10, 2),
    'shared-challenges': ('Shared Challenges', 'Complete small shared goals and track joint progress.', 15, 2),
    'date-night-anywhere': ('Date Night Anywhere', 'A curated date for two people, in person or remote.', 20, 2),
    'predict-my-answer': ('Predict My Answer', 'A playful way to see what you notice about each other.', 8, 2),
    'better-question': ('The Better Question', 'Prompts that take the pressure off the first real conversation.', 15, 4),
    'make-a-plan': ('Make a Plan', 'Turn shared taste into something you could actually do together.', 10, 2),
    'truth-or-dare': ('Truth or Dare', 'A playful prompt-led room for people ready to be a little more open.', 12, 6),
    'first-spark': ('First Spark', 'Playful prompts that make early chemistry feel less awkward.', 10, 2),
    'story-thread': ('Story Thread', 'Build a strange, sweet story together one line at a time.', 12, 4),
}

EXPERIENCE_MODES = {
    'most-likely-to': Room.Mode.PLAY,
    'guess-my-answer': Room.Mode.PLAY,
    'word-battle': Room.Mode.PLAY,
    'build-a-story': Room.Mode.CREATE,
    'open-conversation': Room.Mode.TALK,
    'guided-conversation': Room.Mode.TALK,
    'debate': Room.Mode.TALK,
    'quick-takes': Room.Mode.TALK,
    'plan-something-together': Room.Mode.PLAN,
    'shared-challenges': Room.Mode.PLAN,
    'date-night-anywhere': Room.Mode.PLAN,
    'predict-my-answer': Room.Mode.PLAY,
    'better-question': Room.Mode.TALK,
    'make-a-plan': Room.Mode.PLAN,
    'truth-or-dare': Room.Mode.PLAY,
    'first-spark': Room.Mode.FLIRT,
    'story-thread': Room.Mode.CREATE,
}

# A discovery room is deliberately aligned to one of the intentions a person
# chose during onboarding.  This keeps matching useful without presenting a
# dating room to someone who only opted into friendship, for example.
EXPERIENCE_INTENTS = {
    'most-likely-to': 'friendship', 'guess-my-answer': 'friendship',
    'word-battle': 'friendship', 'build-a-story': 'friendship',
    'open-conversation': 'conversation', 'guided-conversation': 'conversation',
    'debate': 'conversation', 'quick-takes': 'conversation',
    'plan-something-together': 'friendship', 'shared-challenges': 'friendship',
    'date-night-anywhere': 'dating', 'predict-my-answer': 'dating',
    'better-question': 'conversation', 'make-a-plan': 'friendship',
    'truth-or-dare': 'friendship', 'first-spark': 'dating',
    'story-thread': 'friendship',
}


def room_invite_unavailable(room: Room, *, now=None) -> bool:
    """Invite links remain reusable until their room is ended or archived."""
    now = now or timezone.now()
    return (
        room.archived_at is not None
        or room.status == Room.Status.ENDED
        or (
            room.duration_minutes > 0
            and room.starts_at + timedelta(minutes=room.duration_minutes) <= now
        )
    )


@transaction.atomic
def create_private_room(*, user, experience: str, topic: str = '', discussion_description: str = '', starts_at=None, invited_user=None, creates_connection=False, duration_minutes=None):
    try:
        title, description, duration_minutes, max_members = PRIVATE_EXPERIENCES[experience]
    except KeyError as error:
        raise ValidationError({'experience': 'Choose a supported private experience.'}) from error

    duration_minutes = PRIVATE_EXPERIENCES[experience][2] if duration_minutes is None else duration_minutes
    if duration_minutes not in {0, 10, 30, 60}:
        raise ValidationError({'duration_minutes': 'Choose 10, 30, 60 minutes, or untimed.'})
    code = f'P-{secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].upper()}'
    scheduled_at = starts_at if starts_at and starts_at > timezone.now() else timezone.now()
    is_scheduled = scheduled_at > timezone.now()
    room = Room.objects.create(
        code=code,
        slug=f'private-{code.lower()}',
        title=topic.strip() if topic.strip() else title,
        description=discussion_description.strip() if discussion_description.strip() else description,
        experience=experience,
        tone='Private',
        intent=EXPERIENCE_INTENTS[experience],
        mode=EXPERIENCE_MODES[experience],
        is_discovery_room=False,
        status=Room.Status.SCHEDULED if is_scheduled else Room.Status.OPEN,
        max_members=2,
        duration_minutes=duration_minutes,
        starts_at=scheduled_at,
        created_by=user,
    )
    RoomMembership.objects.create(room=room, user=user)
    invite = RoomInvite.objects.create(room=room, created_by=user, invited_user=invited_user, creates_connection=creates_connection, expires_at=timezone.now() + timedelta(hours=24))
    return room, invite


@transaction.atomic
def create_public_room(*, user, experience: str, tone: str, audience: str, max_members: int, city: str, topic: str = '', discussion_description: str = '', starts_at=None, duration_minutes=None):
    try:
        title, description, duration_minutes, experience_max_members = PRIVATE_EXPERIENCES[experience]
    except KeyError as error:
        raise ValidationError({'experience': 'Choose a supported experience.'}) from error
    if max_members > experience_max_members:
        raise ValidationError({'max_members': f'{title} supports up to {experience_max_members} people.'})
    duration_minutes = PRIVATE_EXPERIENCES[experience][2] if duration_minutes is None else duration_minutes
    if duration_minutes not in {0, 10, 30, 60}:
        raise ValidationError({'duration_minutes': 'Choose 10, 30, 60 minutes, or untimed.'})
    code = f'R-{secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].upper()}'
    scheduled_at = starts_at if starts_at and starts_at > timezone.now() else timezone.now()
    is_scheduled = scheduled_at > timezone.now()
    room = Room.objects.create(
        code=code,
        slug=f'room-{code.lower()}',
        title=topic.strip() if topic.strip() else title,
        description=discussion_description.strip() if discussion_description.strip() else description,
        experience=experience,
        tone=tone,
        # Keep public rooms in the same intent taxonomy used by discovery
        # profiles.  The generic "connection" value is not one of the
        # profile intents, so those rooms can never be returned by the
        # personalized recommendation endpoint.
        intent=EXPERIENCE_INTENTS[experience],
        mode=EXPERIENCE_MODES[experience],
        audience=audience,
        city=city.strip(),
        is_discovery_room=True,
        status=Room.Status.SCHEDULED if is_scheduled else Room.Status.OPEN,
        max_members=max_members,
        duration_minutes=duration_minutes,
        starts_at=scheduled_at,
        created_by=user,
    )
    RoomMembership.objects.create(room=room, user=user)
    return room


def start_room_if_ready(room: Room, *, now=None) -> bool:
    """Start a room once it is full (and its scheduled time has arrived).

    ``starts_at`` is the beginning of the experience, not the moment a host
    opened its lobby.  Replacing it when the last participant arrives keeps
    the full duration available to everyone.
    """
    if room.status not in {Room.Status.OPEN, Room.Status.SCHEDULED}:
        return False

    now = now or timezone.now()
    if room.status == Room.Status.SCHEDULED and room.starts_at > now:
        return False

    present_members = room.memberships.filter(
        disposition=RoomMembership.Disposition.PRESENT,
    ).count()
    if present_members < room.max_members:
        return False

    room.status = Room.Status.ACTIVE
    room.starts_at = now
    room.save(update_fields=('status', 'starts_at'))
    return True


@transaction.atomic
def join_room(*, room: Room, user) -> RoomMembership:
    locked_room = Room.objects.select_for_update().get(pk=room.pk)
    membership = RoomMembership.objects.filter(room=locked_room, user=user).first()
    if membership and membership.disposition == RoomMembership.Disposition.PRESENT:
        start_room_if_ready(locked_room)
        membership.room = locked_room
        return membership
    # A former participant may return to an active room while its timer is
    # still running. New participants remain blocked once play has started.
    can_return_to_active_room = membership is not None and locked_room.status == Room.Status.ACTIVE
    if locked_room.status not in {Room.Status.OPEN, Room.Status.SCHEDULED} and not can_return_to_active_room:
        raise PermissionDenied('This room is no longer available to join.')
    active_members = locked_room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).count()
    if active_members >= locked_room.max_members:
        raise ValidationError({'room': 'This room is full.'})
    if membership:
        membership.disposition = RoomMembership.Disposition.PRESENT
        membership.ready_at = None
        membership.save(update_fields=('disposition', 'ready_at'))
    else:
        membership = RoomMembership.objects.create(room=locked_room, user=user)
    start_room_if_ready(locked_room)
    membership.room = locked_room
    return membership


@transaction.atomic
def accept_invite(*, invite: RoomInvite, user):
    locked = RoomInvite.objects.select_for_update().select_related('room').get(pk=invite.pk)
    if locked.revoked_at is not None or room_invite_unavailable(locked.room):
        raise ValidationError({'invite': 'This room has ended or was archived.'})
    membership = join_room(room=locked.room, user=user)
    if locked.accepted_at is None:
        locked.accepted_by = user
        locked.accepted_at = timezone.now()
        locked.save(update_fields=('accepted_by', 'accepted_at'))
    return membership
