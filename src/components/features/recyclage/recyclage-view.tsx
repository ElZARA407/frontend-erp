'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Factory, Eye, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useBonTransformations, useClotureBonTransformation } from '@/lib/hooks/use-recyclage'
import type { BonTransformation } from '@/lib/recyclage.types'
import { BtForm } from './bt-form'

export function RecyclageView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [locationId, setLocationId] = useState<string>('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data: locationsData } = useLocations()
  const { mutate: clotureBt, isPending: closing } = useClotureBonTransformation()

  const { data, isLoading } = useBonTransformations({
    statut: statut || undefined,
    location_id: locationId ? Number(locationId) : undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
  })

  const locations = Array.isArray(locationsData) ? locationsData : []
  const pagination = data?.data
  const bts = Array.isArray(pagination?.data) ? pagination.data : []

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'ouvert', label: 'Ouverts' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'cloture', label: 'Clôturés' },
    { value: 'annule', label: 'Annulés' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recyclage / Broyage"
        subtitle={`${pagination?.total ?? 0} bon(s) de transformation`}
        actions={
          <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCreate(true)}>
            Nouveau BT
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
          label="Site"
          placeholder="Tous les sites"
          className="bg-white"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          value={locationId}
          onChange={(e) => {
            setLocationId(e.target.value)
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
          <TableSkeleton rows={10} cols={9} />
        ) : bts.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <Factory className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun bon de transformation trouvé</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numéro', 'Date', 'Site', 'Brute', 'Broyée', 'Entrée', 'Rendement', 'Perte', 'Statut', ''].map((h) => (
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
                {bts.map((bt: BonTransformation) => (
                  <tr key={bt.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="ref-code">{bt.numero}</span>
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(bt.date)}</td>
                    <td className="px-4 py-3 text-steel-600">{bt.location?.nom ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-steel-800">
                      {bt.matiere_brute?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-steel-800">
                      {bt.matiere_broyee?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatQty(bt.quantite_entree)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatPercent(bt.taux_rendement)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatPercent(bt.taux_perte)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(bt.statut.valeur)} dot>
                        {bt.statut.libelle}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {['ouvert', 'en_cours'].includes(bt.statut.valeur) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            loading={closing}
                            onClick={() => clotureBt(bt.id)}
                          >
                            Clôturer
                          </Button>
                        )}
                        <Link href={`/recyclage/${bt.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="h-3.5 w-3.5" />}
                          >
                            Voir
                          </Button>
                        </Link>
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
        title="Nouveau bon de transformation"
        size="lg"
      >
        <BtForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
    </div>
  )
}