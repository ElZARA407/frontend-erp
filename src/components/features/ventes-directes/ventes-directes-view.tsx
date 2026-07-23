'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, Plus, RotateCcw, ShoppingCart, Truck, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import { useClients } from '@/lib/hooks/use-clients'
import {
  useAnnulerVenteDirecte,
  useValiderVenteDirecte,
  useVentesDirectes,
} from '@/lib/hooks/use-ventes-directes'
import type { VenteDirecte } from '@/lib/ventes-directes.types'
import { VenteDirecteForm } from './vente-directe-form'
import { LivraisonForm } from '../livraisons/livraison-form'
import { useRouter } from 'next/navigation'

export function VentesDirectesView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [clientId, setClientId] = useState<string>('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showLivraison, setShowLivraison] = useState(false)
  const [selectedVente, setSelectedVente] = useState<VenteDirecte | null>(null)
  const router = useRouter();

  const { data: clientsPage } = useClients({ actif: true, per_page: 100 })
  const { mutate: validerVente, isPending: validating } = useValiderVenteDirecte()
  const { mutate: annulerVente, isPending: cancelling } = useAnnulerVenteDirecte()

  const { data, isLoading } = useVentesDirectes({
    statut: statut || undefined,
    client_id: clientId ? Number(clientId) : undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
  })

  const clients = Array.isArray(clientsPage?.data.data) ? clientsPage.data.data : []
  const pagination = data?.data
  const ventes = Array.isArray(pagination?.data) ? pagination.data : []

  const statutOptions = [
    { value: '', label: 'Toutes' },
    { value: 'brouillon', label: 'Brouillons' },
    { value: 'validee', label: 'Validees' },
    { value: 'annulee', label: 'Annulees' },
  ]

  const getLabel = (statutVente: VenteDirecte['statut']) => {
    if (statutVente === 'brouillon') return 'Brouillon'
    if (statutVente === 'validee') return 'Validee'
    if (statutVente === 'annulee') return 'Annulee'
    if (statutVente === 'livree') return 'Livree'
    return statutVente
  }

  const canDeliver = (vente: VenteDirecte) =>
    vente.statut === 'validee' &&
    Array.isArray(vente.lignes) &&
    vente.lignes.some((ligne) => (ligne.quantite_restante ?? ligne.quantite) > 0)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ventes directes"
        subtitle={`${pagination?.total ?? 0} vente(s) directe(s)`}
        actions={
          <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCreate(true)}>
            Nouvelle vente
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-surface-border bg-white p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-400">Statut</div>
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
          placeholder="Tous les clients"
          className="bg-white"
          options={clients.map((client) => ({ value: client.id, label: client.nom }))}
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value)
            setPage(1)
          }}
        />

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
          <TableSkeleton rows={10} cols={7} />
        ) : ventes.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <ShoppingCart className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucune vente directe trouvee</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numero', 'Client', 'Localisation', 'Date', 'Total', 'Statut', ''].map((h) => (
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
                {ventes.map((vente: VenteDirecte) => (
                  <tr key={vente.id} className="cursor-pointer hover:bg-surface-muted/60 transition-colors"
                    onClick={() => router.push(`/ventes-directes/${vente.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="ref-code">{vente.numero}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-steel-800">
                      {vente.client?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {vente.location?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(vente.date)}</td>
                    <td className="px-4 py-3">
                      <span className="amount">{formatMGA(vente.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(vente.statut)} dot>
                        {getLabel(vente.statut)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canDeliver(vente) && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Truck className="h-3.5 w-3.5" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedVente(vente)
                              setShowLivraison(true)
                            }}
                          >
                            Livrer
                          </Button>
                        )}
                        {vente.statut === 'brouillon' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            loading={validating}
                            onClick={(event) =>{ 
                              event.stopPropagation()
                              validerVente(vente.id)
                            }}
                          >
                            Valider
                          </Button>
                        )}
                        {vente.statut === 'validee' && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<RotateCcw className="h-3.5 w-3.5" />}
                            loading={cancelling}
                            onClick={(event) =>{
                              event.stopPropagation()
                              annulerVente(vente.id)}}
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
            currentPage={pagination.current_page}
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
        title="Nouvelle vente directe"
        size="wide"
      >
        <VenteDirecteForm onSuccess={() => setShowCreate(false)} />
      </Dialog>

      <Dialog
        open={showLivraison}
        onClose={() => {
          setShowLivraison(false)
          setSelectedVente(null)
        }}
        title={selectedVente ? `Créer un BL depuis ${selectedVente.numero}` : 'Créer un BL'}
        size="wide"
      >
        {selectedVente && (
          <LivraisonForm
            sourceType="vente_directe"
            source={selectedVente}
            onSuccess={() => {
              setShowLivraison(false)
              setSelectedVente(null)
            }}
          />
        )}
      </Dialog>
    </div>
  )
}