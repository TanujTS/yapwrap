import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import {
  createActionItem,
  listActionItems,
  updateActionItemStatus,
  deleteActionItem,
} from "./action-items.controller";

export const actionItemsModule = Router();

actionItemsModule.use(requireAuth);

actionItemsModule.post("/", createActionItem);
actionItemsModule.get("/", listActionItems);
actionItemsModule.patch("/:id/status", updateActionItemStatus);
actionItemsModule.delete("/:id", deleteActionItem);
