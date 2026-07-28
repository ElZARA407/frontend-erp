// src/components/features/contrats/contrat-form.tsx
'use client'

import { useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { contratSchema, type ContratSchema } from '@/lib/schemas/lot3.schema'
import { useCreateContrat } from '@/lib/hooks/use-lot3'
import type { CatalogueProduct } from '@/lib/catalogue.types'
import type { Client } from '@/lib/types'
import { formatMGA } from '@/lib/utils'

interface ContratFormProps {
  clients: Client[]
  produits: CatalogueProduct[]
  onSuccess?: () => void
}

const FREQUENCE_OPTIONS = [
  { value: 'quotidienne', label: 'Quotidienne' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'bimensuel', label: 'Bimensuel' },
  { value: 'mensuel', label: 'Mensuelle' },
  { value: 'tous_x_jours', label: 'Tous les X jours' },
  { value: 'personnalisee', label: 'Personnalisée' },
]

function defaultLine(produits: CatalogueProduct[]) {
  const produit = produits[0]
  const classement = produit?.stocks_par_qualite?.[0]

  return {
    produit_id: produit?.id ?? 0,
    classement_id: classement?.classement_id ?? 0,
    quantite_contractuelle: 1,
    frequence: 'mensuel' as const,
    frequence_jours: null,
    date_debut: '',
    date_fin: '',
    prix_unitaire: 0,
  }
}

export function ContratForm({ clients, produits, onSuccess }: ContratFormProps) {
  const createContrat = useCreateContrat()
  const todayMonth = new Date().toISOString().slice(0, 7)

  const productOptions = useMemo(
    () =>
      produits.map((produit) => ({
        value: produit.id,
        label: produit.designation,
        description: produit.nomencla,
      })),
    [produits]
  )

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<ContratSchema>({
    resolver: zodResolver(contratSchema) as unknown as Resolver<ContratSchema>,
    defaultValues: {
      client_id: clients[0]?.id ?? 0,
      mois: todayMonth,
      lignes: [defaultLine(produits)],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const lignes = useWatch({ control, name: 'lignes' }) ?? []

  const total = lignes.reduce(
    (sum, ligne) =>
      sum +
      (Number(ligne.quantite_contractuelle) || 0) *
      (Number(ligne.prix_unitaire) || 0),
    0
  )

  return (
    <form
      onSubmit={handleSubmit((values) =>
        createContrat.mutate(values, { onSuccess })
      )}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="client_id"
          render={({ field }) => (
            <SearchableSelect
              label="Client *"
              options={clients.map((client) => ({
                value: client.id,
                label: client.nom,
                description: client.reference,
              }))}
              value={field.value}
              onValueChange={(value) => field.onChange(Number(value))}
              placeholder="Choisir un client"
              searchPlaceholder="Rechercher un client..."
              noOptionsMessage="Aucun client trouvé."
              error={errors.client_id?.message}
            />
          )}
        />

        <Input
          label="Mois de référence *"
          type="month"
          error={errors.mois?.message}
          {...register('mois')}
        />
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
            Lignes de contrat
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => append(defaultLine(produits))}
          >
            Ajouter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-steel-500">Produit</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-steel-500">Classement</th>
                <th className="w-28 px-3 py-2 text-right text-xs font-medium text-steel-500">Qté</th>
                <th className="w-40 px-3 py-2 text-left text-xs font-medium text-steel-500">Fréquence</th>
                <th className="w-28 px-3 py-2 text-right text-xs font-medium text-steel-500">Jours</th>
                <th className="w-36 px-3 py-2 text-left text-xs font-medium text-steel-500">Début</th>
                <th className="w-36 px-3 py-2 text-left text-xs font-medium text-steel-500">Fin</th>
                <th className="w-36 px-3 py-2 text-right text-xs font-medium text-steel-500">PU</th>
                <th className="w-36 px-3 py-2 text-right text-xs font-medium text-steel-500">Total</th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-border">
              {fields.map((field, index) => {
                const selectedProduitId = Number(lignes[index]?.produit_id) || 0
                const selectedProduit = produits.find((produit) => produit.id === selectedProduitId)
                const classementOptions = (selectedProduit?.stocks_par_qualite ?? []).map((classement) => ({
                  value: classement.classement_id,
                  label: classement.libelle,
                  description: `Stock: ${classement.stock_total}`,
                }))
                const frequence = lignes[index]?.frequence
                const lineTotal =
                  (Number(lignes[index]?.quantite_contractuelle) || 0) *
                  (Number(lignes[index]?.prix_unitaire) || 0)

                return (
                  <tr key={field.id} className="align-top">
                    <td className="px-3 py-2">
                      <Controller
                        control={control}
                        name={`lignes.${index}.produit_id`}
                        render={({ field }) => (
                          <SearchableSelect
                            label=""
                            options={productOptions}
                            value={field.value}
                            onValueChange={(value) => {
                              const produitId = Number(value)
                              const produit = produits.find((item) => item.id === produitId)
                              const firstClassement = produit?.stocks_par_qualite?.[0]

                              field.onChange(produitId)
                              setValue(`lignes.${index}.classement_id`, firstClassement?.classement_id ?? 0, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }}
                            placeholder="Produit"
                            searchPlaceholder="Rechercher un produit..."
                            noOptionsMessage="Aucun produit trouvé."
                            error={errors.lignes?.[index]?.produit_id?.message}
                          />
                        )}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Controller
                        control={control}
                        name={`lignes.${index}.classement_id`}
                        render={({ field }) => (
                          <SearchableSelect
                            label=""
                            options={classementOptions}
                            value={field.value}
                            onValueChange={(value) => field.onChange(Number(value))}
                            placeholder="Classement"
                            searchPlaceholder="Rechercher..."
                            noOptionsMessage="Aucun classement pour ce produit."
                            disabled={!selectedProduitId}
                            error={errors.lignes?.[index]?.classement_id?.message}
                          />
                        )}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.001"
                        className="text-right"
                        error={errors.lignes?.[index]?.quantite_contractuelle?.message}
                        {...register(`lignes.${index}.quantite_contractuelle`, { valueAsNumber: true })}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Select
                        options={FREQUENCE_OPTIONS}
                        error={errors.lignes?.[index]?.frequence?.message}
                        {...register(`lignes.${index}.frequence`)}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="1"
                        disabled={frequence !== 'tous_x_jours'}
                        className="text-right"
                        error={errors.lignes?.[index]?.frequence_jours?.message}
                        {...register(`lignes.${index}.frequence_jours`, { valueAsNumber: true })}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        type="date"
                        error={errors.lignes?.[index]?.date_debut?.message}
                        {...register(`lignes.${index}.date_debut`)}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <Input
                        type="date"
                        error={errors.lignes?.[index]?.date_fin?.message}
                        {...register(`lignes.${index}.date_fin`)}
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
                      {formatMGA(lineTotal)}
                    </td>

                    <td className="px-3 py-2 text-center">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded p-1 text-steel-400 hover:text-red-500"
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

        {errors.lignes?.message && (
          <p className="px-4 py-3 text-xs text-red-600">
            {errors.lignes.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-surface-border pt-4">
        <p className="text-sm text-steel-500">
          Total contractuel : <span className="font-semibold text-steel-900">{formatMGA(total)}</span>
        </p>

        <Button type="submit" loading={createContrat.isPending}>
          Créer le contrat
        </Button>
      </div>
    </form>
  )
}