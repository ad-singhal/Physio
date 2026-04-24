'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'programme', label: 'Programme' },
  { id: 'progress', label: 'Progress' },
  { id: 'messages', label: 'Messages' },
] as const

type TabId = (typeof TABS)[number]['id']

type Props = {
  children: (tab: TabId) => React.ReactNode
  defaultTab?: TabId
}

export function PatientTabs({ children, defaultTab = 'overview' }: Props) {
  const [active, setActive] = useState<TabId>(defaultTab)

  return (
    <div className="space-y-4">
      {/* Tab list */}
      <div className="flex gap-0.5 rounded-lg bg-muted p-1 w-full overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              active === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {children(active)}
    </div>
  )
}
