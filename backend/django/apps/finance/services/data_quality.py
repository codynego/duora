from ..models import FinancialAccount, Obligation, Transaction


def assess_financial_data_quality(business) -> dict:
    """Describe whether saved records support analytics and forecasting."""
    transactions = Transaction.objects.filter(business=business, is_voided=False)
    obligations = Obligation.objects.filter(business=business, balance__gt=0)
    active_account_count = FinancialAccount.objects.filter(business=business, is_active=True).count()
    transaction_count = transactions.count()
    categorized_count = transactions.filter(
        kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE)
    ).exclude(category='').count()
    categorizable_count = transactions.filter(
        kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE)
    ).count()
    open_obligation_count = obligations.count()
    dated_obligation_count = obligations.filter(due_date__isnull=False).count()
    unassigned_transaction_count = transactions.filter(
        account__isnull=True,
        kind__in=(Transaction.Kind.INCOME, Transaction.Kind.EXPENSE),
    ).count()

    missing = []
    warnings = []
    if not active_account_count and not business.opening_balance:
        missing.append('Add an opening balance or an active financial account.')
    if transaction_count < 4:
        missing.append('Add more dated transactions before relying on trend analysis.')
    if open_obligation_count and dated_obligation_count < open_obligation_count:
        missing.append('Add due dates to open customer and supplier balances for forecasting.')
    if unassigned_transaction_count:
        warnings.append(f'{unassigned_transaction_count} transaction(s) are not assigned to an account.')
    if categorizable_count and categorized_count < categorizable_count:
        warnings.append(f'{categorizable_count - categorized_count} income or expense transaction(s) are uncategorized.')

    cash_ready = bool(active_account_count or business.opening_balance)
    analytics_ready = cash_ready and transaction_count >= 4
    forecast_ready = cash_ready and open_obligation_count > 0 and dated_obligation_count == open_obligation_count
    score_parts = [
        1 if cash_ready else 0,
        1 if transaction_count >= 4 else 0,
        1 if not open_obligation_count or dated_obligation_count == open_obligation_count else 0,
        1 if not categorizable_count or categorized_count == categorizable_count else 0,
    ]

    return {
        'status': 'ready' if analytics_ready and not missing else 'partial' if cash_ready or transaction_count else 'insufficient',
        'score': int(sum(score_parts) * 100 / len(score_parts)),
        'capabilities': {
            'cash_position': cash_ready,
            'performance_analysis': analytics_ready,
            'cash_forecast': forecast_ready,
        },
        'counts': {
            'transactions': transaction_count,
            'active_accounts': active_account_count,
            'open_obligations': open_obligation_count,
            'dated_open_obligations': dated_obligation_count,
            'unassigned_transactions': unassigned_transaction_count,
        },
        'missing': missing,
        'warnings': warnings,
    }
