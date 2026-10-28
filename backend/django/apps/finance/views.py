import json
import logging
import os
import urllib.error
import urllib.request

from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Business, Contact, FinancialAccount, Obligation, Transaction, TransactionAudit
from .serializers import (BusinessSerializer, ContactSerializer, FinancialAccountSerializer,
                          ObligationSerializer, TransactionSerializer)

logger = logging.getLogger(__name__)


def owned_business(request, business_id):
    return Business.objects.filter(owner=request.user, id=business_id).first()


def json_safe(value):
    return json.loads(json.dumps(value, default=str))


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
        next_opening_balance = serializer.validated_data.get('opening_balance', business.opening_balance)
        if next_opening_balance != business.opening_balance and (business.transactions.exists() or business.accounts.exists()):
            return Response({'opening_balance': 'The starting balance cannot be changed after accounts or transactions have been recorded.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({'data': BusinessSerializer(business).data})


class BusinessOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        transactions = Transaction.objects.filter(business=business, is_voided=False)
        today = timezone.localdate()
        month_start = today.replace(day=1)
        current_month = transactions.filter(occurred_on__gte=month_start, occurred_on__lte=today)
        cash_activity = current_month.filter(kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE))
        totals = cash_activity.values('kind').annotate(total=Sum('amount'))
        total_by_kind = {row['kind']: row['total'] or 0 for row in totals}
        all_totals = transactions.filter(kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE)).values('kind').annotate(total=Sum('amount'))
        all_by_kind = {row['kind']: row['total'] or 0 for row in all_totals}
        open_obligations = Obligation.objects.filter(business=business, balance__gt=0)
        next_seven_days = today + timedelta(days=7)
        obligation_totals = {}
        for name, queryset in {
            'receivables_outstanding': open_obligations.filter(kind=Obligation.Kind.RECEIVABLE),
            'payables_outstanding': open_obligations.filter(kind=Obligation.Kind.PAYABLE),
            'receivables_overdue': open_obligations.filter(kind=Obligation.Kind.RECEIVABLE, due_date__lt=today),
            'payables_overdue': open_obligations.filter(kind=Obligation.Kind.PAYABLE, due_date__lt=today),
            'receivables_due_soon': open_obligations.filter(kind=Obligation.Kind.RECEIVABLE, due_date__gte=today, due_date__lte=next_seven_days),
            'payables_due_soon': open_obligations.filter(kind=Obligation.Kind.PAYABLE, due_date__gte=today, due_date__lte=next_seven_days),
            'payables_due_today': open_obligations.filter(kind=Obligation.Kind.PAYABLE, due_date=today),
        }.items():
            obligation_totals[name] = queryset.aggregate(total=Sum('balance'))['total'] or Decimal('0.00')
        accounts = list(FinancialAccount.objects.filter(business=business, is_active=True))
        account_rows = FinancialAccountSerializer(accounts, many=True).data
        if accounts:
            account_totals = FinancialAccountSerializer(accounts, many=True).data
            unassigned_totals = transactions.filter(account__isnull=True).values('kind').annotate(total=Sum('amount'))
            unassigned_by_kind = {row['kind']: row['total'] or 0 for row in unassigned_totals}
            cash = sum((Decimal(row['balance']) for row in account_totals), start=Decimal('0.00')) + unassigned_by_kind.get(Transaction.Kind.INCOME, 0) - unassigned_by_kind.get(Transaction.Kind.EXPENSE, 0)
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
                **obligation_totals,
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
        rows = Transaction.objects.filter(business=business, is_voided=False)[:200]
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
        obligation = serializer.validated_data.get('obligation')
        if obligation:
            obligation = Obligation.objects.select_for_update().get(pk=obligation.pk, business=business)
            if serializer.validated_data['amount'] > obligation.balance:
                return Response({'amount': 'The payment exceeds the remaining balance. Refresh the page and try again.'}, status=status.HTTP_400_BAD_REQUEST)
        save_fields = {'business': business, 'created_by': request.user}
        if obligation and not serializer.validated_data.get('contact'):
            save_fields['contact'] = obligation.contact
        saved_transaction = serializer.save(**save_fields)
        TransactionAudit.objects.create(transaction=saved_transaction, action=TransactionAudit.Action.CREATED, actor=request.user, changes=json_safe(TransactionSerializer(saved_transaction).data))
        if obligation:
            obligation.balance -= saved_transaction.amount
            obligation.status = Obligation.Status.SETTLED if obligation.balance == 0 else Obligation.Status.PARTIAL
            obligation.save(update_fields=('balance', 'status', 'updated_at'))
        return Response({'data': TransactionSerializer(saved_transaction).data}, status=status.HTTP_201_CREATED)


class TransactionParseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        text = str(request.data.get('text') or '').strip()
        if not text or len(text) > 2000:
            return Response({'detail': 'Describe one transaction in 2,000 characters or less.'}, status=status.HTTP_400_BAD_REQUEST)
        api_key = os.environ.get('OPENAI_API_KEY', '').strip()
        if not api_key:
            return Response({'detail': 'Text entry is not configured yet. Add OPENAI_API_KEY to the backend environment.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        contacts = list(Contact.objects.filter(business=business).values_list('name', 'kind'))
        accounts = list(FinancialAccount.objects.filter(business=business, is_active=True).values_list('name', 'kind'))
        prompt = {
            'business_currency': business.currency,
            'known_contacts': [{'name': name, 'kind': kind} for name, kind in contacts],
            'known_accounts': [{'name': name, 'kind': kind} for name, kind in accounts],
            'description': text,
        }
        configured_model = os.environ.get('OPENAI_TRANSACTION_MODEL', '').strip()
        model = configured_model if configured_model in {'gpt-4o-mini', 'gpt-4.1-mini'} else 'gpt-4o-mini'
        body = json.dumps({
            'model': model,
            'input': [
                {'role': 'system', 'content': 'You extract one small-business transaction into a reviewable draft. Never invent amounts, names, accounts, or dates. Distinguish a customer repayment from new income, a supplier payment from a new expense, and an internal transfer from both. For a sale or bill, total_amount is the full value and paid_amount is the amount paid now; if only one amount is given, use it for both. Use ISO YYYY-MM-DD only for dates explicitly stated or clearly relative to today. Return only valid JSON with exactly these keys: kind (income, expense, transfer, or unknown), description (string), total_amount (number or null), paid_amount (number or null), contact_name (string or null), account_name (string or null), transfer_account_name (string or null), due_date (string or null), payment_method (string or null), missing_details (array of strings), note (string).'},
                {'role': 'user', 'content': json.dumps({**prompt, 'today': timezone.localdate().isoformat()})},
            ],
            'text': {'format': {'type': 'json_object'}},
        }).encode('utf-8')
        req = urllib.request.Request('https://api.openai.com/v1/responses', data=body, method='POST', headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as error:
            provider_body = error.read().decode('utf-8', errors='replace')[:2000]
            logger.error('OpenAI transaction parsing rejected the request: status=%s body=%s', error.code, provider_body)
            try:
                provider_payload = json.loads(provider_body)
                provider_error = provider_payload.get('error') or {}
                provider_message = str(provider_error.get('message') or '').strip()
                provider_code = str(provider_error.get('code') or '').strip()
            except json.JSONDecodeError:
                provider_message = ''
                provider_code = ''
            if error.code in (401, 403):
                detail = 'Text entry is not authorized. Check OPENAI_API_KEY in the deployed backend environment.'
            elif error.code == 404:
                detail = 'The text-entry model is unavailable. The backend is configured to use gpt-4o-mini.'
            elif error.code == 400:
                detail = 'The text-entry request was rejected' + (f': {provider_message}' if provider_message else '. Check the deployed OpenAI configuration and try again.')
            else:
                detail = 'Text entry provider error' + (f' ({error.code})' if error.code else '') + (f': {provider_message}' if provider_message else '. Please try again or enter the transaction manually.')
            response_data = {'detail': detail, 'provider_status': error.code}
            if provider_code:
                response_data['provider_code'] = provider_code
            return Response(response_data, status=status.HTTP_503_SERVICE_UNAVAILABLE if error.code in (401, 403, 404, 429) else status.HTTP_400_BAD_REQUEST)
        except (urllib.error.URLError, TimeoutError) as error:
            logger.error('OpenAI transaction parsing request failed: %s', error)
            return Response({'detail': 'Text entry is temporarily unavailable. Please try again or enter the transaction manually.'}, status=status.HTTP_502_BAD_GATEWAY)
        except json.JSONDecodeError:
            logger.error('OpenAI transaction parsing returned invalid JSON.')
            return Response({'detail': 'The transaction draft was incomplete. Please try again or enter it manually.'}, status=status.HTTP_502_BAD_GATEWAY)
        output_text = payload.get('output_text', '')
        try:
            draft = json.loads(output_text)
        except (TypeError, json.JSONDecodeError):
            return Response({'detail': 'The transaction draft was incomplete. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)
        draft = {
            'kind': draft.get('kind', 'unknown'),
            'description': draft.get('description', ''),
            'total_amount': draft.get('total_amount'),
            'paid_amount': draft.get('paid_amount'),
            'contact_name': draft.get('contact_name'),
            'account_name': draft.get('account_name'),
            'transfer_account_name': draft.get('transfer_account_name'),
            'due_date': draft.get('due_date'),
            'payment_method': draft.get('payment_method'),
            'missing_details': draft.get('missing_details') if isinstance(draft.get('missing_details'), list) else [],
            'note': draft.get('note', ''),
        }
        return Response({'data': draft})


class IntelligenceChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        question = str(request.data.get('question') or '').strip()
        if not question or len(question) > 2000:
            return Response({'detail': 'Ask one question in 2,000 characters or less.'}, status=status.HTTP_400_BAD_REQUEST)
        api_key = os.environ.get('OPENAI_API_KEY', '').strip()
        if not api_key:
            return Response({'detail': 'Financial controller chat is not configured yet. Add OPENAI_API_KEY to the backend environment.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        transactions = list(Transaction.objects.filter(business=business, is_voided=False).select_related('account', 'contact').order_by('-occurred_on', '-created_at')[:40])
        accounts = list(FinancialAccount.objects.filter(business=business, is_active=True))
        account_rows = FinancialAccountSerializer(accounts, many=True).data
        obligations = list(Obligation.objects.filter(business=business).select_related('contact').order_by('due_date', '-updated_at')[:40])
        insights_response = FinanceInsightsView().get(request, business_id)
        insights = insights_response.data.get('data', []) if insights_response.status_code == 200 else []
        context = {
            'business': {'name': business.name, 'currency': business.currency, 'opening_balance': business.opening_balance},
            'accounts': [{'name': row['name'], 'kind': row['kind'], 'balance': row['balance']} for row in account_rows],
            'transactions': [{'date': row.occurred_on, 'kind': row.kind, 'description': row.description, 'amount': row.amount,
                              'account': row.account.name if row.account else None,
                              'contact': row.contact.name if row.contact else None} for row in transactions],
            'obligations': [{'kind': row.kind, 'contact': row.contact.name, 'description': row.description,
                             'amount': row.amount, 'balance': row.balance, 'due_date': row.due_date,
                             'status': row.status} for row in obligations],
            'findings': [{'title': item.get('title'), 'severity': item.get('severity'), 'detail': item.get('detail'),
                          'impact_amount': item.get('impact_amount'), 'suggestion': item.get('suggestion')}
                         for item in insights[:20]],
        }
        history = request.data.get('history') if isinstance(request.data.get('history'), list) else []
        history = [{'role': item.get('role'), 'content': str(item.get('content', ''))[:2000]}
                   for item in history[-8:] if item.get('role') in ('user', 'assistant') and item.get('content')]
        model = os.environ.get('OPENAI_INTELLIGENCE_MODEL', '').strip()
        if model not in {'gpt-4o-mini', 'gpt-4.1-mini'}:
            model = 'gpt-4o-mini'
        body = json.dumps({
            'model': model,
            'max_output_tokens': 600,
            'input': [
                {'role': 'system', 'content': 'You are Dorah, a careful financial controller for a small business. Answer only from the supplied saved-record context. Do not invent transactions, balances, dates, customers, or explanations. Show relevant amounts with the business currency. Distinguish recorded cash from receivables, payables, expected collections, repayments, and internal transfers. When the records are incomplete, say so plainly. Possible findings are review prompts, not confirmed errors. Never authorize, save, delete, or change records. Keep answers practical and concise: answer the question, cite the relevant record categories or figures, and end with one sensible next step. Return plain text, not JSON or markdown tables.'},
                {'role': 'user', 'content': json.dumps({'today': timezone.localdate().isoformat(), 'question': question, 'recent_conversation': history, 'saved_financial_context': context}, default=str)},
            ],
        }).encode('utf-8')
        req = urllib.request.Request('https://api.openai.com/v1/responses', data=body, method='POST', headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as error:
            provider_body = error.read().decode('utf-8', errors='replace')[:2000]
            logger.error('OpenAI intelligence chat rejected the request: status=%s body=%s', error.code, provider_body)
            if error.code in (401, 403):
                detail = 'Financial controller chat is not authorized. Check OPENAI_API_KEY in the deployed backend environment.'
            elif error.code == 404:
                detail = 'The intelligence chat model is unavailable. The backend is configured to use gpt-4o-mini.'
            else:
                detail = 'Financial controller chat is temporarily unavailable. Please try again.'
            return Response({'detail': detail}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except (urllib.error.URLError, TimeoutError) as error:
            logger.exception('OpenAI intelligence chat request failed: %s', error)
            return Response({'detail': 'Financial controller chat could not reach OpenAI. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except json.JSONDecodeError:
            logger.exception('OpenAI intelligence chat returned invalid JSON')
            return Response({'detail': 'The controller returned an incomplete answer. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)
        answer = str(payload.get('output_text') or '').strip()
        if not answer:
            output_parts = []
            for item in payload.get('output', []) if isinstance(payload.get('output'), list) else []:
                if not isinstance(item, dict) or item.get('type') != 'message':
                    continue
                for content in item.get('content', []) if isinstance(item.get('content'), list) else []:
                    if isinstance(content, dict) and content.get('type') in ('output_text', 'text') and content.get('text'):
                        output_parts.append(str(content['text']))
            answer = '\n'.join(output_parts).strip()
        if not answer:
            logger.error('OpenAI intelligence chat returned no text: status=%s output_types=%s', payload.get('status'), [item.get('type') for item in payload.get('output', []) if isinstance(item, dict)])
            return Response({'detail': 'The controller returned an empty answer. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({'data': {'answer': answer, 'grounded': True}})


class TransactionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_transaction(self, request, business_id, transaction_id):
        return Transaction.objects.filter(business__owner=request.user, business_id=business_id, id=transaction_id).first()

    def get(self, request, business_id, transaction_id):
        transaction = self.get_transaction(request, business_id, transaction_id)
        if not transaction:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': TransactionSerializer(transaction).data, 'audit': list(transaction.audit_events.values('action', 'created_at', 'actor__email', 'changes'))})

    @transaction.atomic
    def patch(self, request, business_id, transaction_id):
        saved_transaction = self.get_transaction(request, business_id, transaction_id)
        if not saved_transaction:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        if saved_transaction.obligation_id:
            return Response({'detail': 'Linked payment records cannot be edited. Void this transaction and record a corrected payment instead.'}, status=status.HTTP_400_BAD_REQUEST)
        before = TransactionSerializer(saved_transaction).data
        serializer = TransactionSerializer(saved_transaction, data=request.data, partial=True, context={'business': saved_transaction.business})
        serializer.is_valid(raise_exception=True)
        saved_transaction = serializer.save()
        after = TransactionSerializer(saved_transaction).data
        changes = {key: {'from': before.get(key), 'to': after.get(key)} for key in after if before.get(key) != after.get(key)}
        TransactionAudit.objects.create(transaction=saved_transaction, action=TransactionAudit.Action.UPDATED, actor=request.user, changes=json_safe(changes))
        return Response({'data': after})

    @transaction.atomic
    def delete(self, request, business_id, transaction_id):
        saved_transaction = self.get_transaction(request, business_id, transaction_id)
        if not saved_transaction:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        if saved_transaction.is_voided:
            return Response({'detail': 'This transaction has already been voided.'}, status=status.HTTP_400_BAD_REQUEST)
        obligation = saved_transaction.obligation
        if obligation:
            obligation.balance = min(obligation.amount, obligation.balance + saved_transaction.amount)
            obligation.status = Obligation.Status.OPEN if obligation.balance == obligation.amount else Obligation.Status.PARTIAL
            obligation.save(update_fields=('balance', 'status', 'updated_at'))
        saved_transaction.is_voided = True
        saved_transaction.voided_at = timezone.now()
        saved_transaction.voided_by = request.user
        saved_transaction.void_reason = str(request.data.get('reason') or 'User removed transaction')[:255]
        saved_transaction.save(update_fields=('is_voided', 'voided_at', 'voided_by', 'void_reason', 'updated_at'))
        TransactionAudit.objects.create(transaction=saved_transaction, action=TransactionAudit.Action.VOIDED, actor=request.user, changes={'reason': saved_transaction.void_reason, 'linked_obligation_restored': bool(obligation)})
        return Response({'data': TransactionSerializer(saved_transaction).data})


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
        try:
            opening_balance_is_zero = Decimal(str(data.get('opening_balance') or '0')) == 0
        except (InvalidOperation, TypeError, ValueError):
            opening_balance_is_zero = False
        if not FinancialAccount.objects.filter(business=business).exists() and opening_balance_is_zero and business.opening_balance:
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


class ObligationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_obligation(self, request, business_id, obligation_id):
        return Obligation.objects.filter(business__owner=request.user, business_id=business_id, id=obligation_id).select_related('contact').first()

    def get(self, request, business_id, obligation_id):
        obligation = self.get_obligation(request, business_id, obligation_id)
        if not obligation:
            return Response({'detail': 'Balance not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': ObligationSerializer(obligation).data})

    @transaction.atomic
    def patch(self, request, business_id, obligation_id):
        obligation = self.get_obligation(request, business_id, obligation_id)
        if not obligation:
            return Response({'detail': 'Balance not found.'}, status=status.HTTP_404_NOT_FOUND)
        payments_exist = obligation.payments.filter(is_voided=False).exists()
        if payments_exist and any(field in request.data for field in ('contact', 'kind')):
            return Response({'detail': 'A balance with recorded payments cannot change its customer or balance type.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ObligationSerializer(obligation, data=request.data, partial=True, context={'business': obligation.business})
        serializer.is_valid(raise_exception=True)
        new_amount = serializer.validated_data.get('amount', obligation.amount)
        paid_amount = obligation.amount - obligation.balance
        if new_amount < paid_amount:
            return Response({'amount': 'The original amount cannot be less than payments already recorded.'}, status=status.HTTP_400_BAD_REQUEST)
        saved_obligation = serializer.save(balance=new_amount - paid_amount, status=Obligation.Status.SETTLED if new_amount == paid_amount else (Obligation.Status.PARTIAL if paid_amount else Obligation.Status.OPEN))
        return Response({'data': ObligationSerializer(saved_obligation).data})

    @transaction.atomic
    def delete(self, request, business_id, obligation_id):
        obligation = self.get_obligation(request, business_id, obligation_id)
        if not obligation:
            return Response({'detail': 'Balance not found.'}, status=status.HTTP_404_NOT_FOUND)
        if obligation.payments.filter(is_voided=False).exists():
            return Response({'detail': 'This balance has recorded payments and cannot be deleted. Void the linked payments first.'}, status=status.HTTP_400_BAD_REQUEST)
        # Keep voided payments for audit history, but release their protected
        # foreign-key reference so the now-unused balance can be removed.
        obligation.payments.filter(is_voided=True).update(obligation=None)
        obligation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        rows = list(Transaction.objects.filter(business=business, is_voided=False, obligation__isnull=True,
                    kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE), occurred_on__gte=first_month, occurred_on__lte=today)
                    .annotate(month=TruncMonth('occurred_on')).values('month', 'kind').annotate(total=Sum('amount')).order_by('month'))
        months = {}
        for row in rows:
            key = row['month'].strftime('%Y-%m')
            months.setdefault(key, {'month': key, 'income': 0, 'expenses': 0})
            months[key]['income' if row['kind'] == Transaction.Kind.INCOME else 'expenses'] = row['total'] or 0
        obligations = Obligation.objects.filter(business=business, affects_performance=True,
                    created_at__date__gte=first_month, created_at__date__lte=today)
        obligation_rows = obligations.annotate(month=TruncMonth('created_at')).values('month', 'kind').annotate(total=Sum('amount'))
        for row in obligation_rows:
            key = row['month'].strftime('%Y-%m')
            months.setdefault(key, {'month': key, 'income': 0, 'expenses': 0})
            field = 'income' if row['kind'] == Obligation.Kind.RECEIVABLE else 'expenses'
            months[key][field] += row['total'] or 0
        for month in months.values():
            month['net'] = month['income'] - month['expenses']
        return Response({'data': sorted(months.values(), key=lambda row: row['month']), 'period_start': first_month, 'period_end': today,
                         'basis': 'recorded_transactions_and_balances', 'is_complete_profit_and_loss': False})


class FinanceInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, business_id):
        business = owned_business(request, business_id)
        if not business:
            return Response({'detail': 'Business not found.'}, status=status.HTTP_404_NOT_FOUND)
        today = timezone.localdate()
        findings = []
        potential_impact = Decimal('0.00')
        overdue = Obligation.objects.filter(business=business, kind=Obligation.Kind.RECEIVABLE,
                                             balance__gt=0, due_date__lt=today).select_related('contact')
        overdue_total = sum((item.balance for item in overdue), start=0)
        if overdue.exists():
            overdue_evidence = [
                {'id': str(item.id), 'contact': item.contact.name, 'description': item.description,
                 'due_date': item.due_date, 'balance': item.balance}
                for item in overdue.order_by('due_date')[:10]
            ]
            findings.append({'id': 'overdue-receivables', 'severity': 'high', 'status': 'new',
                             'title': 'Customer balances are overdue',
                             'detail': f'{overdue.count()} customer balances totaling {overdue_total:,.2f} {business.currency} are past due.',
                             'evidence_count': overdue.count(), 'source': 'obligations',
                             'impact_amount': overdue_total,
                             'action_label': 'Investigate receivables',
                             'suggestion': 'Check the original due date and recent payments before following up. Keep this amount out of available cash until collected.',
                             'evidence': overdue_evidence,
                             'action_url': '/dashboard/receivables'})
            potential_impact += overdue_total

        next_week = today + timedelta(days=7)
        upcoming_payables = Obligation.objects.filter(
            business=business, kind=Obligation.Kind.PAYABLE, balance__gt=0,
            due_date__gte=today, due_date__lte=next_week,
        ).select_related('contact').order_by('due_date')
        upcoming_total = upcoming_payables.aggregate(total=Sum('balance'))['total'] or Decimal('0.00')
        if upcoming_total:
            findings.append({'id': 'upcoming-payables', 'severity': 'review', 'status': 'planning',
                             'title': 'Supplier obligations due in the next 7 days',
                             'detail': f'Recorded supplier balances totaling {upcoming_total:,.2f} {business.currency} are due by {next_week}. Compare these dates with current account balances and expected collections before scheduling payments.',
                             'evidence_count': upcoming_payables.count(), 'source': 'payables',
                             'impact_amount': upcoming_total,
                             'period_start': today, 'period_end': next_week,
                             'action_label': 'Review upcoming bills',
                             'suggestion': 'Compare these due dates with recorded account balances and expected customer collections.',
                             'evidence': [{'id': str(item.id), 'contact': item.contact.name, 'description': item.description,
                                           'due_date': item.due_date, 'balance': item.balance}
                                          for item in upcoming_payables[:10]],
                             'action_url': '/dashboard/payables'})
            potential_impact += upcoming_total

        period_start = today.replace(day=1)
        previous_month_end = period_start - timedelta(days=1)
        previous_month_start = previous_month_end.replace(day=1)
        comparable_days = min(today.day, previous_month_end.day)
        previous_period_end = previous_month_start + timedelta(days=comparable_days - 1)
        current_period_expenses = Transaction.objects.filter(
            business=business, is_voided=False, kind=Transaction.Kind.EXPENSE, obligation__isnull=True,
            occurred_on__gte=period_start, occurred_on__lte=today,
        )
        previous_period_expenses = Transaction.objects.filter(
            business=business, is_voided=False, kind=Transaction.Kind.EXPENSE, obligation__isnull=True,
            occurred_on__gte=previous_month_start, occurred_on__lte=previous_period_end,
        )
        current_by_category = {row['category'] or '': row['total'] or Decimal('0.00')
                               for row in current_period_expenses.values('category').annotate(total=Sum('amount'))}
        previous_by_category = {row['category'] or '': row['total'] or Decimal('0.00')
                                for row in previous_period_expenses.values('category').annotate(total=Sum('amount'))}
        for raw_category, current_total in current_by_category.items():
            category = raw_category or 'Uncategorized'
            previous_total = previous_by_category.get(raw_category, Decimal('0.00'))
            increase = current_total - previous_total
            if previous_total < Decimal('10000.00') or increase < Decimal('5000.00') or current_total < previous_total * Decimal('1.35'):
                continue
            percentage = int((increase * 100 / previous_total).quantize(Decimal('1')))
            evidence = []
            for transaction in current_period_expenses.filter(category=raw_category)[:5]:
                evidence.append({'id': str(transaction.id), 'date': transaction.occurred_on,
                                 'description': transaction.description, 'amount': transaction.amount,
                                 'counterparty': transaction.counterparty, 'period': 'current'})
            for transaction in previous_period_expenses.filter(category=raw_category)[:5]:
                evidence.append({'id': f'previous-{transaction.id}', 'date': transaction.occurred_on,
                                 'description': transaction.description, 'amount': transaction.amount,
                                 'counterparty': transaction.counterparty, 'period': 'previous'})
            findings.append({'id': f'expense-increase-{raw_category or "uncategorized"}',
                             'severity': 'review', 'status': 'new',
                             'title': f'{category} expenses increased',
                             'detail': f'{category} expenses increased {percentage}% from {previous_total:,.2f} {business.currency} to {current_total:,.2f} {business.currency}, comparing {previous_month_start}–{previous_period_end} with {period_start}–{today}.',
                             'evidence_count': len(evidence), 'source': 'transactions',
                             'impact_amount': increase, 'period_start': period_start,
                             'period_end': today, 'comparison_start': previous_month_start,
                             'comparison_end': previous_period_end,
                             'action_label': 'Review expense activity',
                             'suggestion': 'Inspect the listed transactions for new one-off costs or records filed under the wrong category.',
                             'evidence': evidence,
                             'action_url': '/dashboard/transactions'})
            potential_impact += increase

        recent = Transaction.objects.filter(business=business, is_voided=False, kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE),
                                            obligation__isnull=True, occurred_on__gte=today - timedelta(days=90))
        groups = {}
        for item in recent:
            duplicate_key = (item.kind, item.amount, item.occurred_on, item.account_id, item.contact_id,
                             (item.counterparty or '').strip().lower(), item.description.strip().lower())
            groups.setdefault(duplicate_key, []).append(item)
        for duplicate_rows in groups.values():
            if len(duplicate_rows) > 1:
                findings.append({'id': f"possible-duplicate-{duplicate_rows[0].id}", 'severity': 'review', 'status': 'new',
                                 'title': 'Possible duplicate transaction',
                                 'detail': f'{len(duplicate_rows)} saved transactions share the same date, amount, description, and counterparty.',
                                 'evidence_count': len(duplicate_rows), 'source': 'transactions',
                                 'impact_amount': Decimal('0.00'), 'action_label': 'Compare transactions',
                                 'suggestion': 'Matching details can also describe two legitimate purchases. Compare dates, counterparties, and account activity before changing either record.',
                                 'transaction_ids': [str(item.id) for item in duplicate_rows],
                                 'evidence': [{'id': str(item.id), 'date': item.occurred_on, 'description': item.description,
                                               'amount': item.amount, 'counterparty': item.counterparty}
                                              for item in duplicate_rows],
                                 'action_url': '/dashboard/transactions'})
        findings.sort(key=lambda item: (item['severity'] != 'high', item['title']))
        return Response({'data': findings,
                         'summary': {'open_findings': len(findings), 'potential_impact': potential_impact},
                         'generated_from': 'saved_records', 'generated_at': timezone.now()})
