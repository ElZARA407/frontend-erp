'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Copy, Eye, Plus, ShoppingCart, Truck } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatMGA, getStatutColor } from '@/lib/utils'
import { useCommandes, useDuplicateCommande } from '@/lib/hooks/use-commandes'
import type { Commande } from '@/lib/types'
import { CommandeForm } from './commande-form'
import { LivraisonForm } from '../livraisons/livraison-form'
import { useRouter } from 'next/navigation'

export function CommandesView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [enRetard, setEnRetard] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showLivraison, setShowLivraison] = useState(false)
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const router = useRouter()

  const { data, isLoading } = useCommandes({
    statut: statut || undefined,
    en_retard: enRetard || undefined,
    page,
    per_page: 20,
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

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : commandes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <ShoppingCart className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucune commande trouvée</p>
          </div>
        ) : (
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
                            duplicate(cmd.id)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
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
    </div>
  )
}