"use client"

import { use } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MessageSquareTextIcon,
  UsersIcon,
  WrenchIcon,
  SparklesIcon,
  LoaderCircleIcon,
  PlusIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

import { useRouter } from "next/navigation"

import { useMeeting, useDeleteMeeting } from "@/hooks/use-meetings"
import { useAnalyzeMeeting, useMeetingAnalysis } from "@/hooks/use-evaluation"
import { AnalysisView } from "./components/analysis-view"
import { ActionItemModal } from "./components/action-item-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

function formatTime(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

function initials(name: string) {
  return name
    .split(/[ .@_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatTranscriptTimestamp(ts: string) {
  const parts = ts.split(":")
  if (parts.length === 3) {
    const hours = parseInt(parts[0])
    const mins = parseInt(parts[1])
    const totalMins = hours * 60 + mins
    return `${totalMins.toString().padStart(2, "0")}:${parts[2]}`
  }
  return ts
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: meeting, isLoading, isError, error } = useMeeting(id)
  const { data: analysis, isLoading: isLoadingAnalysis } = useMeetingAnalysis(id)
  const analyzeMeeting = useAnalyzeMeeting(id)
  const deleteMeeting = useDeleteMeeting()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (isError || !meeting) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-sm text-destructive">
          {error?.message || "Meeting not found"}
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    )
  }

  const uniqueSpeakers = [
    ...new Set(meeting.transcript.map((t) => t.speaker)),
  ]

  const currentAnalysis = analyzeMeeting.data || analysis

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-start gap-3"
      >
        <Button asChild variant="ghost" size="icon" className="mt-1 size-8">
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold">
            {meeting.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDaysIcon className="size-3.5" />
              {formatDate(meeting.meetingDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-3.5" />
              {formatTime(meeting.meetingDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={() => setIsConfirmOpen(true)}
            disabled={deleteMeeting.isPending}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="mr-2 size-4" />
            Add Action Item
          </Button>
          <Button 
            onClick={() => analyzeMeeting.mutate()} 
            disabled={analyzeMeeting.isPending || !!currentAnalysis}
            variant={currentAnalysis ? "outline" : "default"}
          >
            {analyzeMeeting.isPending ? (
              <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
            ) : (
              <SparklesIcon className="mr-2 size-4" />
            )}
            {currentAnalysis ? "Analyzed" : "Analyze with AI"}
          </Button>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content: Transcript & Analysis */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* AI Analysis View */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            {isLoadingAnalysis ? (
               <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                  <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-2">Checking for analysis...</p>
                </CardContent>
              </Card>
            ) : currentAnalysis ? (
              <AnalysisView analysis={currentAnalysis} meetingId={meeting.id} />
            ) : (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-background border shadow-sm">
                    <SparklesIcon className="size-6 text-primary animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-sm font-semibold text-foreground">
                      No AI analysis yet
                    </p>
                    <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
                      Transform this transcript into actionable insights. Extract decisions, 
                      summaries, and tasks with one click.
                    </p>
                  </div>
                  <Button 
                    className="mt-4" 
                    size="sm"
                    onClick={() => analyzeMeeting.mutate()}
                    disabled={analyzeMeeting.isPending}
                  >
                    {analyzeMeeting.isPending ? (
                      <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
                    ) : (
                      <SparklesIcon className="mr-2 size-4" />
                    )}
                    Generate Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          <Separator />

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col gap-1">
                  <h2 className="font-heading text-xl font-semibold">Transcript</h2>
                  <p className="text-sm text-muted-foreground">Full meeting history with speakers</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end max-w-[50%]">
                  {uniqueSpeakers.map((speaker) => (
                    <Badge key={speaker} variant="secondary" className="text-[10px] font-medium px-2 py-0">
                      {speaker}
                    </Badge>
                  ))}
                </div>
              </div>

              <Card className="border-none bg-muted/30 shadow-none">
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="flex flex-col p-4 gap-2">
                      {meeting.transcript.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: 0.01 * index,
                          }}
                          className="group flex gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-background/60"
                        >
                          <span className="mt-1 shrink-0 font-mono text-[10px] text-muted-foreground/60 w-10">
                            {formatTranscriptTimestamp(entry.timestamp)}
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-primary/80 uppercase tracking-tight">
                              {entry.speaker}
                            </span>
                            <p className="text-sm leading-relaxed text-foreground/90">
                              {entry.text}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Sidebar: Participants & Stats */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="sticky top-6 flex flex-col gap-6"
          >
            {/* Quick Stats Card */}
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Meeting Pulse</p>
                  <UsersIcon className="size-4 opacity-80" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <p className="text-2xl font-bold">{meeting.participants.length}</p>
                    <p className="text-[10px] opacity-70">Participants</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-2xl font-bold">{meeting.transcript.length}</p>
                    <p className="text-[10px] opacity-70">Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {meeting.participants.map((p) => (
                    <div
                      key={p.email}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="size-8 border-2 border-background">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {initials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium truncate">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {p.email}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {meeting && (
        <>
          <ActionItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            meetingId={meeting.id}
          />
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => {
              deleteMeeting.mutate(meeting.id, {
                onSuccess: () => router.push("/dashboard")
              })
            }}
            title="Delete Meeting"
            description="Are you sure you want to delete this meeting? This will also remove any generated transcripts and action items."
            confirmText="Delete"
            variant="destructive"
            isLoading={deleteMeeting.isPending}
          />
        </>
      )}
    </div>
  )
}
