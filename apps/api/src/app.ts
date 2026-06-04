import express from "express";
import { actionItemsModule } from "./modules/action-items/action-items.module";
import { evaluationModule } from "./modules/evaluation/evaluation.module";
import { meetingsModule } from "./modules/meetings/meetings.module";
import { remindersModule } from "./modules/reminders/reminders.module";
import { corsMiddleware } from "./middlewares/cors";
import { errorHandler } from "./middlewares/error-handler";
import { traceMiddleware } from "./middlewares/trace";
import httpLogger from "./logger";
import { responseOk } from "./utils/api-response";
import { auth } from "./utils/auth";
import { toNodeHandler } from "better-auth/node";

const app = express();

app.get("/health", (req, res) => {
  responseOk(req, res, { status: "UP" });
});

app.use(corsMiddleware);
app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json({ limit: "1mb" }));
app.use(traceMiddleware);
app.use(httpLogger);

app.use("/api/meetings", meetingsModule);
app.use("/api/action-items", actionItemsModule);
app.use("/api/evaluation", evaluationModule);
app.use("/api/reminders", remindersModule);

app.use(errorHandler);

export default app;
