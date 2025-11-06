# Supabase Edge Functions Migration Plan

## Overview

This document outlines the migration plan for moving the Express.js backend to Supabase Edge Functions. This is a significant architectural change that requires careful planning and execution.

## Current Architecture

### Backend Components

1. **Express.js Server** (`src/server.ts`)
   - HTTP server with Express app
   - Socket.IO for real-time communication
   - Multiple route modules (auth, sessions, resources, chat, notifications, admin)
   - ~42 REST API endpoints
   - Middleware for authentication, validation, error handling

2. **Route Modules** (6 modules)
   - `auth.routes.ts` - 8 endpoints
   - `sessions.routes.ts` - 7 endpoints
   - `resources.routes.ts` - 7 endpoints
   - `chat.routes.ts` - 6 endpoints
   - `notifications.routes.ts` - 5 endpoints
   - `admin.routes.ts` - 5 endpoints

3. **Socket.IO Handlers** (3 handlers)
   - `chat.handler.ts` - Real-time chat events
   - `notifications.handler.ts` - Real-time notifications
   - `sessions.handler.ts` - Real-time session updates

4. **Services** (8 services)
   - All services use Supabase client (already compatible)
   - Services are mostly stateless and can be reused

5. **Dependencies**
   - Express.js for HTTP server
   - Socket.IO for WebSocket connections
   - Supabase client for database/auth/storage
   - Jitsi integration for video sessions

## Migration Scope

### What Can Be Migrated

1. **REST API Endpoints** → Supabase Edge Functions
   - All 42 endpoints can be converted to Edge Functions
   - Each route module becomes a separate Edge Function or function group
   - Services can be reused with minimal changes

2. **Authentication** → Supabase Auth (already using)
   - Already using Supabase Auth
   - Edge Functions have built-in auth helpers

3. **Database Operations** → Supabase Client (already using)
   - All services already use Supabase client
   - No changes needed

4. **File Storage** → Supabase Storage (already using)
   - Already using Supabase Storage
   - Edge Functions can handle file uploads

### What Needs to Be Replaced

1. **Socket.IO** → Supabase Realtime
   - Complete replacement required
   - Different API and event model
   - Client-side changes required

2. **Express Middleware** → Edge Function Middleware
   - Custom middleware needs to be rewritten
   - Different request/response handling

3. **Error Handling** → Edge Function Error Responses
   - Different error response format
   - No Express error middleware

4. **Request/Response** → Edge Function Request/Response
   - Different API (Deno Request/Response)
   - No Express req/res objects

## Challenges and Considerations

### 1. Runtime Environment

- **Current**: Node.js with Express
- **Target**: Deno runtime (Edge Functions)
- **Impact**: 
  - Different module system (ES modules only)
  - Different standard library
  - Some npm packages may not work
  - TypeScript support is built-in

### 2. Real-time Communication

- **Current**: Socket.IO (WebSocket-based)
- **Target**: Supabase Realtime (PostgreSQL change streams)
- **Impact**:
  - Different event model
  - Client-side code needs changes
  - No direct Socket.IO events
  - Uses PostgreSQL triggers and channels

### 3. Function Organization

- **Current**: Single Express app with routes
- **Target**: Multiple Edge Functions (one per route group)
- **Impact**:
  - More deployment units
  - Need to manage multiple functions
  - Shared code needs to be extracted

### 4. Authentication Middleware

- **Current**: Express middleware
- **Target**: Edge Function auth helpers
- **Impact**:
  - Different auth pattern
  - Need to rewrite middleware logic

### 5. File Uploads

- **Current**: Express body parser
- **Target**: Edge Function request handling
- **Impact**:
  - Different file upload handling
  - May need different approach

### 6. Jitsi Integration

- **Current**: Node.js service
- **Target**: Edge Function
- **Impact**:
  - JWT generation needs to work in Deno
  - May need different JWT library

## Migration Strategy

### Phase 1: Preparation

1. **Set up Supabase Edge Functions**
   - Install Supabase CLI
   - Initialize Edge Functions project
   - Set up local development environment

2. **Extract Shared Code**
   - Create shared utilities module
   - Extract common types
   - Create shared Supabase client helpers

3. **Create Migration Branch**
   - Create feature branch for migration
   - Set up testing environment

### Phase 2: Core Infrastructure

