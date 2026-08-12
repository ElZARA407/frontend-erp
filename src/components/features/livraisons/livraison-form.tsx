'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCreateLivraison, useUpdateLivraison } from '@/lib/hooks/use-livraisons'
import { formatDate, formatQty } from '@/lib/utils'
import type { LivraisonCreatePayload, LivraisonLinePayload } from '@/lib/api/livraisons'
import type { Livraison } from '@/lib/types'

type SourceType = 'commande' | 'vente_directe'

type DeliverySourceLine = {
  id: number
  produit_id: number
  classement_id: number
  quantite: number
  quantite_restante?: number | null
  produit?: { id: number; nomencla?: string | null; designation?: string | null } | null
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
}

interface LivraisonFormProps {
  sourceType?: SourceType
  source?: DeliverySource
  defaultValues?: Livraison
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
  quantiteMax: number | null
  quantiteInitiale: number
}

function parseQty(value: string): number {
  const normalized = value.trim().replace(',', '.')
  if (normalized === '') return Number.NaN
  return Number(normalized)
}

const EMPTY_LINES: DeliverySourceLine[] = []
const EMPTY_LIVRAISON_LINES: NonNullable<Livraison['lignes']> = []

function getLineMaxQuantity(line: DeliverySourceLine, sourceType: SourceType): number {
  if (sourceType === 'commande') {
    const remaining = typeof line.quantite_restante === 'number' ? line.quantite_restante : line.quantite
    return Number.isFinite(remaining) ? remaining : 0
  }

  const remaining = typeof line.quantite_restante === 'number' ? line.quantite_restante : line.quantite
  return Number.isFinite(remaining) ? remaining : 0
}

