'use client'

import { useEffect, useMemo } from 'react'
import { useForm,type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAjusterInventaire } from '@/lib/hooks/use-stocks'
import { ajustementStockSchema, type AjustementStockValues } from '@/lib/schemas/stock.schema'
import type { Stock } from '@/lib/types'
import { formatQty } from '@/lib/utils'

interface AjustementDialogProps {
  open: boolean
  onClose: () => void
  stock: Stock | null
}

export function AjustementDialog({ open, onClose, stock }: AjustementDialogProps) {
  const ajusterInventaire = useAjusterInventaire()

  const initialValues = useMemo<AjustementStockValues>(
    () => ({
      location_id: stock?.location?.id ?? 0,
      entite_type: stock?.entite_type ?? 'matiere',
      entite_id: stock?.entite_id ?? 0,
      classement_id: stock?.classement?.id,
      stock_physique: stock?.stock_total ?? 0,
      motif: '',
    }),
    [stock]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AjustementStockValues>({
    resolver: zodResolver(ajustementStockSchema) as unknown as Resolver<AjustementStockValues>,
    defaultValues: initialValues,
  })

  useEffect(() => {
    if (open) {
      reset(initialValues)
    }
  }, [open, initialValues, reset])

  const stockPhysique = watch('stock_physique')
  const ecart = (Number(stockPhysique) || 0) - (stock?.stock_total ?? 0)

  const onSubmit = (values: AjustementStockValues) => {
    ajusterInventaire.mutate(values, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} title="Ajustement d'inventaire" size="lg">
      {!stock ? (
        <p className="text-sm text-steel-500">Aucun stock selectionne.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-md border border-surface-border bg-surface-subtle px-4 py-3">
            <p className="text-sm font-semibold text-steel-900">
              {stock.entite?.designation ?? stock.entite?.nom ?? stock.entite?.nomencla ?? `Article #${stock.entite_id}`}
            </p>
            <p className="mt-1 text-xs text-steel-500">
              {stock.location?.nom ?? 'Location inconnue'} · Theorique: {formatQty(stock.stock_total)}
            </p>
          </div>

          <input type="hidden" {...register('location_id', { setValueAs: (v) => Number(v) })} />
          <input type="hidden" {...register('entite_type')} />
          <input type="hidden" {...register('entite_id', { setValueAs: (v) => Number(v) })} />
          <input
            type="hidden"
            {...register('classement_id', {
              setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
            })}
          />

          <Input
            label="Stock physique constate"
            type="number"
            step="100"
            error={errors.stock_physique?.message}
            {...register('stock_physique', { valueAsNumber: true })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-steel-700">Motif</label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
              placeholder="Ex: ecart inventaire mensuel"
              {...register('motif')}
            />
            {errors.motif?.message && <p className="text-xs text-red-600">{errors.motif.message}</p>}
          </div>

          <div className="rounded-md border border-surface-border bg-surface-subtle px-4 py-3 text-sm">
            <p className="font-medium text-steel-900">Ecart calcule: {formatQty(ecart)}</p>
            <p className="mt-1 text-xs text-steel-500">
              L ecart positif augmente le stock, l ecart negatif le diminue.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={ajusterInventaire.isPending}>
              Valider l ajustement
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}