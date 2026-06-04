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
} from "lucide-react"
import { motion } from "motion/react"

import { useMeeting } from "@/hooks/use-meetings"
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
  const { data: meeting, isLoading, isError, error } = useMeeting(id)

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
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <UsersIcon className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Participants</p>
              <p className="font-heading text-xl font-semibold">
                {meeting.participants.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquareTextIcon className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Transcript Entries
              </p>
              <p className="font-heading text-xl font-semibold">
                {meeting.transcript.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <WrenchIcon className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Action Items</p>
              <p className="font-heading text-xl font-semibold text-muted-foreground">
                —
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Participants */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {meeting.participants.map((p) => (
                <div
                  key={p.email}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">
                      {initials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transcript */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Transcript</CardTitle>
              <div className="flex gap-1.5">
                {uniqueSpeakers.map((speaker) => (
                  <Badge key={speaker} variant="outline" className="text-xs">
                    {speaker}
                  </Badge>
                ))}
              </div>
            </div>
            <CardDescription>
              Full meeting transcript with timestamps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[500px]">
              <div className="flex flex-col gap-1">
                {meeting.transcript.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: 0.2 + index * 0.03,
                    }}
                    className="group flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <Badge
                      variant="outline"
                      className="mt-0.5 h-fit shrink-0 font-mono text-[11px] text-muted-foreground"
                    >
                      {entry.timestamp}
                    </Badge>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-primary">
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
      </motion.div>

      {/* Action Items Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.2 }}
      >
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <WrenchIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Action items will appear here
            </p>
            <p className="max-w-sm text-xs text-muted-foreground/70">
              Run AI analysis on this meeting to extract action items, decisions,
              and follow-ups.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
