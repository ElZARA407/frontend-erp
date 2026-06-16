// src/components/features/factures/factures-view.tsx
'use client'
import { useState } from 'react'
import { useFactures, usePayerFacture, useAnnulerFacture } from '@/lib/hooks/use-factures'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import { MODES_PAIEMENT } from '@/lib/constants'
import { Receipt, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Facture } from '@/lib/types'

export function FacturesView() {
  const [page, setPage]       = useState(1)
  const [statut, setStatut]   = useState<string>('')
  const [enRetard, setEnRetard] = useState(false)
  const [payingId, setPayingId] = useState<number | null>(null)

  const { data, isLoading }        = useFactures({ statut: statut || undefined, en_retard: enRetard || undefined, page, per_page: 20 })
  const { mutate: payer, isPending: paying } = usePayerFacture()
  const { mutate: annuler }        = useAnnulerFacture()

  const factures = data?.data.data ?? []
  const paginate = data?.data

  const { register, handleSubmit, reset } = useForm<{ mode_paiement: string }>()

  const onPay = (formData: { mode_paiement: string }) => {
    if (!payingId) return
    payer({ id: payingId, mode_paiement: formData.mode_paiement }, {
      onSuccess: () => { setPayingId(null); reset() },
    })
  }

  const statutOptions = [
    { value: '',                    label: 'Tous'               },
    { value: 'emise',               label: 'Émises'             },
    { value: 'partiellement_payee', label: 'Part. payées'       },
    { value: 'payee',               label: 'Payées'             },
    { value: 'en_attente',          label: 'En attente'         },
    { value: 'annulee',             label: 'Annulées'           },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Factures"
        subtitle={`${paginate?.total ?? 0} facture${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-surface-border overflow-hidden text-xs">
          {statutOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setStatut(value); setPage(1) }}
              className={
                statut === value
                  ? 'bg-steel-700 px-3 py-1.5 font-medium text-white'
                  : 'bg-white px-3 py-1.5 text-steel-600 hover:bg-surface-subtle'
              }
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-steel-600">
          <input
            type="checkbox"
            checked={enRetard}
            onChange={(e) => { setEnRetard(e.target.checked); setPage(1) }}
            className="h-3.5 w-3.5 accent-red-600"
          />
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          En retard seulement
        </label>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={7} />
        ) : factures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <Receipt className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucune facture trouvée</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Numéro', 'Client', 'Date', 'Échéance', 'Total', 'Retard', 'Statut', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {factures.map((f: Facture) => (
                <tr key={f.id} className={`hover:bg-surface-muted/60 transition-colors ${f.en_retard ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3"><span className="ref-code">{f.numero}</span></td>
                  <td className="px-4 py-3 font-medium text-steel-800">{f.client?.nom ?? '—'}</td>
                  <td className="px-4 py-3 text-steel-600">{formatDate(f.date)}</td>
                  <td className="px-4 py-3 text-steel-600">{formatDate(f.echeance_paiement)}</td>
                  <td className="px-4 py-3"><span className="amount">{formatMGA(f.total)}</span></td>
                  <td className="px-4 py-3">
                    {f.en_retard ? (
                      <span className="text-xs font-medium text-red-600">
                        +{f.jours_retard}j
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatutColor(f.statut.valeur)} dot>
                      {f.statut.libelle}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {['emise', 'partiellement_payee'].includes(f.statut.valeur) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                          onClick={() => setPayingId(f.id)}
                        >
                          Payer
                        </Button>
                      )}
                      {f.statut.valeur === 'emise' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                          onClick={() => annuler(f.id)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {paginate && (
          <Pagination
            currentPage={paginate.current_page}
            lastPage={paginate.last_page}
            total={paginate.total}
            from={paginate.from ?? 0}
            to={paginate.to ?? 0}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Dialog paiement */}
      <Dialog
        open={!!payingId}
        onClose={() => { setPayingId(null); reset() }}
        title="Enregistrer le paiement"
        size="sm"
      >
        <form onSubmit={handleSubmit(onPay)} className="space-y-4">
          <Select
            label="Mode de paiement *"
            options={MODES_PAIEMENT.map((m) => ({ value: m.value, label: m.label }))}
            placeholder="Choisir…"
            {...register('mode_paiement', { required: true })}
          />
          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setPayingId(null); reset() }}
            >
              Annuler
            </Button>
            <Button type="submit" loading={paying}>
              Confirmer le paiement
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}