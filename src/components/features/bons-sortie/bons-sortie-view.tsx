'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, Plus, Package, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, getStatutColor } from '@/lib/utils'
import { MOTIFS_SORTIE } from '@/lib/constants'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useValiderBonSortie, useBonsSortie } from '@/lib/hooks/use-bons-sortie'
import type { BonSortie } from '@/lib/bons-sortie.types'
import { BonSortieForm } from './bon-sortie-form'
import { FileDown } from 'lucide-react'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'

export function BonsSortieView() {
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState<string>('')
  const [locationId, setLocationId] = useState<string>('')
  const [motif, setMotif] = useState<string>('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { exportPdf, isExporting } = usePdfExport()

  const { data: locationsData } = useLocations()
  const { mutate: validerBonSortie, isPending: validating } = useValiderBonSortie()

  const { data, isLoading } = useBonsSortie({
    statut: statut || undefined,
    location_id: locationId ? Number(locationId) : undefined,
    motif: motif || undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
    page,
    per_page: 20,
  })

  const locations = Array.isArray(locationsData) ? locationsData : []
  const pagination = data?.data
  const bons = Array.isArray(pagination?.data) ? pagination.data : []

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'brouillon', label: 'Brouillons' },
    { value: 'valide', label: 'Validés' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bons de sortie"
        subtitle={`${pagination?.total ?? 0} bon(s) de sortie`}
        actions={
          <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCreate(true)}>
            Nouveau BS
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
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
          label="Location"
          placeholder="Toutes les locations"
          className="bg-white"
          options={locations.map((location) => ({ value: location.id, label: location.nom }))}
          value={locationId}
          onChange={(e) => {
            setLocationId(e.target.value)
            setPage(1)
          }}
        />

        <Select
          label="Motif"
          placeholder="Tous les motifs"
          className="bg-white"
          options={MOTIFS_SORTIE.map((item) => ({ value: item.value, label: item.label }))}
          value={motif}
          onChange={(e) => {
            setMotif(e.target.value)
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
          <TableSkeleton rows={10} cols={8} />
        ) : bons.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-steel-400">
              <Package className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Aucun bon de sortie trouvé</p>
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Numéro', 'Localisation', 'Client', 'Motif', 'Date', 'Statut', ''].map((h) => (
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
                {bons.map((bon: BonSortie) => (
                  <tr key={bon.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="ref-code">{bon.numero}</span>
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {bon.location?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {bon.client?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-steel-600">
                      {MOTIFS_SORTIE.find((item) => item.value === bon.motif)?.label ?? bon.motif}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(bon.date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatutColor(bon.statut)} dot>
                        {bon.statut === 'brouillon' ? 'Brouillon' : 'Validé'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {bon.statut === 'brouillon' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            loading={validating}
                            onClick={() => validerBonSortie(bon.id)}
                          >
                            Valider
                          </Button>
                        )}
                        <Link href={`/bons-sortie/${bon.id}`}>
                          <Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />}>
                            Voir
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<FileDown className="h-3.5 w-3.5" />}
                          loading={isExporting('bon_sortie', bon.id)}
                          onClick={() => exportPdf({ type: 'bon_sortie', document: bon })}
                        >
                          PDF
                        </Button>
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
        title="Nouveau bon de sortie"
        size="xl"
      >
        <BonSortieForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
    </div>
  )
}