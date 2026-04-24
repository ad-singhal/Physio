import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Patient, Match, Consultation } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

type Props = {
  patient: Patient
  match: Match
  consultations: Consultation[]
  physioId: string
}

export function OverviewTab({ patient, match, consultations }: Props) {
  const nextConsultation = consultations.find((c) => c.status === 'scheduled')
  const pastConsultations = consultations.filter((c) => c.status === 'completed')

  return (
    <div className="space-y-4">
      {/* Patient info card */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Full Name</dt>
              <dd className="font-medium text-foreground mt-0.5">{patient.full_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground mt-0.5">{patient.email}</dd>
            </div>
            {patient.phone && (
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium text-foreground mt-0.5">{patient.phone}</dd>
              </div>
            )}
            {patient.date_of_birth && (
              <div>
                <dt className="text-muted-foreground">Date of Birth</dt>
                <dd className="font-medium text-foreground mt-0.5">
                  {new Date(patient.date_of_birth).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                </dd>
              </div>
            )}
            {patient.gender && (
              <div>
                <dt className="text-muted-foreground">Gender</dt>
                <dd className="font-medium text-foreground mt-0.5 capitalize">{patient.gender}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {new Date(patient.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Upcoming consultation */}
      {nextConsultation && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsultationCard consultation={nextConsultation} />
          </CardContent>
        </Card>
      )}

      {/* Past consultations */}
      {pastConsultations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border -mx-4 px-4">
              {pastConsultations.map((c) => (
                <li key={c.id} className="py-3">
                  <ConsultationCard consultation={c} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ConsultationCard({ consultation: c }: { consultation: Consultation }) {
  const statusStyles: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    completed: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  }
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          {new Date(c.scheduled_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        {c.consultation_type && (
          <p className="text-xs text-muted-foreground capitalize mt-0.5">
            {c.consultation_type.replace('_', ' ')}
          </p>
        )}
      </div>
      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0', statusStyles[c.status] ?? 'bg-muted text-muted-foreground')}>
        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
      </span>
    </div>
  )
}
