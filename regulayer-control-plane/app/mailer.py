from email.message import EmailMessage
import aiosmtplib
from .config import settings


# ============================================================
# Shared Logo Block (used in all email templates)
# Uses a hosted SVG-style logo placeholder. Replace URL with
# your actual hosted logo when available.
# ============================================================

LOGO_BLOCK = """
<td align="center" style="padding-bottom:24px;">
  <div style="width:48px;height:48px;border-radius:12px;background:#e85d22;color:#ffffff;
              font-family: Arial, sans-serif; font-size:24px;font-weight:800;
              line-height:48px;text-align:center;margin:0 auto;">
    R
  </div>
</td>
"""

LOGO_FALLBACK_BLOCK = """
<td align="center" style="padding-bottom:24px;">
  <div style="width:48px;height:48px;border-radius:50%;background:#000000;color:#fff;
              font-size:22px;font-weight:700;line-height:48px;text-align:center;">R</div>
</td>
"""


# ============================================================
# 1. OTP Verification Email
# ============================================================

OTP_HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Regulayer Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;padding:40px;border-radius:12px;">

          <!-- Logo -->
          <tr>
            """ + LOGO_BLOCK + """
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="font-size:20px;font-weight:600;color:#111;">
              Verify your email address
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-top:20px;font-size:14px;color:#444;line-height:1.6;">
              Enter the verification code below to continue signing in to Regulayer.
              This code will expire in 10 minutes.
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td align="center" style="padding:24px 0;">
              <div style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;
                          background:#f3f4f6;padding:14px 24px;border-radius:8px;color:#111;">
                {{otp_code}}
              </div>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="font-size:12px;color:#888;">
              If you did not request this code, you can safely ignore this email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px;font-size:11px;color:#aaa;text-align:center;">
              Regulayer · AI Decision Audit Infrastructure
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


# ============================================================
# 2. Team Invitation Email
# ============================================================

INVITE_HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Regulayer Invitation</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;padding:40px;border-radius:12px;">

          <!-- Logo -->
          <tr>
            """ + LOGO_BLOCK + """
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="font-size:20px;font-weight:600;color:#111;">
              You've been invited to Regulayer
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-top:20px;font-size:14px;color:#444;line-height:1.6;">
              <strong>{{inviter_name}}</strong> has invited you to join
              <strong>{{org_name}}</strong> as a <strong>{{role}}</strong>.
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-top:30px;">
              <a href="{{invite_link}}"
                 style="background:#000;color:#fff;padding:12px 24px;
                        text-decoration:none;border-radius:8px;
                        font-size:14px;font-weight:500;">
                Accept Invitation
              </a>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td style="padding-top:20px;font-size:12px;color:#888;">
              This invitation expires on {{expiry_date}}.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px;font-size:11px;color:#aaa;text-align:center;">
              If you did not expect this invitation, you may ignore this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


# ============================================================
# 3. Password Reset Email
# ============================================================

RESET_HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset - Regulayer</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;padding:40px;border-radius:12px;">

          <!-- Logo -->
          <tr>
            """ + LOGO_BLOCK + """
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="font-size:20px;font-weight:600;color:#111;">
              Reset Your Password
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-top:20px;font-size:14px;color:#444;line-height:1.6;">
              We received a request to reset the password for your Regulayer account.
            </td>
          </tr>

          <tr>
            <td style="padding-top:10px;font-size:14px;color:#444;line-height:1.6;">
              If you made this request, click the button below to choose a new password.
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-top:30px;">
              <a href="{{reset_link}}"
                 style="background:#000;color:#fff;padding:12px 24px;
                        text-decoration:none;border-radius:8px;
                        font-size:14px;font-weight:500;">
                Reset Password
              </a>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td style="padding-top:20px;font-size:12px;color:#888;">
              This link expires in {{expiry_time}}.
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding-top:20px;font-size:12px;color:#888;">
              If you did not request a password reset, you can safely ignore this email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px;font-size:11px;color:#aaa;text-align:center;">
              Regulayer · AI Decision Audit Infrastructure
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


# ============================================================
# Email Sender Functions
# ============================================================

async def _send_email(message: EmailMessage):
    """Shared SMTP send logic."""
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            use_tls=True if settings.smtp_port == 465 else False,
            start_tls=True if settings.smtp_port == 587 else False,
        )
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


async def send_otp_email(to_email: str, otp_code: str):
    """Send OTP verification email."""
    if not settings.smtp_host or not settings.smtp_user:
        print(f"SMTP not configured. OTP for {to_email}: {otp_code}")
        return

    message = EmailMessage()
    message["From"] = settings.from_email or "no-reply@regulayer.tech"
    message["To"] = to_email
    message["Subject"] = "Your Regulayer Verification Code"

    html_content = OTP_HTML_TEMPLATE.replace("{{otp_code}}", otp_code)
    message.set_content(f"Your verification code is: {otp_code}")
    message.add_alternative(html_content, subtype="html")

    if await _send_email(message):
        print(f"OTP email sent to {to_email}")


