'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { SessionLog } from '@/lib/types/database.types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  sessionLogs: SessionLog[]
  patientId: string
  physioId: string
}

export function ProgressTab({ sessionLogs }: Props) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (sessionLogs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">No session data yet. Data will appear once the patient logs sessions.</p>
      </div>
    )
  }

  // Sort by date ascending for charts
  const sorted = [...sessionLogs].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  )

  const painData = sorted
    .filter((s) => s.pain_score_after !== null)
    .map((s) => ({
      date: new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      score: s.pain_score_after,
    }))

  // Aggregate sessions per week
  const weekMap = new Map<string, number>()
  for (const s of sorted) {
    const date = new Date(s.completed_at)
    const week = `W${getWeekNumber(date)}`
    weekMap.set(week, (weekMap.get(week) ?? 0) + 1)
  }
  const weekData = Array.from(weekMap.entries()).map(([week, sessions]) => ({ week, sessions }))

  const completionRate =
    sessionLogs.length > 0
      ? Math.round((sessionLogs.filter((s) => s.pain_score_after !== null).length / sessionLogs.length) * 100)
      : 0

  async function handleSaveNote() {
    if (!note.trim()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Sessions" value={sessionLogs.length} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} />
        <StatCard
          label="Avg Pain (after)"
          value={
            painData.length > 0
              ? (painData.reduce((a, b) => a + (b.score ?? 0), 0) / painData.length).toFixed(1)
              : '—'
          }
        />
      </div>

      {/* Pain score trend */}
      {painData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pain Score Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={painData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v}/10`, 'Pain']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sessions per week */}
      {weekData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessions Per Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="sessions" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Physio notes */}
      <Card>
        <CardHeader>
          <CardTitle>Add Progress Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Write a note visible to the patient…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSaveNote} disabled={saving || !note.trim()}>
              {saving ? 'Saving…' : 'Save Note'}
            </Button>
            {saved && <span className="text-xs text-green-600">Saved!</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card size="sm">
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
