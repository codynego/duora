from django.db import models
from django.db.models import Count, Q
from apps.moderation.models import SafetyExclusion
from apps.rooms.models import Room, RoomMembership


def recommend_room(*, user, profile):
    excluded_ids = set(SafetyExclusion.objects.filter(Q(user=user) | Q(excluded_user=user)).values_list('user_id', 'excluded_user_id'))
    excluded_users = {user_id for pair in excluded_ids for user_id in pair if user_id != user.id}
    rooms = Room.objects.filter(is_discovery_room=True, status__in=[Room.Status.SCHEDULED, Room.Status.OPEN], intent__in=profile.intents)
    if profile.city:
        rooms = rooms.filter(city__iexact=profile.city)
    rooms = rooms.annotate(active_members=Count('memberships', filter=Q(memberships__disposition=RoomMembership.Disposition.PRESENT))).filter(active_members__lt=models.F('max_members'))
    for room in rooms.order_by('starts_at'):
        member_ids = set(room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).values_list('user_id', flat=True))
        if not member_ids.intersection(excluded_users):
            return room
    return None
