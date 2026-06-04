import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import {
  createMeeting,
  getMeeting,
  listMeetings,
} from "./meetings.controller";

export const meetingsModule = Router();

meetingsModule.use(requireAuth);

meetingsModule.post("/", createMeeting);
meetingsModule.get("/", listMeetings);
meetingsModule.get("/:id", getMeeting);
