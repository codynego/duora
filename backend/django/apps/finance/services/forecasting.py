from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation

from django.utils import timezone

from ..models import Obligation
from .balances import ZERO, recorded_cash_position
from .data_quality import assess_financial_data_quality


MIN_HORIZON_DAYS = 1
MAX_HORIZON_DAYS = 90


class ForecastInputError(ValueError):
    pass


def _decimal(value, field_name):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as error:
        raise ForecastInputError(f'{field_name} must be a valid amount.') from error
    if amount < ZERO:
        raise ForecastInputError(f'{field_name} cannot be negative.')
    return amount


def _horizon(value):
    try:
        days = int(value)
    except (TypeError, ValueError) as error:
        raise ForecastInputError('horizon_days must be a whole number.') from error
    if not MIN_HORIZON_DAYS <= days <= MAX_HORIZON_DAYS:
        raise ForecastInputError(f'horizon_days must be between {MIN_HORIZON_DAYS} and {MAX_HORIZON_DAYS}.')
    return days


def _scenario_events(business, adjustments, today, end_date):
    events = []
    obligation_overrides = {}
    if adjustments is None:
        return events, obligation_overrides
    if not isinstance(adjustments, list) or len(adjustments) > 50:
        raise ForecastInputError('adjustments must be a list containing at most 50 items.')

    obligations = {
        str(item.id): item
        for item in Obligation.objects.filter(business=business, balance__gt=0)
    }
    for index, adjustment in enumerate(adjustments):
        if not isinstance(adjustment, dict):
            raise ForecastInputError(f'adjustments[{index}] must be an object.')
        adjustment_type = adjustment.get('type')
        if adjustment_type == 'delay_obligation':
            obligation_id = str(adjustment.get('obligation_id') or '')
            obligation = obligations.get(obligation_id)
            if not obligation:
                raise ForecastInputError(f'adjustments[{index}].obligation_id was not found in this business.')
            try:
                days = int(adjustment.get('days'))
            except (TypeError, ValueError) as error:
                raise ForecastInputError(f'adjustments[{index}].days must be a whole number.') from error
            if days < 0 or days > MAX_HORIZON_DAYS:
                raise ForecastInputError(f'adjustments[{index}].days must be between 0 and {MAX_HORIZON_DAYS}.')
            if not obligation.due_date:
                raise ForecastInputError(f'adjustments[{index}] cannot delay an obligation without a due date.')
            obligation_overrides[obligation_id] = obligation.due_date + timedelta(days=days)
        elif adjustment_type == 'cash_event':
            direction = adjustment.get('direction')
            if direction not in ('inflow', 'outflow'):
                raise ForecastInputError(f'adjustments[{index}].direction must be inflow or outflow.')
            try:
                event_date = date.fromisoformat(str(adjustment.get('date')))
            except (TypeError, ValueError):
                raise ForecastInputError(f'adjustments[{index}].date must use YYYY-MM-DD.')
            if event_date < today or event_date > end_date:
                raise ForecastInputError(f'adjustments[{index}].date must fall within the forecast horizon.')
            events.append({
                'date': event_date,
                'direction': direction,
                'amount': _decimal(adjustment.get('amount'), f'adjustments[{index}].amount'),
                'description': str(adjustment.get('description') or 'Scenario adjustment')[:160],
                'source': 'scenario',
                'source_id': None,
            })
        else:
            raise ForecastInputError(f'adjustments[{index}].type must be delay_obligation or cash_event.')
    return events, obligation_overrides


def build_cash_forecast(business, horizon_days=30, cash_buffer=ZERO, adjustments=None) -> dict:
    """Build a transparent cash projection from dated saved obligations.

    This is deliberately a contractual projection, not a statistical promise:
    receivables are placed on their recorded due dates and assumptions are
    returned with the result.
    """
    days = _horizon(horizon_days)
    buffer_amount = _decimal(cash_buffer, 'cash_buffer')
    today = timezone.localdate()
    end_date = today + timedelta(days=days - 1)
    cash = recorded_cash_position(business)
    quality = assess_financial_data_quality(business)
    scenario_events, obligation_overrides = _scenario_events(business, adjustments, today, end_date)

    events = list(scenario_events)
    undated = {'receivables': 0, 'payables': 0}
    overdue = {'receivables': ZERO, 'payables': ZERO}
    obligations = Obligation.objects.filter(business=business, balance__gt=0).select_related('contact')
    for obligation in obligations:
        event_date = obligation_overrides.get(str(obligation.id), obligation.due_date)
        bucket = 'receivables' if obligation.kind == Obligation.Kind.RECEIVABLE else 'payables'
        if not event_date:
            undated[bucket] += 1
            continue
        if event_date < today:
            overdue[bucket] += obligation.balance
            continue
        if event_date > end_date:
            continue
        events.append({
            'date': event_date,
            'direction': 'inflow' if obligation.kind == Obligation.Kind.RECEIVABLE else 'outflow',
            'amount': obligation.balance,
            'description': obligation.description,
            'contact': obligation.contact.name,
            'source': 'obligation',
            'source_id': str(obligation.id),
        })

    by_date = defaultdict(list)
    for event in events:
        by_date[event['date']].append(event)

    opening = cash['total']
    balance = opening
    lowest_balance = opening
    lowest_balance_date = today
    first_buffer_breach = today if opening < buffer_amount else None
    timeline = []
    for offset in range(days):
        current_date = today + timedelta(days=offset)
        daily_events = sorted(by_date.get(current_date, []), key=lambda item: item['direction'])
        inflows = sum((event['amount'] for event in daily_events if event['direction'] == 'inflow'), ZERO)
        outflows = sum((event['amount'] for event in daily_events if event['direction'] == 'outflow'), ZERO)
        day_opening = balance
        balance = day_opening + inflows - outflows
        if balance < lowest_balance:
            lowest_balance = balance
            lowest_balance_date = current_date
        if first_buffer_breach is None and balance < buffer_amount:
            first_buffer_breach = current_date
        timeline.append({
            'date': current_date,
            'opening_balance': day_opening,
            'inflows': inflows,
            'outflows': outflows,
            'closing_balance': balance,
            'events': daily_events,
        })

    return {
        'currency': business.currency,
        'basis': 'recorded_cash_and_dated_obligations',
        'horizon_days': days,
        'period_start': today,
        'period_end': end_date,
        'opening_balance': opening,
        'projected_closing_balance': balance,
        'lowest_balance': lowest_balance,
        'lowest_balance_date': lowest_balance_date,
        'cash_buffer': buffer_amount,
        'first_buffer_breach': first_buffer_breach,
        'timeline': timeline,
        'data_quality': quality,
        'limitations': {
            'undated_open_obligations': undated,
            'overdue_amounts_not_assigned_a_future_date': overdue,
        },
        'assumptions': [
            'Recorded account balances are the opening cash position.',
            'Open receivables are treated as inflows on their recorded due dates.',
            'Open payables are treated as outflows on their recorded due dates.',
            'Overdue and undated obligations are disclosed but not assigned an invented future date.',
            'Unrecorded sales, expenses, taxes, payroll, and commitments are excluded.',
        ],
    }