1. **Create Base Edge Function Template**
   - Request/response handling
   - Error handling
   - Authentication helpers
   - CORS handling

2. **Migrate Authentication**
   - Convert auth routes to Edge Function
   - Test authentication flow
   - Verify token handling

3. **Migrate Middleware**
   - Convert auth middleware
   - Convert validation middleware
   - Convert error middleware

### Phase 3: Route Migration

1. **Migrate Auth Routes** (8 endpoints)
   - `/api/auth/signup`
   - `/api/auth/signin`
   - `/api/auth/signout`
   - `/api/auth/refresh`
   - `/api/auth/me`
   - `/api/auth/profile`
   - `/api/auth/change-password`
   - `/api/auth/forgot-password`
   - `/api/auth/reset-password`

2. **Migrate Sessions Routes** (7 endpoints)
   - `/api/sessions` (GET, POST)
   - `/api/sessions/:id` (GET, PUT)
   - `/api/sessions/:id/reschedule`
   - `/api/sessions/:id/cancel`
   - `/api/sessions/:id/complete`
   - `/api/sessions/:id/jitsi-room`

3. **Migrate Resources Routes** (7 endpoints)
   - `/api/resources` (GET, POST)
   - `/api/resources/:id` (GET, PUT, DELETE)
   - `/api/resources/:id/upload`
   - `/api/resources/:id/download`

4. **Migrate Chat Routes** (6 endpoints)
   - `/api/chat` (GET, POST)
   - `/api/chat/:id` (GET)
   - `/api/chat/:id/messages` (GET, POST)
   - `/api/chat/:id/messages/read`

5. **Migrate Notifications Routes** (5 endpoints)
   - `/api/notifications` (GET, POST)
   - `/api/notifications/:id` (GET, DELETE)
   - `/api/notifications/read`

6. **Migrate Admin Routes** (5 endpoints)
   - `/api/admin/users` (GET, PUT, DELETE)
   - `/api/admin/users/:id`
   - `/api/admin/stats`

### Phase 4: Real-time Migration

1. **Replace Socket.IO with Supabase Realtime**
   - Set up Realtime channels
   - Create database triggers for events
   - Update client-side code

2. **Migrate Chat Real-time**
   - Replace Socket.IO chat events
   - Use Realtime channels for chat messages
   - Handle typing indicators

3. **Migrate Notifications Real-time**
   - Replace Socket.IO notification events
   - Use Realtime channels for notifications

4. **Migrate Sessions Real-time**
   - Replace Socket.IO session events
   - Use Realtime channels for session updates

### Phase 5: Testing and Deployment

1. **Unit Testing**
   - Test each Edge Function
   - Test authentication
   - Test error handling

2. **Integration Testing**
   - Test API endpoints
   - Test real-time features
   - Test file uploads

3. **End-to-End Testing**
   - Test complete user flows
   - Test real-time communication
   - Test Jitsi integration

4. **Deployment**
   - Deploy Edge Functions to Supabase
   - Update frontend API endpoints
   - Monitor and debug

## Code Examples

### Edge Function Template

```typescript
// supabase/functions/auth/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different routes
    const url = new URL(req.url)
    const path = url.pathname.replace('/auth', '')

    switch (path) {
      case '/signup':
        return handleSignup(req, supabaseClient)
      case '/signin':
        return handleSignin(req, supabaseClient)
      // ... other routes
      default:
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleSignup(req: Request, supabase: any) {
  const { email, password, role, name } = await req.json()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        name,
      },
    },
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### Socket.IO to Supabase Realtime Migration

**Before (Socket.IO):**

```typescript
// Server-side
socket.on('sendMessage', async (data) => {
  const message = await chatService.sendMessage(data, userId)
  io.to(`chat:${chatId}`).emit('newMessage', message)
})

// Client-side
socket.emit('sendMessage', { chatId, content })
socket.on('newMessage', (message) => {
  // Handle new message
})
```

**After (Supabase Realtime):**

```typescript
// Server-side (Edge Function)
const { data, error } = await supabase
  .from('messages')
  .insert({ chat_id: chatId, content, user_id: userId })
  .select()
  .single()

// Database trigger automatically publishes to Realtime channel

