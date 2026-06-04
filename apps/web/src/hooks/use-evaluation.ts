"use client"

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { meetingKeys } from "./use-meetings"

export const evaluationKeys = {
  all: ["evaluations"] as const,
  meeting: (meetingId: string) => [...evaluationKeys.all, meetingId] as const,
}

export function useMeetingAnalysis(meetingId: string) {
  return useQuery({
    queryKey: evaluationKeys.meeting(meetingId),
    queryFn: async () => {
      const res = await api.evaluation.get(meetingId)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    enabled: !!meetingId,
  })
}

export function useAnalyzeMeeting(meetingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.evaluation.analyze(meetingId)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: (data) => {
      // We can optimistically set the data if we want to cache the analysis result
      queryClient.setQueryData(evaluationKeys.meeting(meetingId), data)
    },
  })
}
