# Quick Resend Setup Guide

## Your Supabase Project
- **Project Ref**: `bdsepglppqbnazfepvmi`
- **Project Name**: RCR
- **Region**: us-west-1

## Step-by-Step Setup

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign in
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Name it "Supabase SMTP" or similar
5. **Copy the API key** (starts with `re_`)

### 2. Configure in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi)
2. Click **Authentication** in the left sidebar
3. Click **Settings** (or go to: Authentication → Settings)
4. Scroll down to **SMTP Settings**
5. Toggle **Enable Custom SMTP** to **ON**
6. Fill in the following:

   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: [Your Resend API Key from step 1]
   Sender Email: [Your verified Resend email, e.g., noreply@yourdomain.com]
   Sender Name: Rwanda Cancer Relief
   ```

7. Click **Save** or **Update Settings**

### 3. Test It

1. Go to your app's sign-in page
2. Click "Reset password"
3. Enter a test email address
4. Check the email inbox (and spam folder)
5. You can also check Resend Dashboard → **Emails** to see delivery status

## Using the Automated Script (Alternative)

If you prefer to use the script, add these to your `.env.local` file:

```env
SUPABASE_ACCESS_TOKEN=your-access-token-from-supabase-dashboard
SUPABASE_PROJECT_REF=bdsepglppqbnazfepvmi
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Rwanda Cancer Relief
```

Then run:
```bash
pnpm configure:resend
```

## Troubleshooting

- **"Email address not authorized"**: Make sure SMTP is enabled in Supabase
- **Emails not arriving**: Check Resend Dashboard → Emails for delivery status
- **Rate limit errors**: Check Supabase Dashboard → Authentication → Rate Limits

