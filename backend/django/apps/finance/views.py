from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Business, Transaction
from .serializers import BusinessSerializer, TransactionSerializer


class BusinessListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        businesses = Business.objects.filter(owner=request.user)
        return Response({'data': BusinessSerializer(businesses, many=True).data})

    def post(self, request):
        serializer = BusinessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            type(request.user).objects.select_for_update().get(pk=request.user.pk)
            if Business.objects.filter(owner=request.user).exists():
                return Response({'detail': 'Your Free workspace supports one business.'}, status=status.HTTP_409_CONFLICT)
            business = serializer.save(owner=request.user)
        return Response({'data': BusinessSerializer(business).data}, status=status.HTTP_201_CREATED)


class BusinessOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = Business.objects.filter(owner=request.user, id=business_id).first()
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        transactions = Transaction.objects.filter(business=business)
        today = timezone.localdate()
        month_start = today.replace(day=1)
        current_month = transactions.filter(occurred_on__gte=month_start, occurred_on__lte=today)
        totals = current_month.values('kind').annotate(total=Sum('amount'))
        total_by_kind = {row['kind']: row['total'] or 0 for row in totals}
        all_totals = transactions.values('kind').annotate(total=Sum('amount'))
        all_by_kind = {row['kind']: row['total'] or 0 for row in all_totals}
        cash = business.opening_balance + all_by_kind.get(Transaction.Kind.INCOME, 0) - all_by_kind.get(Transaction.Kind.EXPENSE, 0)
        monthly = list(
            current_month.annotate(month=TruncMonth('occurred_on'))
            .values('month', 'kind').annotate(total=Sum('amount'), count=Count('id'))
            .order_by('month', 'kind')
        )
        return Response({
            'business': BusinessSerializer(business).data,
            'summary': {
                'cash_position': cash,
                'income_this_month': total_by_kind.get(Transaction.Kind.INCOME, 0),
                'expenses_this_month': total_by_kind.get(Transaction.Kind.EXPENSE, 0),
                'net_this_month': total_by_kind.get(Transaction.Kind.INCOME, 0) - total_by_kind.get(Transaction.Kind.EXPENSE, 0),
                'transactions_this_month': current_month.count(),
            },
            'monthly_activity': monthly,
            'transactions': TransactionSerializer(transactions[:100], many=True).data,
            'is_sample': False,
        })


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get_business(self, request, business_id):
        return Business.objects.filter(owner=request.user, id=business_id).first()

    def get(self, request, business_id):
        business = self.get_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        rows = Transaction.objects.filter(business=business)[:200]
        return Response({'data': TransactionSerializer(rows, many=True).data})

    @transaction.atomic
    def post(self, request, business_id):
        business = Business.objects.select_for_update().filter(owner=request.user, id=business_id).first()
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        today = timezone.localdate()
        if business.plan == Business.Plan.FREE and business.transactions.filter(created_at__year=today.year, created_at__month=today.month).count() >= 100:
            return Response({'detail': 'You have reached the Free plan limit of 100 transactions this month.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = TransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_transaction = serializer.save(business=business, created_by=request.user)
        return Response({'data': TransactionSerializer(saved_transaction).data}, status=status.HTTP_201_CREATED)
