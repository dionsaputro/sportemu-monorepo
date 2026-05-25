import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-sky-700 text-white shadow-sm hover:bg-sky-800': variant === 'primary',
            'border border-slate-200 text-slate-700 hover:bg-slate-50': variant === 'secondary',
            'text-slate-600 hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
          },
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
