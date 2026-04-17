from email.message import EmailMessage
import aiosmtplib
from .config import settings


# ============================================================
# Regulayer Enterprise Email System
# ============================================================

LOGO_URL = "https://regulayer.tech/_next/image?url=%2Fregulayer_logo.png&w=640&q=75"


def _base_template(title: str, preheader: str, body_content: str) -> str:
    """
    Master email wrapper used by every transactional email.
    Clean, professional, no decorative elements.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body, table, td, p {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f7f7f8;">
  <div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f8;">
    <tr>
      <td align="center" style="padding:48px 20px 40px;">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="left" style="padding-bottom:28px;">
              <img src="{LOGO_URL}" alt="Regulayer" width="130" style="display:block;width:130px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background-color:#ffffff;border:1px solid #e4e4e7;border-radius:8px;">
                <tr>
                  <td style="padding:36px 32px 32px;">
                    {body_content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;font-size:12px;color:#a1a1aa;line-height:1.6;">
              Regulayer &middot; AI Compliance Infrastructure<br/>
              This is an automated message. Please do not reply to this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ============================================================
# 1. OTP Verification Email
# ============================================================

def _build_otp_html(otp_code: str) -> str:
    body = f"""
    <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#18181b;">
      Verify your email address
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.7;">
      Use the code below to complete your sign-in. This code will expire in 10 minutes.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:0 0 24px;">
          <div style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;
                      color:#18181b;background-color:#f4f4f5;padding:14px 28px;border-radius:6px;
                      border:1px solid #e4e4e7;font-family:monospace;">
            {otp_code}
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
      If you did not request this code, no action is needed. Your account has not been changed.
    </p>
    """
    return _base_template(
        title="Regulayer - Verification Code",
        preheader=f"Your verification code is {otp_code}",
        body_content=body,
    )


# ============================================================
# 2. Team Invitation Email
# ============================================================

def _build_invite_html(inviter_name: str, org_name: str, role: str, invite_link: str, expiry_date: str) -> str:
    body = f"""
    <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#18181b;">
      You have been invited to join {org_name}
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.7;">
      {inviter_name} has invited you to join <strong>{org_name}</strong> as
      <strong>{role}</strong> on the Regulayer platform.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="left" style="padding:0 0 24px;">
          <a href="{invite_link}"
             style="display:inline-block;background-color:#18181b;color:#ffffff;
                    padding:12px 28px;border-radius:6px;font-size:14px;font-weight:500;
                    text-decoration:none;">
            Accept Invitation
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:13px;color:#71717a;line-height:1.6;">
      This invitation will expire on {expiry_date}. If you were not expecting this,
      you may safely disregard this email.
    </p>

    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;word-break:break-all;">
      If the button above does not work, copy and paste this link into your browser:<br/>
      {invite_link}
    </p>
    """
    return _base_template(
        title=f"Regulayer - Invitation to {org_name}",
        preheader=f"{inviter_name} invited you to join {org_name} on Regulayer",
        body_content=body,
    )


# ============================================================
# 3. Password Reset Email
# ============================================================

def _build_reset_html(reset_link: str, expiry_time: str) -> str:
    body = f"""
    <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#18181b;">
      Reset your password
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.7;">
      We received a request to reset the password associated with your Regulayer account.
      Click the button below to choose a new password. This link is valid for {expiry_time}.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="left" style="padding:0 0 24px;">
          <a href="{reset_link}"
             style="display:inline-block;background-color:#18181b;color:#ffffff;
                    padding:12px 28px;border-radius:6px;font-size:14px;font-weight:500;
                    text-decoration:none;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:13px;color:#71717a;line-height:1.6;">
      If you did not make this request, please ignore this email. No changes have been
      made to your account.
    </p>

    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;word-break:break-all;">
      If the button above does not work, copy and paste this link into your browser:<br/>
      {reset_link}
    </p>
    """
    return _base_template(
        title="Regulayer - Password Reset",
        preheader="Reset the password for your Regulayer account",
        body_content=body,
    )


# ============================================================
# 4. Account Deletion OTP Email
# ============================================================

def _build_account_delete_html(otp_code: str, org_name: str) -> str:
    body = f"""
    <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#18181b;">
      Confirm account deletion
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#52525b;line-height:1.7;">
      A request has been submitted to permanently delete the organization
      <strong>{org_name}</strong> and all data associated with it. This action cannot be undone.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:6px;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#7f1d1d;line-height:1.7;">
          <strong>The following will be permanently removed:</strong><br/>
          All team members and accounts, all projects and API keys, all governance policies
          and audit records, all billing and subscription data, and the organization itself.
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:14px;color:#52525b;line-height:1.7;">
      Enter the verification code below to proceed. This code expires in 10 minutes.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:0 0 24px;">
          <div style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;
                      color:#991b1b;background-color:#fef2f2;padding:14px 28px;border-radius:6px;
                      border:1px solid #fecaca;font-family:monospace;">
            {otp_code}
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
      If you did not initiate this request, please disregard this email and consider
      changing your password immediately.
    </p>
    """
    return _base_template(
        title=f"Regulayer - Confirm Deletion of {org_name}",
        preheader=f"Confirm the deletion of {org_name} on Regulayer",
        body_content=body,
    )


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

    html_content = _build_otp_html(otp_code)
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
    message["Subject"] = f"You have been invited to {org_name} on Regulayer"

    html_content = _build_invite_html(inviter_name, org_name, role, invite_link, expiry_date)

    message.set_content(
        f"{inviter_name} has invited you to join {org_name} as a {role}. "
        f"Accept your invitation: {invite_link}"
    )
    message.add_alternative(html_content, subtype="html")

    if await _send_email(message):
        print(f"Invitation email sent to {to_email}")


async def send_account_deletion_otp_email(to_email: str, otp_code: str, org_name: str):
    """Send OTP email for account deletion verification."""
    if not settings.smtp_host or not settings.smtp_user:
        print(f"SMTP not configured. Account deletion OTP for {to_email}: {otp_code}")
        return

    message = EmailMessage()
    message["From"] = settings.from_email or "no-reply@regulayer.tech"
    message["To"] = to_email
    message["Subject"] = f"Confirm Account Deletion - {org_name}"

    html_content = _build_account_delete_html(otp_code, org_name)
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

    html_content = _build_reset_html(reset_link, expiry_time)

    message.set_content(
        f"You requested a password reset for your Regulayer account. "
        f"Reset your password here: {reset_link} (expires in {expiry_time})"
    )
    message.add_alternative(html_content, subtype="html")

    if await _send_email(message):
        print(f"Password reset email sent to {to_email}")
