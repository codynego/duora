import hashlib
import json
from datetime import timedelta
from decimal import Decimal

from django.core.serializers.json import DjangoJSONEncoder
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from ..models import FinancialFinding, Obligation, Transaction
from .balances import recorded_cash_position
from .data_quality import assess_financial_data_quality


ZERO = Decimal('0.00')


def _percentage_change(current, previous):
    if previous <= 0:
        return None
    return int(((current - previous) * Decimal('100') / previous).quantize(Decimal('1')))


def _finding_type(fingerprint):
    if fingerprint.startswith('expense-increase-'):
        return 'expense_increase'
    if fingerprint.startswith('possible-duplicate-'):
        return 'possible_duplicate'
    return fingerprint.replace('-', '_')[:80]


def build_financial_intelligence(business, as_of=None) -> dict:
    """Evaluate deterministic finding rules without mutating finding state."""
    today = as_of or timezone.localdate()
    findings = []
    potential_impact = ZERO
    transactions = Transaction.objects.filter(business=business, is_voided=False)
    period_start = today.replace(day=1)
    previous_month_end = period_start - timedelta(days=1)
    previous_month_start = previous_month_end.replace(day=1)
    comparable_days = min(today.day, previous_month_end.day)
    previous_period_end = previous_month_start + timedelta(days=comparable_days - 1)

    performance_transactions = transactions.filter(
        kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE), obligation__isnull=True,
    )
    current_period = performance_transactions.filter(occurred_on__gte=period_start, occurred_on__lte=today)
    previous_period = performance_transactions.filter(
        occurred_on__gte=previous_month_start, occurred_on__lte=previous_period_end,
    )
    current_totals = {
        row['kind']: row['total'] or ZERO
        for row in current_period.values('kind').annotate(total=Sum('amount'))
    }
    previous_totals = {
        row['kind']: row['total'] or ZERO
        for row in previous_period.values('kind').annotate(total=Sum('amount'))
    }
    current_income = current_totals.get(Transaction.Kind.INCOME, ZERO)
    current_expenses = current_totals.get(Transaction.Kind.EXPENSE, ZERO)
    previous_income = previous_totals.get(Transaction.Kind.INCOME, ZERO)
    previous_expenses = previous_totals.get(Transaction.Kind.EXPENSE, ZERO)
    current_record_count = current_period.count()
    previous_record_count = previous_period.count()
    total_record_count = performance_transactions.count()
    has_comparable_periods = current_record_count >= 2 and previous_record_count >= 2
    cash_position = recorded_cash_position(business)
    accounts = cash_position['accounts']
    recorded_cash = cash_position['total']

    overdue = Obligation.objects.filter(
        business=business,
        kind=Obligation.Kind.RECEIVABLE,
        balance__gt=0,
        due_date__lt=today,
    ).select_related('contact')
    overdue_total = overdue.aggregate(total=Sum('balance'))['total'] or ZERO
    if overdue_total:
        overdue_evidence = [
            {
                'id': str(item.id),
                'contact': item.contact.name,
                'description': item.description,
                'due_date': item.due_date,
                'balance': item.balance,
            }
            for item in overdue.order_by('due_date')[:10]
        ]
        findings.append({
            'id': 'overdue-receivables',
            'severity': 'high',
            'status': 'new',
            'title': 'Customer balances are overdue',
            'risk_label': 'Cash collection risk',
            'detail': f'{overdue.count()} customer balances totaling {overdue_total:,.2f} {business.currency} are past due.',
            'why_it_matters': 'Money recorded as customer balances is not available cash. Longer collection delays can make it harder to cover operating expenses and supplier commitments.',
            'metrics': [
                {'label': 'Overdue balance', 'value': overdue_total, 'format': 'currency'},
                {'label': 'Overdue records', 'value': overdue.count(), 'format': 'number'},
            ],
            'evidence_count': overdue.count(),
            'source': 'obligations',
            'impact_amount': overdue_total,
            'action_label': 'Investigate receivables',
            'suggestion': 'Check the original due date and recent payments before following up. Keep this amount out of available cash until collected.',
            'evidence': overdue_evidence,
            'action_url': '/dashboard/receivables',
            'suggested_questions': ['Which customer should I follow up with first?', 'How does this affect my cash flow?', 'What happens if these customers pay late?'],
        })
        potential_impact += overdue_total

    receivables_by_contact = list(
        Obligation.objects.filter(
            business=business,
            kind=Obligation.Kind.RECEIVABLE,
            balance__gt=0,
        )
        .values('contact_id', 'contact__name')
        .annotate(balance=Sum('balance'))
        .order_by('-balance')
    )
    receivables_total = sum((row['balance'] or ZERO for row in receivables_by_contact), ZERO)
    if len(receivables_by_contact) >= 2 and receivables_total > 0:
        leading = receivables_by_contact[0]
        leading_share = int(((leading['balance'] * 100) / receivables_total).quantize(Decimal('1')))
        if leading_share >= 50:
            concentration_evidence = [
                {
                    'id': str(row['contact_id']),
                    'contact': row['contact__name'],
                    'description': 'Outstanding customer balance',
                    'balance': row['balance'],
                }
                for row in receivables_by_contact[:5]
            ]
            findings.append({
                'id': 'receivables-concentration',
                'severity': 'review',
                'status': 'planning',
                'title': 'Outstanding receivables are concentrated in one customer',
                'risk_label': 'Customer concentration risk',
                'detail': f'{leading["contact__name"]} accounts for {leading_share}% of the {receivables_total:,.2f} {business.currency} currently outstanding from customers.',
                'why_it_matters': 'When a large share of expected cash depends on one customer, a single late payment can materially affect the business cash position.',
                'metrics': [
                    {'label': 'Total outstanding', 'value': receivables_total, 'format': 'currency'},
                    {'label': 'Largest customer balance', 'value': leading['balance'], 'format': 'currency'},
                    {'label': 'Largest customer share', 'value': leading_share, 'format': 'percent'},
                ],
                'evidence_count': len(receivables_by_contact),
                'source': 'obligations',
                'impact_amount': leading['balance'],
                'action_label': 'Review customer concentration',
                'suggestion': 'Confirm the expected collection date and consider the cash impact if this customer pays later than planned.',
                'evidence': concentration_evidence,
                'action_url': '/dashboard/receivables',
                'suggested_questions': ['How would a late payment affect cash?', 'Which balances should I follow up on?', 'How concentrated are my collections?'],
            })

    next_week = today + timedelta(days=7)
    upcoming_payables = Obligation.objects.filter(
        business=business,
        kind=Obligation.Kind.PAYABLE,
        balance__gt=0,
        due_date__gte=today,
        due_date__lte=next_week,
    ).select_related('contact').order_by('due_date')
    upcoming_total = upcoming_payables.aggregate(total=Sum('balance'))['total'] or ZERO
    if upcoming_total:
        findings.append({
            'id': 'upcoming-payables',
            'severity': 'review',
            'status': 'planning',
            'title': 'Supplier obligations due in the next 7 days',
            'risk_label': 'Upcoming cash commitment',
            'detail': f'Recorded supplier balances totaling {upcoming_total:,.2f} {business.currency} are due by {next_week}. Compare these dates with current account balances and expected collections before scheduling payments.',
            'why_it_matters': 'Upcoming supplier payments reduce the cash available for other operating needs. Their timing should be compared with expected collections and the desired cash buffer.',
            'metrics': [
                {'label': 'Due within 7 days', 'value': upcoming_total, 'format': 'currency'},
                {'label': 'Supplier obligations', 'value': upcoming_payables.count(), 'format': 'number'},
                {'label': 'Recorded cash', 'value': recorded_cash, 'format': 'currency'},
            ],
            'evidence_count': upcoming_payables.count(),
            'source': 'payables',
            'impact_amount': upcoming_total,
            'period_start': today,
            'period_end': next_week,
            'action_label': 'Review upcoming bills',
            'suggestion': 'Compare these due dates with recorded account balances and expected customer collections.',
            'evidence': [
                {
                    'id': str(item.id),
                    'contact': item.contact.name,
                    'description': item.description,
                    'due_date': item.due_date,
                    'balance': item.balance,
                }
                for item in upcoming_payables[:10]
            ],
            'action_url': '/dashboard/payables',
            'suggested_questions': ['Which payment is due first?', 'Will recorded cash cover these bills?', 'What collections are expected before payment?'],
        })
        potential_impact += upcoming_total

    current_period_expenses = Transaction.objects.filter(
        business=business,
        is_voided=False,
        kind=Transaction.Kind.EXPENSE,
        obligation__isnull=True,
        occurred_on__gte=period_start,
        occurred_on__lte=today,
    )
    previous_period_expenses = Transaction.objects.filter(
        business=business,
        is_voided=False,
        kind=Transaction.Kind.EXPENSE,
        obligation__isnull=True,
        occurred_on__gte=previous_month_start,
        occurred_on__lte=previous_period_end,
    )
    current_by_category = {
        row['category'] or '': row['total'] or ZERO
        for row in current_period_expenses.values('category').annotate(total=Sum('amount'))
    }
    previous_by_category = {
        row['category'] or '': row['total'] or ZERO
        for row in previous_period_expenses.values('category').annotate(total=Sum('amount'))
    }
    for raw_category, current_total in current_by_category.items():
        category = raw_category or 'Uncategorized'
        previous_total = previous_by_category.get(raw_category, ZERO)
        increase = current_total - previous_total
        if previous_total < Decimal('10000.00') or increase < Decimal('5000.00') or current_total < previous_total * Decimal('1.35'):
            continue
        percentage = int((increase * 100 / previous_total).quantize(Decimal('1')))
        evidence = [
            {
                'id': str(item.id),
                'date': item.occurred_on,
                'description': item.description,
                'amount': item.amount,
                'counterparty': item.counterparty,
                'period': 'current',
            }
            for item in current_period_expenses.filter(category=raw_category)[:5]
        ]
        evidence.extend({
            'id': f'previous-{item.id}',
            'date': item.occurred_on,
            'description': item.description,
            'amount': item.amount,
            'counterparty': item.counterparty,
            'period': 'previous',
        } for item in previous_period_expenses.filter(category=raw_category)[:5])
        findings.append({
            'id': f'expense-increase-{raw_category or "uncategorized"}',
            'severity': 'review',
            'status': 'new',
            'title': f'{category} expenses increased',
            'risk_label': 'Expense variance',
            'detail': f'{category} expenses increased {percentage}% from {previous_total:,.2f} {business.currency} to {current_total:,.2f} {business.currency}, comparing {previous_month_start}-{previous_period_end} with {period_start}-{today}.',
            'why_it_matters': 'A sustained increase can reduce the cash available for other commitments. The underlying records should be checked to distinguish recurring costs from one-off or miscategorised expenses.',
            'metrics': [
                {'label': 'Current period', 'value': current_total, 'format': 'currency'},
                {'label': 'Previous period', 'value': previous_total, 'format': 'currency'},
                {'label': 'Increase', 'value': percentage, 'format': 'percent'},
            ],
            'evidence_count': len(evidence),
            'source': 'transactions',
            'impact_amount': increase,
            'period_start': period_start,
            'period_end': today,
            'comparison_start': previous_month_start,
            'comparison_end': previous_period_end,
            'action_label': 'Review expense activity',
            'suggestion': 'Inspect the listed transactions for new one-off costs or records filed under the wrong category.',
            'evidence': evidence,
            'action_url': '/dashboard/transactions',
            'suggested_questions': [f'What caused the increase in {category}?', 'Is this increase recurring?', 'Which transactions should I review first?'],
        })
        potential_impact += increase

    recent = Transaction.objects.filter(
        business=business,
        is_voided=False,
        kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE),
        obligation__isnull=True,
        occurred_on__gte=today - timedelta(days=90),
    )
    duplicate_groups = {}
    for item in recent:
        duplicate_key = (
            item.kind,
            item.amount,
            item.occurred_on,
            item.account_id,
            item.contact_id,
            (item.counterparty or '').strip().lower(),
            item.description.strip().lower(),
        )
        duplicate_groups.setdefault(duplicate_key, []).append(item)
    for duplicate_rows in duplicate_groups.values():
        if len(duplicate_rows) < 2:
            continue
        findings.append({
            'id': f'possible-duplicate-{duplicate_rows[0].id}',
            'severity': 'review',
            'status': 'new',
            'title': 'Possible duplicate transaction',
            'risk_label': 'Record quality risk',
            'detail': f'{len(duplicate_rows)} saved transactions share the same date, amount, description, and counterparty.',
            'why_it_matters': 'A duplicate record can overstate income or expenses and distort cash, performance comparisons, and future forecasts.',
            'metrics': [
                {'label': 'Matching records', 'value': len(duplicate_rows), 'format': 'number'},
                {'label': 'Amount per record', 'value': duplicate_rows[0].amount, 'format': 'currency'},
            ],
            'evidence_count': len(duplicate_rows),
            'source': 'transactions',
            'impact_amount': ZERO,
            'action_label': 'Compare transactions',
            'suggestion': 'Matching details can also describe two legitimate purchases. Compare dates, counterparties, and account activity before changing either record.',
            'transaction_ids': [str(item.id) for item in duplicate_rows],
            'evidence': [
                {
                    'id': str(item.id),
                    'date': item.occurred_on,
                    'description': item.description,
                    'amount': item.amount,
                    'counterparty': item.counterparty,
                }
                for item in duplicate_rows
            ],
            'action_url': '/dashboard/transactions',
            'suggested_questions': ['Why were these records flagged?', 'How would removing a duplicate affect my totals?', 'What should I compare before correcting it?'],
        })

    cash_after_known_payables = recorded_cash - upcoming_total
    if upcoming_total and cash_after_known_payables < 0:
        findings.append({
            'id': 'cash-coverage-risk',
            'severity': 'high',
            'status': 'new',
            'title': 'Recorded cash may not cover known supplier payments',
            'risk_label': 'Cash flow risk',
            'detail': f'Recorded cash is {recorded_cash:,.2f} {business.currency}, while supplier balances due in the next 7 days total {upcoming_total:,.2f} {business.currency}. This does not include future income or unrecorded commitments.',
            'why_it_matters': 'Known supplier commitments exceed the cash currently recorded. Without timely collections or payment rescheduling, the business may not be able to meet every obligation when due.',
            'metrics': [
                {'label': 'Recorded cash', 'value': recorded_cash, 'format': 'currency'},
                {'label': 'Due within 7 days', 'value': upcoming_total, 'format': 'currency'},
                {'label': 'Potential shortfall', 'value': abs(cash_after_known_payables), 'format': 'currency'},
            ],
            'evidence_count': upcoming_payables.count(),
            'source': 'payables',
            'impact_amount': abs(cash_after_known_payables),
            'period_start': today,
            'period_end': next_week,
            'action_label': 'Review cash coverage',
            'suggestion': 'Confirm account balances, customer collections, and which supplier payments can be scheduled before committing to additional spending.',
            'evidence': [
                {'id': 'recorded-cash', 'description': 'Recorded cash across accounts', 'amount': recorded_cash},
                {'id': 'upcoming-payables', 'description': 'Supplier balances due in 7 days', 'amount': upcoming_total},
            ],
            'action_url': '/dashboard/payables',
            'suggested_questions': ['Which payment creates the shortfall?', 'What happens if a customer pays late?', 'How can I protect my cash buffer?'],
        })

    income_change = _percentage_change(current_income, previous_income)
    expense_change = _percentage_change(current_expenses, previous_expenses)
    if (
        has_comparable_periods
        and income_change is not None
        and expense_change is not None
        and expense_change >= 15
        and expense_change > income_change
    ):
        findings.append({
            'id': 'expenses-outpacing-income',
            'severity': 'review',
            'status': 'new',
            'title': 'Recorded expenses are growing faster than recorded income',
            'risk_label': 'Performance risk',
            'detail': f'Expenses changed {expense_change:+d}% while income changed {income_change:+d}% across comparable month-to-date periods. Review the expense categories and transactions behind the change.',
            'why_it_matters': 'When expenses grow faster than income, the recorded net result and available cash can weaken even if sales are increasing.',
            'metrics': [
                {'label': 'Expense change', 'value': expense_change, 'format': 'signed_percent'},
                {'label': 'Income change', 'value': income_change, 'format': 'signed_percent'},
                {'label': 'Current net movement', 'value': current_income - current_expenses, 'format': 'currency'},
            ],
            'evidence_count': current_record_count + previous_record_count,
            'source': 'transactions',
            'impact_amount': ZERO,
            'period_start': period_start,
            'period_end': today,
            'comparison_start': previous_month_start,
            'comparison_end': previous_period_end,
            'action_label': 'Review recorded performance',
            'suggestion': 'Inspect the largest expense changes first and confirm whether the rise is recurring, one-off, or incorrectly categorised.',
            'evidence': [
                {'id': 'current-income', 'description': 'Recorded income - current period', 'amount': current_income, 'period': 'current'},
                {'id': 'current-expenses', 'description': 'Recorded expenses - current period', 'amount': current_expenses, 'period': 'current'},
                {'id': 'previous-income', 'description': 'Recorded income - comparison period', 'amount': previous_income, 'period': 'previous'},
                {'id': 'previous-expenses', 'description': 'Recorded expenses - comparison period', 'amount': previous_expenses, 'period': 'previous'},
            ],
            'action_url': '/dashboard/performance',
            'suggested_questions': ['Which expenses are growing fastest?', 'Is the change recurring?', 'How does this affect my current cash position?'],
        })

    data_quality = assess_financial_data_quality(business)
    data_status = 'ready' if total_record_count >= 6 and accounts else 'limited'
    if data_status == 'limited':
        data_note = 'Add more dated income and expense records, plus at least one account, before relying on trend comparisons.'
    elif not has_comparable_periods:
        data_note = 'Current balances are available, but there are not yet two comparable periods for trend analysis.'
    else:
        data_note = 'Trend comparisons use dated, saved transactions. Results remain limited to the records Dorah has.'
    material_risk = (
        cash_after_known_payables < 0
        or (
            has_comparable_periods
            and income_change is not None
            and expense_change is not None
            and expense_change >= 15
            and expense_change > income_change
        )
    )
    health_status = 'needs_review' if material_risk else 'steady' if data_status == 'ready' else 'limited'
    health_title = (
        'Your financial position needs review'
        if health_status == 'needs_review'
        else 'Your recorded position is building'
        if health_status == 'limited'
        else 'Your recorded position is steady'
    )
    health_detail = (
        'Known supplier commitments exceed recorded cash in the next 7 days. Confirm collections and payment timing before committing to more spending.'
        if cash_after_known_payables < 0
        else 'Dorah has enough saved data to show your current position. Keep recording consistently to strengthen the next comparison.'
        if health_status == 'steady'
        else data_note
    )
    health = {
        'status': health_status,
        'title': health_title,
        'detail': health_detail,
        'data_quality': {
            'status': data_status,
            'record_count': total_record_count,
            'account_count': len(accounts),
            'score': data_quality['score'],
            'capabilities': data_quality['capabilities'],
            'missing': data_quality['missing'],
            'warnings': data_quality['warnings'],
            'note': data_note,
        },
        'performance': {
            'status': 'ready' if has_comparable_periods else 'limited',
            'period_start': period_start,
            'period_end': today,
            'comparison_start': previous_month_start,
            'comparison_end': previous_period_end,
            'income': current_income,
            'expenses': current_expenses,
            'net_recorded_movement': current_income - current_expenses,
            'income_change_percent': income_change if has_comparable_periods else None,
            'expense_change_percent': expense_change if has_comparable_periods else None,
        },
        'cash_flow': {
            'status': 'needs_review' if cash_after_known_payables < 0 else 'ready' if accounts else 'limited',
            'recorded_cash': recorded_cash,
            'known_payables_next_7_days': upcoming_total,
            'cash_after_known_payables': cash_after_known_payables,
            'overdue_receivables': overdue_total,
            'note': 'Recorded cash less known supplier balances due in the next 7 days. It does not assume future income or unrecorded commitments.',
        },
    }
    findings.sort(key=lambda item: (item['severity'] != 'high', item['title']))
    return {
        'data': findings,
        'summary': {'open_findings': len(findings), 'potential_impact': potential_impact},
        'health': health,
        'generated_from': 'saved_records',
        'generated_at': timezone.now(),
    }


