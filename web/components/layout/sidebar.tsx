'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarDays,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/store/sidebar'
import type { Physiotherapist } from '@/lib/types/database.types'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/availability', label: 'Availability', icon: CalendarDays },
  { href: '/settings', label: 'Settings', icon: Settings },
]

type SidebarProps = {
  physio: Pick<Physiotherapist, 'full_name' | 'profile_photo_url'>
  unreadCount?: number
}

export function Sidebar({ physio, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const { isOpen, close } = useSidebarStore()

  // Close mobile sidebar on route change
  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto lg:transition-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">PhysioConnect</span>
          </Link>
          <button
            onClick={close}
            className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            const isMessages = href === '/messages'
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isMessages && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer — physio info + sign out */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{physio.full_name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">Physiotherapist</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </Link>
        </div>
      </aside>
    </>
  )
}
