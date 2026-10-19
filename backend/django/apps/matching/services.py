from django.db import models
from django.db.models import Count, Q
from django.utils import timezone
from apps.moderation.models import SafetyExclusion
from apps.rooms.models import Room, RoomMembership


def recommend_room(*, user, profile):
    excluded_ids = set(SafetyExclusion.objects.filter(Q(user=user) | Q(excluded_user=user)).values_list('user_id', 'excluded_user_id'))
    excluded_users = {user_id for pair in excluded_ids for user_id in pair if user_id != user.id}
    rooms = Room.objects.filter(is_discovery_room=True, status__in=[Room.Status.SCHEDULED, Room.Status.OPEN], intent__in=profile.intents)
    if profile.city:
        rooms = rooms.filter(city__iexact=profile.city)
    rooms = rooms.annotate(active_members=Count('memberships', filter=Q(memberships__disposition=RoomMembership.Disposition.PRESENT))).filter(active_members__lt=models.F('max_members'))
    style_experiences = {
        'Talk & debate': {'open-conversation', 'guided-conversation', 'debate', 'quick-takes', 'better-question'},
        'Games & puzzles': {'most-likely-to', 'guess-my-answer', 'word-battle', 'truth-or-dare', 'predict-my-answer'},
        'Stories & creativity': {'build-a-story', 'story-thread'},
        'Plans & adventures': {'plan-something-together', 'shared-challenges', 'date-night-anywhere', 'make-a-plan'},
    }
    preferred_experiences = set().union(*(style_experiences.get(style, set()) for style in (profile.conversation_styles or [])))
    depth_experiences = {
        'Light and playful': {'quick-takes', 'most-likely-to', 'word-battle', 'truth-or-dare'},
        'Deep and reflective': {'guided-conversation', 'debate', 'better-question', 'open-conversation', 'build-a-story'},
    }
    preferred_depth = depth_experiences.get(profile.conversation_depth, set())
    energy_members = {'One-on-one': {2}, 'Small groups': {4, 6}}
    preferred_members = energy_members.get(profile.social_energy, set())
    interest_experiences = {
        'Food & places': {'plan-something-together', 'date-night-anywhere', 'make-a-plan'},
        'Music': {'date-night-anywhere', 'open-conversation', 'quick-takes'},
        'Film & TV': {'quick-takes', 'open-conversation', 'most-likely-to'},
        'Books': {'guided-conversation', 'open-conversation', 'story-thread'},
        'Travel': {'plan-something-together', 'date-night-anywhere', 'make-a-plan'},
        'Fitness': {'shared-challenges', 'quick-takes'},
        'Games': {'word-battle', 'most-likely-to', 'guess-my-answer'},
        'Creative things': {'build-a-story', 'story-thread', 'make-a-plan'},
    }
    preferred_interests = set().union(*(interest_experiences.get(interest, set()) for interest in (profile.interests or [])))
    now = timezone.now()

    def score(room):
        points = 0
        if room.experience in preferred_experiences:
            points += 8
        if room.experience in preferred_depth:
            points += 5
        if room.experience in preferred_interests:
            points += 3
        if room.max_members in preferred_members:
            points += 3
        if profile.availability:
            local_start = timezone.localtime(room.starts_at)
            if profile.availability == 'Mornings' and 5 <= local_start.hour < 12:
                points += 2
            elif profile.availability == 'Evenings' and 17 <= local_start.hour < 24:
                points += 2
            elif profile.availability == 'Weekends' and local_start.weekday() >= 5:
                points += 2
        # Prefer rooms starting soon when the personalization signals tie.
        return points, -abs((room.starts_at - now).total_seconds())

    ranked_rooms = sorted(rooms.order_by('starts_at'), key=score, reverse=True)
    for room in ranked_rooms:
        member_ids = set(room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).values_list('user_id', flat=True))
        if not member_ids.intersection(excluded_users):
            return room
    return None
