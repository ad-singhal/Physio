import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgramBuilder } from '@/components/programme/builder'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewProgrammePage({ params }: PageProps) {
  const { id: patientId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Verify physio owns this patient
  const { data: match } = await supabase
    .from('matches')
    .select('id')
    .eq('physio_id', user.id)
    .eq('patient_id', patientId)
    .single()

  if (!match) notFound()

  return (
    <ProgramBuilder
      patientId={patientId}
      physioId={user.id}
    />
  )
}
