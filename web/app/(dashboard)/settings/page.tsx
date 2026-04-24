import { createClient } from '@/lib/supabase/server'
import { ProfileSettings } from './_components/profile-settings'
import type { Physiotherapist, PhysioCredentials, PhysioCertification, PhysioConditionTreated } from '@/lib/types/database.types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: physio },
    { data: credentials },
    { data: certifications },
    { data: conditions },
  ] = await Promise.all([
    supabase
      .from('physiotherapists')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('physio_credentials')
      .select('*')
      .eq('physio_id', user.id)
      .single(),
    supabase
      .from('physio_certifications')
      .select('*')
      .eq('physio_id', user.id),
    supabase
      .from('physio_conditions_treated')
      .select('*')
      .eq('physio_id', user.id),
  ])

  if (!physio) return null

  return (
    <ProfileSettings
      physio={physio as Physiotherapist}
      credentials={credentials as PhysioCredentials | null}
      certifications={(certifications ?? []) as PhysioCertification[]}
      conditions={(conditions ?? []) as PhysioConditionTreated[]}
    />
  )
}
