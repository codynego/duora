from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.finance.models import Business, Transaction, TransactionAudit

User = get_user_model()


def iso(value):
    return value.isoformat() if value else None


class AdminOperationsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        users = User.objects.annotate(business_count=Count('businesses')).order_by('-date_joined')
        businesses = Business.objects.select_related('owner').order_by('-created_at')
        audits = TransactionAudit.objects.select_related('actor', 'transaction__business').order_by('-created_at')[:20]

        return Response({
            'overview': {
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(is_active=True).count(),
                'unverified_users': User.objects.filter(is_active=False).count(),
                'new_users_7d': User.objects.filter(date_joined__gte=week_ago).count(),
                'businesses': Business.objects.count(),
                'new_businesses_7d': Business.objects.filter(created_at__gte=week_ago).count(),
                'whatsapp_opt_ins': Business.objects.filter(whatsapp_marketing_opt_in=True).count(),
                'transactions_7d': Transaction.objects.filter(created_at__gte=week_ago, is_voided=False).count(),
            },
            'users': [
                {
                    'id': user.pk,
                    'email': user.email,
                    'is_active': user.is_active,
                    'is_staff': user.is_staff,
                    'date_joined': iso(user.date_joined),
                    'business_count': user.business_count,
                }
                for user in users[:50]
            ],
            'businesses': [
                {
                    'id': str(business.pk),
                    'name': business.name,
                    'owner_email': business.owner.email,
                    'plan': business.plan,
                    'setup_choice': business.setup_choice,
                    'created_at': iso(business.created_at),
                    'whatsapp_number': business.whatsapp_number,
                    'whatsapp_marketing_opt_in': business.whatsapp_marketing_opt_in,
                }
                for business in businesses[:50]
            ],
            'onboarding': [
                {
                    'id': user.pk,
                    'email': user.email,
                    'verified': user.is_active,
                    'business_count': user.business_count,
                    'date_joined': iso(user.date_joined),
                }
                for user in users.filter(is_active=True, business_count=0)[:50]
            ],
            'email': {
                'provider': 'Resend',
                'configured': bool(settings.RESEND_API_KEY),
                'from_email': settings.RESEND_FROM_EMAIL,
                'supported_flows': ['verification', 'password_reset', 'onboarding'],
                'delivery_history_available': False,
            },
            'support': {
                'email': 'support@dorah.me',
                'inbox_connected': False,
                'note': 'Support requests are currently handled through the support email inbox.',
            },
            'audit': [
                {
                    'id': str(event.pk),
                    'action': event.action,
                    'actor_email': event.actor.email,
                    'business_name': event.transaction.business.name,
                    'transaction_description': event.transaction.description,
                    'created_at': iso(event.created_at),
                }
                for event in audits
            ],
        })
