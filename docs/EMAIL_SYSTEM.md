# Persian Hub Email Notification System

This document describes the email notification system implemented for Persian Hub, including setup, configuration, and testing procedures.

## Overview

The email notification system sends transactional emails for business and review workflows using Office 365 SMTP. All emails are logged in the database for audit, retry, and analytics purposes.

## Features

- **Business Notifications**: Submission, approval, rejection, and verification emails
- **Review Notifications**: Submission to admins and approval to business owners
- **Email Logging**: Complete audit trail with deduplication
- **Admin Test Utility**: Built-in email testing interface
- **Office 365 Integration**: SMTP with fallback handling
- **Template System**: HTML email templates with Persian Hub branding

## Email Events

### User Emails
1. **Business Submitted**: When a user creates a business (pending status)
2. **Business Approved**: When admin approves a business
3. **Business Rejected**: When admin rejects a business (includes rejection reason)
4. **Business Verified**: When admin marks business as verified
5. **Review Approved**: When admin approves a review (sent to business owner)

### Admin Emails
6. **New Business Submitted**: When a business is created (pending status)
7. **New Review Submitted**: When a review is created (pending status)

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your Vercel project or `.env.local`:

\`\`\`bash
# SMTP Configuration (Office 365)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=mailer@aussieavatar.com.au
SMTP_PASS=your_smtp_password

# Email Settings
EMAIL_FROM_NAME=Persian Hub
EMAIL_FROM_EMAIL=noreply@persianhub.com.au
ADMIN_EMAILS=admin1@example.com,admin2@example.com
APP_BASE_URL=https://persianhub.com.au
\`\`\`

### 2. Database Setup

Run the email log table creation script:

\`\`\`sql
-- This creates the email_log table with all required columns and indexes
-- File: scripts/create-email-log-table.sql
\`\`\`

The script creates:
- `email_log` table with comprehensive tracking
- Indexes for performance
- Row Level Security policies
- Admin-safe view for sensitive data

### 3. Office 365 Configuration

#### Option A: Use Send-As Permission (Recommended)
1. In Office 365 Admin Center, grant "Send As" permission for `noreply@persianhub.com.au` to `mailer@aussieavatar.com.au`
2. This allows emails to appear from the desired address

#### Option B: Automatic Fallback
If Send-As is not configured, the system automatically:
1. Uses `mailer@aussieavatar.com.au` as the From address
2. Sets `noreply@persianhub.com.au` as Reply-To
3. Logs a warning about the fallback

## Testing the System

### 1. Admin Test Utility

Access the admin email test utility at `/admin/settings`:

1. **Configuration Status**: View current SMTP settings and status
2. **Send Test Email**: Send a test email to verify functionality
3. **Environment Guide**: Reference for required variables

### 2. Manual Testing Checklist

#### Business Workflow Tests
- [ ] Create a new business → Owner and admin receive emails
- [ ] Approve business → Owner receives approval email
- [ ] Reject business with reason → Owner receives rejection email with reason
- [ ] Verify business → Owner receives verification email
- [ ] Check email_log table for all entries

#### Review Workflow Tests
- [ ] Submit a review → Admin receives notification email
- [ ] Approve review → Business owner receives notification email
- [ ] Check email_log table for all entries

#### Error Handling Tests
- [ ] Test with invalid SMTP credentials → Graceful failure, no crashes
- [ ] Test with missing environment variables → Warning logged, no emails sent
- [ ] Test duplicate events → Deduplication prevents duplicate emails

### 3. Email Log Verification

Check the `email_log` table after each test:

\`\`\`sql
-- View recent email logs
SELECT 
  template_key,
  status,
  to_emails,
  subject,
  created_at,
  error_message
FROM email_log 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for failed emails
SELECT * FROM email_log WHERE status = 'failed';

-- View email statistics
SELECT 
  template_key,
  status,
  COUNT(*) as count
FROM email_log 
GROUP BY template_key, status;
\`\`\`

## Email Templates

All email templates use Persian Hub branding with:
- **Brand Color**: `oklch(54.6% .245 262.881)` (fallback: `#4F46E5`)
- **Font**: Arial, Helvetica, sans-serif
- **Layout**: 600px container with rounded corners and shadow
- **Responsive**: Works on desktop and mobile

### Template Variables

Each template uses specific variables:

- **Business Templates**: `ownerName`, `businessName`, `listingUrl`, `rejectionReason`
- **Review Templates**: `businessName`, `reviewExcerpt`, `ownerName`
- **Admin Templates**: `businessName`, `ownerEmail`, `adminUrl`

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch" Errors
- **Cause**: SMTP credentials incorrect or Office 365 authentication issues
- **Solution**: Verify SMTP_USER and SMTP_PASS in environment variables

#### 2. Emails Not Sending
- **Cause**: Missing environment variables
- **Solution**: Check all required variables are set and SMTP service is configured

#### 3. "From Address Rejected" Errors
- **Cause**: Office 365 doesn't allow sending from `noreply@persianhub.com.au`
- **Solution**: System automatically falls back to authenticated user email with Reply-To header

#### 4. Duplicate Emails
- **Cause**: Multiple rapid status changes
- **Solution**: System uses deduplication keys to prevent duplicates

### Debug Mode

Enable debug logging by checking the email_log table:

\`\`\`sql
-- View detailed error information
SELECT 
  template_key,
  error_code,
  error_message,
  variables,
  attempted_at
FROM email_log 
WHERE status = 'failed'
ORDER BY created_at DESC;
\`\`\`

## Architecture

### Components

1. **EmailService** (`lib/services/email-service.ts`)
   - SMTP configuration and sending
   - Error handling and fallback logic
   - Email logging integration

2. **EmailTemplates** (`lib/services/email-templates.ts`)
   - HTML template rendering
   - Variable substitution
   - Consistent branding

3. **NotificationService** (`lib/services/notification-service.ts`)
   - Business logic for when to send emails
   - Database integration for fetching related data
   - Coordination between templates and email service

4. **Server Actions** (`lib/actions.ts`)
   - Integration with business and review workflows
   - State change detection
   - Error handling that doesn't break main functionality

### Database Schema

The `email_log` table tracks:
- **Delivery Status**: queued, sending, sent, failed, cancelled
- **Retry Logic**: attempts count and timestamps
- **Deduplication**: unique keys prevent duplicate sends
- **Audit Trail**: complete record of all email activity
- **Template Tracking**: version control for email templates

## Security Considerations

- **Row Level Security**: Only service role can insert/update email logs
- **Admin Access**: Email configuration only accessible to admin users
- **Data Retention**: Email bodies are redacted after 180 days (configurable)
- **Environment Variables**: Sensitive SMTP credentials stored securely

## Performance

- **Async Processing**: Email sending doesn't block main application flow
- **Database Indexes**: Optimized for common queries and retry processing
- **Deduplication**: Prevents unnecessary email sends
- **Error Handling**: Failed emails don't crash the application

## Monitoring

Monitor email system health by checking:
- Email success/failure rates in `email_log` table
- Admin test utility for configuration status
- Application logs for SMTP connection issues
- Deduplication effectiveness

## Future Enhancements

Potential improvements:
- **Queue System**: Background job processing for high volume
- **Email Templates UI**: Admin interface for template customization
- **Analytics Dashboard**: Email performance metrics
- **Webhook Integration**: Real-time delivery status updates
- **Multi-language Support**: Localized email templates
