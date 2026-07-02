'use client'

import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useClients } from '@/lib/hooks/use-clients'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { useCreateBonSortie } from '@/lib/hooks/use-bons-sortie'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { formatMGA } from '@/lib/utils'
import { bonSortieSchema, type BonSortieSchema } from '@/lib/schemas/bons-sortie.schema'

interface BonSortieFormProps {
  onSuccess?: () => void
}

export function BonSortieForm({ onSuccess }: BonSortieFormProps) {
  const createBonSortie = useCreateBonSortie()

  const { data: clientsPage } = useClients({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()
  const { data: productsPage } = useProducts({ actif: true, per_page: 500 })

  const clients = Array.isArray(clientsPage?.data.data) ? clientsPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []
  const products = Array.isArray(productsPage?.data.data) ? productsPage.data.data : []

  const classementOptions = useMemo(
    () =>
      products.flatMap((product) =>
        (product.stocks_par_qualite ?? []).map((classement) => ({
          value: classement.classement_id,
          label: `${product.nomencla} - ${classement.libelle}`,
        }))
      ),
    [products]
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BonSortieSchema>({
    resolver: zodResolver(bonSortieSchema) as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      motif: 'usage_interne',
      lignes: [
        {
          classement_id: 0,
          quantite: 1,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const lignes = watch('lignes') ?? []
  const totalQuantite = lignes.reduce((sum, ligne) => sum + (Number(ligne.quantite) || 0), 0)

  const onSubmit = (values: BonSortieSchema) => {
    createBonSortie.mutate(values, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Location *"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          placeholder="Choisir une location"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
        <Input
          label="Date *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Motif *"
          options={MOTIFS_SORTIE.map((motif) => ({ value: motif.value, label: motif.label }))}
          error={errors.motif?.message}
          {...register('motif')}
        />
        <Select
          label="Client"
          options={clients.map((client) => ({ value: client.id, label: client.nom }))}
          placeholder="Aucun client"
          {...register('client_id', {
            setValueAs: (value) => (value === '' ? undefined : Number(value)),
          })}
        />
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Lignes de sortie
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() =>
              append({
                classement_id: classementOptions[0]?.value ?? 0,
                quantite: 1,
              })
            }
          >
            Ajouter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-steel-500">
                  Classement
                </th>
                <th className="w-32 px-3 py-2 text-right text-xs font-medium text-steel-500">
                  Quantité
                </th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="px-3 py-2">
                    <Select
                      options={classementOptions}
                      placeholder="Classement"
                      error={errors.lignes?.[index]?.classement_id?.message}
                      {...register(`lignes.${index}.classement_id`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.001"
                      className="text-right"
                      error={errors.lignes?.[index]?.quantite?.message}
                      {...register(`lignes.${index}.quantite`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded p-1 text-steel-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {errors.lignes && (
          <p className="px-4 py-3 text-xs text-red-600">
            {errors.lignes.message}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Total quantités</p>
        <p className="mt-1 text-lg font-semibold text-steel-900">{formatMGA(totalQuantite)}</p>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createBonSortie.isPending}>
          Créer le bon de sortie
        </Button>
      </div>
    </form>
  )
}