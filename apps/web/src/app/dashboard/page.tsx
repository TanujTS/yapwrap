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

import { useState, useEffect } from "react"
import { useMeetings, useDeleteMeeting } from "@/hooks/use-meetings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrashIcon, SearchIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const deleteMutation = useDeleteMeeting()

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
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-xs">
                {formatRelative(meeting.meetingDate)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm("Are you sure you want to delete this meeting?")) {
                    deleteMutation.mutate(meeting.id)
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError, error } = useMeetings(page, limit, debouncedSearch)

  const totalCount = data?.meta?.count as number | undefined
  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 1

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

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page</span>
          <Select
            value={String(limit)}
            onValueChange={(val) => {
              setLimit(Number(val))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
