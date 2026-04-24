import { createClient } from '@/lib/supabase/server'
import { AvailabilityCalendar } from './_components/availability-calendar'
import type { AvailabilitySlot } from '@/lib/types/database.types'

export default async function AvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Load slots for the next 4 weeks
  const today = new Date()
  const fourWeeksOut = new Date(today)
  fourWeeksOut.setDate(today.getDate() + 28)

  const { data: slots } = await supabase
    .from('availability_slots')
    .select('id, physio_id, date, start_time, end_time, status')
    .eq('physio_id', user.id)
    .gte('date', today.toISOString().split('T')[0])
    .lte('date', fourWeeksOut.toISOString().split('T')[0])
    .order('date')
    .order('start_time')

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Availability</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Click a time slot to mark it as available or blocked. Available slots appear in the iOS booking screen.
        </p>
      </div>
      <AvailabilityCalendar physioId={user.id} initialSlots={(slots ?? []) as AvailabilitySlot[]} />
    </div>
  )
}
