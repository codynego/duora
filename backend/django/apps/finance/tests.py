from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Business, Contact, FinancialAccount, FinancialFinding, Obligation, Transaction
from .services.balances import recorded_cash_position


class FinanceOwnershipTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(username='owner@example.com', email='owner@example.com', password='StrongPassword123!')
        self.other_user = user_model.objects.create_user(username='other@example.com', email='other@example.com', password='StrongPassword123!')
        self.business = Business.objects.create(
            owner=self.owner,
            name='Owner business',
            business_type='Sole proprietor',
            industry='Retail and trade',
        )
        self.transaction = Transaction.objects.create(
            business=self.business,
            created_by=self.owner,
            kind=Transaction.Kind.INCOME,
            description='Private sale',
            amount=Decimal('100.00'),
            occurred_on='2026-01-01',
        )
        self.client = APIClient()

    def test_other_user_cannot_read_business_overview(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f'/api/v1/finance/businesses/{self.business.id}/overview/')
        self.assertEqual(response.status_code, 404)

    def test_other_user_cannot_modify_or_delete_transaction(self):
        self.client.force_authenticate(user=self.other_user)
        url = f'/api/v1/finance/businesses/{self.business.id}/transactions/{self.transaction.id}/'

        update_response = self.client.patch(url, {'description': 'Tampered'}, format='json')
        delete_response = self.client.delete(url, format='json')

        self.assertEqual(update_response.status_code, 404)
        self.assertEqual(delete_response.status_code, 404)
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.description, 'Private sale')
        self.assertFalse(self.transaction.is_voided)

    def test_intelligence_includes_a_data_backed_health_assessment(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(f'/api/v1/finance/businesses/{self.business.id}/intelligence/')

        self.assertEqual(response.status_code, 200)
        health = response.data['health']
        self.assertEqual(health['data_quality']['record_count'], 1)
        self.assertEqual(str(health['performance']['income']), '0.00')
        self.assertEqual(str(health['cash_flow']['recorded_cash']), '100.00')


class CashForecastTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='forecast@example.com',
            email='forecast@example.com',
            password='StrongPassword123!',
        )
        self.other_user = user_model.objects.create_user(
            username='other-forecast@example.com',
            email='other-forecast@example.com',
            password='StrongPassword123!',
        )
        self.business = Business.objects.create(
            owner=self.owner,
            name='Forecast business',
            business_type='Limited company',
            industry='Services',
        )
        self.account = FinancialAccount.objects.create(
            business=self.business,
            name='Operating account',
            kind=FinancialAccount.Kind.BANK,
            currency='NGN',
            opening_balance=Decimal('1000.00'),
        )
        self.customer = Contact.objects.create(
            business=self.business,
            kind=Contact.Kind.CUSTOMER,
            name='Customer One',
        )
        self.supplier = Contact.objects.create(
            business=self.business,
            kind=Contact.Kind.SUPPLIER,
            name='Supplier One',
        )
        today = timezone.localdate()
        self.receivable = Obligation.objects.create(
            business=self.business,
            contact=self.customer,
            kind=Obligation.Kind.RECEIVABLE,
            description='Expected customer payment',
            amount=Decimal('500.00'),
            balance=Decimal('500.00'),
            due_date=today + timedelta(days=2),
        )
        self.payable = Obligation.objects.create(
            business=self.business,
            contact=self.supplier,
            kind=Obligation.Kind.PAYABLE,
            description='Supplier bill',
            amount=Decimal('800.00'),
            balance=Decimal('800.00'),
            due_date=today + timedelta(days=4),
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.owner)

    def test_recorded_cash_position_is_shared_by_forecast(self):
        cash = recorded_cash_position(self.business)

        self.assertEqual(cash['total'], Decimal('1000.00'))
        self.assertEqual(cash['accounts'][0]['balance'], Decimal('1000.00'))

    def test_forecast_projects_dated_receivables_and_payables(self):
        response = self.client.get(
            f'/api/v1/finance/businesses/{self.business.id}/forecast/?horizon_days=7&cash_buffer=900'
        )

        self.assertEqual(response.status_code, 200)
        forecast = response.data['data']
        self.assertEqual(Decimal(str(forecast['opening_balance'])), Decimal('1000.00'))
        self.assertEqual(Decimal(str(forecast['projected_closing_balance'])), Decimal('700.00'))
        self.assertEqual(Decimal(str(forecast['lowest_balance'])), Decimal('700.00'))
        self.assertEqual(forecast['first_buffer_breach'], timezone.localdate() + timedelta(days=4))
        self.assertEqual(len(forecast['timeline']), 7)

    def test_scenario_can_delay_a_receivable_without_changing_saved_record(self):
        original_due_date = self.receivable.due_date
        response = self.client.post(
            f'/api/v1/finance/businesses/{self.business.id}/forecast/',
            {
                'horizon_days': 10,
                'adjustments': [{
                    'type': 'delay_obligation',
                    'obligation_id': str(self.receivable.id),
                    'days': 5,
                }],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        timeline = {row['date']: row for row in response.data['data']['timeline']}
        self.assertEqual(Decimal(str(timeline[original_due_date]['inflows'])), Decimal('0.00'))
        self.assertEqual(
            Decimal(str(timeline[original_due_date + timedelta(days=5)]['inflows'])),
            Decimal('500.00'),
        )
        self.receivable.refresh_from_db()
        self.assertEqual(self.receivable.due_date, original_due_date)

    def test_forecast_rejects_invalid_horizon(self):
        response = self.client.get(
            f'/api/v1/finance/businesses/{self.business.id}/forecast/?horizon_days=365'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('between 1 and 90', response.data['detail'])

    def test_other_user_cannot_access_forecast(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(f'/api/v1/finance/businesses/{self.business.id}/forecast/')

        self.assertEqual(response.status_code, 404)


class FindingEngineTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='findings@example.com',
            email='findings@example.com',
            password='StrongPassword123!',
        )
        self.other_user = user_model.objects.create_user(
            username='other-findings@example.com',
            email='other-findings@example.com',
            password='StrongPassword123!',
        )
        self.business = Business.objects.create(
            owner=self.owner,
            name='Finding business',
            business_type='Limited company',
            industry='Wholesale',
        )
        FinancialAccount.objects.create(
            business=self.business,
            name='Cash',
            kind=FinancialAccount.Kind.CASH,
            currency='NGN',
            opening_balance=Decimal('5000.00'),
        )
        primary_customer = Contact.objects.create(
            business=self.business,
            kind=Contact.Kind.CUSTOMER,
            name='Primary Customer',
        )
        secondary_customer = Contact.objects.create(
            business=self.business,
            kind=Contact.Kind.CUSTOMER,
            name='Secondary Customer',
        )
        due_date = timezone.localdate() + timedelta(days=10)
        self.primary_receivable = Obligation.objects.create(
            business=self.business,
            contact=primary_customer,
            kind=Obligation.Kind.RECEIVABLE,
            description='Primary balance',
            amount=Decimal('800.00'),
            balance=Decimal('800.00'),
            due_date=due_date,
        )
        Obligation.objects.create(
            business=self.business,
            contact=secondary_customer,
            kind=Obligation.Kind.RECEIVABLE,
            description='Secondary balance',
            amount=Decimal('200.00'),
            balance=Decimal('200.00'),
            due_date=due_date,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.owner)

    def intelligence(self):
        return self.client.get(f'/api/v1/finance/businesses/{self.business.id}/intelligence/')

    def test_concentration_finding_is_generated_and_persisted(self):
        response = self.intelligence()

        self.assertEqual(response.status_code, 200)
        finding = next(item for item in response.data['data'] if item['id'] == 'receivables-concentration')
        self.assertIn('80%', finding['detail'])
        self.assertEqual(finding['risk_label'], 'Customer concentration risk')
        self.assertEqual(len(finding['metrics']), 3)
        self.assertTrue(finding['why_it_matters'])
        self.assertEqual(finding['status'], FinancialFinding.Status.PLANNING)
        stored = FinancialFinding.objects.get(
            business=self.business,
            fingerprint='receivables-concentration',
        )
        self.assertTrue(stored.is_active)
        self.assertEqual(stored.status, FinancialFinding.Status.PLANNING)

    def test_resolved_finding_stays_resolved_until_evidence_changes(self):
        self.intelligence()
        update_url = (
            f'/api/v1/finance/businesses/{self.business.id}/intelligence/'
            'findings/receivables-concentration/'
        )
        resolved = self.client.patch(
            update_url,
            {'status': 'resolved', 'feedback': 'handled'},
            format='json',
        )

        self.assertEqual(resolved.status_code, 200)
        self.assertEqual(resolved.data['data']['status'], 'resolved')
        unchanged = self.intelligence()
        unchanged_finding = next(
            item for item in unchanged.data['data'] if item['id'] == 'receivables-concentration'
        )
        self.assertEqual(unchanged_finding['status'], 'resolved')

        self.primary_receivable.balance = Decimal('900.00')
        self.primary_receivable.save(update_fields=('balance',))
        changed = self.intelligence()
        changed_finding = next(
            item for item in changed.data['data'] if item['id'] == 'receivables-concentration'
        )
        self.assertEqual(changed_finding['status'], 'planning')

    def test_other_user_cannot_update_finding_state(self):
        self.intelligence()
        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            f'/api/v1/finance/businesses/{self.business.id}/intelligence/findings/receivables-concentration/',
            {'status': 'resolved'},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
