import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, ClipboardList, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: todayConsultations },
    { count: activePatients },
    { count: patientsAwaitingProgramme },
    { count: unreadMessages },
  ] = await Promise.all([
    supabase
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq('physio_id', user.id)
      .gte('scheduled_at', today + 'T00:00:00')
      .lte('scheduled_at', today + 'T23:59:59')
      .eq('status', 'scheduled'),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('physio_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('physio_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_type', 'patient')
      .is('read_at', null),
  ])

  const summaryCards = [
    {
      title: "Today's Consultations",
      value: todayConsultations ?? 0,
      icon: CalendarDays,
      href: '/patients',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Active Patients',
      value: activePatients ?? 0,
      icon: Users,
      href: '/patients',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/40',
    },
    {
      title: 'Awaiting Programme',
      value: patientsAwaitingProgramme ?? 0,
      icon: ClipboardList,
      href: '/patients',
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Unread Messages',
      value: unreadMessages ?? 0,
      icon: MessageSquare,
      href: '/messages',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:ring-foreground/20 transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground font-medium">{card.title}</CardTitle>
                  <div className={cn('rounded-lg p-2', card.bg)}>
                    <card.icon className={cn('h-4 w-4', card.color)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-foreground">{card.value}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent consultations */}
      <Suspense fallback={<ActivityFeedSkeleton />}>
        <RecentActivity physioId={user.id} />
      </Suspense>
    </div>
  )
}

async function RecentActivity({ physioId }: { physioId: string }) {
  const supabase = await createClient()

  const { data: consultations } = await supabase
    .from('consultations')
    .select('id, scheduled_at, status, consultation_type, patient_id')
    .eq('physio_id', physioId)
    .order('scheduled_at', { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Consultations</CardTitle>
      </CardHeader>
      <CardContent>
        {!consultations || consultations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No consultations yet.</p>
        ) : (
          <ul className="divide-y divide-border -mx-4 px-4">
            {consultations.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Patient {c.patient_id.slice(0, 8)}…
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.scheduled_at).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {c.consultation_type && ` · ${c.consultation_type.replace('_', ' ')}`}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    completed: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  }
  return (
    <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', styles[status] ?? 'bg-muted text-muted-foreground')}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function ActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
