"use client"

import { useState } from "react"
import { SparklesIcon, CheckIcon, WrenchIcon, CheckCircle2Icon, ListTodoIcon, CircleIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Citation, Insight, GeneratedActionItem, MeetingAnalysis, ActionItem } from "@/lib/api"
import { useActionItems, useDeleteActionItem } from "@/hooks/use-action-items"
import { ActionItemModal } from "./action-item-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"

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

function CitationBadge({ citations }: { citations: Citation[] }) {
  if (!citations || citations.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {citations.map((c, i) => (
        <Badge key={i} variant="secondary" className="text-[10px] h-4 py-0 font-mono text-muted-foreground bg-muted/50">
          {formatTranscriptTimestamp(c.timestamp)} {c.speaker && `(${c.speaker})`}
        </Badge>
      ))}
    </div>
  )
}

function InsightList({ title, icon: Icon, insights, colorClass }: { title: string, icon: any, insights: Insight[], colorClass: string }) {
  if (!insights || insights.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <div className={`flex size-8 items-center justify-center rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`size-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">{insights.length}</Badge>
      </div>
      <div className="flex flex-col gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="group flex gap-4 rounded-xl border border-transparent p-2 transition-colors hover:bg-muted/30">
            <div className={`mt-2 size-2 shrink-0 rounded-full ${colorClass}`} />
            <div className="flex flex-col gap-1">
              <p className="text-sm leading-relaxed text-foreground/90">{insight.text}</p>
              <CitationBadge citations={insight.citations} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalysisView({ analysis, meetingId }: { analysis: MeetingAnalysis; meetingId: string }) {
  const { data: existingActionItems = [] } = useActionItems({ meetingId })
  const deleteActionItem = useDeleteActionItem()
  const [selectedItem, setSelectedItem] = useState<GeneratedActionItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAcceptActionItem = (item: GeneratedActionItem) => {
    setSelectedItem(item)
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteActionItem.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: () => setDeleteId(null)
    })
  }

  const isAccepted = (task: string) => existingActionItems.some(existing => existing.task === task)

  return (
    <div className="flex flex-col gap-12">
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Action Item"
        description="Are you sure you want to delete this action item?"
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteActionItem.isPending}
      />
      <ActionItemModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        meetingId={meetingId}
        analysisId={analysis.id}
        initialData={selectedItem}
      />

      {/* Top Section: Executive Summary & Action Items */}
      <div className="grid gap-12 lg:grid-cols-2">
        <InsightList
          title="Executive Summary"
          icon={SparklesIcon}
          insights={analysis.summary}
          colorClass="bg-purple-500"
        />

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500 bg-opacity-10">
              <WrenchIcon className="size-4 text-orange-500" />
            </div>
            <h3 className="font-heading text-base font-semibold">Action Items</h3>
            <Badge variant="secondary" className="ml-auto text-[10px]">{analysis.actionItems.length}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-1">
            {analysis.actionItems.map((item, idx) => {
              const accepted = isAccepted(item.task)
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <Card className={`overflow-hidden border-2 ${accepted ? 'border-primary/20 bg-primary/5' : 'border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors'}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{item.task}</p>
                          {!accepted && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[10px] border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleAcceptActionItem(item)}
                            >
                              Save
                            </Button>
                          )}
                          {accepted && <CheckIcon className="size-4 shrink-0 text-primary mt-0.5" />}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {item.assignee && (
                            <Badge variant="secondary" className="bg-background text-[10px] py-0 font-normal">
                              👤 {item.assignee}
                            </Badge>
                          )}
                          {item.suggestedDueDate && (
                            <Badge variant="secondary" className="bg-background text-[10px] py-0 font-normal">
                              📅 {item.suggestedDueDate.split('T')[0]}
                            </Badge>
                          )}
                        </div>
                        <CitationBadge citations={item.citations} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Decisions & Follow-ups */}
      <div className="grid gap-12 lg:grid-cols-2">
        <InsightList
          title="Key Decisions"
          icon={CheckCircle2Icon}
          insights={analysis.decisions}
          colorClass="bg-emerald-500"
        />
        <InsightList
          title="Follow-ups"
          icon={ListTodoIcon}
          insights={analysis.followUps}
          colorClass="bg-blue-500"
        />
      </div>

      {/* Existing Tasks Row (if any) */}
      {existingActionItems.length > 0 && (
        <div className="flex flex-col gap-4 border-t pt-8">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="size-4 text-primary" />
            <p className="text-sm font-bold uppercase tracking-wider">Confirmed Action Items</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {existingActionItems.map(item => (
              <div key={item.id} className="group relative flex items-center gap-3 rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/30">
                {item.status === 'COMPLETED' ? (
                  <CheckCircle2Icon className="size-5 text-emerald-500 shrink-0" />
                ) : (
                  <CircleIcon className="size-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${item.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                    {item.task}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{item.assignee || 'Unassigned'}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(item.id)}
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
