from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SubscriptionMembership, SubscriptionOffer, SubscriptionPreference
from .serializers import SubscriptionMembershipSerializer, SubscriptionOfferSerializer, SubscriptionPreferenceSerializer


class SubscriptionDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        active_memberships = SubscriptionMembership.objects.filter(
            user=request.user,
            status__in=(SubscriptionMembership.Status.ACTIVE, SubscriptionMembership.Status.OVERDUE),
        ).select_related('service')
        recurring_memberships = active_memberships.filter(billing_type=SubscriptionMembership.BillingType.RECURRING)
        monthly_total = recurring_memberships.aggregate(total=Sum('monthly_cost'))['total'] or 0
        due_soon = recurring_memberships.filter(next_renewal__gte=today, next_renewal__lte=today + timedelta(days=7))
        return Response({
            'data': {
                'monthly_total': monthly_total,
                'active_count': active_memberships.filter(status=SubscriptionMembership.Status.ACTIVE).count(),
                'due_soon_count': due_soon.count(),
                'memberships': SubscriptionMembershipSerializer(active_memberships, many=True).data,
                'due_soon': SubscriptionMembershipSerializer(due_soon, many=True).data,
            }
        })


class SubscriptionMembershipListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = SubscriptionMembership.objects.filter(user=request.user).select_related('service')
        return Response({'data': SubscriptionMembershipSerializer(memberships, many=True).data})

    def post(self, request):
        serializer = SubscriptionMembershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = serializer.save(user=request.user, source=SubscriptionMembership.Source.MANUAL)
        return Response({'data': SubscriptionMembershipSerializer(membership).data}, status=status.HTTP_201_CREATED)


class SubscriptionMembershipDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, membership_id):
        return SubscriptionMembership.objects.filter(id=membership_id, user=request.user).select_related('service').first()

    def patch(self, request, membership_id):
        membership = self.get_object(request, membership_id)
        if not membership:
            return Response({'detail': 'Subscription not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SubscriptionMembershipSerializer(membership, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': SubscriptionMembershipSerializer(membership).data})


class SubscriptionOfferListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        offers = SubscriptionOffer.objects.filter(
            status=SubscriptionOffer.Status.ACTIVE,
            seats_available__gt=0,
            service__is_active=True,
        ).select_related('service')
        return Response({'data': SubscriptionOfferSerializer(offers, many=True).data})


class SubscriptionPreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        preferences, _ = SubscriptionPreference.objects.get_or_create(user=request.user)
        return Response({'data': SubscriptionPreferenceSerializer(preferences).data})

    def put(self, request):
        preferences, _ = SubscriptionPreference.objects.get_or_create(user=request.user)
        serializer = SubscriptionPreferenceSerializer(preferences, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data})