def sync_finding_lifecycle(business, result) -> dict:
    """Persist current findings while preserving user-reviewed lifecycle state."""
    now = timezone.now()
    seen = []
    stateful_findings = []
    with transaction.atomic():
        for finding in result['data']:
            fingerprint = finding['id']
            seen.append(fingerprint)
            safe_payload = json.loads(json.dumps(finding, cls=DjangoJSONEncoder))
            content_hash = hashlib.sha256(
                json.dumps(safe_payload, sort_keys=True, separators=(',', ':')).encode('utf-8')
            ).hexdigest()
            default_status = finding.get('status', FinancialFinding.Status.NEW)
            stored, created = FinancialFinding.objects.select_for_update().get_or_create(
                business=business,
                fingerprint=fingerprint,
                defaults={
                    'finding_type': _finding_type(fingerprint),
                    'severity': finding['severity'],
                    'status': default_status,
                    'content_hash': content_hash,
                    'payload': safe_payload,
                    'last_seen_at': now,
                },
            )
            if not created:
                content_changed = stored.content_hash != content_hash
                if stored.status == FinancialFinding.Status.RESOLVED and content_changed:
                    stored.status = default_status
                    stored.feedback = FinancialFinding.Feedback.NONE
                    stored.resolved_at = None
                stored.finding_type = _finding_type(fingerprint)
                stored.severity = finding['severity']
                stored.content_hash = content_hash
                stored.payload = safe_payload
                stored.is_active = True
                stored.last_seen_at = now
                stored.save(update_fields=(
                    'finding_type', 'severity', 'status', 'content_hash', 'payload',
                    'feedback', 'is_active', 'last_seen_at', 'resolved_at', 'updated_at',
                ))
            stateful = dict(finding)
            stateful['status'] = stored.status
            stateful['feedback'] = stored.feedback
            stateful['first_seen_at'] = stored.first_seen_at
            stateful['last_seen_at'] = stored.last_seen_at
            stateful_findings.append(stateful)

        stale = FinancialFinding.objects.filter(business=business, is_active=True)
        if seen:
            stale = stale.exclude(fingerprint__in=seen)
        stale.update(is_active=False, updated_at=now)

    result = dict(result)
    result['data'] = stateful_findings
    result['summary'] = dict(result['summary'])
    result['summary']['open_findings'] = sum(
        finding['status'] != FinancialFinding.Status.RESOLVED for finding in stateful_findings
    )
    return result


