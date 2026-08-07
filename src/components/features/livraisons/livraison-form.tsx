'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCreateLivraison } from '@/lib/hooks/use-livraisons'
import { formatDate, formatQty } from '@/lib/utils'
import type { LivraisonCreatePayload } from '@/lib/api/livraisons'

type DeliverySourceLine = {
  id: number
  produit_id: number
  classement_id: number
  quantite: number
  quantite_restante?: number | null
  produit?: { id: number; nomencla?: string; designation?: string } | null
  classement?: {
    id: number
    qualite_libelle?: string | null
    qualite?: string | null
    libelle?: string | null
    designation?: string | null
  } | null
}

type DeliverySource = {
  id: number
  numero: string
  date: string
  client?: { id: number; nom: string } | null
  location?: { id: number; nom: string } | null
  lignes?: DeliverySourceLine[] | null
  livraisons?: Array<{ id: number; numero: string }> | null
}

interface LivraisonFormProps {
  sourceType: 'commande' | 'vente_directe'
  source: DeliverySource
  onSuccess?: () => void
}

type DeliveryRow = {
  id: number
  produit_id: number
  classement_id: number
  ligne_commande_id: number | null
  ligne_vente_directe_id: number | null
  produitLabel: string
  classementLabel: string
  quantiteMax: number
}

function parseQty(value: string): number {
  const normalized = value.trim().replace(',', '.')
  if (normalized === '') return Number.NaN
  return Number(normalized)
}

function getLineMaxQuantity(line: DeliverySourceLine, sourceType: 'commande' | 'vente_directe'): number {
  if (sourceType === 'commande') {
    const remaining = typeof line.quantite_restante === 'number' ? line.quantite_restante : line.quantite
    return Number.isFinite(remaining) ? remaining : 0
  }

  return Number.isFinite(line.quantite) ? line.quantite : 0
}

