// src/components/ui/button.tsx
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const base = 'inline-flex items-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel-500/40 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary:   'bg-steel-700 text-white hover:bg-steel-800 shadow-sm',
  secondary: 'bg-steel-100 text-steel-700 hover:bg-steel-200',
  outline:   'border border-surface-border bg-white text-steel-700 hover:bg-surface-subtle',
  ghost:     'text-steel-600 hover:bg-surface-subtle hover:text-steel-800',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
}

const sizes = {
  sm: 'h-7  px-2.5 text-xs',
  md: 'h-9  px-4   text-sm',
  lg: 'h-10 px-5   text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {children}
    </button>
  )
}