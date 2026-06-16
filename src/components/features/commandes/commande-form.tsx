// src/components/features/commandes/commande-form.tsx
'use client'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { commandeSchema, type CommandeSchema } from '@/lib/schemas/commande.schema'
import { useCreateCommande } from '@/lib/hooks/use-commandes'
import { useClients } from '@/lib/hooks/use-clients'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { formatMGA } from '@/lib/utils'

interface CommandeFormProps { onSuccess?: () => void }

export function CommandeForm({ onSuccess }: CommandeFormProps) {
  const { mutate: create, isPending } = useCreateCommande()
  const { data: clientsData } = useClients({ actif: true, per_page: 100 })

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CommandeSchema>({
    resolver: zodResolver(commandeSchema),
    defaultValues: {
      echeance: 30,
      lignes:   [{ classement_id: 0, quantite: 1, prix_unitaire: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const lignes  = watch('lignes')
  const total   = lignes.reduce((sum, l) => sum + (l.quantite || 0) * (l.prix_unitaire || 0), 0)
  const clients = clientsData?.data.data ?? []

  return (
    <form onSubmit={handleSubmit((data) => create(data, { onSuccess }))} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Client *"
          options={clients.map((c) => ({ value: c.id, label: c.nom }))}
          placeholder="Sélectionner un client"
          error={errors.client_id?.message}
          {...register('client_id', { valueAsNumber: true })}
        />
        <Select
          label="Échéance paiement *"
          options={[
            { value: 15, label: '15 jours' },
            { value: 30, label: '30 jours' },
            { value: 60, label: '60 jours' },
          ]}
          {...register('echeance', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date commande *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <Input
          label="Livraison prévue"
          type="date"
          {...register('date_livraison_prevue')}
        />
      </div>

      {/* Lignes */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">Lignes de commande</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3 w-3" />}
            onClick={() => append({ classement_id: 0, quantite: 1, prix_unitaire: 0 })}
          >
            Ajouter
          </Button>
        </div>

        <div className="rounded-md border border-surface-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-steel-500">Produit (classement)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-steel-500 w-28">Quantité</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-steel-500 w-36">Prix unit. (Ar)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-steel-500 w-36">Total</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {fields.map((field, i) => (
                <tr key={field.id}>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      placeholder="ID classement"
                      className="h-8 w-full rounded border border-surface-border px-2 text-sm focus:border-steel-400 focus:outline-none"
                      {...register(`lignes.${i}.classement_id`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.001"
                      className="h-8 w-full rounded border border-surface-border px-2 text-right text-sm focus:border-steel-400 focus:outline-none"
                      {...register(`lignes.${i}.quantite`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="1"
                      className="h-8 w-full rounded border border-surface-border px-2 text-right text-sm focus:border-steel-400 focus:outline-none"
                      {...register(`lignes.${i}.prix_unitaire`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs font-medium text-steel-700">
                    {formatMGA((lignes[i]?.quantite || 0) * (lignes[i]?.prix_unitaire || 0))}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="rounded p-1 text-steel-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-subtle border-t border-surface-border">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                  Total commande
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="amount">{formatMGA(total)}</span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        {errors.lignes && (
          <p className="mt-1 text-xs text-red-600">{errors.lignes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={isPending}>
          Créer la commande
        </Button>
      </div>
    </form>
  )
}