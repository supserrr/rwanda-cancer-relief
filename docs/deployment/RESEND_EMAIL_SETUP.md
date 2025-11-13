# Resend Email Setup for Supabase

This guide explains how to configure Resend as your SMTP provider for Supabase authentication emails.

## Prerequisites

1. A Resend account (sign up at [resend.com](https://resend.com))
2. Access to your Supabase project dashboard
3. A verified domain in Resend (recommended for production)

## Step 1: Get Resend SMTP Credentials

1. **Sign in to Resend Dashboard**
   - Go to [resend.com](https://resend.com) and sign in
   - Navigate to **API Keys** section

2. **Create an API Key** (if you don't have one)
   - Click "Create API Key"
   - Give it a name (e.g., "Supabase SMTP")
   - Copy the API key (you'll only see it once)

3. **Get SMTP Settings**
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587` (TLS) or `465` (SSL)
   - **SMTP User**: `resend`
   - **SMTP Password**: Your Resend API key
   - **From Email**: Use a verified domain email (e.g., `noreply@yourdomain.com`)
   - **From Name**: Your application name (e.g., "Rwanda Cancer Relief")

## Step 2: Configure Resend in Supabase Dashboard

1. **Navigate to Supabase Dashboard**
   - Go to your project: [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Go to Authentication Settings**
   - Click **Authentication** in the left sidebar
   - Click **Settings** (or go directly to `/project/[project-ref]/settings/auth`)

3. **Enable Custom SMTP**
   - Scroll down to **SMTP Settings** section
   - Toggle **Enable Custom SMTP** to ON

4. **Enter Resend SMTP Details**
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587` (recommended) or `465`
   - **SMTP User**: `resend`
   - **SMTP Password**: Your Resend API key
   - **Sender Email**: Your verified Resend email address
   - **Sender Name**: Your application name

5. **Save Settings**
   - Click **Save** or **Update Settings**
   - Supabase will test the connection

## Step 3: Verify Domain in Resend (Recommended for Production)

For production, you should verify your domain in Resend:

1. **Add Domain in Resend**
   - Go to Resend Dashboard → **Domains**
   - Click **Add Domain**
   - Enter your domain (e.g., `yourdomain.com`)

2. **Add DNS Records**
   - Resend will provide DNS records to add:
     - **SPF Record**: `v=spf1 include:resend.com ~all`
     - **DKIM Records**: Multiple CNAME records
     - **DMARC Record** (optional but recommended)

3. **Verify Domain**
   - Once DNS records are added, Resend will verify your domain
   - This may take a few minutes to 24 hours

4. **Update Sender Email**
   - After verification, update your Supabase SMTP sender email to use your verified domain
   - Example: `noreply@yourdomain.com`

## Step 4: Test Email Sending

1. **Test Password Reset**
   - Go to your application's sign-in page
   - Click "Reset password"
   - Enter a test email address
   - Check the email inbox (and spam folder)

2. **Check Resend Dashboard**
   - Go to Resend Dashboard → **Emails**
   - You should see the email in the logs
   - Check delivery status

## Step 5: Configure Rate Limits (Optional)

After setting up custom SMTP, Supabase applies a default rate limit of 30 emails per hour. You can adjust this:

1. **Go to Rate Limits**
   - In Supabase Dashboard → **Authentication** → **Rate Limits**
   - Adjust **Email** rate limit as needed
   - Resend free tier allows 3,000 emails/month
   - Resend Pro tier allows 50,000 emails/month

## Environment Variables (For Reference)

While SMTP is configured in Supabase Dashboard, you may want to document these for your team:

```env
# Resend SMTP Configuration (configured in Supabase Dashboard)
# SMTP Host: smtp.resend.com
# SMTP Port: 587
# SMTP User: resend
# SMTP Password: [Your Resend API Key]
# Sender Email: noreply@yourdomain.com
# Sender Name: Rwanda Cancer Relief
```

**Note**: These are NOT set in your `.env` file. They are configured directly in Supabase Dashboard.

## Troubleshooting

### Emails Not Sending

1. **Check Resend Dashboard**
   - Go to Resend → **Emails** to see delivery status
   - Check for any error messages

2. **Verify SMTP Settings**
   - Double-check all SMTP credentials in Supabase
   - Ensure the API key is correct and active

3. **Check Domain Verification**
   - If using a custom domain, ensure it's verified in Resend
   - Check DNS records are correctly configured

4. **Check Spam Folder**
   - Emails might be going to spam initially
   - Domain verification helps with deliverability

### Rate Limit Issues

- Check Supabase rate limits in Dashboard → Authentication → Rate Limits
- Check Resend usage in Resend Dashboard → **Usage**
- Upgrade Resend plan if needed

### Authentication Errors

- Verify your Resend API key is correct
- Ensure the API key has not been revoked
- Check that SMTP user is set to `resend` (not your email)

## Resend Pricing

- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Tier**: $20/month for 50,000 emails
- **Pay-as-you-go**: $0.30 per 1,000 emails after free tier

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend SMTP Guide](https://resend.com/docs/send-with-supabase-smtp)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend Dashboard](https://resend.com/emails)

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment-specific API keys** (development vs production)
3. **Rotate API keys regularly**
4. **Monitor email usage** in Resend Dashboard
5. **Set up domain verification** for better deliverability
6. **Use separate domains** for authentication vs marketing emails

