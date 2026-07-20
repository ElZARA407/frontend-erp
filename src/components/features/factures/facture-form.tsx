'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertTriangle, CheckSquare, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateFacture, useFacturePreview } from '@/lib/hooks/use-factures'
import { useLivraisons } from '@/lib/hooks/use-livraisons'
import { formatDate, formatMGA, formatQty } from '@/lib/utils'
import type { FacturePreviewLine } from '@/lib/factures.types'

interface FactureFormProps {
  onSuccess?: () => void
  defaultLivraisonId?: number
}

type PreviewLineComputed = FacturePreviewLine & {
  prix_unitaire_edite: number
  total_ligne_edite: number
}

type PreviewLivraisonComputed = {
  id: number
  numero: string
  date_livraison: string | null
  statut: 'prepare' | 'livre' | 'retourne'
  reference_bc: string | null
  reference_facture: string | null
  lignes_count: number
  total_livraison: number
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Impossible de calculer l’aperçu de la facture.'
}

function parseNumber(value: string): number {
  const normalized = value.trim().replace(',', '.')
  if (normalized === '') return Number.NaN
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export function FactureForm({ onSuccess, defaultLivraisonId }: FactureFormProps) {
  const createFacture = useCreateFacture()

  const [search, setSearch] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>(
    defaultLivraisonId ? [defaultLivraisonId] : []
  )
  const [prixOverrides, setPrixOverrides] = useState<Record<number, string>>({})

  useEffect(() => {
    setSelectedIds(defaultLivraisonId ? [defaultLivraisonId] : [])
  }, [defaultLivraisonId])

  const { data: livraisonsPage, isLoading } = useLivraisons({
    statut: 'livre',
    est_facturee: false,
    per_page: 500,
  })

  const livraisons = useMemo(
    () => (Array.isArray(livraisonsPage?.data?.data) ? livraisonsPage.data.data : []),
    [livraisonsPage]
  )

  const selectedIdsKey = useMemo(
    () => Array.from(new Set(selectedIds)).sort((a, b) => a - b),
    [selectedIds]
  )

  const selectedRows = useMemo(
    () => livraisons.filter((livraison) => selectedIdsKey.includes(livraison.id)),
    [livraisons, selectedIdsKey]
  )

  const selectedClientId = selectedRows[0]?.client?.id ?? null

  const filteredLivraisons = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return livraisons.filter((livraison) => {
      const matchesSearch =
        !needle ||
        [livraison.numero, livraison.client?.nom, livraison.reference_bc]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle))

      const livraisonDate = livraison.date_livraison ?? ''
      const matchesStart = !dateDebut || (livraisonDate !== '' && livraisonDate >= dateDebut)
      const matchesEnd = !dateFin || (livraisonDate !== '' && livraisonDate <= dateFin)

      return matchesSearch && matchesStart && matchesEnd
    })
  }, [livraisons, search, dateDebut, dateFin])

  const previewQuery = useFacturePreview(selectedIdsKey)
  const previewData = previewQuery.data ?? null
  const previewErrorMessage = previewQuery.error ? getErrorMessage(previewQuery.error) : null

  useEffect(() => {
    if (!previewData) {
      return
    }

    setPrixOverrides((current) => {
      const next: Record<number, string> = {}

      for (const ligne of previewData.lignes ?? []) {
        next[ligne.ligne_id] = current[ligne.ligne_id] ?? String(ligne.prix_unitaire)
      }

      return next
    })
  }, [previewData])

  const previewLignes = useMemo<PreviewLineComputed[]>(() => {
    if (!previewData) {
      return []
    }

    return (previewData.lignes ?? []).map((ligne) => {
      const overrideRaw = prixOverrides[ligne.ligne_id]
      const prix = parseNumber(overrideRaw ?? String(ligne.prix_unitaire))
      const prixUnitaire = Number.isFinite(prix) ? prix : ligne.prix_unitaire
      const total = Number((ligne.quantite * prixUnitaire).toFixed(2))

      return {
        ...ligne,
        prix_unitaire_edite: prixUnitaire,
        total_ligne_edite: total,
      }
    })
  }, [previewData, prixOverrides])

  const previewLivraisons = useMemo<PreviewLivraisonComputed[]>(() => {
    if (!previewData) {
      return []
    }

    const grouped = new Map<number, PreviewLivraisonComputed>()

    for (const ligne of previewLignes) {
      const current = grouped.get(ligne.livraison_id)

      if (current) {
        current.total_livraison = Number((current.total_livraison + ligne.total_ligne_edite).toFixed(2))
        current.lignes_count += 1
      } else {
        const source = previewData.livraisons.find((item) => item.id === ligne.livraison_id)
        grouped.set(ligne.livraison_id, {
          id: ligne.livraison_id,
          numero: ligne.livraison_numero,
          date_livraison: source?.date_livraison ?? null,
          statut: source?.statut ?? 'livre',
          reference_bc: source?.reference_bc ?? null,
          reference_facture: source?.reference_facture ?? null,
          lignes_count: 1,
          total_livraison: ligne.total_ligne_edite,
        })
      }
    }

    return Array.from(grouped.values())
  }, [previewData, previewLignes])

  const totalAFacturer = useMemo(
    () => previewLignes.reduce((sum, ligne) => sum + ligne.total_ligne_edite, 0),
    [previewLignes]
  )

  const nombreLivraisons = previewLivraisons.length || selectedIdsKey.length
  const nombreLignes = previewLignes.length

  const toggleLivraison = (id: number, clientId?: number | null) => {
    if (selectedClientId && clientId && selectedClientId !== clientId) {
      return
    }

    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (selectedIdsKey.length === 0) {
      return
    }

    try {
      await createFacture.mutateAsync({
        livraison_ids: selectedIdsKey,
        lignes: previewLignes.map((ligne) => ({
          ligne_id: ligne.ligne_id,
          prix_unitaire: ligne.prix_unitaire_edite,
        })),
      })
      onSuccess?.()
    } catch {
      // toast géré par le hook
    }
  }

  const canSubmit = selectedIdsKey.length > 0 && !createFacture.isPending && !previewErrorMessage

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-surface-border bg-surface-subtle/60 p-4">
        <p className="text-sm font-medium text-steel-900">
          Créer une facture à partir d’une ou plusieurs livraisons
        </p>
        <p className="mt-1 text-xs text-steel-500">
          Coche les BL à inclure. Tu peux ajuster les prix unitaires avant création, et le total se
          recalcule immédiatement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <Input
          label="Recherche BL"
          placeholder="Numéro, client, référence BC"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-3.5 w-3.5" />}
        />

        <Input
          label="Du"
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />

        <Input
          label="Au"
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
        />

        <div className="flex items-end">
          <div className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-steel-600">
            {selectedClientId ? (
              <span>
                Client verrouillé:{' '}
                <span className="font-semibold text-steel-900">
                  {previewData?.client?.nom ?? selectedRows[0]?.client?.nom ?? '—'}
                </span>
              </span>
            ) : (
              'Aucun client sélectionné'
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-steel-900">Livraisons disponibles</p>
            <p className="text-xs text-steel-500">
              Une facture ne peut regrouper que des livraisons du même client.
            </p>
          </div>
          <Badge variant="info" dot>
            {selectedIdsKey.length} sélectionnée(s)
          </Badge>
        </div>

        {isLoading ? (
          <div className="p-5 text-sm text-steel-500">Chargement des livraisons…</div>
        ) : filteredLivraisons.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-steel-500">
            Aucune livraison livrée non facturée disponible.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                  <th className="px-4 py-3">Choix</th>
                  <th className="px-4 py-3">BL</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredLivraisons.map((livraison) => {
                  const lockedByClient = !!selectedClientId && livraison.client?.id !== selectedClientId
                  const checked = selectedIdsKey.includes(livraison.id)

                  return (
                    <tr
                      key={livraison.id}
                      className={
                        lockedByClient ? 'bg-surface-subtle/50' : 'hover:bg-surface-subtle/70'
                      }
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={lockedByClient}
                          onChange={() => toggleLivraison(livraison.id, livraison.client?.id)}
                          className="h-4 w-4 rounded border-surface-border text-steel-700 focus:ring-steel-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-steel-900">{livraison.numero}</td>
                      <td className="px-4 py-3 text-steel-600">{livraison.client?.nom ?? '—'}</td>
                      <td className="px-4 py-3 text-steel-600">
                        {formatDate(livraison.date_livraison)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success" dot>
                          Livrée
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* {previewErrorMessage && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{previewErrorMessage}</span>
        </div>
      )} */}

      {selectedIdsKey.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-surface-border bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                BL sélectionnés
              </p>
              <p className="mt-1 text-xl font-semibold text-steel-900">{nombreLivraisons}</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Lignes</p>
              <p className="mt-1 text-xl font-semibold text-steel-900">{nombreLignes}</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                TOTAL À FACTURER
              </p>
              <p className="mt-1 text-2xl font-bold text-steel-900">{formatMGA(totalAFacturer)}</p>
            </div>
          </div>

          {previewLivraisons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-steel-900">
                <CheckSquare className="h-4 w-4" />
                Aperçu des BL sélectionnés
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {previewLivraisons.map((livraison) => (
                  <div
                    key={livraison.id}
                    className="rounded-lg border border-surface-border bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-steel-900">{livraison.numero}</p>
                        <p className="text-xs text-steel-500">
                          {formatDate(livraison.date_livraison)} • {livraison.lignes_count}{' '}
                          ligne(s)
                        </p>
                      </div>
                      <Badge variant="info">{formatMGA(livraison.total_livraison)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewLignes.length > 0 && (
            <div className="rounded-lg border border-surface-border">
              <div className="border-b border-surface-border px-4 py-3">
                <p className="text-sm font-semibold text-steel-900">Lignes facturées</p>
                <p className="text-xs text-steel-500">
                  Snapshot figé des lignes des BL sélectionnés. Le prix unitaire peut être ajusté
                  avant création.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                      <th className="px-4 py-3">BL</th>
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3">Classement</th>
                      <th className="px-4 py-3">Quantité</th>
                      <th className="px-4 py-3">PU</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {previewLignes.map((ligne) => (
                      <tr key={ligne.ligne_id} className="hover:bg-surface-subtle/70">
                        <td className="px-4 py-3 font-medium text-steel-900">
                          {ligne.livraison_numero}
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {ligne.produit?.designation ?? ligne.produit?.nomencla ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {ligne.classement?.designation ?? ligne.classement?.libelle ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-steel-600">{formatQty(ligne.quantite)}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={prixOverrides[ligne.ligne_id] ?? String(ligne.prix_unitaire)}
                            onChange={(e) =>
                              setPrixOverrides((current) => ({
                                ...current,
                                [ligne.ligne_id]: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {formatMGA(ligne.total_ligne_edite)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end border-t border-surface-border pt-4">
        <Button type="submit" loading={createFacture.isPending} disabled={!canSubmit}>
          Créer la facture
        </Button>
      </div>
    </form>
  )
}