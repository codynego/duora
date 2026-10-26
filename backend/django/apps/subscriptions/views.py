from datetime import timedelta

from django.db import transaction
from django.db.models import F, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SubscriptionMembership, SubscriptionOffer, SubscriptionOrder, SubscriptionPreference, SubscriptionService
from .serializers import SubscriptionMembershipSerializer, SubscriptionOfferSerializer, SubscriptionOfferWriteSerializer, SubscriptionOrderSerializer, SubscriptionPreferenceSerializer, SubscriptionServiceSerializer


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


class SubscriptionServiceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        services = SubscriptionService.objects.filter(is_active=True)
        return Response({'data': SubscriptionServiceSerializer(services, many=True).data})


class SellerOfferListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        offers = SubscriptionOffer.objects.filter(seller=request.user).select_related('service')
        return Response({'data': SubscriptionOfferWriteSerializer(offers, many=True).data})

    def post(self, request):
        serializer = SubscriptionOfferWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = serializer.save(seller=request.user, status=SubscriptionOffer.Status.PENDING_REVIEW)
        return Response({'data': SubscriptionOfferWriteSerializer(offer).data}, status=status.HTTP_201_CREATED)


class SellerOfferDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, offer_id):
        offer = SubscriptionOffer.objects.filter(id=offer_id, seller=request.user).first()
        if not offer:
            return Response({'detail': 'Shared seat not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SubscriptionOfferWriteSerializer(offer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data})


class MarketplaceReservationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, offer_id):
        now = timezone.now()
        expired = SubscriptionOrder.objects.select_for_update().filter(
            offer_id=offer_id, status=SubscriptionOrder.Status.PAYMENT_PENDING, expires_at__lte=now,
        )
        for order in expired:
            SubscriptionOffer.objects.filter(id=order.offer_id).update(seats_available=F('seats_available') + 1)
            order.status = SubscriptionOrder.Status.CANCELLED
            order.save(update_fields=('status', 'updated_at'))
        offer = SubscriptionOffer.objects.select_for_update().select_related('service').filter(
            id=offer_id, status=SubscriptionOffer.Status.ACTIVE,
        ).first()
        if not offer:
            return Response({'detail': 'This shared seat is no longer available.'}, status=status.HTTP_409_CONFLICT)
        if offer.seller_id == request.user.id:
            return Response({'detail': 'You cannot reserve your own shared seat.'}, status=status.HTTP_400_BAD_REQUEST)
        existing = SubscriptionOrder.objects.filter(
            offer=offer, buyer=request.user,
            status__in=(SubscriptionOrder.Status.PAYMENT_PENDING, SubscriptionOrder.Status.PAID, SubscriptionOrder.Status.PROVISIONING, SubscriptionOrder.Status.ACTIVE),
        ).select_related('offer__service').first()
        if existing:
            return Response({'data': SubscriptionOrderSerializer(existing).data})
        if offer.seats_available <= 0:
            return Response({'detail': 'This shared seat is no longer available.'}, status=status.HTTP_409_CONFLICT)
        offer.seats_available -= 1
        offer.save(update_fields=('seats_available', 'updated_at'))
        order = SubscriptionOrder.objects.create(
            offer=offer, buyer=request.user, amount=offer.price, billing_type=offer.billing_type,
            expires_at=now + timedelta(minutes=15),
        )
        return Response({'data': SubscriptionOrderSerializer(order).data}, status=status.HTTP_201_CREATED)


class MarketplaceOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = SubscriptionOrder.objects.filter(buyer=request.user).select_related('offer__service')
        return Response({'data': SubscriptionOrderSerializer(orders, many=True).data})


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
