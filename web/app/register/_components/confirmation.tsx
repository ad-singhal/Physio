import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Confirmation() {
  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
        <span className="text-3xl">✓</span>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Application submitted!</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Your application is now under review. Our team typically responds within{' '}
        <strong className="text-zinc-700 dark:text-zinc-300">1–2 business days</strong>. You&apos;ll
        receive an email once a decision has been made.
      </p>
      <Link href="/">
        <Button className="w-full">Back to sign in</Button>
      </Link>
    </div>
  )
}
