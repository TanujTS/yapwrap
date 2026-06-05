# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-06-05

### Added
- **Authentication**: Integrated Better-Auth for robust session-based authentication with PostgreSQL backend storage.
- **Database Architecture**: Implemented Drizzle ORM schemas for `User`, `Meeting`, `MeetingAnalysis`, `ActionItem`, and `ReminderLog`.
- **Unified API Responses**: Created global middleware to wrap all responses and catch unhandled exceptions, attaching trace IDs to every request.
- **Meeting Management**: Implemented `POST /api/meetings`, `GET /api/meetings`, and `GET /api/meetings/:id` with Zod validation.
- **AI Integration**: Implemented `POST /api/meetings/:id/analyze` utilizing the Gemini 2.5 Flash SDK. Configured strict JSON Structured Outputs to enforce citation generation and prevent hallucinations.
- **Action Items**: Built endpoints to create, list, and update action items. Added a specific `GET /api/action-items/overdue` endpoint.
- **Reminder Scheduler**: Integrated BullMQ and Redis to run a background worker that polls for overdue action items.
- **External Integration**: Configured Nodemailer to dispatch formatted email reminders for overdue action items.
- **API Documentation**: Integrated Swagger UI at `/api/docs` mapping out the entire REST surface area.
- **Evaluation**: Added the `GET /api/evaluation` endpoint to expose implementation details.
