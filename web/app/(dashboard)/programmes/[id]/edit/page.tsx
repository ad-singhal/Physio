import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgramBuilder } from '@/components/programme/builder'
import type { BuilderState } from '@/lib/types/database.types'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditProgrammePage({ params }: PageProps) {
  const { id: programId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: program } = await supabase
    .from('programs')
    .select('id, physio_id, patient_id, title, description, target_condition, duration_weeks, status')
    .eq('id', programId)
    .eq('physio_id', user.id)
    .single()

  if (!program) notFound()

  // Load draft state if it exists
  const { data: draft } = await supabase
    .from('program_drafts')
    .select('draft_state')
    .eq('program_id', programId)
    .eq('physio_id', user.id)
    .single()

  const initialState: BuilderState = draft?.draft_state
    ? (draft.draft_state as unknown as BuilderState)
    : {
        title: program.title,
        description: program.description ?? '',
        targetCondition: program.target_condition ?? '',
        durationWeeks: program.duration_weeks,
        tiers: [{ name: 'Basic', fee: 0, callFrequency: 'None', features: [] }],
        days: [],
      }

  return (
    <ProgramBuilder
      patientId={program.patient_id}
      physioId={user.id}
      programId={programId}
      initialState={initialState}
    />
  )
}
