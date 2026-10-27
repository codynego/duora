from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Business, Contact, FinancialAccount, Obligation, Transaction
from .serializers import (BusinessSerializer, ContactSerializer, FinancialAccountSerializer,
                          ObligationSerializer, TransactionSerializer)


def owned_business(request, business_id):
    return Business.objects.filter(owner=request.user, id=business_id).first()


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


class BusinessSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = BusinessSerializer(business, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        next_currency = serializer.validated_data.get('currency', business.currency)
        if next_currency != business.currency and (business.transactions.exists() or business.accounts.exists() or business.obligations.exists()):
            return Response({'currency': 'Primary currency cannot be changed after financial records or accounts have been added.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({'data': BusinessSerializer(business).data})


class BusinessOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
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
        accounts = list(FinancialAccount.objects.filter(business=business, is_active=True).values('id', 'opening_balance'))
        if accounts:
            account_totals = {str(account['id']): account['opening_balance'] for account in accounts}
            assigned_totals = Transaction.objects.filter(account_id__in=[account['id'] for account in accounts]).values('account_id', 'kind').annotate(total=Sum('amount'))
            for row in assigned_totals:
                account_id = str(row['account_id'])
                sign = 1 if row['kind'] == Transaction.Kind.INCOME else -1
                account_totals[account_id] += sign * (row['total'] or 0)
            unassigned_totals = transactions.filter(account__isnull=True).values('kind').annotate(total=Sum('amount'))
            unassigned_by_kind = {row['kind']: row['total'] or 0 for row in unassigned_totals}
            cash = sum(account_totals.values(), start=0) + unassigned_by_kind.get(Transaction.Kind.INCOME, 0) - unassigned_by_kind.get(Transaction.Kind.EXPENSE, 0)
        else:
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
        return owned_business(request, business_id)

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
        serializer = TransactionSerializer(data=request.data, context={'business': business})
        serializer.is_valid(raise_exception=True)
        saved_transaction = serializer.save(business=business, created_by=request.user)
        return Response({'data': TransactionSerializer(saved_transaction).data}, status=status.HTTP_201_CREATED)


class FinancialAccountListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        accounts = FinancialAccount.objects.filter(business=business, is_active=True).prefetch_related('transactions')
        return Response({'data': FinancialAccountSerializer(accounts, many=True).data})

    def post(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        data.setdefault('currency', business.currency)
        if not FinancialAccount.objects.filter(business=business).exists() and not data.get('opening_balance'):
            data['opening_balance'] = business.opening_balance
        serializer = FinancialAccountSerializer(data=data, context={'business': business})
        serializer.is_valid(raise_exception=True)
        account = serializer.save(business=business)
        return Response({'data': FinancialAccountSerializer(account).data}, status=status.HTTP_201_CREATED)


class ContactListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        contacts = Contact.objects.filter(business=business)
        contact_kind = request.query_params.get('kind')
        if contact_kind in Contact.Kind.values:
            contacts = contacts.filter(kind=contact_kind)
        return Response({'data': ContactSerializer(contacts, many=True).data})

    def post(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact = serializer.save(business=business)
        return Response({'data': ContactSerializer(contact).data}, status=status.HTTP_201_CREATED)


class ObligationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        obligations = Obligation.objects.filter(business=business).select_related('contact')
        kind = request.query_params.get('kind')
        if kind in Obligation.Kind.values:
            obligations = obligations.filter(kind=kind)
        return Response({'data': ObligationSerializer(obligations, many=True).data})

    def post(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ObligationSerializer(data=request.data, context={'business': business})
        serializer.is_valid(raise_exception=True)
        obligation = serializer.save(business=business)
        return Response({'data': ObligationSerializer(obligation).data}, status=status.HTTP_201_CREATED)


class PerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        today = timezone.localdate()
        first_this_month = today.replace(day=1)
        month_index = first_this_month.year * 12 + first_this_month.month - 1 - 11
        first_month = first_this_month.replace(year=month_index // 12, month=month_index % 12 + 1)
        rows = list(Transaction.objects.filter(business=business, occurred_on__gte=first_month, occurred_on__lte=today)
                    .annotate(month=TruncMonth('occurred_on')).values('month', 'kind').annotate(total=Sum('amount')).order_by('month'))
        months = {}
        for row in rows:
            key = row['month'].strftime('%Y-%m')
            months.setdefault(key, {'month': key, 'income': 0, 'expenses': 0})
            months[key]['income' if row['kind'] == Transaction.Kind.INCOME else 'expenses'] = row['total'] or 0
        return Response({'data': list(months.values()), 'period_start': first_month, 'period_end': today,
                         'basis': 'recorded_transactions', 'is_complete_profit_and_loss': False})


class FinanceInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        today = timezone.localdate()
        findings = []
        overdue = Obligation.objects.filter(business=business, kind=Obligation.Kind.RECEIVABLE,
                                             balance__gt=0, due_date__lt=today).select_related('contact')
        overdue_total = sum((item.balance for item in overdue), start=0)
        if overdue.exists():
            findings.append({'id': 'overdue-receivables', 'severity': 'high', 'status': 'new',
                             'title': 'Customer balances are overdue',
                             'detail': f'{overdue.count()} customer balances totaling {overdue_total} are past due.',
                             'evidence_count': overdue.count(), 'source': 'obligations',
                             'action_url': '/dashboard/receivables'})
        recent = Transaction.objects.filter(business=business, occurred_on__gte=today - timedelta(days=90))
        groups = {}
        for item in recent:
            duplicate_key = (item.kind, item.amount, item.occurred_on, (item.counterparty or '').strip().lower(), item.description.strip().lower())
            groups.setdefault(duplicate_key, []).append(item)
        for duplicate_rows in groups.values():
            if len(duplicate_rows) > 1:
                findings.append({'id': f"possible-duplicate-{duplicate_rows[0].id}", 'severity': 'review', 'status': 'new',
                                 'title': 'Possible duplicate transaction',
                                 'detail': f'{len(duplicate_rows)} saved transactions share the same date, amount, description, and counterparty.',
                                 'evidence_count': len(duplicate_rows), 'source': 'transactions',
                                 'transaction_ids': [str(item.id) for item in duplicate_rows],
                                 'action_url': '/dashboard/transactions'})
        return Response({'data': findings, 'generated_from': 'saved_records', 'generated_at': timezone.now()})
