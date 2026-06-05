import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import {
  createMeeting,
  getMeeting,
  listMeetings,
  deleteMeeting,
} from "./meetings.controller";

export const meetingsModule = Router();

meetingsModule.use(requireAuth);

/**
 * @openapi
 * /api/meetings:
 *   post:
 *     summary: Create a new meeting
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, transcript]
 *             properties:
 *               title:
 *                 type: string
 *               meetingDate:
 *                 type: string
 *                 format: date-time
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     email: { type: string }
 *               transcript:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     timestamp: { type: string }
 *                     speaker: { type: string }
 *                     text: { type: string }
 *     responses:
 *       201:
 *         description: Meeting created successfully
 */
meetingsModule.post("/", createMeeting);

/**
 * @openapi
 * /api/meetings:
 *   get:
 *     summary: List meetings for the current user
 *     tags: [Meetings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A list of meetings
 */
meetingsModule.get("/", listMeetings);

/**
 * @openapi
 * /api/meetings/{id}:
 *   get:
 *     summary: Get meeting details by ID
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Detailed meeting object
 */
meetingsModule.get("/:id", getMeeting);

/**
 * @openapi
 * /api/meetings/{id}:
 *   delete:
 *     summary: Delete a meeting
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Meeting deleted successfully
 */
meetingsModule.delete("/:id", deleteMeeting);
