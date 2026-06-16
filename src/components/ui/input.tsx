// src/components/ui/input.tsx
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-steel-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-steel-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-md border border-surface-border bg-white px-3 text-sm',
            'placeholder:text-steel-400 transition-colors',
            'focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30',
            'disabled:cursor-not-allowed disabled:opacity-60',
            icon && 'pl-9',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}