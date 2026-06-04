import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { analyzeMeeting } from "./evaluation.controller";

export const evaluationModule = Router();

evaluationModule.use(requireAuth);

evaluationModule.post("/:meetingId", analyzeMeeting);
