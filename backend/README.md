# Backend - Rwanda Cancer Relief

Backend services and API for Rwanda Cancer Relief platform.

## Status

✅ **Ready for Development** - Backend is fully configured with database schema, API endpoints, testing framework, and deployment configuration. See `QUICK_START.md` to get started.

## Technology Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express.js
- **Real-time:** Socket.IO
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Validation:** Zod
- **Video Calls:** Jitsi Meet API
- **Deployment:** Render
- **Notifications:** Resend or Supabase Realtime

## Prerequisites

Before starting development, ensure:

1. ✅ Node.js >= 18 installed (v20.18.0 verified)
2. ✅ npm >= 9 installed (v10.8.2 verified)
3. ⏳ Supabase project configured (see `docs/PREREQUISITES_CHECKLIST.md`)
4. ⏳ Environment variables set up (see `env.example`)
5. ⏳ Frontend running on localhost:3000

See `docs/PREREQUISITES_CHECKLIST.md` for complete verification checklist.

## Quick Start

See `docs/QUICK_START.md` for detailed setup instructions.

**Quick steps:**

1. Install dependencies: `npm install`
2. Set up Supabase project and apply migrations
3. Configure environment variables: `cp env.example .env`
4. Start development server: `npm run dev`

Server will start on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express server entry point
│   ├── app.ts                 # Express app configuration
│   ├── config/                # Configuration files
│   ├── routes/                # API routes
│   ├── controllers/           # Request handlers
│   ├── services/               # Business logic
│   ├── middleware/             # Express middleware
│   ├── schemas/                # Zod validation schemas
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── socket/                 # Socket.IO setup
├── tests/                      # Test files (unit, integration, e2e)
├── migrations/                 # Database migrations
├── docs/                       # API documentation
├── env.example                 # Environment template
├── render.yaml                 # Render deployment config
├── Dockerfile                  # Docker configuration
└── tsconfig.json              # TypeScript config
```

## Available Scripts

**Development:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run typecheck` - Type check without building

**Testing:**
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:e2e` - Run E2E tests only
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report

**Code Quality:**
- `npm run lint` - Run linter

**Utilities:**
- `npm run verify:supabase` - Verify Supabase connection and setup

## API Endpoints

Complete API documentation available in `docs/API_DOCUMENTATION.md`

**Available Endpoints:**
- `/health` - Health check
- `/api` - API root with endpoint list
- `/api/auth/*` - Authentication (signup, signin, refresh, profile)
- `/api/sessions/*` - Session management (CRUD, reschedule, cancel, complete)
- `/api/resources/*` - Resource management (CRUD, view tracking, downloads)
- `/api/chat/*` - Chat and messaging (real-time via Socket.IO)
- `/api/notifications/*` - Notifications management
- `/api/admin/*` - Admin features (analytics, user management)

**Real-time Features:**
- Socket.IO for chat and notifications
- Jitsi Meet integration for video sessions

## Documentation

**Getting Started:**
- `QUICK_START.md` - Quick start guide
- `ENV_SECRETS.md` - Environment variables guide
- `PREREQUISITES_CHECKLIST.md` - Prerequisites checklist

**API Documentation:**
- `docs/API_DOCUMENTATION.md` - Complete API reference
- `docs/API_TESTING.md` - API testing guide
- `docs/JITSI_INTEGRATION.md` - Jitsi Meet integration

**Database:**
- `migrations/README.md` - Database migration guide

**Deployment:**
- `docs/DEPLOYMENT.md` - Production deployment guide
- `render.yaml` - Render deployment configuration

## Development Guidelines

1. All request payloads validated with Zod
2. Use TypeScript strict mode
3. Follow Express.js best practices
4. Implement proper error handling
5. Use Supabase for database operations
6. Socket.IO for real-time features

## Next Steps

1. **Set Up Supabase** - Create project and apply migrations (see `QUICK_START.md`)
2. **Configure Environment** - Set up `.env` file (see `ENV_SECRETS.md`)
3. **Start Development** - Run `npm run dev` and test endpoints
4. **Frontend Integration** - Connect frontend to backend API
5. **Deploy** - Follow deployment guide (see `docs/DEPLOYMENT.md`)

## Completed Features

✅ Complete database schema with migrations  
✅ Row Level Security (RLS) policies  
✅ Authentication system (signup, signin, JWT, refresh)  
✅ Session management (CRUD, rescheduling, cancellation)  
✅ Resource management (CRUD, file uploads, tracking)  
✅ Chat and messaging (real-time via Socket.IO)  
✅ Notifications system  
✅ Admin features (analytics, user management)  
✅ Jitsi Meet integration (React SDK, IFrame API, lib-jitsi-meet)  
✅ Testing framework (unit, integration, E2E)  
✅ Deployment configuration (Render, Docker)  
✅ Complete API documentation  

---

**Status:** ✅ Ready for Development  
**Last Updated:** November 2024

