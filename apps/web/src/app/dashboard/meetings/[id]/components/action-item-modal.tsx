"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2Icon, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateActionItem, useUpdateActionItem } from "@/hooks/use-action-items"
import type { GeneratedActionItem, ActionItem, ReminderOffset } from "@/lib/api"
import { cn } from "@/lib/utils"

const actionItemSchema = z.object({
  task: z.string().min(1, "Task description is required"),
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  reminderOffset: z.enum(["none", "now", "15min", "1h", "1d", "2d", "1w"]),
})

type ActionItemFormValues = z.infer<typeof actionItemSchema>

interface ActionItemModalProps {
  isOpen: boolean
  onClose: () => void
  meetingId: string
  analysisId?: string
  initialData?: GeneratedActionItem | null
  editItem?: ActionItem | null
}

export function ActionItemModal({
  isOpen,
  onClose,
  meetingId,
  analysisId,
  initialData,
  editItem
}: ActionItemModalProps) {
  const createActionItem = useCreateActionItem()
  const updateActionItem = useUpdateActionItem()
  
  const form = useForm<ActionItemFormValues>({
    resolver: zodResolver(actionItemSchema),
    defaultValues: {
      task: "",
      assignee: "",
      reminderOffset: "none",
    },
  })

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        form.reset({
          task: editItem.task,
          assignee: editItem.assignee || "",
          dueDate: editItem.dueDate ? new Date(editItem.dueDate) : undefined,
          reminderOffset: editItem.reminderOffset || "none",
        })
      } else if (initialData) {
        form.reset({
          task: initialData.task,
          assignee: initialData.assignee || "",
          dueDate: initialData.suggestedDueDate ? new Date(initialData.suggestedDueDate) : undefined,
          reminderOffset: "none",
        })
      } else {
        form.reset({
          task: "",
          assignee: "",
          reminderOffset: "none",
        })
      }
    }
  }, [isOpen, initialData, editItem, form])

  const onSubmit = (data: ActionItemFormValues) => {
    if (editItem) {
      updateActionItem.mutate(
        {
          id: editItem.id,
          data: {
            task: data.task,
            assignee: data.assignee || null,
            dueDate: data.dueDate ? data.dueDate.toISOString() : null,
            reminderOffset: data.reminderOffset,
          }
        },
        {
          onSuccess: () => {
            onClose()
          },
        }
      )
    } else {
      createActionItem.mutate(
        {
          meetingId,
          analysisId,
          task: data.task,
          assignee: data.assignee,
          dueDate: data.dueDate?.toISOString(),
          reminderOffset: data.reminderOffset,
          citations: initialData?.citations,
        },
        {
          onSuccess: () => {
            onClose()
          },
        }
      )
    }
  }

  const isPending = createActionItem.isPending || updateActionItem.isPending
  const isEditing = !!editItem

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Action Item" : "Create Action Item"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this action item." : "Review and confirm the details for this action item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="task"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Task Description</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="What needs to be done?"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="assignee"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Assignee (Optional)</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Who is responsible?"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="dueDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex flex-col">
                <FieldLabel htmlFor={field.name}>Due Date (Optional)</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id={field.name}
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      aria-invalid={fieldState.invalid}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="reminderOffset"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email Reminder</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select a reminder time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No reminder</SelectItem>
                    <SelectItem value="now">Now (15s test delay)</SelectItem>
                    <SelectItem value="15min">15 minutes before due date</SelectItem>
                    <SelectItem value="1h">1 hour before</SelectItem>
                    <SelectItem value="1d">1 day before</SelectItem>
                    <SelectItem value="2d">2 days before</SelectItem>
                    <SelectItem value="1w">1 week before</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Save Action Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
