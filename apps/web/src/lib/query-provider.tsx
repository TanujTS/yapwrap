"use client"

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any) => {
            toast.error(error.message || "An error occurred")
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            toast.error(error.message || "An error occurred")
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
