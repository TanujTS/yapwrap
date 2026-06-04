import type { NextFunction, Response } from "express";
import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { meeting, meetingAnalysis } from "../../db/schema";
import type { AppRequest } from "../../types";
import { ApiError } from "../../utils/api-error";
import { responseOk } from "../../utils/api-response";
import { env } from "../../config/env";
import { logger } from "../../logger";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const citationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    timestamp: { type: Type.STRING, description: "The exact timestamp from the transcript, e.g., '00:10'" },
    speaker: { type: Type.STRING, description: "The name of the speaker if available" },
  },
  required: ["timestamp", "speaker"],
};

const insightSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    citations: {
      type: Type.ARRAY,
      items: citationSchema,
    },
  },
  required: ["text", "citations"],
};

const generatedActionItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    task: { type: Type.STRING },
    assignee: { type: Type.STRING, nullable: true },
    suggestedDueDate: { type: Type.STRING, nullable: true, format: "date-time" },
    citations: {
      type: Type.ARRAY,
      items: citationSchema,
    },
  },
  required: ["task", "citations"],
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.ARRAY,
      items: insightSchema,
      description: "A summary of the meeting. Mandatory.",
    },
    actionItems: {
      type: Type.ARRAY,
      items: generatedActionItemSchema,
      description: "Action items extracted from the transcript.",
    },
    decisions: {
      type: Type.ARRAY,
      items: insightSchema,
      description: "Decisions made during the meeting.",
    },
    followUps: {
      type: Type.ARRAY,
      items: insightSchema,
      description: "Follow-up suggestions or next steps.",
    },
  },
  required: ["summary"],
};

export async function getMeetingAnalysis(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const meetingId = req.params.meetingId as string;

    if (!meetingId) {
      throw new ApiError(400, "VALIDATION_ERROR", "Meeting ID is required");
    }

    // Check if meeting exists and belongs to user
    const [foundMeeting] = await db
      .select()
      .from(meeting)
      .where(and(eq(meeting.id, meetingId), eq(meeting.userId, req.user!.id)))
      .limit(1);

    if (!foundMeeting) {
      throw new ApiError(404, "NOT_FOUND", "Meeting not found");
    }

    // Check if analysis exists
    const [analysis] = await db
      .select()
      .from(meetingAnalysis)
      .where(eq(meetingAnalysis.meetingId, meetingId))
      .limit(1);

    if (!analysis) {
      responseOk(req, res, null);
      return;
    }

    responseOk(req, res, analysis);
  } catch (error) {
    logger.error({ event: "meeting.get_analysis.error", error });
    next(error);
  }
}

export async function analyzeMeeting(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const meetingId = req.params.meetingId as string;

    if (!meetingId) {
      throw new ApiError(400, "VALIDATION_ERROR", "Meeting ID is required");
    }

    // Check if meeting exists and belongs to user
    const [foundMeeting] = await db
      .select()
      .from(meeting)
      .where(and(eq(meeting.id, meetingId), eq(meeting.userId, req.user!.id)))
      .limit(1);

    if (!foundMeeting) {
      throw new ApiError(404, "NOT_FOUND", "Meeting not found");
    }

    // Check if analysis already exists
    const [existingAnalysis] = await db
      .select()
      .from(meetingAnalysis)
      .where(eq(meetingAnalysis.meetingId, meetingId))
      .limit(1);

    if (existingAnalysis) {
      logger.info({ event: "meeting.analyzed.cache_hit", meetingId });
      responseOk(req, res, existingAnalysis);
      return;
    }

    // Format transcript for Gemini
    const transcriptText = foundMeeting.transcript
      .map((entry) => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
      .join("\n");

    const systemPrompt = `You are an expert meeting analyst. Your task is to extract insights from the provided meeting transcript.
CRITICAL INSTRUCTIONS:
1. GROUNDING: All AI-generated content must be grounded in the provided transcript.
2. NO HALLUCINATION: The system must not invent attendees, action items, decisions, or meeting outcomes. Do not add information not explicitly present in the transcript.
3. CITATIONS REQUIRED: Every generated insight (summary point, action item, decision, follow-up) must include at least one citation referencing the exact timestamp(s) and speaker(s) from which the insight was derived.
4. STRUCTURE: Follow the requested JSON schema.`;

    const prompt = `Please analyze the following meeting transcript:\n\nTitle: ${foundMeeting.title}\n\nTranscript:\n${transcriptText}\n\nGenerate the meeting summary, action items, decisions, and follow-up suggestions.`;

    logger.info({ event: "meeting.analysis.started", meetingId });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Low temperature for high factual accuracy
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response from Gemini");
    }

    const parsedOutput = JSON.parse(outputText);

    // Save to database
    const [savedAnalysis] = await db
      .insert(meetingAnalysis)
      .values({
        meetingId: foundMeeting.id,
        summary: parsedOutput.summary,
        actionItems: parsedOutput.actionItems,
        decisions: parsedOutput.decisions,
        followUps: parsedOutput.followUps,
      })
      .returning();

    logger.info({ event: "meeting.analyzed.success", meetingId });
    responseOk(req, res, savedAnalysis);
  } catch (error) {
    logger.error({ event: "meeting.analysis.error", error });
    next(error);
  }
}
