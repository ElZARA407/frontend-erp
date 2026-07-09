// src/components/ui/dialog.tsx
'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  wide: 'max-w-7xl',
}

export function Dialog({ open, onClose, title, children, size = 'md' }: DialogProps) {
  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-steel-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl border border-surface-border bg-white shadow-xl',
          sizes[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="text-base font-semibold text-steel-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-steel-400 transition-colors hover:bg-surface-subtle hover:text-steel-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}