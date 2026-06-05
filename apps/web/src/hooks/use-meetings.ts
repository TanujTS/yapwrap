"use client"

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { api, type CreateMeetingPayload } from "@/lib/api"

export const meetingKeys = {
  all: ["meetings"] as const,
  lists: () => [...meetingKeys.all, "list"] as const,
  list: (page: number, limit: number, search?: string) =>
    [...meetingKeys.lists(), { page, limit, search }] as const,
  details: () => [...meetingKeys.all, "detail"] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
}

export function useMeetings(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: meetingKeys.list(page, limit, search),
    queryFn: async () => {
      const res = await api.meetings.list(page, limit, search)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return { data: res.data, meta: res.meta }
    },
  })
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: async () => {
      const res = await api.meetings.get(id)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateMeetingPayload) => {
      const res = await api.meetings.create(data)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.meetings.delete(id)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}
