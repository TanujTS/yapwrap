# API Structure

This follows the `express-boilerplate` shape, but feature code goes under `modules` instead of separate `controllers` and `routes`.

```bash
src
├── app.ts                 # Express app setup and module registration
├── index.ts               # Server listener only
├── config                 # Environment/config helpers
├── db                     # Database client and schema
├── integrations           # Third-party clients such as Slack/Email/etc.
├── lib                    # Shared libraries such as auth provider setup
├── logger                 # Pino logger and HTTP logger setup
├── middlewares            # Express middleware
├── modules                # Feature modules
│   ├── action-items
│   ├── auth
│   ├── evaluation
│   ├── meetings
│   └── reminders
├── schemas                # Shared validation schemas
├── types                  # App-wide TypeScript types
└── utils                  # Shared helpers like responses/errors
```

## What Goes Where

- `modules/<feature>`: feature router/module, service, repository, and local schema files.
- `middlewares`: auth guard, trace ID, request shaping, error handling.
- `utils/api-response.ts`: unified success/error response helpers.
- `utils/api-error.ts`: shared API error class.
- `logger`: Pino app logger and Express HTTP logger.
- `db`: database connection and table/model definitions.
- `integrations`: real third-party integration clients used by modules.
