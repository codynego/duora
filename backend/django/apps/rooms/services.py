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


@transaction.atomic
def create_private_room(*, user, experience: str, topic: str = '', discussion_description: str = '', starts_at=None):
    try:
        title, description, duration_minutes, max_members = PRIVATE_EXPERIENCES[experience]
    except KeyError as error:
        raise ValidationError({'experience': 'Choose a supported private experience.'}) from error

    code = f'P-{secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].upper()}'
    scheduled_at = starts_at if starts_at and starts_at > timezone.now() else timezone.now()
    is_scheduled = scheduled_at > timezone.now()
    room = Room.objects.create(
        code=code,
        slug=f'private-{code.lower()}',
        title=topic.strip() if topic.strip() else title,
        description=discussion_description.strip() if discussion_description.strip() else description,
        tone='Private',
        intent='connection',
        mode=EXPERIENCE_MODES[experience],
        is_discovery_room=False,
        status=Room.Status.SCHEDULED if is_scheduled else Room.Status.OPEN,
        max_members=2,
        duration_minutes=duration_minutes,
        starts_at=scheduled_at,
        created_by=user,
    )
    RoomMembership.objects.create(room=room, user=user)
    invite = RoomInvite.objects.create(room=room, created_by=user, expires_at=timezone.now() + timedelta(hours=24))
    return room, invite


@transaction.atomic
def create_public_room(*, user, experience: str, tone: str, audience: str, max_members: int, city: str, topic: str = '', discussion_description: str = '', starts_at=None):
    try:
        title, description, duration_minutes, experience_max_members = PRIVATE_EXPERIENCES[experience]
    except KeyError as error:
        raise ValidationError({'experience': 'Choose a supported experience.'}) from error
    if max_members > experience_max_members:
        raise ValidationError({'max_members': f'{title} supports up to {experience_max_members} people.'})
    code = f'R-{secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].upper()}'
    scheduled_at = starts_at if starts_at and starts_at > timezone.now() else timezone.now()
    is_scheduled = scheduled_at > timezone.now()
    room = Room.objects.create(
        code=code,
        slug=f'room-{code.lower()}',
        title=topic.strip() if topic.strip() else title,
        description=discussion_description.strip() if discussion_description.strip() else description,
        tone=tone,
        intent='connection',
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
