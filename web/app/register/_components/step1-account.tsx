'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

export type Step1Values = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Step1Values>
  onNext: (values: Step1Values) => void
  error?: string | null
  loading?: boolean
}

export function Step1Account({ defaultValues, onNext, error, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" placeholder="Dr. Jane Smith" {...register('full_name')} />
        {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        <p className="text-xs text-zinc-400">Min 8 chars, one uppercase letter, one number.</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Continue'}
      </Button>
    </form>
  )
}
