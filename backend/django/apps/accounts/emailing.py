import html
import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    pass


def send_email(*, to, subject, text, body_html):
    api_key = settings.RESEND_API_KEY
    if not api_key:
        if settings.DEBUG:
            logger.warning('Resend is not configured; skipped email subject=%s recipient=%s', subject, to)
            return
        raise EmailDeliveryError('Resend is not configured.')

    payload = json.dumps({
        'from': settings.RESEND_FROM_EMAIL,
        'to': [to],
        'subject': subject,
        'text': text,
        'html': body_html,
    }).encode('utf-8')
    request = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        method='POST',
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status < 200 or response.status >= 300:
                raise EmailDeliveryError(f'Resend returned HTTP {response.status}.')
    except urllib.error.HTTPError as error:
        logger.error('Resend rejected an email: status=%s recipient=%s', error.code, to)
        raise EmailDeliveryError('Resend rejected the email.') from error
    except (urllib.error.URLError, TimeoutError) as error:
        logger.error('Resend request failed: recipient=%s error=%s', to, error)
        raise EmailDeliveryError('Resend is temporarily unavailable.') from error


def send_verification_email(user, verification_url):
    safe_url = html.escape(verification_url, quote=True)
    send_email(
        to=user.email,
        subject='Verify your Dorah email',
        text=f'Verify your Dorah email by opening this link: {verification_url}\n\nThis link expires in 1 hour.',
        body_html=f'<p>Welcome to Dorah.</p><p>Verify your email to activate your account:</p><p><a href="{safe_url}">Verify my email</a></p><p>This link expires in 1 hour. If you did not create this account, you can ignore this message.</p>',
    )


def send_password_reset_email(user, reset_url):
    safe_url = html.escape(reset_url, quote=True)
    send_email(
        to=user.email,
        subject='Reset your Dorah password',
        text=f'Reset your Dorah password by opening this link: {reset_url}\n\nThis link expires in 1 hour.',
        body_html=f'<p>We received a request to reset your Dorah password.</p><p><a href="{safe_url}">Reset my password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this message.</p>',
    )


def send_onboarding_email(user, business):
    send_email(
        to=user.email,
        subject=f'{business.name} is ready in Dorah',
        text=f'{business.name} is now set up in Dorah. Open your dashboard to record activity and review what needs attention.',
        body_html=f'<p>Your Dorah workspace for <strong>{html.escape(business.name)}</strong> is ready.</p><p>Open your dashboard to record activity, review balances, and keep your business money in view.</p><p><a href="{html.escape(settings.DUORA_FRONTEND_URL + "/dashboard", quote=True)}">Open Dorah</a></p>',
    )
