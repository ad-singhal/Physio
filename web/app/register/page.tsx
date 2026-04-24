import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Apply to Join</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Registration is coming soon. Check back shortly.
        </p>
        <Link href="/">
          <Button variant="outline" className="w-full">Back to sign in</Button>
        </Link>
      </div>
    </div>
  )
}
