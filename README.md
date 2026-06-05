# Yapwrap - Hintro Meeting Intelligence Assignment

Yapwrap is an AI-powered meeting intelligence service built for the Hintro Engineering Internship assignment. It extracts insights, decisions, and action items from meeting transcripts using the Gemini SDK with strict structural grounding, while managing follow-up reminders via BullMQ and Nodemailer.

## Core Features
- **Meeting Management**: Upload transcripts and organize meeting metadata.
- **AI Analysis**: Uses `gemini-2.5-flash` to extract JSON-structured summaries, action items, decisions, and follow-ups.
- **Strict Grounding**: Every generated insight must cite the precise transcript timestamp it was derived from.
- **Background Workers**: A BullMQ worker constantly scans for overdue action items.
- **External Integration**: Nodemailer dispatches actual SMTP reminder emails for overdue tasks.
- **Unified API & Traceability**: All API endpoints return a standardized success/error object injected with a unique `traceId`.

## Tech Stack
- **Monorepo**: Turborepo & Bun
- **Backend**: Express.js (TypeScript)
- **Frontend**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: Better-Auth (Session-based)
- **Queue**: BullMQ & Redis
- **AI**: Google Gemini SDK

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
- [Bun](https://bun.sh/) (v1.x)
- Docker & Docker Compose (for local Redis/PostgreSQL)

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory. You must configure the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/yapwrap"

# Redis
REDIS_URL="redis://localhost:6379"

# API & Auth
PORT=3001
AUTH_BASE_URL="http://localhost:3001"
BETTER_AUTH_SECRET="super-secret-key-change-me"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Gemini AI
GEMINI_API_KEY="your-google-gemini-api-key"

# Nodemailer SMTP Configuration
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
EMAIL_FROM="yapwrap@example.com"
```

### 3. Start Local Services
Spin up a local Redis instance (and PostgreSQL if not using Neon):
```sh
docker-compose up -d
```

### 4. Install & Run
Install dependencies:
```sh
bun install
```

Push database migrations:
```sh
bun run db:push
```

Start the development server (runs both the Next.js frontend and Express API):
```sh
bun dev
```

---

## 📚 API Documentation

Once the backend is running, the **Swagger OpenAPI documentation** is available at:
👉 **[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

### API Usage Examples

**1. Create a Meeting**
```bash
curl -X POST http://localhost:3001/api/meetings \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session-token=..." \
  -d '{
    "title": "Sprint Planning",
    "meetingDate": "2026-05-20T10:00:00Z",
    "transcript": [
      { "timestamp": "00:10", "speaker": "John", "text": "We should launch next Friday." },
      { "timestamp": "00:20", "speaker": "Alice", "text": "I will prepare release notes." }
    ]
  }'
```

**2. Trigger AI Analysis**
```bash
curl -X POST http://localhost:3001/api/meetings/{meeting_id}/analyze \
  -H "Cookie: better-auth.session-token=..."
```

**3. Get Evaluation Details**
```bash
curl -X GET http://localhost:3001/api/evaluation
```

---

## 🚢 Deployment Instructions

The application is configured to run via a 2-stage Docker build, making it highly portable.

1. **Build the Docker Image:**
```sh
docker build -t yapwrap .
```

2. **Run the Container:**
Pass the necessary environment variables explicitly at runtime.
```sh
docker run -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  -e GEMINI_API_KEY="..." \
  -e SMTP_HOST="..." \
  ... \
  yapwrap
```

### Suggested Platforms
- **API & Worker**: Render or Railway (ideal for Docker containers running background BullMQ threads).
- **Frontend**: Vercel (link directly to the `apps/web` folder).
- **Database**: Neon (Serverless Postgres) or Supabase.
- **Cache**: Upstash Redis.
