"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export const reminderKeys = {
  all: ["reminders"] as const,
  logs: (filters: { actionItemId?: string; status?: string } = {}) => 
    [...reminderKeys.all, "logs", filters] as const,
}

export function useReminderLogs(filters: { actionItemId?: string; status?: string } = {}) {
  return useQuery({
    queryKey: reminderKeys.logs(filters),
    queryFn: async () => {
      const res = await api.reminders.listLogs(filters)
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
  })
}
