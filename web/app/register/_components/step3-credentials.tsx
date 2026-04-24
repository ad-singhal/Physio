'use client'

import { useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

const currentYear = new Date().getFullYear()

const certSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  year: z.number({ error: 'Enter a year' }).min(1960).max(currentYear, `Year can't be in the future`),
})

const schema = z.object({
  bpt_university: z.string().min(1, 'University is required'),
  bpt_year: z.number({ error: 'Enter a year' }).min(1960).max(currentYear, `Year can't be in the future`),
  mpt_specialisation: z.string().optional(),
  mpt_university: z.string().optional(),
  mpt_year: z.number({ error: 'Enter a year' }).min(1960).max(currentYear).optional(),
  additional_certifications: z.array(certSchema),
})

export type Step3Values = z.infer<typeof schema>

export interface Step3Files {
  bpt_doc: File | null
  mpt_doc: File | null
  cert_docs: (File | null)[]
}

interface Props {
  defaultValues?: Partial<Step3Values>
  onSubmit: (values: Step3Values, files: Step3Files) => void
  onBack: () => void
  error?: string | null
  loading?: boolean
}

function FilePickerButton({
  label,
  file,
  onChange,
  required,
}: {
  label: string
  file: File | null
  onChange: (f: File | null) => void
  required?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
        >
          {file ? '📄 ' + file.name : 'Choose file'}
        </button>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-zinc-400 hover:text-red-500"
          >
            Remove
          </button>
        )}
        <input
          ref={ref}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {required && !file && (
        <p className="text-xs text-zinc-400">PDF, JPG, or PNG accepted.</p>
      )}
    </div>
  )
}

export function Step3Credentials({ defaultValues, onSubmit, onBack, error, loading }: Props) {
  const [bptDoc, setBptDoc] = useState<File | null>(null)
  const [mptDoc, setMptDoc] = useState<File | null>(null)
  const [certDocs, setCertDocs] = useState<(File | null)[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(schema),
    defaultValues: { additional_certifications: [], ...defaultValues },
  })

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control,
    name: 'additional_certifications',
  })

  const mptSpecialisation = watch('mpt_specialisation')

  function handleAddCert() {
    appendCert({ name: '', issuer: '', year: currentYear })
    setCertDocs((prev) => [...prev, null])
  }

  function handleRemoveCert(index: number) {
    removeCert(index)
    setCertDocs((prev) => prev.filter((_, i) => i !== index))
  }

  function handleCertDoc(index: number, file: File | null) {
    setCertDocs((prev) => {
      const next = [...prev]
      next[index] = file
      return next
    })
  }

  function onFormSubmit(values: Step3Values) {
    if (!bptDoc) {
      setFileError('BPT certificate is required.')
      return
    }
    setFileError(null)
    onSubmit(values, { bpt_doc: bptDoc, mpt_doc: mptDoc, cert_docs: certDocs })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {(error || fileError) && (
        <Alert variant="destructive">
          <AlertDescription>{error ?? fileError}</AlertDescription>
        </Alert>
      )}

      {/* BPT */}
      <div className="space-y-3">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
          Bachelor of Physiotherapy (BPT) <span className="text-red-500">*</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bpt_university">University <span className="text-red-500">*</span></Label>
            <Input id="bpt_university" placeholder="e.g. University of Mumbai" {...register('bpt_university')} />
            {errors.bpt_university && <p className="text-xs text-red-500">{errors.bpt_university.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bpt_year">Year of Completion <span className="text-red-500">*</span></Label>
            <Input id="bpt_year" type="number" min={1960} max={currentYear} {...register('bpt_year', { valueAsNumber: true })} />
            {errors.bpt_year && <p className="text-xs text-red-500">{errors.bpt_year.message}</p>}
          </div>
        </div>
        <FilePickerButton label="BPT Certificate" file={bptDoc} onChange={setBptDoc} required />
      </div>

      <Separator />

      {/* MPT */}
      <div className="space-y-3">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
          Master of Physiotherapy (MPT){' '}
          <span className="text-xs font-normal text-zinc-400">optional</span>
        </h3>
        <div className="space-y-1.5">
          <Label htmlFor="mpt_specialisation">Specialisation</Label>
          <Input id="mpt_specialisation" placeholder="e.g. Orthopaedics, Neurology" {...register('mpt_specialisation')} />
        </div>
        {mptSpecialisation && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mpt_university">University</Label>
              <Input id="mpt_university" placeholder="University name" {...register('mpt_university')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mpt_year">Year of Completion</Label>
              <Input id="mpt_year" type="number" min={1960} max={currentYear} {...register('mpt_year', { valueAsNumber: true })} />
            </div>
          </div>
        )}
        {mptSpecialisation && (
          <FilePickerButton label="MPT Certificate" file={mptDoc} onChange={setMptDoc} />
        )}
      </div>

      <Separator />

      {/* Additional Certifications */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Additional Certifications</h3>
          <p className="text-xs text-zinc-500 mt-0.5">McKenzie, DNS, Mulligan, etc. — optional</p>
        </div>

        {certFields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Certification {index + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveCert(index)}
                className="text-zinc-400 hover:text-red-500 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. McKenzie Method" {...register(`additional_certifications.${index}.name`)} />
                {errors.additional_certifications?.[index]?.name && (
                  <p className="text-xs text-red-500">{errors.additional_certifications[index]?.name?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Issuer <span className="text-red-500">*</span></Label>
                <Input placeholder="Issuing body" {...register(`additional_certifications.${index}.issuer`)} />
                {errors.additional_certifications?.[index]?.issuer && (
                  <p className="text-xs text-red-500">{errors.additional_certifications[index]?.issuer?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Year <span className="text-red-500">*</span></Label>
                <Input type="number" min={1960} max={currentYear} {...register(`additional_certifications.${index}.year`, { valueAsNumber: true })} />
                {errors.additional_certifications?.[index]?.year && (
                  <p className="text-xs text-red-500">{errors.additional_certifications[index]?.year?.message}</p>
                )}
              </div>
            </div>
            <FilePickerButton
              label="Certificate Document"
              file={certDocs[index] ?? null}
              onChange={(f) => handleCertDoc(index, f)}
            />
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={handleAddCert}>
          + Add certification
        </Button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit application'}
        </Button>
      </div>
    </form>
  )
}
