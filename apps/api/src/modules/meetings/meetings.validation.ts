import { z } from "zod";

const transcriptEntrySchema = z.object({
  timestamp: z.string().min(1, "Timestamp is required"),
  speaker: z.string().min(1, "Speaker is required"),
  text: z.string().min(1, "Text is required"),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Meeting title is required").max(255, "Title must be at most 255 characters"),
  participants: z.array(z.email("Each participant must be a valid email")).min(1, "At least one participant is required"),
  meetingDate: z.iso.datetime("meetingDate must be a valid ISO 8601 datetime"),
  transcript: z.array(transcriptEntrySchema).min(1, "At least one transcript entry is required"),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;