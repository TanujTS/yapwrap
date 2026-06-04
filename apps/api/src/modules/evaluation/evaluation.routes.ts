import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { analyzeMeeting, getMeetingAnalysis } from "./evaluation.controller";

export const evaluationModule = Router();

evaluationModule.use(requireAuth);

evaluationModule.get("/:meetingId", getMeetingAnalysis);
evaluationModule.post("/:meetingId", analyzeMeeting);
