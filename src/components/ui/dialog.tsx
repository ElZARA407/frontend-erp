// src/components/ui/dialog.tsx
'use client'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface DialogProps {
  open:     boolean
  onClose:  () => void
  title:    string
  children: React.ReactNode
  size?:    'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Dialog({ open, onClose, title, children, size = 'md' }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-steel-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative z-10 w-full rounded-xl border border-surface-border bg-white shadow-xl',
        sizes[size],
      )}>
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="text-base font-semibold text-steel-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-steel-400 hover:bg-surface-subtle hover:text-steel-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}