// src/components/features/contrats/contrat-form.tsx
'use client'

import { useMemo } from 'react'
import { useFieldArray, useForm,type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { contratSchema, type ContratSchema } from '@/lib/schemas/lot3.schema'
import { useCreateContrat } from '@/lib/hooks/use-lot3'
import type { CatalogueProduct } from '@/lib/catalogue.types'
import type { Client } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'

interface ContratFormProps {
  clients: Client[]
  produits: CatalogueProduct[]
  onSuccess?: () => void
}

export function ContratForm({ clients, produits, onSuccess }: ContratFormProps) {
  const createContrat = useCreateContrat()
  const todayMonth = new Date().toISOString().slice(0, 7)

  const classementOptions = useMemo(
    () =>
      produits.flatMap((produit) =>
        (produit.stocks_par_qualite ?? []).map((classement) => ({
          value: classement.classement_id,
          label: `${produit.nomencla} - ${classement.libelle}`,
        }))
      ),
    [produits]
  )

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ContratSchema>({
    resolver: zodResolver(contratSchema) as unknown as Resolver<ContratSchema>,
    defaultValues: {
      client_id: clients[0]?.id ?? 0,
      mois: todayMonth,
      lignes: [
        {
          classement_id: classementOptions[0]?.value ?? 0,
          quantite_contractuelle: 1,
          frequence: 'mensuel',
          prix_unitaire: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  })

  const lignes = watch('lignes')
  const total = lignes.reduce(
    (sum, ligne) => sum + (Number(ligne.quantite_contractuelle) || 0) * (Number(ligne.prix_unitaire) || 0),
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
        <Select
          label="Client *"
          options={clients.map((client) => ({
            value: client.id,
            label: client.nom,
          }))}
          placeholder="Choisir un client"
          error={errors.client_id?.message}
          {...register('client_id', { valueAsNumber: true })}
        />
        <Input
          label="Mois *"
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
            onClick={() =>
              append({
                classement_id: classementOptions[0]?.value ?? 0,
                quantite_contractuelle: 1,
                frequence: 'mensuel',
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
                <th className="px-3 py-2 text-left text-xs font-medium text-steel-500">Classement</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-steel-500 w-32">Qté</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-steel-500 w-40">Fréquence</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-steel-500 w-36">PU</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-steel-500 w-36">Total</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="px-3 py-2">
                    <Select
                      options={classementOptions}
                      placeholder="Classement"
                      {...register(`lignes.${index}.classement_id`, { valueAsNumber: true })}
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
                      options={[
                        { value: 'hebdomadaire', label: 'Hebdomadaire' },
                        { value: 'bimensuel', label: 'Bimensuel' },
                        { value: 'mensuel', label: 'Mensuel' },
                      ]}
                      {...register(`lignes.${index}.frequence`)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      className="text-right"
                      {...register(`lignes.${index}.prix_unitaire`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-steel-700">
                    {Number.isFinite(total) ? total.toLocaleString('fr-FR') : '0'} Ar
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
        <Button type="submit" loading={createContrat.isPending}>
          Créer le contrat
        </Button>
      </div>
    </form>
  )
}