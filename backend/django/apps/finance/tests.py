from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Business, Transaction


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
