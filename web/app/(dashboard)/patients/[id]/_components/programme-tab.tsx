import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, CheckCircle, Clock } from 'lucide-react'
import type { Program } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

type Props = {
  patientId: string
  programs: Program[]
}

export function ProgrammeTab({ patientId, programs }: Props) {
  const activeProgram = programs.find((p) => p.status === 'published')
  const draftPrograms = programs.filter((p) => p.status === 'draft')

  return (
    <div className="space-y-4">
      {/* Create new programme CTA */}
      <div className="flex justify-end">
        <Link href={`/patients/${patientId}/programme/new`}>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Create Programme
          </Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No programmes yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeProgram && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <CardTitle>{activeProgram.title}</CardTitle>
                  </div>
                  <span className="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                    Published
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ProgramDetail program={activeProgram} />
                <div className="mt-4">
                  <Link href={`/programmes/${activeProgram.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3.5 w-3.5" />
                      Edit Programme
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {draftPrograms.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                    <CardTitle>{p.title}</CardTitle>
                  </div>
                  <span className="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    Draft
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ProgramDetail program={p} />
                <div className="mt-4">
                  <Link href={`/programmes/${p.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3.5 w-3.5" />
                      Continue editing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ProgramDetail({ program: p }: { program: Program }) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {p.description && (
        <div className="col-span-2">
          <dt className="text-muted-foreground">Description</dt>
          <dd className="font-medium text-foreground mt-0.5">{p.description}</dd>
        </div>
      )}
      {p.target_condition && (
        <div>
          <dt className="text-muted-foreground">Target Condition</dt>
          <dd className="font-medium text-foreground mt-0.5">{p.target_condition}</dd>
        </div>
      )}
      <div>
        <dt className="text-muted-foreground">Duration</dt>
        <dd className="font-medium text-foreground mt-0.5">{p.duration_weeks} weeks</dd>
      </div>
      {p.published_at && (
        <div>
          <dt className="text-muted-foreground">Published</dt>
          <dd className="font-medium text-foreground mt-0.5">
            {new Date(p.published_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
          </dd>
        </div>
      )}
    </dl>
  )
}
