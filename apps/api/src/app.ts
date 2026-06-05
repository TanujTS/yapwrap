import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { actionItemsModule } from "./modules/action-items/action-items.routes";
import { evaluationModule } from "./modules/evaluation/evaluation.routes";
import { meetingsModule } from "./modules/meetings/meetings.routes";
import { remindersModule } from "./modules/reminders/reminders.routes";
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

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/meetings", meetingsModule);
app.use("/api/action-items", actionItemsModule);
app.use("/api/evaluation", evaluationModule);
app.use("/api/reminders", remindersModule);

app.use(errorHandler);

export default app;
