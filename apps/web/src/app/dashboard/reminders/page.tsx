"use client"

import { useReminderLogs } from "@/hooks/use-reminders"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoaderCircleIcon, BellIcon, CheckCircle2Icon, XCircleIcon, MailIcon, CalendarIcon, UserIcon, ArrowUpRightIcon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function RemindersDashboardPage() {
  const { data: logs, isLoading, isError } = useReminderLogs()

  const successCount = logs?.filter(l => l.status.toLowerCase() === 'sent').length || 0
  const failedCount = logs?.filter(l => l.status.toLowerCase() === 'failed').length || 0
  const totalCount = logs?.length || 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex size-12 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/20 shrink-0">
            <BellIcon className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">Reminders</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              Monitor automated email delivery and notification history
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-none bg-muted/30 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Attempts</p>
              <p className="text-4xl font-extrabold text-foreground">{totalCount}</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <MailIcon className="size-16" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-none bg-emerald-500/5 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">Successful</p>
              <p className="text-4xl font-extrabold text-emerald-600">{successCount}</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-600">
              <CheckCircle2Icon className="size-16" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-destructive/5 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-destructive/70 uppercase tracking-widest">Failed</p>
              <p className="text-4xl font-extrabold text-destructive">{failedCount}</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-destructive">
              <XCircleIcon className="size-16" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="px-6 py-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl font-bold">Delivery History</CardTitle>
              <CardDescription className="font-medium">
                Detailed log of all reminder notifications dispatched by the system.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <LoaderCircleIcon className="size-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-muted-foreground animate-pulse">Loading activity logs...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2">
              <XCircleIcon className="size-10 opacity-20" />
              <p className="font-bold">Failed to load history</p>
              <p className="text-xs opacity-70">There was an error communicating with the API.</p>
            </div>
          ) : logs?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <MailIcon className="size-8 opacity-20" />
              </div>
              <p className="font-bold text-foreground">No reminders sent yet</p>
              <p className="text-sm opacity-70 max-w-[280px] mt-1 leading-relaxed">
                When the scheduler triggers action item notifications, they will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[600px] text-sm text-left">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Status</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Recipient</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Action Item Context</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-tighter text-[11px]">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {logs?.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        {log.status.toLowerCase() === 'sent' ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2Icon className="size-3" /> Sent
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive border border-destructive/20">
                            <XCircleIcon className="size-3" /> Failed
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <div className="size-7 rounded-full bg-muted flex items-center justify-center">
                             <UserIcon className="size-3.5 text-muted-foreground" />
                           </div>
                           <span className="font-semibold text-foreground">{log.sentTo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col min-w-0">
                          <p className="text-foreground font-semibold truncate max-w-[300px]">{log.task}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{log.meetingTitle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <div className="flex items-center gap-2 text-muted-foreground font-medium">
                           <CalendarIcon className="size-3.5 opacity-40" />
                           {format(new Date(log.sentAt), 'MMM d, h:mm a')}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
