import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft } from 'lucide-react'
import { PatientTabs } from './_components/patient-tabs'
import { OverviewTab } from './_components/overview-tab'
import { OnboardingTab } from './_components/onboarding-tab'
import { ProgrammeTab } from './_components/programme-tab'
import { ProgressTab } from './_components/progress-tab'
import { MessagesTab } from './_components/messages-tab'
import { ConsultationCard } from './_components/consultation-card'
import type {
  Patient,
  Match,
  Consultation,
  OnboardingResponse,
  Program,
  SessionLog,
  Message,
} from '@/lib/types/database.types'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PatientProfilePage({ params }: PageProps) {
  const { id: patientId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch match (confirms physio owns this patient)
  const { data: match } = await supabase
    .from('matches')
    .select('id, physio_id, patient_id, status, created_at')
    .eq('physio_id', user.id)
    .eq('patient_id', patientId)
    .single()

  if (!match) notFound()

  // Parallel fetch all patient data
  const [
    { data: patient },
    { data: onboarding },
    { data: consultations },
    { data: programs },
    { data: sessionLogs },
    { data: messages },
    { data: consultationNotes },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, full_name, profile_photo_url, date_of_birth, gender, phone, created_at')
      .eq('id', patientId)
      .single(),
    supabase
      .from('onboarding_responses')
      .select('id, patient_id, general_info, health_profile, pain_profile, created_at')
      .eq('patient_id', patientId)
      .single(),
    supabase
      .from('consultations')
      .select('id, physio_id, patient_id, match_id, scheduled_at, duration_minutes, status, consultation_type, created_at')
      .eq('physio_id', user.id)
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false }),
    supabase
      .from('programs')
      .select('id, physio_id, patient_id, match_id, title, description, target_condition, status, duration_weeks, published_at, created_at')
      .eq('physio_id', user.id)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false }),
    supabase
      .from('session_logs')
      .select('id, patient_id, program_id, program_day_id, completed_at, pain_score_before, pain_score_after, notes')
      .eq('patient_id', patientId)
      .order('completed_at', { ascending: false }),
    supabase
      .from('messages')
      .select('id, match_id, sender_id, sender_type, content, created_at, read_at')
      .eq('match_id', match.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('consultation_notes')
      .select('consultation_id, notes')
      .eq('physio_id', user.id),
  ])

  if (!patient) notFound()

  const notesMap = new Map(
    (consultationNotes ?? []).map((n) => [n.consultation_id, n.notes])
  )

  const nextConsultation = (consultations ?? []).find((c) => c.status === 'scheduled')

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/patients"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Patients
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{patient.full_name}</span>
      </div>

      {/* Patient header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden shrink-0">
          {patient.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={patient.profile_photo_url} alt={patient.full_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-white font-bold text-xl">{patient.full_name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{patient.full_name}</h2>
          <p className="text-sm text-muted-foreground">{patient.email}</p>
        </div>
      </div>

      {/* Upcoming consultation card */}
      {nextConsultation && (
        <ConsultationCard
          consultation={nextConsultation as Consultation}
          physioId={user.id}
          existingNotes={notesMap.get(nextConsultation.id)}
        />
      )}

      {/* Tabbed content */}
      <PatientTabs>
        {(tab) => {
          if (tab === 'overview') {
            return (
              <OverviewTab
                patient={patient as Patient}
                match={match as Match}
                consultations={(consultations ?? []) as Consultation[]}
                physioId={user.id}
              />
            )
          }
          if (tab === 'onboarding') {
            return <OnboardingTab onboarding={onboarding as OnboardingResponse | null} />
          }
          if (tab === 'programme') {
            return (
              <ProgrammeTab
                patientId={patientId}
                programs={(programs ?? []) as Program[]}
              />
            )
          }
          if (tab === 'progress') {
            return (
              <ProgressTab
                sessionLogs={(sessionLogs ?? []) as SessionLog[]}
                patientId={patientId}
                physioId={user.id}
              />
            )
          }
          if (tab === 'messages') {
            return (
              <MessagesTab
                matchId={match.id}
                physioId={user.id}
                initialMessages={(messages ?? []) as Message[]}
              />
            )
          }
          return null
        }}
      </PatientTabs>
    </div>
  )
}
