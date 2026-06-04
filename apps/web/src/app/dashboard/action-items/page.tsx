"use client"

import { useState } from "react"
import { useActionItems, useUpdateActionItemStatus, useDeleteActionItem } from "@/hooks/use-action-items"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, CircleIcon, LoaderCircleIcon, ListTodoIcon, CalendarDaysIcon, Trash2Icon, BellIcon, AlertTriangleIcon, ClockIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ActionItemModal } from "../meetings/[id]/components/action-item-modal"
import type { ActionItem } from "@/lib/api"

function getDueStatus(item: ActionItem): "overdue" | "due-soon" | null {
  if (!item.dueDate || item.status === "COMPLETED") return null
  const now = new Date()
  const due = new Date(item.dueDate)
  if (due < now) return "overdue"
  const diffMs = due.getTime() - now.getTime()
  if (diffMs < 24 * 60 * 60 * 1000) return "due-soon"
  return null
}

export default function ActionItemsPage() {
  const { data: actionItems, isLoading, isError } = useActionItems()
  const updateStatus = useUpdateActionItemStatus()
  const deleteActionItem = useDeleteActionItem()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<ActionItem | null>(null)

  const toggleStatus = (id: string, currentStatus: string) => {
    setUpdatingId(id)
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED"
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        toast.success(`Action item marked as ${newStatus.toLowerCase()}`)
        setUpdatingId(null)
      },
      onError: (err) => {
        toast.error("Failed to update status")
        setUpdatingId(null)
      }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteActionItem.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Action item deleted")
        setDeleteId(null)
      },
      onError: () => {
        toast.error("Failed to delete action item")
        setDeleteId(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Action Item"
        description="Are you sure you want to delete this action item? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteActionItem.isPending}
      />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <ListTodoIcon className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold">Action Items</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your tasks across all meetings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            Click the circle to toggle completion status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-sm text-destructive py-4">Failed to load action items.</div>
          ) : actionItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ListTodoIcon className="size-12 opacity-20 mb-4" />
              <p>No action items found.</p>
              <p className="text-sm opacity-70">Analyze a meeting to extract and accept action items.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {actionItems?.map(item => {
                const isCompleted = item.status === "COMPLETED"
                const isUpdating = updatingId === item.id
                return (
                  <div key={item.id} className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-colors ${isCompleted ? 'bg-muted/30 border-muted' : 'bg-card hover:bg-muted/10'}`}>
                    <button
                      className="mt-0.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      onClick={() => toggleStatus(item.id, item.status)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <LoaderCircleIcon className="size-5 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2Icon className="size-5 text-green-500" />
                      ) : (
                        <CircleIcon className="size-5" />
                      )}
                    </button>
                    <div
                      className="flex flex-col flex-1 gap-1.5 cursor-pointer"
                      onClick={() => setEditItem(item)}
                    >
                      <p className={`font-medium leading-none ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.task}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {item.assignee && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            👤 {item.assignee}
                          </Badge>
                        )}
                        {item.dueDate && (
                          <Badge variant="outline" className="text-xs font-normal bg-background">
                            📅 {format(new Date(item.dueDate), 'MMM d, yyyy')}
                          </Badge>
                        )}
                        {getDueStatus(item) === "overdue" && (
                          <Badge variant="destructive" className="text-xs font-normal">
                            <AlertTriangleIcon className="mr-1 size-3" />
                            Overdue
                          </Badge>
                        )}
                        {getDueStatus(item) === "due-soon" && (
                          <Badge className="text-xs font-normal bg-amber-500/10 text-amber-600 border-amber-500/20">
                            <ClockIcon className="mr-1 size-3" />
                            Due soon
                          </Badge>
                        )}
                        {item.reminderOffset && item.reminderOffset !== "none" && (
                          <Badge variant="outline" className="text-xs font-normal">
                            <BellIcon className="mr-1 size-3" />
                            Reminder set
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary/80">
                          <Link href={`/dashboard/meetings/${item.meetingId}`} className="flex items-center gap-1 hover:underline">
                            <CalendarDaysIcon className="size-3" />
                            View Meeting
                          </Link>
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {editItem && (
        <ActionItemModal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          meetingId={editItem.meetingId}
          editItem={editItem}
        />
      )}
    </div>
  )
}
