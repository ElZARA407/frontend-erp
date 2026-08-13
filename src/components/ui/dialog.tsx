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
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
  wide: 'sm:max-w-7xl',
}

export function Dialog({ open, onClose, title, children, size = 'md' }: DialogProps) {
  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-steel-950/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={cn(
          'relative z-10 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] min-w-0 flex-col overflow-hidden rounded-xl border border-surface-border bg-white shadow-xl sm:max-h-[92dvh] sm:w-full',
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-surface-border px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 className="min-w-0 break-words text-base font-semibold text-steel-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-steel-400 transition-colors hover:bg-surface-subtle hover:text-steel-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">{children}</div>
      </div>
    </div>
  )
}