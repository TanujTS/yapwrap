const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<{ success: true; data: T; meta?: Record<string, unknown> } | { success: false; error: { code: string; message: string; details?: unknown } }> {
  const { params, ...init } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    ) as Record<string, string>;
    const searchParams = new URLSearchParams(cleanParams);
    url += `?${searchParams.toString()}`;
  }

  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const json = await res.json();
  return json;
}

export const api = {
  meetings: {
    list: (page = 1, limit = 20, search?: string) => {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      return apiFetch<MeetingListItem[]>("/api/meetings", { params });
    },

    get: (id: string) => apiFetch<MeetingDetail>(`/api/meetings/${id}`),

    create: (data: CreateMeetingPayload) =>
      apiFetch<MeetingDetail>("/api/meetings", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/meetings/${id}`, {
        method: "DELETE",
      }),
  },
  evaluation: {
    get: (meetingId: string) =>
      apiFetch<MeetingAnalysis | null>(`/api/evaluation/${meetingId}`),
    analyze: (meetingId: string) =>
      apiFetch<MeetingAnalysis>(`/api/evaluation/${meetingId}`, {
        method: "POST",
      }),
  },
  actionItems: {
    list: (params?: { meetingId?: string; status?: string; assignee?: string }) =>
      apiFetch<ActionItem[]>("/api/action-items", {
        params: params as Record<string, string>,
      }),

    create: (data: CreateActionItemPayload) =>
      apiFetch<ActionItem>("/api/action-items", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string) =>
      apiFetch<ActionItem>(`/api/action-items/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/action-items/${id}`, {
        method: "DELETE",
      }),

    get: (id: string) =>
      apiFetch<ActionItem>(`/api/action-items/${id}`),

    update: (id: string, data: UpdateActionItemPayload) =>
      apiFetch<ActionItem>(`/api/action-items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  reminders: {
    listLogs: (params?: { actionItemId?: string; status?: string }) =>
      apiFetch<ReminderLog[]>("/api/reminders/logs", {
        params: params as Record<string, string>,
      }),
  },
};

// ---------- Types ----------

export type ReminderLog = {
  id: string;
  sentTo: string;
  status: string;
  sentAt: string;
  task: string;
  meetingTitle: string;
};

export type TranscriptEntry = {
  timestamp: string;
  speaker: string;
  text: string;
};

export type Participant = {
  name: string;
  email: string;
};

export type MeetingListItem = {
  id: string;
  userId: string;
  title: string;
  participants: Participant[];
  meetingDate: string;
  transcript: TranscriptEntry[];
  createdAt: string;
  updatedAt: string;
};

export type MeetingDetail = MeetingListItem;

export type CreateMeetingPayload = {
  title: string;
  participants: string[];
  meetingDate: string;
  transcript: TranscriptEntry[];
};

export type Citation = {
  timestamp: string;
  speaker?: string;
};

export type Insight = {
  text: string;
  citations: Citation[];
};

export type GeneratedActionItem = {
  task: string;
  assignee: string | null;
  suggestedDueDate: string | null;
  citations: Citation[];
};

export type MeetingAnalysis = {
  id: string;
  meetingId: string;
  summary: Insight[];
  actionItems: GeneratedActionItem[];
  decisions: Insight[];
  followUps: Insight[];
  createdAt: string;
};

export type ReminderOffset = "now" | "none" | "15min" | "1h" | "1d" | "2d" | "1w";

export type ActionItem = {
  id: string;
  meetingId: string;
  analysisId?: string;
  task: string;
  assignee?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate?: string;
  reminderOffset: ReminderOffset;
  citations: Citation[];
};

export type CreateActionItemPayload = {
  meetingId: string;
  analysisId?: string;
  task: string;
  assignee?: string;
  dueDate?: string;
  reminderOffset?: ReminderOffset;
  citations?: Citation[];
};

export type UpdateActionItemPayload = {
  task?: string;
  assignee?: string | null;
  dueDate?: string | null;
  reminderOffset?: ReminderOffset;
};