export function LivraisonForm({ sourceType, source, onSuccess }: LivraisonFormProps) {
  const createLivraison = useCreateLivraison()
  const sourceLines = Array.isArray(source.lignes) ? source.lignes : []

  const rows = useMemo<DeliveryRow[]>(
    () =>
      sourceLines
        .map((line) => {
          const quantiteMax = getLineMaxQuantity(line, sourceType)

          return {
            id: line.id,
            produit_id: line.produit_id,
            classement_id: line.classement_id,
            ligne_commande_id: sourceType === 'commande' ? line.id : null,
            ligne_vente_directe_id: sourceType === 'vente_directe' ? line.id : null,
            produitLabel: line.produit?.designation ?? line.produit?.nomencla ?? '—',
            classementLabel:
              line.classement?.qualite_libelle ??
              line.classement?.libelle ??
              line.classement?.designation ??
              line.classement?.qualite ??
              '—',
            quantiteMax,
          }
        })
        .filter((row) => row.quantiteMax > 0),
    [sourceLines, sourceType]
  )

  const [referenceBc, setReferenceBc] = useState(source.numero)
  const [chauffeur, setChauffeur] = useState('')
  const [vehicule, setVehicule] = useState('')
  const [observations, setObservations] = useState('')
  const [quantites, setQuantites] = useState<Record<number, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dateLivraison, setDateLivraison] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const nextQuantites = Object.fromEntries(
      rows.map((row) => [row.id, String(row.quantiteMax)])
    ) as Record<number, string>

    setReferenceBc(source.numero)
    setChauffeur('')
    setVehicule('')
    setObservations('')
    setQuantites(nextQuantites)
    setSubmitError(null)
    setDateLivraison(new Date().toISOString().slice(0, 10))
  }, [rows, source.numero, source.id, sourceType])

  const totalA_livrer = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const qty = parseQty(quantites[row.id] ?? '')
        return Number.isFinite(qty) ? sum + qty : sum
      }, 0),
    [quantites, rows]
  )

  const canSubmit = rows.length > 0 && !createLivraison.isPending

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!source.client?.id) {
      setSubmitError('Client introuvable sur le document source.')
      return
    }

    if (rows.length === 0) {
      setSubmitError('Aucune ligne livrable.')
      return
    }

    const lignes = rows.map((row) => {
      const quantity = parseQty(quantites[row.id] ?? '')

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(`Quantité invalide pour ${row.produitLabel}.`)
      }

      if (quantity > row.quantiteMax) {
        throw new Error(
          `La quantité de ${row.produitLabel} ne peut pas dépasser ${formatQty(row.quantiteMax)}.`
        )
      }

      return {
        ligne_commande_id: row.ligne_commande_id,
        ligne_vente_directe_id: row.ligne_vente_directe_id,
        produit_id: row.produit_id,
        classement_id: row.classement_id,
        quantite_livree: quantity,
      }
    })

    const payload: LivraisonCreatePayload = {
      source_type: sourceType,
      source_id: source.id,
      client_id: source.client.id,
      reference_bc: referenceBc.trim() || source.numero,
      chauffeur: chauffeur.trim() || null,
      vehicule: vehicule.trim() || null,
      observations: observations.trim() || null,
      date_livraison: dateLivraison || null,
      lignes,
    }

    try {
      setSubmitError(null)
      await createLivraison.mutateAsync(payload)
      onSuccess?.()
    } catch {
      // Toast géré par le hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-surface-border bg-surface-subtle/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info" dot>
            {sourceType === 'commande' ? 'Commande' : 'Vente directe'}
          </Badge>
          <span className="text-sm font-semibold text-steel-900">{source.numero}</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-steel-400">Client</p>
            <p className="mt-1 text-sm font-medium text-steel-900">{source.client?.nom ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-steel-400">Location</p>
            <p className="mt-1 text-sm font-medium text-steel-900">{source.location?.nom ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-steel-400">Date</p>
            <p className="mt-1 text-sm font-medium text-steel-900">{formatDate(source.date)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          label="Référence BC"
          value={referenceBc}
          onChange={(e) => setReferenceBc(e.target.value)}
        />
        <Input
          label="Chauffeur"
          value={chauffeur}
          onChange={(e) => setChauffeur(e.target.value)}
        />
        <Input
          label="Véhicule"
          value={vehicule}
          onChange={(e) => setVehicule(e.target.value)}
        />
        <Input
            label="Date de livraison"
            type="date"
            value={dateLivraison}
            onChange={(e) => setDateLivraison(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-steel-700">Observations</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          className="min-h-24 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-steel-900 outline-none transition-colors placeholder:text-steel-400 focus:border-steel-500 focus:ring-1 focus:ring-steel-500/30"
          placeholder="Observations éventuelles"
        />
      </div>

      {submitError && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="rounded-lg border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-steel-900">Lignes à livrer</p>
            <p className="text-xs text-steel-500">
              {sourceType === 'commande'
                ? 'Les quantités proposées correspondent au reliquat.'
                : 'Les quantités proposées correspondent à la ligne source.'}
            </p>
          </div>
          <Badge variant="info" dot>
            {rows.length} ligne(s)
          </Badge>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-steel-500">
            Aucune ligne livrable.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Classement</th>
                  <th className="px-4 py-3">Disponible</th>
                  <th className="px-4 py-3">Qté à livrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-subtle/70">
                    <td className="px-4 py-3">
                      <div className="font-medium text-steel-900">
                        {row.produitLabel}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-steel-600">{row.classementLabel}</td>
                    <td className="px-4 py-3 text-steel-600">
                      {formatQty(row.quantiteMax)}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={quantites[row.id] ?? ''}
                        onChange={(e) =>
                          setQuantites((current) => ({
                            ...current,
                            [row.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-subtle/40 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-steel-600">
          <Package className="h-4 w-4" />
          <span>Total à livrer</span>
        </div>
        <span className="text-sm font-semibold text-steel-900">
          {formatQty(totalA_livrer)}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={createLivraison.isPending} disabled={!canSubmit || rows.length === 0}>
          Créer le BL
        </Button>
      </div>
    </form>
  )
}