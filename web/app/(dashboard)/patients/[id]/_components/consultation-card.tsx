'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle } from 'lucide-react'
import type { Consultation } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

type Props = {
  consultation: Consultation
  physioId: string
  existingNotes?: string
}

export function ConsultationCard({ consultation: c, physioId, existingNotes }: Props) {
  const supabase = createClient()
  const [notes, setNotes] = useState(existingNotes ?? '')
  const [marking, setMarking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(c.status === 'completed')
  const isDraft = saveError !== null

  async function markComplete() {
    setMarking(true)
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'completed' })
      .eq('id', c.id)

    if (!error) setCompleted(true)
    setMarking(false)
  }

  async function saveNotes() {
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase.from('consultation_notes').upsert({
      consultation_id: c.id,
      physio_id: physioId,
      notes,
    })

    if (error) setSaveError('Save failed — notes kept as draft.')
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Consultation</CardTitle>
          {completed ? (
            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Completed
            </div>
          ) : (
            <Button size="sm" onClick={markComplete} disabled={marking}>
              {marking ? 'Saving…' : 'Mark Complete'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Scheduled</dt>
            <dd className="font-medium text-foreground mt-0.5">
              {new Date(c.scheduled_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </dd>
          </div>
          {c.consultation_type && (
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium text-foreground mt-0.5 capitalize">
                {c.consultation_type.replace('_', ' ')}
              </dd>
            </div>
          )}
        </dl>

        {/* Post-call notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Post-call Notes</label>
          {isDraft && (
            <p className="text-xs text-amber-600 font-medium">{saveError}</p>
          )}
          <Textarea
            placeholder="Add notes visible to the patient…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <Button size="sm" variant="outline" onClick={saveNotes} disabled={saving}>
            {saving ? 'Saving…' : 'Save Notes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
