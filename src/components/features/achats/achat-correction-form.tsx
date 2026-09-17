'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCorrectAchatAdmin } from '@/lib/hooks/use-achats'
import { createIdempotencyKey } from '@/lib/idempotency'
import { formatMGA, formatQty } from '@/lib/utils'
import type { JournalAchat } from '@/lib/types'

type AchatCorrectionFormProps = {
  achat: JournalAchat
  onSuccess: () => void
}

type EditableLine = {
  id: number
  label: string
  quantite: number
  prix_unitaire: number
}

export function AchatCorrectionForm({
  achat,
  onSuccess,
}: AchatCorrectionFormProps) {
  const correction = useCorrectAchatAdmin()

  const lignes = useMemo<EditableLine[]>(
    () =>
      (Array.isArray(achat.lignes) ? achat.lignes : []).map((ligne) => {
        const label =
          ligne.article_type === 'produit'
            ? ligne.produit?.designation ?? `Produit #${ligne.produit_id}`
            : ligne.matiere?.nom ?? `Matière #${ligne.matiere_id}`

        return {
          id: ligne.id,
          label,
          quantite: Number(ligne.quantite),
          prix_unitaire: Number(ligne.prix_unitaire),
        }
      }),
    [achat.lignes],
  )

  const [motif, setMotif] = useState('')
  const [quantites, setQuantites] = useState<Record<number, string>>(() =>
    Object.fromEntries(lignes.map((ligne) => [ligne.id, String(ligne.quantite)])),
  )
  const [error, setError] = useState<string | null>(null)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const motifCorrection = motif.trim()

    if (motifCorrection.length < 5) {
      setError('Le motif de correction doit contenir au moins 5 caractères.')
      return
    }

    const payloadLines = []

    for (const ligne of lignes) {
    const quantite = Number((quantites[ligne.id] ?? '').replace(',', '.'))

    if (!Number.isFinite(quantite) || quantite <= 0) {
        setError(`Quantité invalide pour ${ligne.label}.`)
        return
    }

    payloadLines.push({
        id: ligne.id,
        quantite,
        prix_unitaire: ligne.prix_unitaire,
    })
    }

    setError(null)

    correction.mutate(
      {
        id: achat.id,
        idempotencyKey: createIdempotencyKey(),
        payload: {
          motif_correction: motifCorrection,
          lignes: payloadLines,
        },
      },
      {
        onSuccess,
        onError: () => undefined,
      },
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Correction administrateur tracée</p>
            <p className="mt-1 text-amber-800">
              Les quantités seront corrigées par mouvements compensatoires.
              Les articles, la location, le fournisseur et les prix unitaires sont inchangeable.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-steel-700">
          Motif de correction *
        </label>
        <textarea
          value={motif}
          onChange={(event) => setMotif(event.target.value)}
          minLength={5}
          required
          placeholder="Exemple : erreur de saisie constatée après contrôle du bordereau fournisseur."
          className="min-h-24 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-steel-900 outline-none focus:border-steel-500 focus:ring-1 focus:ring-steel-500/30"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Prix verrouillé</th>
              <th className="px-4 py-3">Nouvelle quantité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {lignes.map((ligne) => (
              <tr key={ligne.id}>
                <td className="px-4 py-3 font-medium text-steel-900">
                  {ligne.label}
                </td>
                <td className="px-4 py-3 text-steel-600">
                  <Badge variant="muted">{formatMGA(ligne.prix_unitaire)}</Badge>
                </td>
                <td className="w-48 px-4 py-3">
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={quantites[ligne.id] ?? ''}
                    onChange={(event) =>
                      setQuantites((current) => ({
                        ...current,
                        [ligne.id]: event.target.value,
                      }))
                    }
                    aria-label={`Quantité corrigée ${ligne.label}`}
                  />
                  <p className="mt-1 text-xs text-steel-400">
                    Ancienne : {formatQty(ligne.quantite)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={correction.isPending}>
          Enregistrer la correction
        </Button>
      </div>
    </form>
  )
}