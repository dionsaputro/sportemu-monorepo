import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
