from email.message import EmailMessage
import aiosmtplib
from .config import settings


# ============================================================
# Enterprise Email Design System
# ============================================================
# All Regulayer transactional emails share a unified visual
# identity: official logo, consistent header/footer, and
# a professional dark-on-white layout suitable for regulated
# enterprise environments.
# ============================================================

LOGO_URL = "https://regulayer.tech/_next/image?url=%2Fregulayer_logo.png&w=640&q=75"
CURRENT_YEAR = "2026"


def _base_template(title: str, preheader: str, body_content: str) -> str:
    """
    Master email wrapper.
    All transactional emails are rendered through this single
    enterprise template.  No template can bypass this function.

    Args:
        title:        HTML <title> tag text
        preheader:    Invisible preview text shown in inbox previews
        body_content: The inner HTML content block
    """
    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body, table, td {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }}
    a {{ color: #e85d22; text-decoration: none; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ width: 100% !important; padding: 16px !important; }}
      .email-body {{ padding: 28px 20px !important; }}
    }}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <!-- Preheader (hidden inbox preview text) -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    {preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="email-wrapper" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- ========== HEADER ========== -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="https://regulayer.tech" target="_blank" style="display:inline-block;">
                <img src="{LOGO_URL}" alt="Regulayer" width="160" height="auto"
                     style="display:block;max-width:160px;height:auto;border:0;outline:none;" />
              </a>
            </td>
          </tr>

          <!-- ========== MAIN CARD ========== -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background-color:#ffffff;border-radius:16px;overflow:hidden;
                            box-shadow:0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);">


                <!-- Body Content -->
                <tr>
                  <td class="email-body" style="padding:40px 40px 36px;">
                    {body_content}
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 40px;">
                    <div style="height:1px;background-color:#e8e8eb;"></div>
                  </td>
                </tr>

                <!-- Card Footer -->
                <tr>
                  <td style="padding:20px 40px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:#9ca3af;line-height:1.5;">
                          This is an automated message from <a href="https://regulayer.tech" style="color:#e85d22;font-weight:500;">Regulayer</a>.
                          Please do not reply directly to this email.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ========== FOOTER ========== -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:12px;color:#9ca3af;line-height:1.6;">
                    <strong style="color:#6b7280;">Regulayer</strong> · EU AI Act Compliance Infrastructure
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:8px;font-size:11px;color:#b0b8c4;line-height:1.5;">
                    Cryptographic Decision Audit &middot; HITL Governance &middot; Regulatory Reporting
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;font-size:11px;color:#c8cdd5;">
                    &copy; {CURRENT_YEAR} Regulayer. All rights reserved.
                  </td>
                </tr>
              </table>
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
    <!-- Title -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;">
      Verify your email
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
      Enter the verification code below to complete your sign-in to Regulayer.
      This code is valid for <strong style="color:#374151;">10 minutes</strong>.
    </p>

    <!-- OTP Code Block -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:4px 0 28px;">
          <div style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;
                      color:#111827;background-color:#f9fafb;border:2px solid #e5e7eb;
                      padding:16px 32px;border-radius:12px;font-family:'Courier New',monospace;">
            {otp_code}
          </div>
        </td>
      </tr>
    </table>

    <!-- Security Notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border-radius:10px;border:1px solid #f3f4f6;">
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#6b7280;line-height:1.6;">
          <strong style="color:#374151;">&#128274; Security notice:</strong>
          If you did not initiate this request, please ignore this email.
          Your account remains secure.
        </td>
      </tr>
    </table>
    """
    return _base_template(
        title="Regulayer – Verification Code",
        preheader=f"Your Regulayer verification code is {otp_code}",
        body_content=body,
    )


# ============================================================
# 2. Team Invitation Email
# ============================================================

def _build_invite_html(inviter_name: str, org_name: str, role: str, invite_link: str, expiry_date: str) -> str:
    body = f"""
    <!-- Title -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;">
      You&rsquo;ve been invited
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      <strong style="color:#111827;">{inviter_name}</strong> has invited you to join
      <strong style="color:#111827;">{org_name}</strong> on Regulayer.
    </p>

    <!-- Role Badge -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border-radius:10px;border:1px solid #f3f4f6;margin-bottom:28px;">
      <tr>
        <td style="padding:16px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:4px;">
                Your Role
              </td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:#111827;">
                {role}
              </td>
            </tr>
          </table>
        </td>
        <td style="padding:16px;text-align:right;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:4px;">
                Organization
              </td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:#111827;">
                {org_name}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{invite_link}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="17%" strokecolor="#111827" fillcolor="#111827">
          <w:anchorlock/><center style="color:#ffffff;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;">Accept Invitation</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="{invite_link}"
             style="display:inline-block;background-color:#111827;color:#ffffff;
                    padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;
                    text-decoration:none;line-height:1;mso-padding-alt:0;">
            Accept Invitation &rarr;
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>

    <!-- Expiry + Security -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#fffbeb;border-radius:10px;border:1px solid #fef3c7;">
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#92400e;line-height:1.6;">
          <strong>&#9200; Expires:</strong> {expiry_date}<br/>
          If you did not expect this invitation, simply ignore this email.
        </td>
      </tr>
    </table>
    """
    return _base_template(
        title=f"Regulayer – Invitation to {org_name}",
        preheader=f"{inviter_name} has invited you to join {org_name} on Regulayer",
        body_content=body,
    )


# ============================================================
# 3. Password Reset Email
# ============================================================

def _build_reset_html(reset_link: str, expiry_time: str) -> str:
    body = f"""
    <!-- Title -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;">
      Reset your password
    </h1>
    <p style="margin:0 0 12px;font-size:15px;color:#6b7280;line-height:1.6;">
      We received a request to reset the password for your Regulayer account.
      If you made this request, click the button below to set a new password.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;line-height:1.5;">
      This link is valid for <strong style="color:#374151;">{expiry_time}</strong>.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:28px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{reset_link}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="17%" strokecolor="#111827" fillcolor="#111827">
          <w:anchorlock/><center style="color:#ffffff;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;">Reset Password</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="{reset_link}"
             style="display:inline-block;background-color:#111827;color:#ffffff;
                    padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;
                    text-decoration:none;line-height:1;mso-padding-alt:0;">
            Reset Password &rarr;
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>

    <!-- Fallback URL -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border-radius:10px;border:1px solid #f3f4f6;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">
            Or copy this link
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;word-break:break-all;line-height:1.5;">
            {reset_link}
          </p>
        </td>
      </tr>
    </table>

    <!-- Security Notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border-radius:10px;border:1px solid #f3f4f6;">
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#6b7280;line-height:1.6;">
          <strong style="color:#374151;">&#128274; Security notice:</strong>
          If you did not request a password reset, please disregard this email.
          No changes have been made to your account.
        </td>
      </tr>
    </table>
    """
    return _base_template(
        title="Regulayer – Password Reset",
        preheader="Reset the password for your Regulayer account",
        body_content=body,
    )


# ============================================================
# 4. Account Deletion OTP Email
# ============================================================

def _build_account_delete_html(otp_code: str, org_name: str) -> str:
    body = f"""
    <!-- Title -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#dc2626;letter-spacing:-0.3px;">
      &#9888;&#65039; Account Deletion Request
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6;">
      A request has been made to permanently delete your organization
      <strong style="color:#111827;">{org_name}</strong> and all associated data.
    </p>

    <!-- Danger Banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#fef2f2;border-radius:10px;border:1px solid #fecaca;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;font-size:13px;color:#991b1b;line-height:1.7;">
          <strong style="font-size:14px;">This action is irreversible.</strong> The following will be permanently deleted:
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;">
            <tr><td style="padding:3px 0;font-size:13px;color:#991b1b;">&bull;&nbsp; All team members and their accounts</td></tr>
            <tr><td style="padding:3px 0;font-size:13px;color:#991b1b;">&bull;&nbsp; All projects, API keys, and SDK integrations</td></tr>
            <tr><td style="padding:3px 0;font-size:13px;color:#991b1b;">&bull;&nbsp; All governance policies and audit logs</td></tr>
            <tr><td style="padding:3px 0;font-size:13px;color:#991b1b;">&bull;&nbsp; All billing data and subscription records</td></tr>
            <tr><td style="padding:3px 0;font-size:13px;color:#991b1b;">&bull;&nbsp; The organization <strong>{org_name}</strong> itself</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Verification Code -->
    <p style="margin:0 0 12px;font-size:15px;color:#6b7280;line-height:1.6;">
      Enter this verification code to confirm. It expires in <strong style="color:#374151;">10 minutes</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:4px 0 28px;">
          <div style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;
                      color:#dc2626;background-color:#fef2f2;border:2px solid #fecaca;
                      padding:16px 32px;border-radius:12px;font-family:'Courier New',monospace;">
            {otp_code}
          </div>
        </td>
      </tr>
    </table>

    <!-- Security Notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border-radius:10px;border:1px solid #f3f4f6;">
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#6b7280;line-height:1.6;">
          <strong style="color:#374151;">&#128274; Didn&rsquo;t request this?</strong>
          Ignore this email and secure your account immediately by resetting your password.
        </td>
      </tr>
    </table>
    """
    return _base_template(
        title=f"Regulayer – Confirm Account Deletion ({org_name})",
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
    message["Subject"] = f"You've been invited to {org_name} on Regulayer"

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
    message["Subject"] = f"⚠️ Confirm Account Deletion – {org_name}"

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
