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
  CodeIcon,
  FileTextIcon
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
  CardFooter
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TranscriptEntry } from "@/lib/api"

const JSON_TEMPLATE = `{
  "title": "Sprint Planning",
  "meetingDate": "2026-05-20T10:00:00Z",
  "participants": [
    "alice@example.com",
    "bob@example.com"
  ],
  "transcript": [
    {
      "timestamp": "00:10",
      "speaker": "John",
      "text": "We should launch next Friday."
    },
    {
      "timestamp": "00:20",
      "speaker": "Alice",
      "text": "I will prepare release notes."
    }
  ]
}`

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
  
  const [jsonInput, setJsonInput] = useState(JSON_TEMPLATE)

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

  async function handleManualSubmit(e: React.FormEvent) {
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

  async function handleJsonSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data = JSON.parse(jsonInput)
      
      if (!data.title || !data.participants || !data.meetingDate || !data.transcript) {
        toast.error("JSON is missing required fields (title, participants, meetingDate, transcript)")
        return
      }
      
      if (!Array.isArray(data.participants) || !Array.isArray(data.transcript)) {
        toast.error("participants and transcript must be arrays")
        return
      }

      createMeeting.mutate(data, {
        onSuccess: (res) => {
          toast.success("Meeting created successfully")
          router.push(`/dashboard/meetings/${res.id}`)
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create meeting")
        },
      })
    } catch (err) {
      toast.error("Invalid JSON format")
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
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

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileTextIcon className="size-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <CodeIcon className="size-4" />
            JSON Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-6">
            {/* Title & Date */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meeting Details</CardTitle>
                <CardDescription>Basic meeting information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Sprint Planning"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={createMeeting.isPending}
                    className="h-10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`justify-start text-left font-normal h-10 ${!meetingDate ? "text-muted-foreground" : ""}`}
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
                      className="h-10"
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
              <CardContent className="flex flex-col gap-4">
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
                    className="h-10"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 px-4"
                    onClick={addParticipant}
                    disabled={createMeeting.isPending}
                  >
                    Add
                  </Button>
                </div>
                {participants.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {participants.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="pl-3 pr-1 py-1.5 text-sm font-medium bg-muted"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeParticipant(email)}
                          className="ml-2 rounded-full p-0.5 hover:bg-background/80 transition-colors"
                        >
                          <XIcon className="size-3.5" />
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {transcript.map((entry, index) => (
                    <div key={index} className="group relative flex flex-col sm:flex-row gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/30 focus-within:bg-muted/30 focus-within:border-primary/30">
                      <div className="flex flex-row sm:flex-col gap-2 sm:w-[120px] shrink-0">
                        <Input
                          placeholder="00:00"
                          value={entry.timestamp}
                          onChange={(e) =>
                            updateTranscriptEntry(index, "timestamp", e.target.value)
                          }
                          disabled={createMeeting.isPending}
                          className="h-8 text-xs font-mono bg-background"
                        />
                        <Input
                          placeholder="Speaker name"
                          value={entry.speaker}
                          onChange={(e) =>
                            updateTranscriptEntry(index, "speaker", e.target.value)
                          }
                          disabled={createMeeting.isPending}
                          className="h-8 text-xs font-medium bg-background"
                        />
                      </div>
                      
                      <div className="flex-1 relative">
                        <Textarea
                          placeholder="Type what was said here..."
                          value={entry.text}
                          onChange={(e) =>
                            updateTranscriptEntry(index, "text", e.target.value)
                          }
                          rows={3}
                          disabled={createMeeting.isPending}
                          className="min-h-[72px] resize-y text-sm border-0 focus-visible:ring-1 focus-visible:ring-primary/30 bg-background shadow-sm"
                        />
                      </div>

                      {transcript.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 size-6 rounded-full bg-background border shadow-sm opacity-0 scale-95 transition-all group-hover:opacity-100 group-hover:scale-100 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                          onClick={() => removeTranscriptEntry(index)}
                          disabled={createMeeting.isPending}
                        >
                          <XIcon className="size-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed py-8 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    onClick={addTranscriptEntry}
                    disabled={createMeeting.isPending}
                  >
                    <PlusIcon className="mr-2 size-4" />
                    Add another entry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                disabled={createMeeting.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMeeting.isPending} className="px-8">
                {createMeeting.isPending ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin mr-2"
                  />
                ) : null}
                Create Meeting
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="json" className="mt-6">
          <form onSubmit={handleJsonSubmit} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">JSON Payload</CardTitle>
                    <CardDescription>
                      Paste a raw JSON object containing the meeting details
                    </CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setJsonInput(JSON_TEMPLATE)}
                    className="text-xs h-8"
                  >
                    Reset Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="font-mono text-xs min-h-[400px] p-4 bg-muted/30"
                  spellCheck={false}
                  disabled={createMeeting.isPending}
                />
              </CardContent>
              <CardFooter className="flex-col items-start gap-4 bg-muted/10 border-t py-4 px-6">
                <div className="text-sm font-medium">Expected Structure:</div>
                <div className="text-xs text-muted-foreground grid gap-2 font-mono bg-background p-4 rounded-md border w-full">
                  <div><span className="text-primary">"title"</span>: string (required)</div>
                  <div><span className="text-primary">"meetingDate"</span>: ISO date string (required)</div>
                  <div><span className="text-primary">"participants"</span>: array of emails (required)</div>
                  <div>
                    <span className="text-primary">"transcript"</span>: array of objects with <span className="text-primary">timestamp</span>, <span className="text-primary">speaker</span>, and <span className="text-primary">text</span> (required)
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                disabled={createMeeting.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMeeting.isPending} className="px-8">
                {createMeeting.isPending ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin mr-2"
                  />
                ) : null}
                Create via JSON
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
