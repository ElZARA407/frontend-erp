'use client'

import { useState } from 'react'
import { AlertTriangle, Copy, Plus, ShoppingCart, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import { useCommandes, useDuplicateCommande } from '@/lib/hooks/use-commandes'
import { useClients } from '@/lib/hooks/use-clients'
import { useLocations } from '@/lib/hooks/use-organisation'
import type { Client, Commande, Location } from '@/lib/types'
import { CommandeForm } from './commande-form'
import { LivraisonForm } from '../livraisons/livraison-form'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { SortControl, type SortDirection } from '@/components/ui/sort-control'
import { TableScroll } from '@/components/ui/table-scroll'

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]

  if (value && typeof value === 'object') {
    const root = value as { data?: unknown }

    if (Array.isArray(root.data)) return root.data as T[]

    if (root.data && typeof root.data === 'object') {
      const nested = root.data as { data?: unknown }

      if (Array.isArray(nested.data)) return nested.data as T[]
    }
  }

  return []
}

export function CommandesView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [enRetard, setEnRetard] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showLivraison, setShowLivraison] = useState(false)
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [clientId, setClientId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [confirmDuplicateId, setConfirmDuplicateId] = useState<number | null>(null)
  const [dateFin, setDateFin] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const { data: clientsPage } = useClients({ actif: true, per_page: 200 })
  const { data: locationsData } = useLocations()

  const clients = normalizeArray<Client>(clientsPage)
  const locations = normalizeArray<Location>(locationsData)

  const { data, isLoading } = useCommandes({
    search: search.trim() || undefined,
    statut: statut || undefined,
    en_retard: enRetard || undefined,
    client_id: clientId ? Number(clientId) : undefined,
    location_id: locationId ? Number(locationId) : undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_dir: sortDir,
  })
  const { mutate: duplicate } = useDuplicateCommande()

  const commandes = data?.data.data ?? []
  const paginate = data?.data

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'non_livree', label: 'Non livrées' },
    { value: 'partielle', label: 'Partielles' },
    { value: 'livree', label: 'Livrées' },
  ]

  const canDeliver = (commande: Commande) =>
    commande.statut.valeur !== 'livree' &&
    Array.isArray(commande.lignes) &&
    commande.lignes.some((ligne) => (ligne.quantite_restante ?? 0) > 0)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Commandes"
        subtitle={`${paginate?.total ?? 0} commande${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouvelle commande
          </Button>
        }
      />

      {/* <div className="flex flex-wrap items-center gap-3"> */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              className="w-full md:w-72"
              label="Recherche"
              placeholder="Numéro, client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />

            <Select
              className="w-full md:w-56"
              label="Client"
              placeholder="Tous"
              options={clients.map((client) => ({
                value: client.id,
                label: client.nom,
              }))}
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value)
                setPage(1)
              }}
            />

            <Select
              className="w-full md:w-56"
              label="Location"
              placeholder="Toutes"
              options={locations.map((location) => ({
                value: location.id,
                label: location.nom,
              }))}
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value)
                setPage(1)
              }}
            />

            <DateRangeFilter
              className="w-full md:w-[28rem]"
              dateDebut={dateDebut}
              dateFin={dateFin}
              onDateDebutChange={(value) => {
                setDateDebut(value)
                setPage(1)
              }}
              onDateFinChange={(value) => {
                setDateFin(value)
                setPage(1)
              }}
            />

            <SortControl
              sortBy={sortBy}
              sortDir={sortDir}
              options={[
                { value: 'date', label: 'Date commande' },
                { value: 'nom', label: 'Référence commande' },
              ]}
              onSortByChange={(value) => {
                setSortBy(value)
                setPage(1)
              }}
              onSortDirChange={(value) => {
                setSortDir(value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-md border border-surface-border text-xs">
              {statutOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setStatut(value)
                    setPage(1)
                  }}
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
        </div>
      {/* </div> */}

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : commandes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <ShoppingCart className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucune commande trouvée</p>
          </div>
        ) : (
          <TableScroll minWidth="980px">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Numéro', 'Client', 'Date', 'Livraison prévue', 'Montant', 'Statut', ''].map((h) => (
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
              {commandes.map((cmd: Commande) => {
                const canDeliverCommande = canDeliver(cmd)

                return (
                  <tr key={cmd.id} 
                    className={`transition-colors cursor-pointer hover:bg-surface-muted/60 ${cmd.en_retard ? 'bg-red-50/40' : ''}`}
                    onClick={() => router.push(`/commandes/${cmd.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="ref-code">{cmd.numero}</span>
                      {cmd.en_retard && <AlertTriangle className="ml-1.5 inline h-3 w-3 text-red-500" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-steel-800">{cmd.client?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(cmd.date)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(cmd.date_livraison_prevue)}</td>
                    <td className="px-4 py-3">
                      <span className="amount">{formatMGA(cmd.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(cmd.statut.valeur)} dot>
                        {cmd.statut.libelle}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canDeliverCommande && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Truck className="h-3.5 w-3.5" />}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedCommande(cmd)
                              setShowLivraison(true)
                            }}
                          >
                            Livrer
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Copy className="h-3.5 w-3.5" />}
                          onClick={(event) => {
                            event.stopPropagation()
                            setConfirmDuplicateId(cmd.id)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            </table>
        </TableScroll>
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

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle commande" size="wide">
        <CommandeForm onSuccess={() => setShowCreate(false)} />
      </Dialog>

      <Dialog
        open={showLivraison}
        onClose={() => {
          setShowLivraison(false)
          setSelectedCommande(null)
        }}
        title={selectedCommande ? `Créer un BL depuis ${selectedCommande.numero}` : 'Créer un BL'}
        size="wide"
      >
        {selectedCommande && (
          <LivraisonForm
            sourceType="commande"
            source={selectedCommande}
            onSuccess={() => {
              setShowLivraison(false)
              setSelectedCommande(null)
            }}
          />
        )}
      </Dialog>
      <ConfirmationDialog
  open={confirmDuplicateId !== null}
  title="Duplication"
  description="Voulez vous vraiment dupliquer cette commande ?"
  confirmLabel="Oui"
  cancelLabel="Non"
  onClose={() => setConfirmDuplicateId(null)}
  onConfirm={() => {
    if (!confirmDuplicateId) return
    duplicate(confirmDuplicateId)
    setConfirmDuplicateId(null)
  }}
/>
    </div>
  )
}