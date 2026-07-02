'use client'

import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useClients } from '@/lib/hooks/use-clients'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useProducts } from '@/lib/hooks/use-catalogue'
import { useCreateVenteDirecte } from '@/lib/hooks/use-ventes-directes'
import { formatMGA } from '@/lib/utils'
import { venteDirecteSchema, type VenteDirecteSchema } from '@/lib/schemas/ventes-directes.schema'

interface VenteDirecteFormProps {
  onSuccess?: () => void
}

export function VenteDirecteForm({ onSuccess }: VenteDirecteFormProps) {
  const createVente = useCreateVenteDirecte()

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
  } = useForm<VenteDirecteSchema>({
    resolver: zodResolver(venteDirecteSchema) as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      lignes: [
        {
          classement_id: 0,
          quantite: 1,
          prix_unitaire: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const lignes = watch('lignes') ?? []
  const total = lignes.reduce(
    (sum, ligne) => sum + (Number(ligne.quantite) || 0) * (Number(ligne.prix_unitaire) || 0),
    0
  )

  const onSubmit = (values: VenteDirecteSchema) => {
    createVente.mutate(values, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Client *"
          options={clients.map((client) => ({ value: client.id, label: client.nom }))}
          placeholder="Choisir un client"
          error={errors.client_id?.message}
          {...register('client_id', { valueAsNumber: true })}
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
          label="Location *"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          placeholder="Choisir une location"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
        <div className="rounded-lg border border-surface-border bg-surface-subtle px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Total estimé</p>
          <p className="mt-1 text-lg font-semibold text-steel-900">{formatMGA(total)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Lignes de vente
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
                prix_unitaire: 0,
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
                <th className="w-40 px-3 py-2 text-right text-xs font-medium text-steel-500">
                  Prix unitaire
                </th>
                <th className="w-36 px-3 py-2 text-right text-xs font-medium text-steel-500">
                  Total
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
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      className="text-right"
                      error={errors.lignes?.[index]?.prix_unitaire?.message}
                      {...register(`lignes.${index}.prix_unitaire`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-steel-700">
                    {formatMGA((Number(lignes[index]?.quantite) || 0) * (Number(lignes[index]?.prix_unitaire) || 0))}
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

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createVente.isPending}>
          Créer la vente directe
        </Button>
      </div>
    </form>
  )
}