'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, TrendingDown, Minus, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type PatientRow = {
  matchId: string
  patientId: string
  patientName: string
  programmeStatus: 'active' | 'awaiting_programme' | 'completed' | null
  lastSessionDate: string | null
  painTrend: 'improving' | 'worsening' | 'stable' | null
  unreadMessages: number
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  awaiting_programme: 'Awaiting Programme',
  completed: 'Completed',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  awaiting_programme: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  completed: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All patients' },
  { value: 'active', label: 'Active' },
  { value: 'awaiting_programme', label: 'Awaiting Programme' },
  { value: 'completed', label: 'Completed' },
]

function PainTrendIcon({ trend }: { trend: PatientRow['painTrend'] }) {
  if (trend === 'improving') return <TrendingDown className="h-4 w-4 text-green-600" aria-label="Improving" />
  if (trend === 'worsening') return <TrendingUp className="h-4 w-4 text-red-600" aria-label="Worsening" />
  return <Minus className="h-4 w-4 text-zinc-400" aria-label="Stable" />
}

export function PatientTable({ patients }: { patients: PatientRow[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch = p.patientName.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all' || p.programmeStatus === filter
      return matchesSearch && matchesFilter
    })
  }, [patients, search, filter])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search patients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                filter === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No patients match your search.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Last Session</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Pain</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Messages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr
                  key={p.matchId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/patients/${p.patientId}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {p.patientName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.programmeStatus ? (
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_STYLES[p.programmeStatus]
                        )}
                      >
                        {STATUS_LABELS[p.programmeStatus]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {p.lastSessionDate
                      ? new Date(p.lastSessionDate).toLocaleDateString('en-GB', { dateStyle: 'medium' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-center">
                    <div className="flex justify-center">
                      <PainTrendIcon trend={p.painTrend} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.unreadMessages > 0 ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                        {p.unreadMessages}
                      </span>
                    ) : (
                      <MessageSquare className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {patients.length} patients
      </p>
    </div>
  )
}
