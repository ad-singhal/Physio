'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExercisePicker } from './exercise-picker'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import type { BuilderState, BuilderDay, BuilderExercise, BuilderTier } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

type Props = {
  patientId: string
  physioId: string
  programId?: string
  initialState?: BuilderState
}

const DEFAULT_STATE: BuilderState = {
  title: '',
  description: '',
  targetCondition: '',
  durationWeeks: 4,
  tiers: [
    { name: 'Basic', fee: 0, callFrequency: 'None', features: [] },
  ],
  days: [],
}

function newDay(weekNumber: number, dayNumber: number): BuilderDay {
  return {
    id: `day-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    weekNumber,
    dayNumber,
    title: `Week ${weekNumber} · Day ${dayNumber}`,
    exercises: [],
  }
}

export function ProgramBuilder({ patientId, physioId, programId, initialState }: Props) {
  const supabase = createClient()
  const [state, setState] = useState<BuilderState>(initialState ?? DEFAULT_STATE)
  const [openDay, setOpenDay] = useState<string | null>(null)
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishConfirm, setPublishConfirm] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const [currentProgramId, setCurrentProgramId] = useState(programId)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Auto-save every 30 seconds
  const saveDraft = useCallback(async () => {
    if (!state.title.trim()) return
    setSaving(true)

    let pid = currentProgramId
    if (!pid) {
      const { data: program } = await supabase
        .from('programs')
        .insert({
          physio_id: physioId,
          patient_id: patientId,
          title: state.title,
          description: state.description || null,
          target_condition: state.targetCondition || null,
          status: 'draft',
          duration_weeks: state.durationWeeks,
        })
        .select('id')
        .single()
      if (program) {
        pid = program.id
        setCurrentProgramId(pid)
      }
    }

    if (pid) {
      await supabase.from('program_drafts').upsert({
        program_id: pid,
        physio_id: physioId,
        draft_state: state as unknown as import('@/lib/types/database.types').Json,
        last_saved_at: new Date().toISOString(),
      })
      setSavedAt(new Date())
    }
    setSaving(false)
  }, [state, currentProgramId, patientId, physioId, supabase])

  useEffect(() => {
    const interval = setInterval(saveDraft, 30000)
    return () => clearInterval(interval)
  }, [saveDraft])

  function update(patch: Partial<BuilderState>) {
    setState((s) => ({ ...s, ...patch }))
  }

  function addDay() {
    const weeks = groupByWeek(state.days)
    const latestWeek = state.days.length > 0 ? Math.max(...state.days.map((d) => d.weekNumber)) : 1
    const daysInWeek = state.days.filter((d) => d.weekNumber === latestWeek).length
    const nextDay = daysInWeek >= 7 ? newDay(latestWeek + 1, 1) : newDay(latestWeek, daysInWeek + 1)
    setState((s) => ({ ...s, days: [...s.days, nextDay] }))
  }

  function removeDay(dayId: string) {
    setState((s) => ({ ...s, days: s.days.filter((d) => d.id !== dayId) }))
  }

  function addExerciseToDay(dayId: string, exercise: BuilderExercise) {
    setState((s) => ({
      ...s,
      days: s.days.map((d) =>
        d.id === dayId ? { ...d, exercises: [...d.exercises, exercise] } : d
      ),
    }))
    setPickerFor(null)
  }

  function updateExercise(dayId: string, exerciseId: string, patch: Partial<BuilderExercise>) {
    setState((s) => ({
      ...s,
      days: s.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.exerciseId === exerciseId ? { ...e, ...patch } : e
              ),
            }
          : d
      ),
    }))
  }

  function removeExercise(dayId: string, exerciseId: string) {
    setState((s) => ({
      ...s,
      days: s.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((e) => e.exerciseId !== exerciseId) }
          : d
      ),
    }))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setState((s) => {
      const oldIndex = s.days.findIndex((d) => d.id === active.id)
      const newIndex = s.days.findIndex((d) => d.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return s
      return { ...s, days: arrayMove(s.days, oldIndex, newIndex) }
    })
  }

  function addTier() {
    setState((s) => ({
      ...s,
      tiers: [...s.tiers, { name: '', fee: 0, callFrequency: 'None', features: [] }],
    }))
  }

  function updateTier(index: number, patch: Partial<BuilderTier>) {
    setState((s) => ({
      ...s,
      tiers: s.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }))
  }

  function removeTier(index: number) {
    setState((s) => ({ ...s, tiers: s.tiers.filter((_, i) => i !== index) }))
  }

  async function handlePublish() {
    setPublishError(null)
    setPublishing(true)

    await saveDraft()

    if (!currentProgramId) {
      setPublishError('Please save the programme first.')
      setPublishing(false)
      return
    }

    const { error } = await supabase
      .from('programs')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', currentProgramId)

    if (error) {
      setPublishError('Publish failed. Programme kept as draft.')
    } else {
      setPublished(true)
    }
    setPublishing(false)
    setPublishConfirm(false)
  }

  const weeks = groupByWeek(state.days)

  if (published) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <CheckCircle className="h-12 w-12 text-green-600" />
        <h2 className="text-xl font-semibold text-foreground">Programme Published!</h2>
        <p className="text-muted-foreground text-sm">The patient can now see and enrol in this programme.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Programme Builder</h2>
          {savedAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Auto-saved {savedAt.toLocaleTimeString('en-GB', { timeStyle: 'short' })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            onClick={() => setPublishConfirm(true)}
            disabled={!state.title.trim() || publishing}
          >
            <Send className="h-3.5 w-3.5" />
            Publish to Patient
          </Button>
        </div>
      </div>

      {publishError && (
        <p className="text-sm text-destructive">{publishError}</p>
      )}

      {/* Publish confirmation dialog */}
      {publishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPublishConfirm(false)} aria-hidden />
          <div className="relative z-10 bg-background rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold text-foreground">Publish Programme?</h3>
            <p className="text-sm text-muted-foreground">
              The patient will be notified and will see this programme in the iOS app. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setPublishConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publishing…' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Programme details */}
      <Card>
        <CardHeader>
          <CardTitle>Programme Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title *</label>
              <Input
                placeholder="e.g. Knee Recovery Programme"
                value={state.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Target Condition</label>
              <Input
                placeholder="e.g. ACL tear, frozen shoulder"
                value={state.targetCondition}
                onChange={(e) => update({ targetCondition: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="Describe the programme goals and approach…"
              value={state.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <label className="text-sm font-medium text-foreground">Duration (weeks)</label>
            <Input
              type="number"
              min={1}
              max={52}
              value={state.durationWeeks}
              onChange={(e) => update({ durationWeeks: parseInt(e.target.value) || 4 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription tiers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Tiers</CardTitle>
            <Button variant="outline" size="sm" onClick={addTier}>
              <Plus className="h-3.5 w-3.5" />
              Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.tiers.map((tier, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tier Name</label>
                <Input
                  placeholder="e.g. Basic"
                  value={tier.name}
                  onChange={(e) => updateTier(i, { name: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Fee (₹/month)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={tier.fee}
                  onChange={(e) => updateTier(i, { fee: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Call Frequency</label>
                <Input
                  placeholder="e.g. 2x/month"
                  value={tier.callFrequency}
                  onChange={(e) => updateTier(i, { callFrequency: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  onClick={() => removeTier(i)}
                  disabled={state.tiers.length === 1}
                  className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  aria-label="Remove tier"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Week/day planner */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Week & Day Planner</CardTitle>
            <Button variant="outline" size="sm" onClick={addDay}>
              <Plus className="h-3.5 w-3.5" />
              Add Day
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {state.days.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
              <p className="text-sm text-muted-foreground">No days yet. Add a day to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={state.days.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {Object.entries(weeks).map(([week, days]) => (
                    <div key={week}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Week {week}
                      </h3>
                      <div className="space-y-2">
                        {days.map((day) => (
                          <SortableDay
                            key={day.id}
                            day={day}
                            isOpen={openDay === day.id}
                            onToggle={() => setOpenDay(openDay === day.id ? null : day.id)}
                            onRemove={() => removeDay(day.id)}
                            onAddExercise={() => setPickerFor(day.id)}
                            onUpdateExercise={updateExercise}
                            onRemoveExercise={removeExercise}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise picker slide-over */}
      {pickerFor && (
        <ExercisePicker
          onAdd={(exercise) => addExerciseToDay(pickerFor, exercise)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  )
}

type SortableDayProps = {
  day: BuilderDay
  isOpen: boolean
  onToggle: () => void
  onRemove: () => void
  onAddExercise: () => void
  onUpdateExercise: (dayId: string, exerciseId: string, patch: Partial<BuilderExercise>) => void
  onRemoveExercise: (dayId: string, exerciseId: string) => void
}

function SortableDay({
  day,
  isOpen,
  onToggle,
  onRemove,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
}: SortableDayProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between gap-2 text-left"
        >
          <span className="text-sm font-medium text-foreground">{day.title}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
            </span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        </button>

        <button
          onClick={onRemove}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove day"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="p-3 space-y-2 border-t border-border">
          {day.exercises.map((ex) => (
            <div key={ex.exerciseId} className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{ex.title}</p>
                <div className="flex gap-3 mt-1">
                  <FieldInput
                    label="Sets"
                    value={ex.sets}
                    min={1}
                    onChange={(v) => onUpdateExercise(day.id, ex.exerciseId, { sets: v })}
                  />
                  <FieldInput
                    label="Reps"
                    value={ex.reps}
                    min={1}
                    onChange={(v) => onUpdateExercise(day.id, ex.exerciseId, { reps: v })}
                  />
                  <FieldInput
                    label="Rest (s)"
                    value={ex.restSeconds}
                    min={0}
                    onChange={(v) => onUpdateExercise(day.id, ex.exerciseId, { restSeconds: v })}
                  />
                </div>
              </div>
              <button
                onClick={() => onRemoveExercise(day.id, ex.exerciseId)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove exercise"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={onAddExercise}>
            <Plus className="h-3.5 w-3.5" />
            Add Exercise
          </Button>
        </div>
      )}
    </div>
  )
}

function FieldInput({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        className="w-12 rounded border border-border bg-background px-1 py-0.5 text-center text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
    </label>
  )
}

function groupByWeek(days: BuilderDay[]): Record<number, BuilderDay[]> {
  const map: Record<number, BuilderDay[]> = {}
  for (const day of days) {
    if (!map[day.weekNumber]) map[day.weekNumber] = []
    map[day.weekNumber].push(day)
  }
  return map
}
