"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateActionItem } from "@/hooks/use-action-items"
import { toast } from "sonner"
import type { GeneratedActionItem, Citation } from "@/lib/api"
import { LoaderCircleIcon } from "lucide-react"

export function ActionItemModal({
  isOpen,
  onClose,
  meetingId,
  analysisId,
  initialData,
}: {
  isOpen: boolean
  onClose: () => void
  meetingId: string
  analysisId?: string
  initialData?: GeneratedActionItem | null
}) {
  const [task, setTask] = useState("")
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [citations, setCitations] = useState<Citation[]>([])

  const createActionItem = useCreateActionItem()

  useEffect(() => {
    if (isOpen && initialData) {
      setTask(initialData.task || "")
      setAssignee(initialData.assignee || "")
      setDueDate(initialData.suggestedDueDate ? initialData.suggestedDueDate.split('T')[0] : "")
      setCitations(initialData.citations || [])
    } else if (isOpen && !initialData) {
      setTask("")
      setAssignee("")
      setDueDate("")
      setCitations([])
    }
  }, [isOpen, initialData])

  function handleSave() {
    if (!task.trim()) {
      toast.error("Task is required")
      return
    }

    createActionItem.mutate(
      {
        meetingId,
        analysisId: analysisId,
        task: task.trim(),
        assignee: assignee.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        citations,
      },
      {
        onSuccess: () => {
          toast.success("Action item saved successfully")
          onClose()
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save action item")
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Save Action Item" : "Create Action Item"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Review and confirm this AI-suggested action item." 
              : "Add a new action item manually."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              placeholder="e.g. Schedule follow-up meeting"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={createActionItem.isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                placeholder="e.g. Alice"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                disabled={createActionItem.isPending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={createActionItem.isPending}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createActionItem.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createActionItem.isPending}>
            {createActionItem.isPending && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
            Save Action Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
