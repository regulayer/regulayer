# Regulayer Production Environment Guide

This document details all external services and their configuration for production deployment.

## Required External Services

### 1. Stripe (Billing)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `STRIPE_API_KEY` | Secret API key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | [Webhooks](https://dashboard.stripe.com/webhooks) → Add endpoint |
| `STRIPE_PUBLISHABLE_KEY` | Public key for frontend | Stripe Dashboard → Publishable key |
| `STRIPE_PORTAL_URL` | Customer portal link | [Portal Settings](https://dashboard.stripe.com/settings/billing/portal) |

**Webhook Events to Configure:**
- `checkout.session.completed`
- `invoice.payment_failed`
- `customer.subscription.deleted`

---

### 2. Email (SendGrid/SMTP)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `SMTP_HOST` | SMTP server | `smtp.sendgrid.net` for SendGrid |
| `SMTP_PORT` | SMTP port | `587` (TLS) |
| `SMTP_USER` | Username | `apikey` for SendGrid |
| `SMTP_PASSWORD` | API key | [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys) |
| `FROM_EMAIL` | Sender address | Must be verified domain |

---

### 3. SSO / Identity (Auth0/Okta)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `SSO_ENABLED` | Enable SSO | `true` for production |
| `SSO_ISSUER` | OIDC issuer URL | Your IdP's issuer URL |
| `SSO_CLIENT_ID` | OAuth client ID | IdP application settings |
| `SSO_CLIENT_SECRET` | OAuth client secret | IdP application settings |

---

### 4. AWS S3 (Backups)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `S3_BACKUP_BUCKET` | Bucket name | Create in [S3 Console](https://s3.console.aws.amazon.com/) |
| `AWS_ACCESS_KEY_ID` | IAM access key | [IAM Users](https://console.aws.amazon.com/iam/) |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key | IAM user creation |
| `AWS_REGION` | AWS region | e.g., `us-east-1` |

**Required S3 Permissions:**
- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`

---

### 5. Production Secrets

| Variable | Description | Notes |
|----------|-------------|-------|
| `JWT_SECRET` | Session signing | Generate: `openssl rand -hex 64` |
| `SESSION_SECRET` | Cookie encryption | Generate: `openssl rand -hex 64` |
| `HMAC_SECRET_KEY` | Request signing | Generate: `openssl rand -hex 64` |
| `GOVERNANCE_INTERNAL_SECRET` | Service auth | Generate: `openssl rand -hex 32` |
| `INCIDENTS_INTERNAL_SECRET` | Service auth | Generate: `openssl rand -hex 32` |

---

## Production Checklist

- [ ] Set `ENV=prod`
- [ ] Set `DEMO_MODE_ENABLED=false`
- [ ] Replace all `mock` and `dev_` values
- [ ] Configure TLS/HTTPS
- [ ] Set up reverse proxy (Nginx/Traefik)
- [ ] Configure DNS for `*.regulayer.tech`
- [ ] Enable database backups
- [ ] Test Stripe webhook delivery
- [ ] Verify email sending
- [ ] Rotate all secrets from development

---

## Security Notes

> **NEVER** commit production secrets to version control.

Use environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault).
