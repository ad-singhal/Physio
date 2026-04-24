'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Plus, Loader2 } from 'lucide-react'
import type { Exercise, BuilderExercise } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

const BODY_REGIONS = ['All', 'Shoulder', 'Knee', 'Hip', 'Spine', 'Ankle', 'Wrist', 'Neck', 'Core']
const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced']

type Props = {
  onAdd: (exercise: BuilderExercise) => void
  onClose: () => void
}

export function ExercisePicker({ onAdd, onClose }: Props) {
  const supabase = createClient()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [bodyRegion, setBodyRegion] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [customName, setCustomName] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('exercises')
        .select('id, title, description, body_region, difficulty, video_url, thumbnail_url, instructions, created_at')
        .order('title')
      if (err) {
        setError('Failed to load exercises. You can type a custom exercise name below.')
      } else {
        setExercises(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const filtered = exercises.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase())
    const matchesRegion = bodyRegion === 'All' || e.body_region?.toLowerCase() === bodyRegion.toLowerCase()
    const matchesDifficulty = difficulty === 'All' || e.difficulty === difficulty
    return matchesSearch && matchesRegion && matchesDifficulty
  })

  function addExercise(exercise: Exercise) {
    onAdd({
      exerciseId: exercise.id,
      title: exercise.title,
      sets: 3,
      reps: 10,
      restSeconds: 60,
      order: Date.now(),
    })
  }

  function addCustom() {
    if (!customName.trim()) return
    onAdd({
      exerciseId: `custom-${Date.now()}`,
      title: customName.trim(),
      sets: 3,
      reps: 10,
      restSeconds: 60,
      order: Date.now(),
    })
    setCustomName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-sm flex-col bg-background shadow-xl h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">Add Exercise</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="border-b border-border p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search exercises…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {BODY_REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setBodyRegion(r)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
                  bodyRegion === r
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors capitalize',
                  difficulty === d
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && <p className="text-xs text-muted-foreground py-2">{error}</p>}
          {!loading && filtered.length === 0 && !error && (
            <p className="text-xs text-muted-foreground text-center py-4">No exercises found.</p>
          )}
          {filtered.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{exercise.title}</p>
                {exercise.body_region && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exercise.body_region}
                    {exercise.difficulty && ` · ${exercise.difficulty}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => addExercise(exercise)}
                className="shrink-0 rounded-md p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                aria-label={`Add ${exercise.title}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Custom exercise fallback */}
        <div className="border-t border-border p-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Custom Exercise</p>
          <div className="flex gap-2">
            <Input
              placeholder="Exercise name…"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              className="flex-1 h-8 text-sm"
            />
            <Button size="sm" onClick={addCustom} disabled={!customName.trim()}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
