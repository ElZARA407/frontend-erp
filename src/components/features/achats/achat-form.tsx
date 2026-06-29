// src/components/features/achats/achat-form.tsx
'use client'

import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCreateAchat } from '@/lib/hooks/use-achats'
import { useFournisseurs } from '@/lib/hooks/use-lot3'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useMatieres } from '@/lib/hooks/use-catalogue'
import { achatSchema, type AchatSchema } from '@/lib/schemas/achat.schema'
import { formatMGA } from '@/lib/utils'

interface AchatFormProps {
  onSuccess?: () => void
}

export function AchatForm({ onSuccess }: AchatFormProps) {
  const createAchat = useCreateAchat()

  const { data: fournisseursPage } = useFournisseurs({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()
  const { data: matieresPage } = useMatieres({ actif: true, per_page: 500 })

  const fournisseurs = Array.isArray(fournisseursPage?.data?.data) ? fournisseursPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []
  const matieres = Array.isArray(matieresPage?.data?.data) ? matieresPage.data.data : []

  const matiereOptions = useMemo(
    () =>
      matieres.map((matiere) => ({
        value: matiere.id,
        label: `${matiere.reference} - ${matiere.nom}`,
      })),
    [matieres]
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AchatSchema>({
    resolver: zodResolver(achatSchema) as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      fournisseur_id: fournisseurs[0]?.id ?? 0,
      location_id: locations[0]?.id ?? 0,
      vehicule: '',
      observations: '',
      lignes: [
        {
          matiere_id: matiereOptions[0]?.value ?? 0,
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

  const onSubmit = (values: AchatSchema) => {
    createAchat.mutate(values, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Fournisseur *"
          options={fournisseurs.map((fournisseur) => ({
            value: fournisseur.id,
            label: fournisseur.nom,
          }))}
          placeholder="Choisir un fournisseur"
          error={errors.fournisseur_id?.message}
          {...register('fournisseur_id', { valueAsNumber: true })}
        />

        <Select
          label="Site *"
          options={locations.map((location) => ({
            value: location.id,
            label: location.nom,
          }))}
          placeholder="Choisir un site"
          error={errors.location_id?.message}
          {...register('location_id', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Date *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />

        <Input
          label="Véhicule"
          placeholder="Immatriculation ou chauffeur"
          error={errors.vehicule?.message}
          {...register('vehicule')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-steel-700">Observations</label>
        <textarea
          rows={3}
          className="min-h-20 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
          placeholder="Notes sur la réception"
          {...register('observations')}
        />
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Lignes de réception
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() =>
              append({
                matiere_id: matiereOptions[0]?.value ?? 0,
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
                  Matière
                </th>
                <th className="w-32 px-3 py-2 text-right text-xs font-medium text-steel-500">
                  Quantité
                </th>
                <th className="w-40 px-3 py-2 text-right text-xs font-medium text-steel-500">
                  Prix unitaire
                </th>
                <th className="w-40 px-3 py-2 text-right text-xs font-medium text-steel-500">
                  Total
                </th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {fields.map((field, index) => {
                const ligne = lignes[index]
                const totalLigne =
                  (Number(ligne?.quantite) || 0) * (Number(ligne?.prix_unitaire) || 0)

                return (
                  <tr key={field.id}>
                    <td className="px-3 py-2">
                      <Select
                        options={matiereOptions}
                        placeholder="Choisir une matière"
                        error={errors.lignes?.[index]?.matiere_id?.message}
                        {...register(`lignes.${index}.matiere_id`, { valueAsNumber: true })}
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
                    <td className="px-3 py-2 text-right font-medium text-steel-800">
                      {formatMGA(totalLigne)}
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
                )
              })}
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
        <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Total BR</p>
        <p className="mt-1 text-lg font-semibold text-steel-900">{formatMGA(total)}</p>
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createAchat.isPending}>
          Créer le BR
        </Button>
      </div>
    </form>
  )
}