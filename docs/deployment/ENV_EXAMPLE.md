# Environment Variables Example

This file documents all environment variables used in the Rwanda Cancer Relief application.

## Production Setup

Copy the variables you need from below and configure them in your Vercel project dashboard under **Settings → Environment Variables**.

## Required Variables

### AI SDK Configuration
**For AI Chat Features**

```
AI_SDK_KEY=your_ai_sdk_key_here
```

Get your API key from: https://sdk.vercel.ai/docs/getting-started

The AI SDK key is required for the chat functionality in `/api/chat/route.ts`.

## Optional Variables

### Perplexity API (Web Search)
```
PERPLEXITY_API_KEY=your_perplexity_key_here
```

Allows AI chat to search the web for information. Get from: https://www.perplexity.ai/

### OpenAI API (Alternative AI Provider)
```
OPENAI_API_KEY=your_openai_key_here
```

Use OpenAI as an alternative AI provider. Get from: https://platform.openai.com/

### Jitsi Configuration
**For Production Video Conferencing**

```
NEXT_PUBLIC_JITSI_DOMAIN=your-jitsi-domain.com
NEXT_PUBLIC_JITSI_APP_ID=your-app-id
```

Currently using 8x8.vc free tier in development. For production with HIPAA compliance, consider self-hosting Jitsi.

### Environment
```
NODE_ENV=production
```

Automatically set by Vercel in production deployments.

### Debug Mode
```
DEBUG=false
```

Control debug logging in production.

## Vercel Deployment

### Setting Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name
   - **Value**: Variable value
   - **Environment**: Select which environments (Production, Preview, Development)
4. Click **Save**

### Important Notes

- **NEXT_PUBLIC_*** variables are exposed to the browser
- Keep sensitive keys (API keys) without NEXT_PUBLIC_ prefix
- Use Vercel's environment variable encryption
- Set different values for Production vs Preview environments
- Never commit `.env` files to version control

## Current Application State

### Working Without Configuration
The app currently works with:
- Mock authentication (no backend required)
- Jitsi video calls via 8x8.vc (no API key needed)
- Basic AI chat simulation (requires API key for real responses)

### Production Considerations

For a production-ready deployment:

1. **Add AI SDK Key** - Required for AI chat responses
2. **Configure Jitsi** - For HIPAA-compliant video calls
3. **Set up Backend API** - For real authentication and data storage
4. **Configure Database** - For persistent data
5. **Enable Monitoring** - Error tracking and analytics

## Testing Configuration

Test your environment variables:

```bash
# Check if variables are loaded
echo $AI_SDK_KEY

# Or in Next.js
console.log(process.env.AI_SDK_KEY)
```

## Security Best Practices

1. **Never commit** `.env` files
2. **Use different keys** for development and production
3. **Rotate keys** periodically
4. **Monitor usage** to detect unauthorized access
5. **Use Vercel's** built-in environment variable management

