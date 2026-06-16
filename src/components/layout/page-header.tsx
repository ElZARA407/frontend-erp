// src/components/layout/page-header.tsx
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title:     string
  subtitle?: string
  actions?:  React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div>
        <h1 className="text-xl font-semibold text-steel-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-steel-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}