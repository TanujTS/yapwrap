# Architectural and Technical Decisions

This document outlines the primary technical choices made during the development of the Yapwrap.

## 1. Monorepo Structure & Package Management
**Decision:** Used **Turborepo** with **Bun** for a fullstack monorepo setup.
- **Why:** Keeps the frontend (Next.js) and backend (Express) closely aligned, allowing shared types and unified dependency management. Bun was chosen for its incredibly fast package installation and native TypeScript execution.
- **Alternatives Considered:** Separate repositories, standard pnpm/yarn workspaces.
- **Trade-offs:** Monorepos can become complex to deploy if caching isn't configured correctly, but Turborepo makes pipeline execution highly efficient.

## 2. Database & ORM
**Decision:** Used **PostgreSQL** (via Neon) with **Drizzle ORM**.
- **Why:** PostgreSQL handles relational data (users, meetings, action items) flawlessly. Drizzle ORM provides excellent type safety from end-to-end.
- **Alternatives Considered:** Prisma, MongoDB, Sequelize.

## 3. Authentication Strategy
**Decision:** Used **Better-Auth** for session-based authentication.
- **Why:** Better-Auth is a modern, framework agnostic auth library that handles session management, cookie security, and password hashing automatically. It integrates cleanly with Drizzle ORM to store sessions in the PostgreSQL database.
- **Alternatives Considered:** JWT, NextAuth.js, Passport.js.

## 4. Background Jobs & Reminder Scheduling
**Decision:** Used **BullMQ** with **Redis**.
- **Why:** Processing overdue action items and sending emails asynchronously ensures the main API thread is never blocked. BullMQ is the industry standard for robust, Redis-backed job queues in Node.js. It supports delayed jobs, retries, and cron-like repeatable jobs perfectly suited for our reminder scheduler.
- **Alternatives Considered:** `node-cron` running in the main process, AWS SQS.
- **Trade-offs:** Requires running and maintaining a Redis instance alongside the PostgreSQL database, increasing infrastructure complexity.

## 5. External Integration (Reminders)
**Decision:** Used **Nodemailer** configured with a custom SMTP service.
- **Why:** Nodemailer is highly reliable for programmatic email dispatch. It allowed us to easily format and template the overdue action item reminders and send them directly to users.
- **Alternatives Considered:** Resend SDK, SendGrid API, Slack Webhooks.
- **Trade-offs:** Managing our own SMTP configuration requires careful handling of spam rules compared to a fully managed API like Resend, but it prevents vendor lock-in.

## 6. API Framework & Architecture
**Decision:** Used **Express.js** with a modular routing pattern.
- **Why:** Express is battle-tested. We structured the application into domain modules (e.g., `meetings`, `action-items`) to ensure separation of concerns. 
- **Alternatives Considered:** NestJS, Fastify.
- **Trade-offs:** Express lacks built-in TypeScript support and opinionated structure compared to NestJS, requiring us to build our own error handling and validation middleware.

## 7. Global Error Handling & API Responses
**Decision:** Unified standard JSON response wrapper with automatic Trace IDs.
- **Why:** Consistent API responses (`{ success, data, error, traceId }`) make frontend consumption predictable. Trace IDs are generated in middleware and attached to both the response and the Pino logger to make debugging across distributed logs trivial.
