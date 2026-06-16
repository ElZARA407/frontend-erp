// src/components/ui/stat-card.tsx
import { cn, formatMGA } from '@/lib/utils'
import { Card } from './card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label:     string
  value:     string | number
  isMoney?:  boolean
  trend?:    number
  icon?:     React.ReactNode
  accent?:   'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const accentMap = {
  primary: 'bg-steel-700  text-white',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500   text-white',
  danger:  'bg-red-600     text-white',
}

export function StatCard({ label, value, isMoney, trend, icon, accent = 'primary', className }: StatCardProps) {
  const displayed = isMoney && typeof value === 'number' ? formatMGA(value) : value

  return (
    <Card className={cn('flex items-stretch overflow-hidden', className)}>
      {icon && (
        <div className={cn('flex w-14 items-center justify-center text-lg', accentMap[accent])}>
          {icon}
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center px-4 py-3.5">
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-steel-900">{displayed}</p>
        {trend !== undefined && (
          <p className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            trend > 0 && 'text-emerald-600',
            trend < 0 && 'text-red-600',
            trend === 0 && 'text-steel-400',
          )}>
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> :
             trend < 0 ? <TrendingDown className="h-3 w-3" /> :
                         <Minus className="h-3 w-3" />}
            {Math.abs(trend)}% ce mois
          </p>
        )}
      </div>
    </Card>
  )
}