async def send_invitation_email(
    to_email: str,
    inviter_name: str,
    org_name: str,
    role: str,
    invite_link: str,
    expiry_date: str
):
    """Send a team member invitation email."""
    if not settings.smtp_host or not settings.smtp_user:
        print(f"SMTP not configured. Invitation for {to_email}: {invite_link}")
        return

    message = EmailMessage()
    message["From"] = settings.from_email or "no-reply@regulayer.tech"
    message["To"] = to_email
    message["Subject"] = f"You've been invited to {org_name} on Regulayer"

    html_content = (
        INVITE_HTML_TEMPLATE
        .replace("{{inviter_name}}", inviter_name)
        .replace("{{org_name}}", org_name)
        .replace("{{role}}", role)
        .replace("{{invite_link}}", invite_link)
        .replace("{{expiry_date}}", expiry_date)
    )

    message.set_content(
        f"{inviter_name} has invited you to join {org_name} as a {role}. "
        f"Accept your invitation: {invite_link}"
    )
    message.add_alternative(html_content, subtype="html")

    if await _send_email(message):
        print(f"Invitation email sent to {to_email}")


# ============================================================
# 4. Account Deletion OTP Email
# ============================================================

ACCOUNT_DELETE_OTP_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Regulayer – Account Deletion Verification</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;padding:40px;border-radius:12px;">

          <!-- Logo -->
          <tr>
            """ + LOGO_BLOCK + """
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="font-size:20px;font-weight:600;color:#dc2626;">
              ⚠️ Account Deletion Request
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="padding-top:16px;">
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;font-size:13px;color:#991b1b;line-height:1.6;">
                You have requested to <strong>permanently delete</strong> your organization
                <strong>{{org_name}}</strong> and all associated data. This action is
                <strong>irreversible</strong>.
              </div>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-top:16px;font-size:14px;color:#444;line-height:1.6;">
              Enter the verification code below to confirm the deletion.
              This code will expire in 10 minutes.
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td align="center" style="padding:24px 0;">
              <div style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;
                          background:#fef2f2;padding:14px 24px;border-radius:8px;color:#dc2626;
                          border:2px solid #fecaca;">
                {{otp_code}}
              </div>
            </td>
          </tr>

          <!-- What gets deleted -->
          <tr>
            <td style="font-size:12px;color:#666;line-height:1.6;">
              <strong>The following will be permanently deleted:</strong><br/>
              • All team members and their accounts<br/>
              • All projects and API keys<br/>
              • All invitations and sessions<br/>
              • All audit logs<br/>
              • The organization itself
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding-top:16px;font-size:12px;color:#888;">
              If you did not request this, please ignore this email and secure your account immediately.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px;font-size:11px;color:#aaa;text-align:center;">
              Regulayer · AI Decision Audit Infrastructure
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_account_deletion_otp_email(to_email: str, otp_code: str, org_name: str):
    """Send OTP email for account deletion verification."""
    if not settings.smtp_host or not settings.smtp_user:
        print(f"SMTP not configured. Account deletion OTP for {to_email}: {otp_code}")
        return

    message = EmailMessage()
    message["From"] = settings.from_email or "no-reply@regulayer.tech"
    message["To"] = to_email
    message["Subject"] = f"⚠️ Confirm Account Deletion – {org_name}"

    html_content = (
        ACCOUNT_DELETE_OTP_TEMPLATE
        .replace("{{otp_code}}", otp_code)
        .replace("{{org_name}}", org_name)
    )
    message.set_content(
        f"Account deletion verification code for {org_name}: {otp_code}. "
        f"This code expires in 10 minutes."
    )
    message.add_alternative(html_content, subtype="html")

    if await _send_email(message):
        print(f"Account deletion OTP email sent to {to_email}")


async def send_password_reset_email(to_email: str, reset_link: str, expiry_time: str = "1 hour"):
    """Send a password reset email."""
    if not settings.smtp_host or not settings.smtp_user:
        print(f"SMTP not configured. Password reset for {to_email}: {reset_link}")
        return

    message = EmailMessage()
    message["From"] = settings.from_email or "no-reply@regulayer.tech"
    message["To"] = to_email
    message["Subject"] = "Reset Your Regulayer Password"

    html_content = (
        RESET_HTML_TEMPLATE
        .replace("{{reset_link}}", reset_link)
        .replace("{{expiry_time}}", expiry_time)
    )

    message.set_content(
        f"You requested a password reset for your Regulayer account. "
        f"Reset your password here: {reset_link} (expires in {expiry_time})"
    )
    message.add_alternative(html_content, subtype="html")

    if await _send_email(message):
        print(f"Password reset email sent to {to_email}")