def evaluate_financial_intelligence(business, as_of=None, persist=True) -> dict:
    result = build_financial_intelligence(business, as_of=as_of)
    return sync_finding_lifecycle(business, result) if persist else result


def update_finding_lifecycle(business, fingerprint, status=None, feedback=None) -> dict:
    finding = FinancialFinding.objects.filter(
        business=business,
        fingerprint=fingerprint,
        is_active=True,
    ).first()
    if not finding:
        raise FinancialFinding.DoesNotExist

    update_fields = ['updated_at']
    if status is not None:
        valid_statuses = {choice for choice, _ in FinancialFinding.Status.choices}
        if status not in valid_statuses:
            raise ValueError('status must be new, planning, or resolved.')
        finding.status = status
        finding.resolved_at = timezone.now() if status == FinancialFinding.Status.RESOLVED else None
        update_fields.extend(('status', 'resolved_at'))
    if feedback is not None:
        valid_feedback = {choice for choice, _ in FinancialFinding.Feedback.choices}
        if feedback not in valid_feedback:
            raise ValueError('feedback must be useful, not_relevant, handled, or empty.')
        finding.feedback = feedback
        update_fields.append('feedback')
    finding.save(update_fields=tuple(dict.fromkeys(update_fields)))

    payload = dict(finding.payload)
    payload['status'] = finding.status
    payload['feedback'] = finding.feedback
    payload['first_seen_at'] = finding.first_seen_at
    payload['last_seen_at'] = finding.last_seen_at
    payload['resolved_at'] = finding.resolved_at
    return payload
