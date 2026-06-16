// src/components/ui/badge.tsx
import { cn, type BadgeVariant } from '@/lib/utils'

const variantStyles: Record<BadgeVariant | 'default', string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  warning: 'bg-amber-50  text-amber-700  ring-amber-200/60',
  danger:  'bg-red-50    text-red-700    ring-red-200/60',
  info:    'bg-blue-50   text-blue-700   ring-blue-200/60',
  muted:   'bg-slate-50  text-slate-500  ring-slate-200/60',
  default: 'bg-steel-50  text-steel-600  ring-steel-200/60',
}

interface BadgeProps {
  variant?: BadgeVariant | 'default'
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded px-2 py-0.5',
      'text-2xs font-semibold uppercase tracking-wide ring-1',
      variantStyles[variant],
      className,
    )}>
      {dot && (
        <span className={cn(
          'h-1.5 w-1.5 rounded-full',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger'  && 'bg-red-500',
          variant === 'info'    && 'bg-blue-500',
          variant === 'muted'   && 'bg-slate-400',
          variant === 'default' && 'bg-steel-500',
        )} />
      )}
      {children}
    </span>
  )
}