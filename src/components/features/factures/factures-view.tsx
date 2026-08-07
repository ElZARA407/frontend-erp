'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { type Resolver } from 'react-hook-form'
import type { PayerFactureSchema } from '@/lib/schemas/facture.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, CheckCircle2, Eye, Plus, Receipt, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { MODES_PAIEMENT } from '@/lib/constants'
import { useClients } from '@/lib/hooks/use-clients'
import { useAnnulerFacture, useFactures, usePayerFacture } from '@/lib/hooks/use-factures'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import { payerFactureSchema } from '@/lib/schemas/facture.schema'
import type { Facture } from '@/lib/factures.types'
import { FileDown } from 'lucide-react'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { useRouter } from 'next/navigation'


type FactureRow = Facture

export function FacturesView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [clientId, setClientId] = useState<string>('')
  const [enRetard, setEnRetard] = useState(false)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [payingId, setPayingId] = useState<number | null>(null)
  const { exportPdf, isExporting } = usePdfExport()
  const router = useRouter()

  const { data: clientsPage } = useClients({ actif: true, per_page: 200 })
  const { data, isLoading } = useFactures({
    client_id: clientId ? Number(clientId) : undefined,
    statut: statut || undefined,
    en_retard: enRetard || undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
  })

  const { mutate: payer, isPending: paying } = usePayerFacture()
  const { mutate: annuler } = useAnnulerFacture()

  const pagination = data?.data
  const factures = Array.isArray(pagination?.data) ? pagination.data : []
  const clients = Array.isArray(clientsPage?.data?.data) ? clientsPage.data.data : []
  const selectedFacture = payingId
    ? factures.find((facture) => facture.id === payingId) ?? null
    : null

  const { register, handleSubmit, reset } = useForm<PayerFactureSchema>({
    resolver: zodResolver(payerFactureSchema) as unknown as Resolver<PayerFactureSchema>,
    defaultValues: {
      mode_paiement: 'espece',
      montant_paye: 0,
    },
  })
  useEffect(() => {
    if (!payingId || !selectedFacture) {
      return
    }

    reset({
      mode_paiement: 'espece',
      montant_paye: selectedFacture.reste_a_payer ?? selectedFacture.total ?? 0,
    })
  }, [payingId, selectedFacture, reset])

  const onPay = (formData: PayerFactureSchema) => {
    if (!payingId) return

    payer(
      {
        id: payingId,
        mode_paiement: formData.mode_paiement,
        montant_paye: formData.montant_paye,
      },
      {
        onSuccess: () => {
          setPayingId(null)
          reset({
            mode_paiement: 'espece',
            montant_paye: 0,
          })
        },
      }
    )
  }

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'emise', label: 'Émises' },
    { value: 'partiellement_payee', label: 'Part. payées' },
    { value: 'payee', label: 'Payées' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'annulee', label: 'Annulées' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Factures"
        subtitle={`${pagination?.total ?? 0} facture${(pagination?.total ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Link href="/factures/nouvelle">
            <Button icon={<Plus className="h-3.5 w-3.5" />}>
              Nouvelle facture
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
        <div className="rounded-lg border border-surface-border bg-white p-3 lg:col-span-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-400">
            Statut
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statutOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatut(option.value)
                  setPage(1)
                }}
                className={
                  statut === option.value
                    ? 'rounded-md bg-steel-700 px-3 py-1.5 text-xs font-medium text-white'
                    : 'rounded-md border border-surface-border bg-white px-3 py-1.5 text-xs text-steel-600 hover:bg-surface-subtle'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Client"
          placeholder="Tous"
          options={[
            { value: '', label: 'Tous les clients' },
            ...clients.map((client) => ({
              value: client.id,
              label: `${client.reference} - ${client.nom}`,
            })),
          ]}
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value)
            setPage(1)
          }}
        />
        <label className="flex items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-steel-600">
          <input
            type="checkbox"
            checked={enRetard}
            onChange={(e) => {
              setEnRetard(e.target.checked)
              setPage(1)
            }}
            className="h-3.5 w-3.5 accent-red-600"
          />
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          En retard seulement
        </label>
        
        <Input
          label="Du"
          type="date"
          value={dateDebut}
          onChange={(e) => {
            setDateDebut(e.target.value)
            setPage(1)
          }}
        />

        <Input
          label="Au"
          type="date"
          value={dateFin}
          onChange={(e) => {
            setDateFin(e.target.value)
            setPage(1)
          }}
        />

        
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={9} />
        ) : factures.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <Receipt className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucune facture trouvée</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {[
                    'Numéro',
                    'Client',
                    'Livraison',
                    'Date',
                    'Échéance',
                    'Total',
                    'Retard',
                    'Statut',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {factures.map((f: FactureRow) => (
                  <tr
                    key={f.id}
                    className={`cursor-pointer transition-colors hover:bg-surface-muted/60 ${
                      f.en_retard ? 'bg-red-50/30' : ''
                    }`}
                    onClick={() => router.push(`/factures/${f.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="ref-code">{f.numero}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-steel-800">
                      {f.client?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {f.livraison ? (
                        <Link
                          href={`/livraisons/${f.livraison.id}`}
                          className="text-sm font-medium text-steel-700 hover:underline"
                        >
                          {f.livraison.numero}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(f.date)}</td>
                    <td className="px-4 py-3 text-steel-600">
                      {formatDate(f.echeance_paiement)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="amount">{formatMGA(f.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {f.en_retard ? (
                        <span className="text-xs font-medium text-red-600">
                          +{f.jours_retard}j
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(f.statut.valeur)} dot>
                        {f.statut.libelle}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<FileDown className="h-3.5 w-3.5" />}
                          loading={isExporting('facture', f.id)}
                          onClick={(event) => {
                            event.stopPropagation()
                            exportPdf({ type: 'facture', document: f })}}
                        >
                          PDF
                        </Button>
                        {['emise', 'partiellement_payee'].includes(f.statut.valeur) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              setPayingId(f.id)}}
                          >
                            Payer
                          </Button>
                        )}
                        {f.statut.valeur === 'emise' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              annuler(f.id)}}
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <Pagination
            currentPage={pagination.current_page ?? page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from ?? 0}
            to={pagination.to ?? 0}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Dialog
        open={!!payingId}
        onClose={() => {
          setPayingId(null)
          reset({
            mode_paiement: 'espece',
            montant_paye: 0,
          })
        }}
        title="Enregistrer le paiement"
        size="sm"
      >
        <form onSubmit={handleSubmit(onPay)} className="space-y-4">
          <div className="rounded-md border border-surface-border bg-surface-subtle/50 px-3 py-2 text-sm text-steel-600">
            <p className="text-xs uppercase tracking-wide text-steel-400">Facture</p>
            <p className="mt-1 font-semibold text-steel-900">
              {selectedFacture?.numero ?? '—'}
            </p>
            <p className="mt-1 text-xs text-steel-500">
              Total : {formatMGA(selectedFacture?.total ?? 0)} • Reste à payer :{' '}
              <span className="font-semibold text-steel-900">
                {formatMGA(selectedFacture?.reste_a_payer ?? selectedFacture?.total ?? 0)}
              </span>
            </p>
          </div>

          <Input
            label="Montant payé *"
            type="number"
            step="0.01"
            min="0.01"        
            {...register('montant_paye', { valueAsNumber: true })}
          />

          <Select
            label="Mode de paiement *"
            options={MODES_PAIEMENT.map((m) => ({ value: m.value, label: m.label }))}
            placeholder="Choisir…"
            {...register('mode_paiement')}
          />

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPayingId(null)
                reset({
                  mode_paiement: 'espece',
                  montant_paye: 0,
                })
              }}
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