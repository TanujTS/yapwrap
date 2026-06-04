"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  PlusIcon,
  UsersIcon,
  MessageSquareTextIcon,
  InboxIcon,
} from "lucide-react"
import { motion } from "motion/react"

import { useMeetings } from "@/hooks/use-meetings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MeetingListItem } from "@/lib/api"

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

function formatRelative(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

function MeetingCard({
  meeting,
  index,
}: {
  meeting: MeetingListItem
  index: number
}) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Card
        className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20"
        onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <CardTitle className="truncate text-base">
                {meeting.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <CalendarDaysIcon className="size-3.5 shrink-0" />
                {formatDate(meeting.meetingDate)}
              </CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">
              {formatRelative(meeting.meetingDate)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <UsersIcon className="size-3.5" />
                {meeting.participants.length}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquareTextIcon className="size-3.5" />
                {meeting.transcript.length} entries
              </span>
            </div>
            <ChevronRightIcon className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MeetingListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-4 py-16"
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <InboxIcon className="size-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h3 className="font-heading text-lg font-medium">No meetings yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first meeting to start capturing insights, action items,
          and follow-ups.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard/meetings/new">
          <PlusIcon data-icon="inline-start" />
          Create your first meeting
        </Link>
      </Button>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useMeetings()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Meetings</h1>
          <p className="text-sm text-muted-foreground">
            Your meeting history and transcripts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/meetings/new">
            <PlusIcon data-icon="inline-start" />
            New Meeting
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <MeetingListSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">
              {error?.message || "Failed to load meetings"}
            </p>
          </CardContent>
        </Card>
      ) : !data?.data.length ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {data.data.map((meeting, index) => (
            <MeetingCard key={meeting.id} meeting={meeting} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
