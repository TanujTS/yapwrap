import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import {
  createActionItem,
  listActionItems,
  updateActionItem,
  updateActionItemStatus,
  deleteActionItem,
  getActionItem,
} from "./action-items.controller";

export const actionItemsModule = Router();

actionItemsModule.use(requireAuth);

/**
 * @openapi
 * /api/action-items:
 *   post:
 *     summary: Manually create an action item
 *     tags: [Action Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meetingId, task]
 *             properties:
 *               meetingId: { type: string, format: uuid }
 *               analysisId: { type: string, format: uuid }
 *               task: { type: string }
 *               assignee: { type: string }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Created
 */
actionItemsModule.post("/", createActionItem);

/**
 * @openapi
 * /api/action-items:
 *   get:
 *     summary: List all action items
 *     tags: [Action Items]
 *     parameters:
 *       - in: query
 *         name: meetingId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *     responses:
 *       200:
 *         description: List of action items
 */
actionItemsModule.get("/", listActionItems);

/**
 * @openapi
 * /api/action-items/{id}:
 *   get:
 *     summary: Get a specific action item
 *     tags: [Action Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Action item object
 */
actionItemsModule.get("/:id", getActionItem);

actionItemsModule.put("/:id", updateActionItem);

/**
 * @openapi
 * /api/action-items/{id}/status:
 *   patch:
 *     summary: Update action item status
 *     tags: [Action Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *     responses:
 *       200:
 *         description: Updated
 */
actionItemsModule.patch("/:id/status", updateActionItemStatus);

/**
 * @openapi
 * /api/action-items/{id}:
 *   delete:
 *     summary: Delete an action item
 *     tags: [Action Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deleted
 */
actionItemsModule.delete("/:id", deleteActionItem);
