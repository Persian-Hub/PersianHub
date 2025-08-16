# Email System Quick Setup Guide

## Required Environment Variables

Add these to your Vercel project settings or `.env.local`:

\`\`\`bash
# Office 365 SMTP (Required)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=mailer@aussieavatar.com.au
SMTP_PASS=your_password_here

# Email Configuration (Required)
EMAIL_FROM_NAME=Persian Hub
EMAIL_FROM_EMAIL=noreply@persianhub.com.au
ADMIN_EMAILS=admin@persianhub.com.au
APP_BASE_URL=https://persianhub.com.au
\`\`\`

## Database Setup

1. Run the email log table creation script:
   \`\`\`bash
   # Execute scripts/create-email-log-table.sql in your Supabase dashboard
   \`\`\`

## Testing

1. Go to `/admin/settings` in your admin panel
2. Check configuration status
3. Send a test email to verify setup

## Email Events

The system automatically sends emails for:
- New business submissions (to owner + admins)
- Business approvals/rejections (to owner)
- Business verification (to owner)
- New review submissions (to admins)
- Review approvals (to business owner)

## Troubleshooting

- **No emails sending**: Check environment variables are set
- **"From address rejected"**: System will automatically use fallback
- **Failed emails**: Check `/admin/settings` for configuration status

For detailed documentation, see `docs/EMAIL_SYSTEM.md`.
