'use client'

import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'
import { useSidebarStore } from '@/lib/store/sidebar'
import type { Physiotherapist } from '@/lib/types/database.types'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/messages': 'Messages',
  '/availability': 'Availability',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  if (pathname in PAGE_TITLES) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/patients/') && pathname.includes('/programme')) return 'Programme Builder'
  if (pathname.startsWith('/patients/')) return 'Patient Profile'
  if (pathname.startsWith('/programmes/')) return 'Programme Builder'
  return 'PhysioConnect'
}

type TopBarProps = {
  physio: Pick<Physiotherapist, 'full_name' | 'profile_photo_url'>
}

export function TopBar({ physio }: TopBarProps) {
  const pathname = usePathname()
  const toggle = useSidebarStore((s) => s.toggle)
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggle}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Avatar shortcut */}
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
          {physio.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={physio.profile_photo_url}
              alt={physio.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-xs">
              {physio.full_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
