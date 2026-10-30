from decimal import Decimal

from django.db.models import Sum

from ..models import FinancialAccount, Transaction


ZERO = Decimal('0.00')


def financial_account_balance(account: FinancialAccount) -> Decimal:
    """Return the current recorded balance for one account."""
    totals = {
        row['kind']: row['total'] or ZERO
        for row in account.transactions.filter(is_voided=False)
        .values('kind')
        .annotate(total=Sum('amount'))
    }
    transfers_in = (
        account.incoming_transfers.filter(is_voided=False, kind=Transaction.Kind.TRANSFER)
        .aggregate(total=Sum('amount'))['total']
        or ZERO
    )
    return (
        account.opening_balance
        + totals.get(Transaction.Kind.INCOME, ZERO)
        - totals.get(Transaction.Kind.EXPENSE, ZERO)
        - totals.get(Transaction.Kind.TRANSFER, ZERO)
        + transfers_in
    )


def recorded_cash_position(business) -> dict:
    """Return recorded cash and its account-level evidence.

    Transactions without an account remain part of the business position so
    existing records are not silently ignored.
    """
    accounts = list(FinancialAccount.objects.filter(business=business, is_active=True))
    account_rows = [
        {
            'id': str(account.id),
            'name': account.name,
            'kind': account.kind,
            'currency': account.currency,
            'balance': financial_account_balance(account),
        }
        for account in accounts
    ]

    transactions = Transaction.objects.filter(business=business, is_voided=False)
    if accounts:
        unassigned_totals = {
            row['kind']: row['total'] or ZERO
            for row in transactions.filter(
                account__isnull=True,
                kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE),
            )
            .values('kind')
            .annotate(total=Sum('amount'))
        }
        unassigned_net = (
            unassigned_totals.get(Transaction.Kind.INCOME, ZERO)
            - unassigned_totals.get(Transaction.Kind.EXPENSE, ZERO)
        )
        total = sum((row['balance'] for row in account_rows), ZERO) + unassigned_net
    else:
        totals = {
            row['kind']: row['total'] or ZERO
            for row in transactions.filter(kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE))
            .values('kind')
            .annotate(total=Sum('amount'))
        }
        unassigned_net = totals.get(Transaction.Kind.INCOME, ZERO) - totals.get(Transaction.Kind.EXPENSE, ZERO)
        total = business.opening_balance + unassigned_net

    return {
        'total': total,
        'currency': business.currency,
        'accounts': account_rows,
        'unassigned_net': unassigned_net,
        'uses_business_opening_balance': not bool(accounts),
    }
