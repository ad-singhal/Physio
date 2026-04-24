import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default async function VerificationPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: physio } = await supabase
    .from('physiotherapists')
    .select('verification_status, rejection_reason')
    .eq('id', user.id)
    .single()

  if (physio?.verification_status === 'verified') redirect('/dashboard')

  const status = physio?.verification_status ?? 'pending'
  const reason = physio?.rejection_reason

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">PhysioConnect</h1>
        </div>

        {status === 'pending' && <PendingState />}
        {status === 'rejected' && <RejectedState reason={reason} />}
        {status === 'needs_info' && <NeedsInfoState reason={reason} />}

        <SignOutButton />
      </div>
    </div>
  )
}

function PendingState() {
  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
        <span className="text-3xl">⏳</span>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Application under review</h2>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
        Your application is being reviewed by our team. This typically takes{' '}
        <strong className="text-zinc-700 dark:text-zinc-300">1–2 business days</strong>. You&apos;ll receive
        an email once a decision has been made.
      </p>
      <Alert>
        <AlertDescription className="text-sm">
          Make sure to check your spam folder for any updates from PhysioConnect.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function RejectedState({ reason }: { reason?: string | null }) {
  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
        <span className="text-3xl">✗</span>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Application not approved</h2>
      {reason && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{reason}</AlertDescription>
        </Alert>
      )}
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        You can update your information and resubmit your application below.
      </p>
      <Link href="/register">
        <Button className="w-full">Resubmit application</Button>
      </Link>
    </div>
  )
}

function NeedsInfoState({ reason }: { reason?: string | null }) {
  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30">
        <span className="text-3xl">ℹ️</span>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Additional information required</h2>
      {reason && (
        <Alert>
          <AlertDescription className="text-sm">{reason}</AlertDescription>
        </Alert>
      )}
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        Please update the flagged information and resubmit.
      </p>
      <Link href="/register">
        <Button className="w-full">Update and resubmit</Button>
      </Link>
    </div>
  )
}

function SignOutButton() {
  return (
    <p className="text-center text-sm text-zinc-400">
      Wrong account?{' '}
      <Link href="/api/auth/signout" className="text-blue-600 hover:underline dark:text-blue-400">
        Sign out
      </Link>
    </p>
  )
}
