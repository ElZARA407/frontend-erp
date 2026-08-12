// src/components/ui/card.tsx
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'min-w-0 overflow-x-auto rounded-lg border border-surface-border bg-white shadow-card [&_table:not([class*="min-w-"])]:min-w-[760px]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col gap-3 border-b border-surface-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('min-w-0 overflow-x-auto p-4 sm:p-5', className)}>
      {children}
    </div>
  )
}
