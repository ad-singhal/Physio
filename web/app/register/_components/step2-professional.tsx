'use client'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  SPECIALISATIONS, MODALITIES, MODES, LANGUAGES,
  VOLUME_BUCKETS, INDIAN_STATES, deriveExperienceTier, EXPERIENCE_TIER_LABELS,
} from '@/lib/constants/registration'

const conditionSchema = z.object({
  condition: z.string().min(1, 'Condition name is required'),
  volume_bucket: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional(),
})

const schema = z.object({
  specialisations: z.array(z.string()).min(1, 'Select at least one specialisation'),
  modalities: z.array(z.string()).min(1, 'Select at least one modality'),
  modes: z.array(z.string()).min(1, 'Select at least one consultation mode'),
  years_experience: z.number({ error: 'Enter a number' }).min(0).max(50),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  location_city: z.string().min(1, 'City is required'),
  location_postcode: z.string().min(1, 'Postcode is required'),
  iap_member: z.boolean(),
  affiliation_name: z.string().optional(),
  state_council_state: z.string().min(1, 'State is required'),
  state_council_number: z.string().min(1, 'Registration number is required'),
  conditions_treated: z.array(conditionSchema).min(1, 'Add at least one condition you treat'),
})

export type Step2Values = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Step2Values>
  onNext: (values: Step2Values) => void
  onBack: () => void
}

function ToggleChips({
  options,
  value,
  onChange,
  error,
}: {
  options: readonly { value: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              value.includes(o.value)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Step2Professional({ defaultValues, onNext, onBack }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      specialisations: [],
      modalities: [],
      modes: [],
      languages: [],
      conditions_treated: [],
      iap_member: false,
      years_experience: 0,
      ...defaultValues,
    },
  })

  const { fields: conditionFields, append: appendCondition, remove: removeCondition } = useFieldArray({
    control,
    name: 'conditions_treated',
  })

  const yearsExp = watch('years_experience')
  const tier = deriveExperienceTier(Number(yearsExp) || 0)

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">

      {/* Specialisations */}
      <div className="space-y-2">
        <Label>Specialisations <span className="text-red-500">*</span></Label>
        <Controller
          control={control}
          name="specialisations"
          render={({ field }) => (
            <ToggleChips
              options={SPECIALISATIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.specialisations?.message}
            />
          )}
        />
      </div>

      <Separator />

      {/* Modalities */}
      <div className="space-y-2">
        <Label>Modalities <span className="text-red-500">*</span></Label>
        <Controller
          control={control}
          name="modalities"
          render={({ field }) => (
            <ToggleChips
              options={MODALITIES}
              value={field.value}
              onChange={field.onChange}
              error={errors.modalities?.message}
            />
          )}
        />
      </div>

      <Separator />

      {/* Consultation Modes */}
      <div className="space-y-2">
        <Label>Consultation Modes <span className="text-red-500">*</span></Label>
        <Controller
          control={control}
          name="modes"
          render={({ field }) => (
            <ToggleChips
              options={MODES}
              value={field.value}
              onChange={field.onChange}
              error={errors.modes?.message}
            />
          )}
        />
      </div>

      <Separator />

      {/* Experience */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="years_experience">Years of Experience</Label>
          <Input id="years_experience" type="number" min={0} max={50} {...register('years_experience', { valueAsNumber: true })} />
          {errors.years_experience && (
            <p className="text-xs text-red-500">{errors.years_experience.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Experience Tier</Label>
          <div className="flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
            {EXPERIENCE_TIER_LABELS[tier]}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio <span className="text-red-500">*</span></Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder="Describe your clinical experience, approach, and what patients can expect working with you..."
          {...register('bio')}
        />
        {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      <Separator />

      {/* Languages */}
      <div className="space-y-2">
        <Label>Languages Spoken <span className="text-red-500">*</span></Label>
        <Controller
          control={control}
          name="languages"
          render={({ field }) => (
            <ToggleChips
              options={LANGUAGES.map((l) => ({ value: l, label: l }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.languages?.message}
            />
          )}
        />
      </div>

      <Separator />

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="location_city">City <span className="text-red-500">*</span></Label>
          <Input id="location_city" placeholder="Mumbai" {...register('location_city')} />
          {errors.location_city && <p className="text-xs text-red-500">{errors.location_city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location_postcode">Postcode <span className="text-red-500">*</span></Label>
          <Input id="location_postcode" placeholder="400001" {...register('location_postcode')} />
          {errors.location_postcode && <p className="text-xs text-red-500">{errors.location_postcode.message}</p>}
        </div>
      </div>

      <Separator />

      {/* Affiliation & Council */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="iap_member"
            render={({ field }) => (
              <Checkbox
                id="iap_member"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="iap_member" className="cursor-pointer">
            IAP Member (Indian Association of Physiotherapists)
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="affiliation_name">Affiliated Hospital / Clinic</Label>
          <Input id="affiliation_name" placeholder="e.g. Apollo Hospital (optional)" {...register('affiliation_name')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="state_council_state">State Council State <span className="text-red-500">*</span></Label>
            <select
              id="state_council_state"
              {...register('state_council_state')}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state_council_state && <p className="text-xs text-red-500">{errors.state_council_state.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state_council_number">Registration Number <span className="text-red-500">*</span></Label>
            <Input id="state_council_number" placeholder="e.g. MH-PT-12345" {...register('state_council_number')} />
            {errors.state_council_number && <p className="text-xs text-red-500">{errors.state_council_number.message}</p>}
          </div>
        </div>
      </div>

      <Separator />

      {/* Conditions Treated */}
      <div className="space-y-3">
        <div>
          <Label>Conditions Treated <span className="text-red-500">*</span></Label>
          <p className="text-xs text-zinc-500 mt-0.5">Add conditions you have clinical experience treating.</p>
        </div>

        {conditionFields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1.5">
                <Input
                  placeholder="e.g. ACL tear, frozen shoulder"
                  {...register(`conditions_treated.${index}.condition`)}
                />
                {errors.conditions_treated?.[index]?.condition && (
                  <p className="text-xs text-red-500">{errors.conditions_treated[index]?.condition?.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeCondition(index)}
                className="mt-1 text-zinc-400 hover:text-red-500 transition-colors text-lg leading-none"
                aria-label="Remove condition"
              >
                ×
              </button>
            </div>
            <div className="flex gap-2">
              {VOLUME_BUCKETS.map((vb) => (
                <label key={vb.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    value={vb.value}
                    {...register(`conditions_treated.${index}.volume_bucket`)}
                    className="accent-blue-600"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{vb.label}</span>
                </label>
              ))}
            </div>
            <Input
              placeholder="Optional notes"
              className="text-sm"
              {...register(`conditions_treated.${index}.notes`)}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendCondition({ condition: '', volume_bucket: 'medium', notes: '' })}
        >
          + Add condition
        </Button>
        {errors.conditions_treated?.message && (
          <p className="text-xs text-red-500">{errors.conditions_treated.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
