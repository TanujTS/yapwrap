import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { analyzeMeeting, getMeetingAnalysis } from "./evaluation.controller";

export const evaluationModule = Router();

evaluationModule.use(requireAuth);

/**
 * @openapi
 * /api/evaluation/{meetingId}:
 *   get:
 *     summary: Fetch an existing analysis for a meeting
 *     tags: [AI Analysis]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Analysis object or null
 */
evaluationModule.get("/:meetingId", getMeetingAnalysis);

/**
 * @openapi
 * /api/evaluation/{meetingId}:
 *   post:
 *     summary: Trigger AI analysis for a meeting transcript
 *     tags: [AI Analysis]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Generated analysis
 */
evaluationModule.post("/:meetingId", analyzeMeeting);
