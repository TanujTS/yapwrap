# Testing Strategy

This document outlines the testing methodology applied during the development of the meeting intelligence service. 

Currently, all testing is performed **manually** through the provided Swagger UI (`/api/docs`), Postman collections, and frontend dashboard integration. Automated unit testing (e.g., Jest/Vitest) is slated for the next development milestone.

## Scenarios Executed

### 1. Authentication
- **Registration**: Created new user accounts, ensuring email uniqueness validation triggers properly.
- **Login**: Verified session token creation and cookie attachment.
- **Protected Routes**: Attempted to access `/api/meetings` and `/api/action-items` without a session cookie, verifying a `401 Unauthorized` response with the standardized error format.

### 2. Meeting Management
- **Creation**: Submitted valid and invalid meeting payloads. Verified that missing titles or malformed transcript arrays are caught by Zod validation, returning a `400 Bad Request`.
- **Retrieval**: Verified pagination (`?page=1&limit=10`) works correctly for the meeting list endpoint.

### 3. AI Analysis & Citations
- **Extraction**: Submitted a sample transcript and triggered the `/api/meetings/:id/analyze` endpoint.
- **Grounding Validation**: Examined the JSON response to ensure that every summary point and action item included a `citations` array with valid `timestamp` and `speaker` fields directly matching the provided transcript payload.
- **Caching**: Triggered the analysis endpoint twice on the same meeting ID, verifying via the trace logs that the second request resulted in a cache hit (database fetch) rather than re-triggering the Gemini API.

### 4. Background Job & External Integrations
- **Overdue Detection**: Manually created an action item and backdated its `dueDate` directly in the database.
- **Queue Execution**: Triggered the BullMQ worker and verified via the console logger that the overdue item was picked up.
- **Email Dispatch**: Verified that Nodemailer successfully established an SMTP connection and dispatched the reminder email to the assignee's address.

## Edge Cases Considered
- **Empty Transcripts**: Ensured the meeting creation endpoint correctly handles or rejects zero-length transcripts.
- **LLM Rate Limits**: Wrapped the Gemini API call in a robust `try-catch` block so that upstream AI provider failures do not crash the Node process, but instead return a graceful `500` to the client.

## Limitations Discovered
- **Timezone Drift**: The overdue action item detector currently relies on UTC comparisons. If users are in heavily offset timezones, reminders might trigger a day earlier or later than their local expectation. Future iterations should store user timezones.
