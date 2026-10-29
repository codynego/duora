import html
import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    pass


def _branded_email(*, eyebrow, title, intro, body, button_label, button_url):
    safe_eyebrow = html.escape(eyebrow)
    safe_title = html.escape(title)
    safe_intro = html.escape(intro)
    safe_button_label = html.escape(button_label)
    safe_button_url = html.escape(button_url, quote=True)
    return f'''<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f5f7fb;color:#111b33;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{safe_title} · Dorah</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7fb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
            <tr>
              <td style="padding:24px 28px;background:#111b33;border-radius:16px 16px 0 0;">
                <span style="display:inline-block;width:30px;height:30px;line-height:30px;border-radius:9px;background:#c9f45d;color:#111b33;font-size:18px;font-weight:700;text-align:center;vertical-align:middle;">D</span>
                <span style="margin-left:9px;color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;">Dorah</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 28px 32px;background:#ffffff;">
                <p style="margin:0 0 12px;color:#3157f5;font-size:12px;font-weight:700;letter-spacing:1.2px;">{safe_eyebrow}</p>
                <h1 style="margin:0 0 16px;color:#111b33;font-size:30px;line-height:1.2;">{safe_title}</h1>
                <p style="margin:0 0 20px;color:#37445f;font-size:16px;line-height:1.6;">{safe_intro}</p>
                {body}
                <p style="margin:28px 0 24px;">
                  <a href="{safe_button_url}" style="display:inline-block;padding:14px 22px;border-radius:9px;background:#3157f5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">{safe_button_label}</a>
                </p>
                <p style="margin:0;color:#64708a;font-size:12px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="{safe_button_url}" style="color:#3157f5;word-break:break-all;">{safe_button_url}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;background:#111b33;border-radius:0 0 16px 16px;color:#ffffff;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;">Clear records. More confident decisions.</p>
                <p style="margin:0;color:#b9c1d3;font-size:12px;line-height:1.5;">Dorah · Financial intelligence for your business</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>'''


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
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Dorah/1.0 (email delivery)',
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status < 200 or response.status >= 300:
                raise EmailDeliveryError(f'Resend returned HTTP {response.status}.')
    except urllib.error.HTTPError as error:
        response_body = error.read().decode('utf-8', errors='replace')[:1000]
        logger.error('Resend rejected an email: status=%s recipient=%s response=%s', error.code, to, response_body)
        raise EmailDeliveryError('Resend rejected the email.') from error
    except (urllib.error.URLError, TimeoutError) as error:
        logger.error('Resend request failed: recipient=%s error=%s', to, error)
        raise EmailDeliveryError('Resend is temporarily unavailable.') from error


def send_verification_email(user, verification_url):
    send_email(
        to=user.email,
        subject='Verify your Dorah email',
        text=f'Verify your Dorah email by opening this link: {verification_url}\n\nThis link expires in 1 hour.',
        body_html=_branded_email(
            eyebrow='ACCOUNT SECURITY',
            title='Verify your Dorah email',
            intro='One quick step and your financial workspace is ready.',
            body='<p style="margin:0;color:#37445f;font-size:15px;line-height:1.6;">Verify your email to activate your account and continue to Dorah.</p><p style="margin:16px 0 0;color:#64708a;font-size:13px;line-height:1.6;">This link expires in 1 hour. If you did not create this account, you can ignore this message.</p>',
            button_label='Verify my email',
            button_url=verification_url,
        ),
    )


def send_password_reset_email(user, reset_url):
    send_email(
        to=user.email,
        subject='Reset your Dorah password',
        text=f'Reset your Dorah password by opening this link: {reset_url}\n\nThis link expires in 1 hour.',
        body_html=_branded_email(
            eyebrow='ACCOUNT SECURITY',
            title='Reset your password',
            intro='We received a request to create a new password for your Dorah account.',
            body='<p style="margin:0;color:#64708a;font-size:13px;line-height:1.6;">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>',
            button_label='Reset my password',
            button_url=reset_url,
        ),
    )


def send_onboarding_email(user, business):
    dashboard_url = f'{settings.DUORA_FRONTEND_URL}/dashboard'
    send_email(
        to=user.email,
        subject=f'{business.name} is ready in Dorah',
        text=f'{business.name} is now set up in Dorah. Open your dashboard to record activity and review what needs attention.',
        body_html=_branded_email(
            eyebrow='YOUR WORKSPACE IS READY',
            title='Welcome to Dorah',
            intro=f'Your workspace for {business.name} is ready.',
            body='<p style="margin:0;color:#37445f;font-size:15px;line-height:1.6;">Record activity, review balances, and keep your business money in view.</p>',
            button_label='Open my dashboard',
            button_url=dashboard_url,
        ),
    )
