from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import SubscriptionMembership, SubscriptionOffer, SubscriptionService


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

    def test_seller_listing_starts_in_review(self):
        service = SubscriptionService.objects.create(name='Canva', slug='canva', permitted_access_methods=['team_seat'])

        response = self.client.post('/api/v1/subscriptions/offers/mine/', {
            'service_id': str(service.id), 'access_method': 'team_seat', 'price': '2900',
            'billing_type': 'recurring', 'billing_period': 'monthly', 'seats_total': 2, 'seats_available': 2,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['status'], 'pending_review')

    def test_buyer_reservation_decrements_an_open_seat_once(self):
        seller = get_user_model().objects.create_user(username='seller@example.com', email='seller@example.com', password='strong-test-password')
        service = SubscriptionService.objects.create(name='Canva', slug='canva', permitted_access_methods=['team_seat'])
        offer = SubscriptionOffer.objects.create(seller=seller, service=service, access_method='team_seat', price=Decimal('2900'), seats_total=1, seats_available=1, status='active')

        response = self.client.post(f'/api/v1/subscriptions/offers/{offer.id}/reserve/')
        offer.refresh_from_db()
        repeat = self.client.post(f'/api/v1/subscriptions/offers/{offer.id}/reserve/')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['status'], 'payment_pending')
        self.assertEqual(offer.seats_available, 0)
        self.assertEqual(repeat.status_code, 200)
