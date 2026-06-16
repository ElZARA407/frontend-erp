// src/components/features/demandes-achat/demande-achat-form.tsx
'use client'

import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { demandeAchatSchema, type DemandeAchatSchema } from '@/lib/schemas/lot3.schema'
import { useCreateDemandeAchat } from '@/lib/hooks/use-lot3'
import type { CatalogueMatiere, CatalogueProduct } from '@/lib/catalogue.types'
import { Plus, Trash2 } from 'lucide-react'

interface DemandeAchatFormProps {
  matieres: CatalogueMatiere[]
  produits: CatalogueProduct[]
  onSuccess?: () => void
}

export function DemandeAchatForm({ matieres, produits, onSuccess }: DemandeAchatFormProps) {
  const createDemande = useCreateDemandeAchat()

  const dateToday = new Date().toISOString().split('T')[0]

  const matiereOptions = useMemo(
    () => matieres.map((matiere) => ({ value: matiere.id, label: `${matiere.reference} - ${matiere.nom}` })),
    [matieres]
  )

  const produitOptions = useMemo(
    () => produits.map((produit) => ({ value: produit.id, label: `${produit.nomencla} - ${produit.designation}` })),
    [produits]
  )

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<DemandeAchatSchema>({
    resolver: zodResolver(demandeAchatSchema) as any,
    defaultValues: {
      date_demande: dateToday,
      observations: '',
      lignes: [
        {
          entite_type: 'matiere',
          entite_id: matiereOptions[0]?.value ?? 0,
          quantite: 1,
          observation_ligne: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const lignes = watch('lignes')

  return (
    <form
      onSubmit={handleSubmit((values) => createDemande.mutate(values, { onSuccess }))}
      className="space-y-5"
    >
      <Input
        label="Date de demande *"
        type="date"
        error={errors.date_demande?.message}
        {...register('date_demande')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-steel-700">Observations</label>
        <textarea
          rows={3}
          className="min-h-20 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500/30"
          placeholder="Observation générale"
          {...register('observations')}
        />
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Lignes de demande
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() =>
              append({
                entite_type: 'matiere',
                entite_id: matiereOptions[0]?.value ?? 0,
                quantite: 1,
                observation_ligne: '',
              })
            }
          >
            Ajouter
          </Button>
        </div>

        <div className="space-y-4 p-4">
          {fields.map((field, index) => {
            const entiteType = watch(`lignes.${index}.entite_type`)
            const options = entiteType === 'produit' ? produitOptions : matiereOptions

            return (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-lg border border-surface-border p-3 md:grid-cols-4">
                <Select
                  label="Type *"
                  options={[
                    { value: 'matiere', label: 'Matière' },
                    { value: 'produit', label: 'Produit' },
                  ]}
                  {...register(`lignes.${index}.entite_type`)}
                />

                <Select
                  label="Article *"
                  options={options}
                  placeholder="Choisir"
                  error={errors.lignes?.[index]?.entite_id?.message}
                  {...register(`lignes.${index}.entite_id`, { valueAsNumber: true })}
                />

                <Input
                  label="Quantité *"
                  type="number"
                  step="0.001"
                  error={errors.lignes?.[index]?.quantite?.message}
                  {...register(`lignes.${index}.quantite`, { valueAsNumber: true })}
                />

                <div className="flex items-end gap-2">
                  <Input
                    label="Observation"
                    placeholder="Optionnel"
                    {...register(`lignes.${index}.observation_ligne`)}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mb-0.5 rounded p-2 text-steel-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {errors.lignes && (
          <p className="px-4 pb-4 text-xs text-red-600">
            {errors.lignes.message}
          </p>
        )}
      </div>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createDemande.isPending}>
          Créer la demande
        </Button>
      </div>
    </form>
  )
}