export function LivraisonForm({ sourceType, source, defaultValues, onSuccess }: LivraisonFormProps) {
  const isEditing = !!defaultValues?.id
  const createLivraison = useCreateLivraison()
  const updateLivraison = useUpdateLivraison()

  const resolvedSourceType = sourceType ?? defaultValues?.source_type ?? 'commande'
  const sourceLines = Array.isArray(source?.lignes) ? source.lignes : EMPTY_LINES
  const livraisonLines = Array.isArray(defaultValues?.lignes)
    ? defaultValues.lignes
    : EMPTY_LIVRAISON_LINES

  const rows = useMemo<DeliveryRow[]>(() => {
    if (isEditing) {
      return livraisonLines.map((line) => ({
        id: line.id,
        produit_id: line.produit_id,
        classement_id: line.classement_id,
        ligne_commande_id: line.ligne_commande_id ?? null,
        ligne_vente_directe_id: line.ligne_vente_directe_id ?? null,
        produitLabel: line.produit?.designation ?? line.produit?.nomencla ?? '—',
        classementLabel:
          line.classement?.designation ??
          line.classement?.libelle ??
          line.classement?.qualite ??
          '—',
        quantiteMax: null,
        quantiteInitiale: line.quantite_livree,
      }))
    }

    return sourceLines
      .map((line) => {
        const quantiteMax = getLineMaxQuantity(line, resolvedSourceType)

        return {
          id: line.id,
          produit_id: line.produit_id,
          classement_id: line.classement_id,
          ligne_commande_id: resolvedSourceType === 'commande' ? line.id : null,
          ligne_vente_directe_id: resolvedSourceType === 'vente_directe' ? line.id : null,
          produitLabel: line.produit?.designation ?? line.produit?.nomencla ?? '—',
          classementLabel:
            line.classement?.qualite_libelle ??
            line.classement?.libelle ??
            line.classement?.designation ??
            line.classement?.qualite ??
            '—',
          quantiteMax,
          quantiteInitiale: quantiteMax,
        }
      })
      .filter((row) => row.quantiteMax !== null && row.quantiteMax > 0)
  }, [isEditing, livraisonLines, sourceLines, resolvedSourceType])

  const [referenceBc, setReferenceBc] = useState('')
  const [chauffeur, setChauffeur] = useState('')
  const [vehicule, setVehicule] = useState('')
  const [observations, setObservations] = useState('')
  const [quantites, setQuantites] = useState<Record<number, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dateLivraison, setDateLivraison] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const nextQuantites = Object.fromEntries(
      rows.map((row) => [row.id, String(row.quantiteInitiale)])
    ) as Record<number, string>

    setReferenceBc(defaultValues?.reference_bc ?? source?.numero ?? '')
    setChauffeur(defaultValues?.chauffeur ?? '')
    setVehicule(defaultValues?.vehicule ?? '')
    setObservations(defaultValues?.observations ?? '')
    setQuantites(nextQuantites)
    setSubmitError(null)
    setDateLivraison(defaultValues?.date_livraison ?? new Date().toISOString().slice(0, 10))
 }, [
  rows,
  source?.numero,
  defaultValues?.id,
  defaultValues?.reference_bc,
  defaultValues?.chauffeur,
  defaultValues?.vehicule,
  defaultValues?.observations,
  defaultValues?.date_livraison,
])

  const totalA_livrer = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const qty = parseQty(quantites[row.id] ?? '')
        return Number.isFinite(qty) ? sum + qty : sum
      }, 0),
    [quantites, rows]
  )

  const isPending = createLivraison.isPending || updateLivraison.isPending
  const canSubmit = rows.length > 0 && !isPending

  const buildLines = (): LivraisonLinePayload[] =>
    rows.map((row) => {
      const quantity = parseQty(quantites[row.id] ?? '')

      if (!Number.isFinite(quantity) || quantity < 0) {
        throw new Error(`Quantité invalide pour ${row.produitLabel}.`)
      }

      if (!isEditing && row.quantiteMax !== null && quantity > row.quantiteMax) {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const lignes = buildLines()

      setSubmitError(null)

      if (isEditing && defaultValues) {
        await updateLivraison.mutateAsync({
          id: defaultValues.id,
          payload: {
            reference_bc: referenceBc.trim() || null,
            chauffeur: chauffeur.trim() || null,
            vehicule: vehicule.trim() || null,
            observations: observations.trim() || null,
            date_livraison: dateLivraison || null,
            lignes,
          },
        })
        onSuccess?.()
        return
      }

      if (!source || !sourceType || !source.client?.id) {
        setSubmitError('Source ou client introuvable pour cette livraison.')
        return
      }

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

      await createLivraison.mutateAsync(payload)
      onSuccess?.()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Impossible d’enregistrer la livraison.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-surface-border bg-surface-subtle/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info" dot>
            {resolvedSourceType === 'commande' ? 'Commande' : 'Vente directe'}
          </Badge>
          <span className="text-sm font-semibold text-steel-900">
            {isEditing ? (defaultValues?.numero ?? 'Préparation') : source?.numero}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-steel-400">Client</p>
            <p className="mt-1 text-sm font-medium text-steel-900">
              {defaultValues?.client?.nom ?? source?.client?.nom ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-steel-400">Source</p>
            <p className="mt-1 text-sm font-medium text-steel-900">
              {isEditing
                ? (defaultValues?.source?.numero ?? `#${defaultValues?.source_id}`)
                : source?.numero}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-steel-400">Date source</p>
            <p className="mt-1 text-sm font-medium text-steel-900">
              {source?.date ? formatDate(source.date) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input label="Référence BC" value={referenceBc} onChange={(e) => setReferenceBc(e.target.value)} />
        <Input label="Chauffeur" value={chauffeur} onChange={(e) => setChauffeur(e.target.value)} />
        <Input label="Véhicule" value={vehicule} onChange={(e) => setVehicule(e.target.value)} />
        <Input label="Date de livraison" type="date" value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)} />
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
              {isEditing
                ? 'Modification possible tant que la livraison n’est pas confirmée.'
                : 'Les quantités proposées correspondent au reliquat.'}
            </p>
          </div>
          <Badge variant="info" dot>
            {rows.length} ligne(s)
          </Badge>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-steel-500">Aucune ligne livrable.</div>
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
                    <td className="px-4 py-3 font-medium text-steel-900">{row.produitLabel}</td>
                    <td className="px-4 py-3 text-steel-600">{row.classementLabel}</td>
                    <td className="px-4 py-3 text-steel-600">
                      {row.quantiteMax === null ? 'Modifiable' : formatQty(row.quantiteMax)}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
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
        <span className="text-sm font-semibold text-steel-900">{formatQty(totalA_livrer)}</span>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-surface-border pt-4">
        <Button type="submit" loading={isPending} disabled={!canSubmit}>
          {isEditing ? 'Mettre à jour' : 'Créer le BL'}
        </Button>
      </div>
    </form>
  )
}