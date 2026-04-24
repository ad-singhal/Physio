import { createClient } from '@/lib/supabase/server'
import { PatientTable, type PatientRow } from './_components/patient-table'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch matches with patient data
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, patient_id, status')
    .eq('physio_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !matches) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Patients</h2>
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">Failed to load patients. Please refresh.</p>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Patients</h2>
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No patients assigned yet. Patients will appear here once matched.</p>
        </div>
      </div>
    )
  }

  const patientIds = matches.map((m) => m.patient_id)

  // Fetch patient profiles
  const { data: patients } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', patientIds)

  // Fetch latest session logs for pain trend and last session
  const { data: sessionLogs } = await supabase
    .from('session_logs')
    .select('patient_id, completed_at, pain_score_before, pain_score_after')
    .in('patient_id', patientIds)
    .order('completed_at', { ascending: false })

  // Fetch unread message counts per patient
  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('match_id')
    .in('match_id', matches.map((m) => m.id))
    .eq('sender_type', 'patient')
    .is('read_at', null)

  // Build patient rows
  const patientMap = new Map((patients ?? []).map((p) => [p.id, p]))

  const unreadByMatch = new Map<string, number>()
  for (const msg of unreadMessages ?? []) {
    unreadByMatch.set(msg.match_id, (unreadByMatch.get(msg.match_id) ?? 0) + 1)
  }

  const sessionsByPatient = new Map<string, typeof sessionLogs>()
  for (const log of sessionLogs ?? []) {
    if (!sessionsByPatient.has(log.patient_id)) {
      sessionsByPatient.set(log.patient_id, [])
    }
    sessionsByPatient.get(log.patient_id)!.push(log)
  }

  function derivePainTrend(logs: typeof sessionLogs): PatientRow['painTrend'] {
    if (!logs || logs.length < 2) return null
    const recent = logs.slice(0, 3)
    const avg = (arr: (number | null)[]) =>
      arr.filter((x): x is number => x !== null).reduce((a, b) => a + b, 0) / (arr.filter((x): x is number => x !== null).length || 1)
    const recentAvg = avg(recent.map((l) => l.pain_score_after))
    const olderAvg = avg(logs.slice(3, 6).map((l) => l.pain_score_after))
    if (olderAvg === 0) return 'stable'
    const delta = recentAvg - olderAvg
    if (delta < -0.5) return 'improving'
    if (delta > 0.5) return 'worsening'
    return 'stable'
  }

  const rows: PatientRow[] = matches.map((match) => {
    const patient = patientMap.get(match.patient_id)
    const logs = sessionsByPatient.get(match.patient_id)
    const lastLog = logs?.[0]
    return {
      matchId: match.id,
      patientId: match.patient_id,
      patientName: patient?.full_name ?? `Patient ${match.patient_id.slice(0, 6)}`,
      programmeStatus: match.status === 'active' ? 'active' : match.status === 'completed' ? 'completed' : 'awaiting_programme',
      lastSessionDate: lastLog?.completed_at ?? null,
      painTrend: derivePainTrend(logs ?? []),
      unreadMessages: unreadByMatch.get(match.id) ?? 0,
    }
  })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Patients</h2>
      <PatientTable patients={rows} />
    </div>
  )
}
