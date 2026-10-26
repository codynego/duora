from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import SubscriptionMembership


class SubscriptionDashboardTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='member@example.com', email='member@example.com', password='strong-test-password')
        self.client.force_authenticate(self.user)

    def test_dashboard_only_returns_the_signed_in_users_memberships(self):
        SubscriptionMembership.objects.create(user=self.user, custom_name='Canva', category='creative', monthly_cost=Decimal('2900'), next_renewal=timezone.localdate() + timedelta(days=2))
        other = get_user_model().objects.create_user(username='other@example.com', email='other@example.com', password='strong-test-password')
        SubscriptionMembership.objects.create(user=other, custom_name='Other plan', monthly_cost=Decimal('9999'))

        response = self.client.get('/api/v1/subscriptions/dashboard/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['active_count'], 1)
        self.assertEqual(response.data['data']['monthly_total'], Decimal('2900'))
        self.assertEqual(len(response.data['data']['memberships']), 1)

    def test_member_can_add_a_manual_subscription(self):
        response = self.client.post('/api/v1/subscriptions/memberships/', {
            'custom_name': 'Notion Plus', 'category': 'productivity', 'monthly_cost': '4500', 'next_renewal': '2026-11-15',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['name'], 'Notion Plus')
        self.assertEqual(SubscriptionMembership.objects.filter(user=self.user).count(), 1)

    def test_subscription_preferences_are_uuid_backed_and_saved(self):
        response = self.client.put('/api/v1/subscriptions/preferences/', {'renewal_reminders': False, 'weekly_spend_digest': True}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(str(response.data['data']['id'])), 36)
        self.assertFalse(response.data['data']['renewal_reminders'])
        self.assertTrue(response.data['data']['weekly_spend_digest'])

    def test_one_time_purchase_does_not_inflate_recurring_monthly_total(self):
        SubscriptionMembership.objects.create(user=self.user, custom_name='Canva', monthly_cost=Decimal('2900'))
        SubscriptionMembership.objects.create(user=self.user, custom_name='Course access', monthly_cost=Decimal('15000'), billing_type='one_time')

        response = self.client.get('/api/v1/subscriptions/dashboard/')

        self.assertEqual(response.data['data']['monthly_total'], Decimal('2900'))

    def test_one_time_purchase_has_no_renewal_date(self):
        response = self.client.post('/api/v1/subscriptions/memberships/', {
            'custom_name': 'Design course', 'category': 'learning', 'monthly_cost': '15000',
            'billing_type': 'one_time', 'next_renewal': '2026-11-15',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['billing_type'], 'one_time')
        self.assertIsNone(response.data['data']['next_renewal'])
