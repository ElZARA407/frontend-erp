// src/components/ui/table-scroll.tsx
import { cn } from '@/lib/utils'

interface TableScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  minWidth?: string
}

export function TableScroll({
  minWidth = '760px',
  className,
  children,
  style,
  ...props
}: TableScrollProps) {
  return (
    <div
      {...props}
      style={{ '--table-min-width': minWidth, ...style } as React.CSSProperties}
      className={cn(
        'min-w-0 overflow-x-auto',
        '[&_table]:min-w-[var(--table-min-width)]',
        className
      )}
    >
      {children}
    </div>
  )
}