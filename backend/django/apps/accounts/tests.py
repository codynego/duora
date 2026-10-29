from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.test import TestCase
from unittest.mock import patch
from rest_framework.test import APIClient


class AuthOriginTests(TestCase):
    def test_cross_site_auth_writes_are_rejected(self):
        client = APIClient()
        response = client.post('/api/v1/auth/logout/', HTTP_ORIGIN='https://attacker.example')
        self.assertEqual(response.status_code, 403)


class EmailAuthFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('apps.accounts.views.send_verification_email')
    def test_signup_requires_email_verification(self, send_email):
        response = self.client.post('/api/v1/auth/register/', {
            'email': 'new@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(email='new@example.com')
        self.assertFalse(user.is_active)
        self.assertNotIn('duora_access', response.cookies)
        send_email.assert_called_once()

    def test_verification_activates_account_and_starts_session(self):
        user = get_user_model().objects.create_user(
            username='verify@example.com', email='verify@example.com',
            password='StrongPassword123!', is_active=False,
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post('/api/v1/auth/verify-email/', {'uid': uid, 'token': token}, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertIn('duora_access', response.cookies)
