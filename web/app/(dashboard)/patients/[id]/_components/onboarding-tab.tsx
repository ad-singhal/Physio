import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OnboardingResponse } from '@/lib/types/database.types'

type Props = {
  onboarding: OnboardingResponse | null
}

export function OnboardingTab({ onboarding }: Props) {
  if (!onboarding) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">No onboarding data submitted yet.</p>
      </div>
    )
  }

  const generalInfo = onboarding.general_info as Record<string, unknown>
  const healthProfile = onboarding.health_profile as Record<string, unknown>
  const painProfile = onboarding.pain_profile as Record<string, unknown>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent>
          <JsonDisplay data={generalInfo} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Health Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <JsonDisplay data={healthProfile} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pain Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <JsonDisplay data={painProfile} />
        </CardContent>
      </Card>
    </div>
  )
}

function JsonDisplay({ data }: { data: Record<string, unknown> }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-muted-foreground">No data.</p>
  }

  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <dt className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
          <dd className="font-medium text-foreground mt-0.5">
            {Array.isArray(value) ? value.join(', ') : String(value ?? '—')}
          </dd>
        </div>
      ))}
    </dl>
  )
}
