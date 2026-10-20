from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import AutoMatchQueue, DiscoveryProfile
from .serializers import DiscoveryProfileSerializer
from .services import leave_auto_match, recommend_room, request_auto_match
from apps.rooms.serializers import RoomSerializer
from apps.connections.models import ConnectionRequest, ConnectionThread


class MyDiscoveryProfileView(RetrieveUpdateAPIView):
    serializer_class = DiscoveryProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = DiscoveryProfile.objects.get_or_create(user=self.request.user)
        return profile


class RoomRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = DiscoveryProfile.objects.get_or_create(user=request.user)
        if not profile.is_discoverable or not profile.intents:
            return Response({'data': None, 'reason': 'Complete discovery preferences before matching.'})
        room = recommend_room(user=request.user, profile=profile)
        if room is None:
            return Response({'data': None, 'reason': 'No compatible room is available right now.'})
        reasons = []
        if profile.conversation_styles:
            reasons.append(profile.conversation_styles[0].lower())
        if profile.conversation_depth:
            reasons.append(profile.conversation_depth.lower())
        if profile.interests:
            reasons.append(profile.interests[0].lower())
        reason = 'Matches your saved preferences.' if not reasons else f"Picked for you because you like {' · '.join(reasons[:2])}."
        return Response({'data': RoomSerializer(room).data, 'reason': reason})


class AutoMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({'data': request_auto_match(user=request.user)})

    def get(self, request):
        queue = AutoMatchQueue.objects.filter(user=request.user, expires_at__gt=timezone.now()).first()
        if queue:
            return Response({'data': {'status': 'waiting'}})
        match = ConnectionRequest.objects.filter(
            requester=request.user,
            source=ConnectionRequest.Source.AUTO_MATCH,
            status=ConnectionRequest.Status.PENDING,
        ).select_related('recipient').order_by('-created_at').first()
        if match:
            thread = ConnectionThread.objects.filter(
                Q(user_one=request.user, user_two=match.recipient) |
                Q(user_one=match.recipient, user_two=request.user),
                room__isnull=True,
            ).order_by('-created_at').first()
            return Response({'data': {'status': 'matched', 'request_id': str(match.id), 'thread_id': str(thread.id) if thread else None}})
        return Response({'data': {'status': 'idle'}})

    def delete(self, request):
        leave_auto_match(user=request.user)
        return Response(status=204)
