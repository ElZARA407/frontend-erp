// src/components/features/factures/facture-form.tsx
'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useCreateFacture } from '@/lib/hooks/use-factures'
import { useLivraisons } from '@/lib/hooks/use-livraisons'
import { formatDate } from '@/lib/utils'
import { factureCreateSchema, type FactureCreateSchema } from '@/lib/schemas/facture.schema'

interface FactureFormProps {
  onSuccess?: () => void
}

export function FactureForm({ onSuccess }: FactureFormProps) {
  const createFacture = useCreateFacture()

  const { data: livraisonsPage, isLoading } = useLivraisons({
    statut: 'livre',
    est_facturee: false,
    per_page: 500,
  })

  const livraisons = Array.isArray(livraisonsPage?.data?.data) ? livraisonsPage.data.data : []

  const livraisonsDisponibles = useMemo(
    () => livraisons.filter((livraison) => livraison.statut === 'livre' && !livraison.est_facturee),
    [livraisons]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FactureCreateSchema>({
    resolver: zodResolver(factureCreateSchema) as any,
    defaultValues: {
      livraison_id: 0,
    },
  })

  const onSubmit = (values: FactureCreateSchema) => {
    createFacture.mutate(values, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-lg border border-surface-border bg-surface-subtle/60 p-4">
        <p className="text-sm font-medium text-steel-900">Créer une facture depuis une livraison</p>
        <p className="mt-1 text-xs text-steel-500">
          Seules les livraisons confirmées et non encore facturées sont proposées.
        </p>
      </div>

      <Select
        label="Livraison *"
        options={livraisonsDisponibles.map((livraison) => ({
          value: livraison.id,
          label: `${livraison.numero} - ${livraison.client?.nom ?? '—'} - ${formatDate(livraison.date_livraison)}`,
        }))}
        placeholder={isLoading ? 'Chargement...' : 'Choisir une livraison'}
        error={errors.livraison_id?.message}
        disabled={isLoading || livraisonsDisponibles.length === 0}
        {...register('livraison_id', { valueAsNumber: true })}
      />

      {!isLoading && livraisonsDisponibles.length === 0 && (
        <p className="text-xs text-steel-500">
          Aucune livraison livrée non facturée n’est disponible.
        </p>
      )}

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createFacture.isPending} disabled={livraisonsDisponibles.length === 0}>
          Créer la facture
        </Button>
      </div>
    </form>
  )
}