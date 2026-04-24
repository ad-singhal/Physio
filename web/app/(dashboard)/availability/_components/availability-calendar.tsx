'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AvailabilitySlot } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8am to 8pm
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = []
  const day = startDate.getDay()
  const monday = new Date(startDate)
  monday.setDate(startDate.getDate() - ((day + 6) % 7))
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function formatHour(h: number) {
  return `${h.toString().padStart(2, '0')}:00`
}

type SlotKey = string // "date|hour"

function slotKey(date: string, hour: number): SlotKey {
  return `${date}|${hour}`
}

type Props = {
  physioId: string
  initialSlots: AvailabilitySlot[]
}

export function AvailabilityCalendar({ physioId, initialSlots }: Props) {
  const supabase = createClient()
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date()
    return today
  })

  const weekDates = getWeekDates(weekStart)

  // Build a map: slotKey -> slot
  const [slotMap, setSlotMap] = useState<Map<SlotKey, AvailabilitySlot>>(() => {
    const map = new Map<SlotKey, AvailabilitySlot>()
    for (const slot of initialSlots) {
      const hour = parseInt(slot.start_time.split(':')[0])
      map.set(slotKey(slot.date, hour), slot)
    }
    return map
  })

  const [pending, setPending] = useState<Set<SlotKey>>(new Set())
  const [error, setError] = useState<string | null>(null)

  function prevWeek() {
    setWeekStart((d) => {
      const next = new Date(d)
      next.setDate(d.getDate() - 7)
      return next
    })
  }

  function nextWeek() {
    setWeekStart((d) => {
      const next = new Date(d)
      next.setDate(d.getDate() + 7)
      return next
    })
  }

  async function toggleSlot(date: Date, hour: number) {
    const dateStr = formatDate(date)
    const key = slotKey(dateStr, hour)

    if (pending.has(key)) return

    setPending((p) => new Set([...p, key]))
    setError(null)

    const existing = slotMap.get(key)

    if (!existing) {
      // Create as available
      const { data: newSlot, error: err } = await supabase
        .from('availability_slots')
        .insert({
          physio_id: physioId,
          date: dateStr,
          start_time: formatHour(hour),
          end_time: formatHour(hour + 1),
          status: 'available',
        })
        .select('id, physio_id, date, start_time, end_time, status')
        .single()

      if (err || !newSlot) {
        setError('Failed to save — slot not marked. Please try again.')
      } else {
        setSlotMap((m) => new Map(m).set(key, newSlot as AvailabilitySlot))
      }
    } else if (existing.status === 'available') {
      // Toggle to blocked
      const { error: err } = await supabase
        .from('availability_slots')
        .update({ status: 'blocked' })
        .eq('id', existing.id)

      if (err) {
        setError('Failed to block slot. Please try again.')
      } else {
        setSlotMap((m) => {
          const next = new Map(m)
          next.set(key, { ...existing, status: 'blocked' })
          return next
        })
      }
    } else if (existing.status === 'blocked') {
      // Remove slot
      const { error: err } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', existing.id)

      if (err) {
        setError('Failed to remove slot. Please try again.')
      } else {
        setSlotMap((m) => {
          const next = new Map(m)
          next.delete(key)
          return next
        })
      }
    }
    // If booked — don't allow toggle

    setPending((p) => {
      const next = new Set(p)
      next.delete(key)
      return next
    })
  }

  const weekLabel = `${weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div className="space-y-3">
      {/* Week navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={prevWeek}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground min-w-48 text-center">{weekLabel}</span>
        <button
          onClick={nextWeek}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
          Blocked
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-200 dark:bg-blue-900" />
          Booked
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-14 py-2 pl-2 text-left font-medium text-muted-foreground">Time</th>
              {weekDates.map((date, i) => {
                const isToday = formatDate(date) === formatDate(new Date())
                return (
                  <th
                    key={i}
                    className={cn(
                      'py-2 text-center font-medium',
                      isToday ? 'text-blue-600' : 'text-muted-foreground'
                    )}
                  >
                    <span className="block">{DAYS_OF_WEEK[i]}</span>
                    <span className={cn('block text-sm', isToday && 'font-bold')}>
                      {date.getDate()}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {HOURS.map((hour) => (
              <tr key={hour} className="divide-x divide-border">
                <td className="py-2 pl-2 text-muted-foreground">{formatHour(hour)}</td>
                {weekDates.map((date, di) => {
                  const dateStr = formatDate(date)
                  const key = slotKey(dateStr, hour)
                  const slot = slotMap.get(key)
                  const isPending = pending.has(key)
                  const isPast = date < new Date(new Date().setHours(hour + 1, 0, 0, 0))

                  const cellStyle = slot?.status === 'available'
                    ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400'
                    : slot?.status === 'blocked'
                    ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500'
                    : slot?.status === 'booked'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-not-allowed'
                    : 'hover:bg-muted/40'

                  return (
                    <td key={di} className="p-0">
                      <button
                        onClick={() => !isPast && slot?.status !== 'booked' && toggleSlot(date, hour)}
                        disabled={isPast || slot?.status === 'booked' || isPending}
                        className={cn(
                          'h-9 w-full transition-colors',
                          cellStyle,
                          isPast && 'opacity-30 cursor-not-allowed',
                          isPending && 'opacity-50 cursor-wait'
                        )}
                        aria-label={`${formatHour(hour)} on ${dateStr} — ${slot?.status ?? 'empty'}`}
                      >
                        {slot?.status === 'available' && (
                          <span className="text-[10px] font-medium">✓</span>
                        )}
                        {slot?.status === 'booked' && (
                          <span className="text-[10px] font-medium">Booked</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