// Client-side
const channel = supabase
  .channel(`chat:${chatId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `chat_id=eq.${chatId}`,
  }, (payload) => {
    // Handle new message
    console.log('New message:', payload.new)
  })
  .subscribe()
```

## Migration Checklist

### Pre-Migration

- [ ] Set up Supabase Edge Functions development environment
- [ ] Create migration branch
- [ ] Document current API endpoints
- [ ] Document Socket.IO events
- [ ] Set up testing framework for Edge Functions

### Core Migration

- [ ] Create base Edge Function template
- [ ] Migrate authentication middleware
- [ ] Migrate validation middleware
- [ ] Migrate error handling
- [ ] Migrate auth routes
- [ ] Migrate sessions routes
- [ ] Migrate resources routes
- [ ] Migrate chat routes
- [ ] Migrate notifications routes
- [ ] Migrate admin routes

### Real-time Migration

- [ ] Set up Supabase Realtime channels
- [ ] Create database triggers for chat messages
- [ ] Create database triggers for notifications
- [ ] Create database triggers for session updates
- [ ] Update client-side Socket.IO code
- [ ] Test real-time communication

### Testing

- [ ] Unit tests for each Edge Function
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for user flows
- [ ] Real-time communication tests
- [ ] File upload tests
- [ ] Jitsi integration tests

### Deployment

- [ ] Deploy Edge Functions to Supabase
- [ ] Update frontend API endpoints
- [ ] Update environment variables
- [ ] Monitor Edge Function logs
- [ ] Set up error tracking
- [ ] Performance testing

## Estimated Timeline

- **Phase 1 (Preparation)**: 1-2 days
- **Phase 2 (Core Infrastructure)**: 2-3 days
- **Phase 3 (Route Migration)**: 5-7 days
- **Phase 4 (Real-time Migration)**: 3-5 days
- **Phase 5 (Testing and Deployment)**: 2-3 days

**Total Estimated Time**: 13-20 days

## Risks and Mitigation

### Risk 1: Socket.IO to Realtime Migration Complexity

**Risk**: Real-time features may not work exactly the same way.

**Mitigation**: 
- Create detailed migration guide for each Socket.IO event
- Test thoroughly before production deployment
- Have rollback plan ready

### Risk 2: Edge Function Cold Starts

**Risk**: Edge Functions may have cold start latency.

**Mitigation**:
- Optimize function code
- Use function warming strategies
- Monitor performance metrics

### Risk 3: Deno Runtime Compatibility

**Risk**: Some npm packages may not work in Deno.

**Mitigation**:
- Test all dependencies early
- Find Deno-compatible alternatives
- Create compatibility layer if needed

### Risk 4: Client-side Changes Required

**Risk**: Frontend needs significant changes for Realtime.

**Mitigation**:
- Update frontend incrementally
- Maintain backward compatibility during transition
- Provide migration guide for frontend team

## Recommendation

### Option 1: Full Migration (Recommended for Long-term)

**Pros**:
- Fully serverless architecture
- Lower infrastructure costs
- Better scalability
- Native Supabase integration

**Cons**:
- Significant development effort
- Client-side changes required
- Learning curve for Deno
- Migration risk

### Option 2: Hybrid Approach (Recommended for Short-term)

**Pros**:
- Lower risk
- Gradual migration
- Can test Edge Functions alongside Express
- Easier rollback

**Cons**:
- Maintain two systems temporarily
- More complex deployment
- Higher infrastructure costs during transition

### Option 3: Keep Current Architecture

**Pros**:
- No migration effort
- Proven architecture
- Full control

**Cons**:
- Higher infrastructure costs
- Need to manage server
- Less scalable

## Conclusion

Migrating to Supabase Edge Functions is feasible but requires significant effort. The main challenges are:

1. Converting Express routes to Edge Functions
2. Replacing Socket.IO with Supabase Realtime
3. Adapting middleware and error handling
4. Updating client-side code

The migration is recommended if you want:
- Fully serverless architecture
- Lower infrastructure costs
- Better scalability
- Native Supabase integration

However, if the current architecture is working well and you don't need the benefits of Edge Functions, keeping the current setup is also a valid option.

## Next Steps

1. Review this migration plan
2. Decide on migration approach (full, hybrid, or keep current)
3. If proceeding, start with Phase 1 (Preparation)
4. Create detailed task breakdown
5. Begin migration incrementally

