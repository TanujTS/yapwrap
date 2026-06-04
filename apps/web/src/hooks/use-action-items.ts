"use client"

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { api, type CreateActionItemPayload, type UpdateActionItemPayload } from "@/lib/api"

export const actionItemKeys = {
  all: ["actionItems"] as const,
  lists: () => [...actionItemKeys.all, "list"] as const,
  list: (filters: { meetingId?: string; status?: string; assignee?: string }) =>
    [...actionItemKeys.lists(), { ...filters }] as const,
  detail: (id: string) => [...actionItemKeys.all, "detail", id] as const,
}

export function useActionItem(id: string) {
  return useQuery({
    queryKey: actionItemKeys.detail(id),
    queryFn: async () => {
      const res = await api.actionItems.get(id)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    enabled: !!id,
  })
}

export function useActionItems(filters: { meetingId?: string; status?: string; assignee?: string } = {}) {
  return useQuery({
    queryKey: actionItemKeys.list(filters),
    queryFn: async () => {
      const res = await api.actionItems.list(filters)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
  })
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateActionItemPayload }) => {
      const res = await api.actionItems.update(id, data)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionItemKeys.lists() })
    },
  })
}

export function useCreateActionItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateActionItemPayload) => {
      const res = await api.actionItems.create(data)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionItemKeys.lists() })
    },
  })
}

export function useUpdateActionItemStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.actionItems.updateStatus(id, status)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionItemKeys.lists() })
    },
  })
}

export function useDeleteActionItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.actionItems.delete(id)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionItemKeys.lists() })
    },
  })
}
