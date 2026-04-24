import { createClient } from '@/lib/supabase/server'
import { MessagingInbox } from './_components/messaging-inbox'
import type { Message } from '@/lib/types/database.types'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all matches the physio has
  const { data: matches } = await supabase
    .from('matches')
    .select('id, patient_id, status')
    .eq('physio_id', user.id)
    .eq('status', 'active')

  if (!matches || matches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">No active patient matches yet.</p>
      </div>
    )
  }

  const matchIds = matches.map((m) => m.id)
  const patientIds = matches.map((m) => m.patient_id)

  // Fetch patient names
  const { data: patients } = await supabase
    .from('users')
    .select('id, full_name, profile_photo_url')
    .in('id', patientIds)

  // Fetch latest message per match
  const { data: allMessages } = await supabase
    .from('messages')
    .select('id, match_id, sender_id, sender_type, content, created_at, read_at')
    .in('match_id', matchIds)
    .order('created_at', { ascending: false })

  const patientMap = new Map((patients ?? []).map((p) => [p.id, p]))

  const latestByMatch = new Map<string, Message>()
  const unreadByMatch = new Map<string, number>()

  for (const msg of allMessages ?? []) {
    if (!latestByMatch.has(msg.match_id)) {
      latestByMatch.set(msg.match_id, msg as Message)
    }
    if (msg.sender_type === 'patient' && !msg.read_at) {
      unreadByMatch.set(msg.match_id, (unreadByMatch.get(msg.match_id) ?? 0) + 1)
    }
  }

  const threads = matches.map((match) => {
    const patient = patientMap.get(match.patient_id)
    return {
      matchId: match.id,
      patientId: match.patient_id,
      patientName: patient?.full_name ?? 'Unknown Patient',
      patientPhotoUrl: patient?.profile_photo_url ?? null,
      lastMessage: latestByMatch.get(match.id) ?? null,
      unreadCount: unreadByMatch.get(match.id) ?? 0,
    }
  }).sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
    const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
    return bTime - aTime
  })

  return (
    <MessagingInbox
      threads={threads}
      physioId={user.id}
    />
  )
}
