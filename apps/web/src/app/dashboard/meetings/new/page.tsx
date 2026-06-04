"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CalendarIcon,
  LoaderCircleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { useCreateMeeting } from "@/hooks/use-meetings"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { TranscriptEntry } from "@/lib/api"

export default function NewMeetingPage() {
  const router = useRouter()
  const createMeeting = useCreateMeeting()

  const [title, setTitle] = useState("")
  const [participantInput, setParticipantInput] = useState("")
  const [participants, setParticipants] = useState<string[]>([])
  const [meetingDate, setMeetingDate] = useState<Date | undefined>()
  const [meetingTime, setMeetingTime] = useState("10:00")
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { timestamp: "", speaker: "", text: "" },
  ])

  function addParticipant() {
    const email = participantInput.trim().toLowerCase()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    if (participants.includes(email)) {
      toast.error("This participant is already added")
      return
    }
    setParticipants((prev) => [...prev, email])
    setParticipantInput("")
  }

  function removeParticipant(email: string) {
    setParticipants((prev) => prev.filter((p) => p !== email))
  }

  function updateTranscriptEntry(
    index: number,
    field: keyof TranscriptEntry,
    value: string,
  ) {
    setTranscript((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    )
  }

  function addTranscriptEntry() {
    setTranscript((prev) => [...prev, { timestamp: "", speaker: "", text: "" }])
  }

  function removeTranscriptEntry(index: number) {
    if (transcript.length <= 1) return
    setTranscript((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Meeting title is required")
      return
    }
    if (participants.length === 0) {
      toast.error("Add at least one participant")
      return
    }
    if (!meetingDate) {
      toast.error("Select a meeting date")
      return
    }

    const validTranscript = transcript.filter(
      (e) => e.timestamp.trim() && e.speaker.trim() && e.text.trim(),
    )
    if (validTranscript.length === 0) {
      toast.error("Add at least one complete transcript entry")
      return
    }

    const [hours, minutes] = meetingTime.split(":").map(Number)
    const dateTime = new Date(meetingDate)
    dateTime.setHours(hours ?? 10, minutes ?? 0, 0, 0)

    createMeeting.mutate(
      {
        title: title.trim(),
        participants,
        meetingDate: dateTime.toISOString(),
        transcript: validTranscript,
      },
      {
        onSuccess: (data) => {
          toast.success("Meeting created successfully")
          router.push(`/dashboard/meetings/${data.id}`)
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create meeting")
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-semibold">New Meeting</h1>
          <p className="text-sm text-muted-foreground">
            Capture meeting details and transcript
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Title & Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meeting Details</CardTitle>
            <CardDescription>Basic meeting information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Sprint Planning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={createMeeting.isPending}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`justify-start text-left font-normal ${!meetingDate ? "text-muted-foreground" : ""}`}
                      disabled={createMeeting.isPending}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {meetingDate
                        ? format(meetingDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={meetingDate}
                      onSelect={setMeetingDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  disabled={createMeeting.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participants</CardTitle>
            <CardDescription>
              Add participant email addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                placeholder="alice@example.com"
                type="email"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addParticipant()
                  }
                }}
                disabled={createMeeting.isPending}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addParticipant}
                disabled={createMeeting.isPending}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {participants.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeParticipant(email)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Transcript</CardTitle>
                <CardDescription>
                  Add timestamped transcript entries
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTranscriptEntry}
                disabled={createMeeting.isPending}
              >
                <PlusIcon data-icon="inline-start" />
                Add entry
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {transcript.map((entry, index) => (
              <div key={index} className="flex flex-col gap-3">
                {index > 0 && <Separator />}
                <div className="flex items-start gap-3">
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                    <div className="flex flex-col gap-1.5 sm:w-24">
                      <Label className="text-xs text-muted-foreground">
                        Timestamp
                      </Label>
                      <Input
                        placeholder="00:10"
                        value={entry.timestamp}
                        onChange={(e) =>
                          updateTranscriptEntry(
                            index,
                            "timestamp",
                            e.target.value,
                          )
                        }
                        disabled={createMeeting.isPending}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:w-32">
                      <Label className="text-xs text-muted-foreground">
                        Speaker
                      </Label>
                      <Input
                        placeholder="John"
                        value={entry.speaker}
                        onChange={(e) =>
                          updateTranscriptEntry(
                            index,
                            "speaker",
                            e.target.value,
                          )
                        }
                        disabled={createMeeting.isPending}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Text
                      </Label>
                      <Textarea
                        placeholder="What was said..."
                        value={entry.text}
                        onChange={(e) =>
                          updateTranscriptEntry(index, "text", e.target.value)
                        }
                        rows={2}
                        disabled={createMeeting.isPending}
                      />
                    </div>
                  </div>
                  {transcript.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6 size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTranscriptEntry(index)}
                      disabled={createMeeting.isPending}
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={createMeeting.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMeeting.isPending}>
            {createMeeting.isPending ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            Create Meeting
          </Button>
        </div>
      </form>
    </div>
  )
}
