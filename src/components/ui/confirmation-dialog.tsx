'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

interface ConfirmationDialogProps {
  open: boolean
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmationDialog({
  open,
  title = 'Confirmer l’action',
  description,
  confirmLabel = 'Oui',
cancelLabel = 'Non',
  variant = 'primary',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        <div className="flex gap-3">
          <div
            className={
              variant === 'danger'
                ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600'
                : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600'
            }
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <p className="text-sm leading-6 text-steel-600">{description}</p>
        </div>

        <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}