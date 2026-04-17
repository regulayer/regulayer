from email.message import EmailMessage
import aiosmtplib
from .config import settings


# ============================================================
# Regulayer Email Templates
# ============================================================
# Design principles: Stripe/Linear-level restraint.
# - Logo: small wordmark, 36px height, top-left, no header bar
# - Generous whitespace
# - Two font sizes only: 15px body, 12px secondary
# - Single accent: #111 for buttons, nothing else
# - No decorative elements, no taglines, no gradients
# ============================================================

LOGO_URL = "https://regulayer.tech/_next/image?url=%2Fregulayer_logo.png&w=640&q=75"


def _base(title: str, preheader: str, inner: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafa;">
<tr><td align="center" style="padding:48px 24px 56px;">
<table width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;">

<!-- Logo -->
<tr><td style="padding:0 0 40px;">
<img src="{LOGO_URL}" alt="Regulayer" width="36" height="36" style="display:block;width:36px;height:36px;border:0;border-radius:6px;" />
</td></tr>

{inner}

<!-- Divider -->
<tr><td style="padding:40px 0 0;">
<div style="height:1px;background-color:#eee;"></div>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 0 0;">
<p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
Regulayer<br/>
This is an automated message. If you did not expect it, no action is needed.
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


# ============================================================
# OTP
# ============================================================

def _build_otp_html(otp_code: str) -> str:
    inner = f"""
<tr><td>
<p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111;">Verify your email address</p>
<p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.7;">
Enter this code to continue signing in to Regulayer. It expires in 10 minutes.
</p>
</td></tr>

<tr><td style="padding:0 0 32px;">
<table cellpadding="0" cellspacing="0" border="0">
<tr><td style="background-color:#f5f5f5;border:1px solid #e5e5e5;border-radius:6px;padding:16px 32px;font-size:28px;font-weight:700;letter-spacing:6px;color:#111;font-family:'Courier New',monospace;">
{otp_code}
</td></tr>
</table>
</td></tr>

<tr><td>
<p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
If you did not request this code, you can ignore this email.
</p>
</td></tr>
"""
    return _base("Verification Code - Regulayer", f"Your code is {otp_code}", inner)


# ============================================================
# Invitation
# ============================================================

def _build_invite_html(inviter_name: str, org_name: str, role: str, invite_link: str, expiry_date: str) -> str:
    inner = f"""
<tr><td>
<p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111;">Join {org_name} on Regulayer</p>
<p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.7;">
{inviter_name} invited you to join <strong style="color:#111;">{org_name}</strong> as <strong style="color:#111;">{role}</strong>.
</p>
</td></tr>

<tr><td style="padding:0 0 32px;">
<a href="{invite_link}" style="display:inline-block;background-color:#111;color:#fff;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;">Accept Invitation</a>
</td></tr>

<tr><td>
<p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
This invitation expires on {expiry_date}. If you were not expecting this, please disregard.
</p>
</td></tr>
"""
    return _base(f"Join {org_name} - Regulayer", f"{inviter_name} invited you to {org_name}", inner)


# ============================================================
# Password Reset
# ============================================================

def _build_reset_html(reset_link: str, expiry_time: str) -> str:
    inner = f"""
<tr><td>
<p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111;">Reset your password</p>
<p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.7;">
Someone requested a password reset for your Regulayer account. Use the button below to choose a new password. This link expires in {expiry_time}.
</p>
</td></tr>

<tr><td style="padding:0 0 32px;">
<a href="{reset_link}" style="display:inline-block;background-color:#111;color:#fff;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;">Reset Password</a>
</td></tr>

<tr><td>
<p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
If you did not request this, no action is needed. Your password will not change.
</p>
</td></tr>
"""
    return _base("Password Reset - Regulayer", "Reset your Regulayer password", inner)


# ============================================================
# Account Deletion
# ============================================================

def _build_account_delete_html(otp_code: str, org_name: str) -> str:
    inner = f"""
<tr><td>
<p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111;">Confirm account deletion</p>
<p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
A request was made to permanently delete <strong style="color:#111;">{org_name}</strong> and all its data. This cannot be undone.
</p>
</td></tr>

<tr><td style="padding:0 0 24px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:6px;">
<tr><td style="padding:14px 16px;font-size:13px;color:#991b1b;line-height:1.7;">
All team members, projects, API keys, governance policies, audit records, billing data, and the organization itself will be permanently removed.
</td></tr>
</table>
</td></tr>

<tr><td>
<p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
Enter this code to confirm. It expires in 10 minutes.
</p>
</td></tr>

<tr><td style="padding:0 0 32px;">
<table cellpadding="0" cellspacing="0" border="0">
<tr><td style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px 32px;font-size:28px;font-weight:700;letter-spacing:6px;color:#991b1b;font-family:'Courier New',monospace;">
{otp_code}
</td></tr>
</table>
</td></tr>

<tr><td>
<p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
If you did not request this, ignore this email and consider changing your password.
</p>
</td></tr>
"""
    return _base(f"Confirm Deletion - Regulayer", f"Confirm deletion of {org_name}", inner)


# ============================================================
# Sender Functions
# ============================================================

async def _send_email(message: EmailMessage):
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
    message["Subject"] = f"Join {org_name} on Regulayer"

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
