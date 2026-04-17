from email.message import EmailMessage
import aiosmtplib
from .config import settings


# ============================================================
# Regulayer Enterprise Email System
# ============================================================

LOGO_URL = "https://regulayer.tech/_next/image?url=%2Fregulayer_logo.png&w=640&q=75"


def _base_template(title: str, preheader: str, body_content: str) -> str:
    """Master email wrapper. Every Regulayer email renders through this."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f2f2f2;">{preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f2f2;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

          <!-- Header Bar -->
          <tr>
            <td style="background-color:#0f0f0f;padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <img src="{LOGO_URL}" alt="Regulayer" width="120" style="display:block;width:120px;height:auto;border:0;" />
                  </td>
                  <td align="right" style="font-size:12px;color:#9ca3af;font-weight:400;letter-spacing:0.3px;">
                    AI Compliance Platform
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 36px;">
              {body_content}
            </td>
          </tr>

          <!-- Footer Divider -->
          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #ebebeb;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px;color:#9ca3af;line-height:1.7;">
                    <strong style="color:#6b7280;font-weight:600;">Regulayer</strong><br/>
                    EU AI Act Compliance Infrastructure<br/>
                    Cryptographic Decision Audit &middot; Governance &middot; Regulatory Reporting
                  </td>
                  <td align="right" valign="top" style="font-size:12px;color:#9ca3af;">
                    <a href="https://regulayer.tech" style="color:#6b7280;text-decoration:none;font-weight:500;">regulayer.tech</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Below-card notice -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:20px 0 0;font-size:11px;color:#b0b0b0;line-height:1.5;">
              This is an automated message from Regulayer. Please do not reply directly.
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
    <p style="margin:0 0 4px;font-size:20px;font-weight:600;color:#111827;line-height:1.3;">
      Verify your email address
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;">
      To continue signing in to your Regulayer account, please enter the
      verification code shown below. This code will expire in 10 minutes.
    </p>

    <!-- Code -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
            <tr>
              <td style="padding:18px 36px;font-size:30px;font-weight:700;letter-spacing:8px;color:#111827;font-family:'Courier New',Courier,monospace;">
                {otp_code}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you did not request this code, no action is required. Your account
      remains secure and no changes have been made.
    </p>
    """
    return _base_template(
        title="Verification Code - Regulayer",
        preheader=f"Your Regulayer verification code is {otp_code}",
        body_content=body,
    )


# ============================================================
# 2. Team Invitation Email
# ============================================================

def _build_invite_html(inviter_name: str, org_name: str, role: str, invite_link: str, expiry_date: str) -> str:
    body = f"""
    <p style="margin:0 0 4px;font-size:20px;font-weight:600;color:#111827;line-height:1.3;">
      You have been invited to join {org_name}
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;">
      {inviter_name} has invited you to collaborate on the Regulayer platform
      as a member of <strong style="color:#374151;">{org_name}</strong>.
    </p>

    <!-- Details card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:12px;">
                <span style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Organization</span><br/>
                <span style="font-size:15px;font-weight:600;color:#111827;">{org_name}</span>
              </td>
              <td style="padding-bottom:12px;">
                <span style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Your Role</span><br/>
                <span style="font-size:15px;font-weight:600;color:#111827;">{role}</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Invited By</span><br/>
                <span style="font-size:15px;font-weight:600;color:#111827;">{inviter_name}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td>
          <a href="{invite_link}"
             style="display:inline-block;background-color:#111827;color:#ffffff;
                    padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;
                    text-decoration:none;line-height:1;">
            Accept Invitation
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      This invitation expires on {expiry_date}. If you were not expecting
      this message, you may safely ignore it.
    </p>
    """
    return _base_template(
        title=f"Invitation to {org_name} - Regulayer",
        preheader=f"{inviter_name} invited you to join {org_name} on Regulayer",
        body_content=body,
    )


# ============================================================
# 3. Password Reset Email
# ============================================================

def _build_reset_html(reset_link: str, expiry_time: str) -> str:
    body = f"""
    <p style="margin:0 0 4px;font-size:20px;font-weight:600;color:#111827;line-height:1.3;">
      Reset your password
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;">
      We received a request to reset the password for your Regulayer account.
      Click the button below to set a new password. For security, this link
      will expire in {expiry_time}.
    </p>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td>
          <a href="{reset_link}"
             style="display:inline-block;background-color:#111827;color:#ffffff;
                    padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;
                    text-decoration:none;line-height:1;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you did not request this, please ignore this email. Your password
      will remain unchanged.
    </p>
    """
    return _base_template(
        title="Password Reset - Regulayer",
        preheader="Reset the password for your Regulayer account",
        body_content=body,
    )


# ============================================================
# 4. Account Deletion OTP Email
# ============================================================

def _build_account_delete_html(otp_code: str, org_name: str) -> str:
    body = f"""
    <p style="margin:0 0 4px;font-size:20px;font-weight:600;color:#111827;line-height:1.3;">
      Confirm account deletion
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
      A request has been made to permanently delete the organization
      <strong style="color:#111827;">{org_name}</strong> and all associated data
      from the Regulayer platform. This action cannot be reversed.
    </p>

    <!-- Warning -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;font-size:13px;color:#991b1b;line-height:1.7;">
          <strong style="font-size:14px;color:#7f1d1d;">This will permanently remove:</strong>
          <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
            <tr><td style="padding:2px 0;font-size:13px;color:#991b1b;">All team members, projects, and API keys</td></tr>
            <tr><td style="padding:2px 0;font-size:13px;color:#991b1b;">All governance policies and audit records</td></tr>
            <tr><td style="padding:2px 0;font-size:13px;color:#991b1b;">All billing data, sessions, and the organization itself</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
      To proceed, enter the verification code below. It expires in 10 minutes.
    </p>

    <!-- Code -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
            <tr>
              <td style="padding:18px 36px;font-size:30px;font-weight:700;letter-spacing:8px;color:#991b1b;font-family:'Courier New',Courier,monospace;">
                {otp_code}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you did not initiate this request, please disregard this email and
      consider resetting your password immediately.
    </p>
    """
    return _base_template(
        title=f"Confirm Deletion - {org_name} - Regulayer",
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
