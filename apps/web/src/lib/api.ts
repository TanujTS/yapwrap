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
    const searchParams = new URLSearchParams(params);
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
    list: (page = 1, limit = 20) =>
      apiFetch<MeetingListItem[]>("/api/meetings", {
        params: { page: String(page), limit: String(limit) },
      }),

    get: (id: string) => apiFetch<MeetingDetail>(`/api/meetings/${id}`),

    create: (data: CreateMeetingPayload) =>
      apiFetch<MeetingDetail>("/api/meetings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

// ---------- Types ----------

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
