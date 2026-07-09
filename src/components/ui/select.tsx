import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string | number; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className, id, ...props },
  ref,
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-steel-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        id={selectId}
        className={cn(
          'h-9 w-full rounded-md border border-surface-border bg-white px-3 text-sm',
          'focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-400',
          className,
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})