// src/components/features/factures/factures-view.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {  type Resolver } from 'react-hook-form'
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
import { FactureForm } from './facture-form'

type FactureRow = Facture

export function FacturesView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [clientId, setClientId] = useState<string>('')
  const [enRetard, setEnRetard] = useState(false)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [payingId, setPayingId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)

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

  const { register, handleSubmit, reset } = useForm<PayerFactureSchema>({
    resolver: zodResolver(payerFactureSchema) as unknown as Resolver<PayerFactureSchema>,
    defaultValues: { mode_paiement: 'espece' },
  })

  const onPay = (formData: PayerFactureSchema) => {
  if (!payingId) return
  payer(
    { id: payingId, mode_paiement: formData.mode_paiement },
    {
      onSuccess: () => {
        setPayingId(null)
        reset({ mode_paiement: 'espece' })
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
          <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCreate(true)}>
            Nouvelle facture
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
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
                    className={`transition-colors hover:bg-surface-muted/60 ${
                      f.en_retard ? 'bg-red-50/30' : ''
                    }`}
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
                        <Link
                          href={`/factures/${f.id}`}
                          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-surface-border bg-white px-2.5 text-xs font-medium text-steel-700 hover:bg-surface-subtle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Voir
                        </Link>
                        {['emise', 'partiellement_payee'].includes(f.statut.valeur) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
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
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nouvelle facture"
        size="lg"
      >
        <FactureForm onSuccess={() => setShowCreate(false)} />
      </Dialog>

      <Dialog
        open={!!payingId}
        onClose={() => {
          setPayingId(null)
          reset()
        }}
        title="Enregistrer le paiement"
        size="sm"
      >
        <form onSubmit={handleSubmit(onPay)} className="space-y-4">
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
                reset()
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