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

actionItemsModule.post("/", createActionItem);
actionItemsModule.get("/", listActionItems);
actionItemsModule.get("/:id", getActionItem);
actionItemsModule.put("/:id", updateActionItem);
actionItemsModule.patch("/:id/status", updateActionItemStatus);
actionItemsModule.delete("/:id", deleteActionItem);
