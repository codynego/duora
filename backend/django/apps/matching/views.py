from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import DiscoveryProfile
from .serializers import DiscoveryProfileSerializer
from .services import leave_auto_match, recommend_room, request_auto_match
from apps.rooms.serializers import RoomSerializer


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

    def delete(self, request):
        leave_auto_match(user=request.user)
        return Response(status=204)
