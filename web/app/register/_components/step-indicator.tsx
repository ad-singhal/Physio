import { cn } from '@/lib/utils'

const STEPS = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Professional Info' },
  { number: 3, label: 'Credentials' },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                current === step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : current > step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-zinc-300 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-600'
              )}
            >
              {current > step.number ? '✓' : step.number}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                current >= step.number ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
              )}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-16 mx-1 mb-4 transition-colors',
                current > step.number ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
