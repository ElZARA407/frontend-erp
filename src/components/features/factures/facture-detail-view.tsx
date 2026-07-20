'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { ArrowLeft, CheckCircle2, FileText, Receipt, Truck, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { MODES_PAIEMENT } from '@/lib/constants'
import { useAnnulerFacture, useFacture, usePayerFacture } from '@/lib/hooks/use-factures'
import { formatDate, formatDateTime, formatMGA, formatQty, getStatutColor } from '@/lib/utils'
import { payerFactureSchema, type PayerFactureSchema } from '@/lib/schemas/facture.schema'

interface FactureDetailViewProps {
  factureId: number
}

export function FactureDetailView({ factureId }: FactureDetailViewProps) {
  const [showPayDialog, setShowPayDialog] = useState(false)

  const { data: facture, isLoading } = useFacture(factureId)
  const payerFacture = usePayerFacture()
  const annulerFacture = useAnnulerFacture()

  const lignes = Array.isArray(facture?.lignes) ? facture.lignes : []
  const livraisonsAssociees = Array.isArray(facture?.livraisons) && facture.livraisons.length > 0
    ? facture.livraisons
    : facture?.livraison
      ? [facture.livraison]
      : []

  const montantRestant = facture?.reste_a_payer ?? Math.max((facture?.total ?? 0) - (facture?.montant_paye ?? 0), 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PayerFactureSchema>({
    resolver: zodResolver(payerFactureSchema) as unknown as Resolver<PayerFactureSchema>,
    defaultValues: {
      mode_paiement: 'espece',
      montant_paye: 0,
    },
  })

  useEffect(() => {
    if (!showPayDialog || !facture) return

    reset({
      mode_paiement: 'espece',
      montant_paye: montantRestant,
    })
  }, [facture, montantRestant, reset, showPayDialog])

  const onPay = (values: PayerFactureSchema) => {
    if (!facture) return

    payerFacture.mutate(
      {
        id: facture.id,
        mode_paiement: values.mode_paiement,
        montant_paye: values.montant_paye,
      },
      {
        onSuccess: () => {
          reset()
          setShowPayDialog(false)
        },
      }
    )
  }

  if (!isLoading && !facture) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Facture #${factureId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/factures"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Facture introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={facture?.numero ?? `Facture #${factureId}`}
        subtitle={facture ? `Client ${facture.client?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {facture?.peut_recevoir_paiement && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                onClick={() => setShowPayDialog(true)}
              >
                Payer
              </Button>
            )}
            {facture && facture.statut.valeur === 'emise' && (
              <Button
                variant="outline"
                icon={<XCircle className="h-3.5 w-3.5" />}
                loading={annulerFacture.isPending}
                onClick={() => annulerFacture.mutate(facture.id)}
              >
                Annuler
              </Button>
            )}
            <Link
              href="/factures"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              label="Total"
              value={facture?.total ?? 0}
              isMoney
              icon={<Receipt className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Montant payé"
              value={facture?.montant_paye ?? 0}
              isMoney
              icon={<Receipt className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Reste à payer"
              value={montantRestant}
              isMoney
              icon={<FileText className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="BL associés"
              value={livraisonsAssociees.length}
              icon={<Truck className="h-5 w-5" />}
              accent="primary"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Résumé facture</h2>
            <p className="text-xs text-steel-500">
              Vue simple avec les informations utiles pour la lecture métier.
            </p>
          </div>
          <Badge variant={facture ? getStatutColor(facture.statut.valeur) : 'default'} dot>
            {facture?.statut.libelle ?? '—'}
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : facture ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Client</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {facture.client ? (
                    <Link className="hover:underline" href={`/clients/${facture.client.id}`}>
                      {facture.client.nom}
                    </Link>
                  ) : (
                    '—'
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(facture.date)}</p>
              </div>

              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Échéance paiement
                </p>
                <p className="mt-1 font-semibold text-steel-900">
                  {facture.echeance_paiement ? formatDate(facture.echeance_paiement) : '—'}
                </p>
              </div>

              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Paiement</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {facture.date_paiement ? formatDate(facture.date_paiement) : '—'}
                  {facture.mode_paiement ? ` • ${facture.mode_paiement}` : ''}
                </p>
              </div>

              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créée le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(facture.created_at)}</p>
              </div>

              <div className="rounded-lg border border-surface-border p-4 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Notes</p>
                <p className="mt-1 font-semibold text-steel-900">{facture.notes ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">BL associés</h2>
            <p className="text-xs text-steel-500">
              Une facture peut regrouper plusieurs BL du même client.
            </p>
          </div>
          <Badge variant="info" dot>
            {livraisonsAssociees.length} BL
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : livraisonsAssociees.length === 0 ? (
            <div className="py-10 text-center text-steel-500">Aucune livraison associée.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {livraisonsAssociees.map((livraison) => (
                <Link
                  key={livraison.id}
                  href={`/livraisons/${livraison.id}`}
                  className="rounded-lg border border-surface-border bg-white p-4 transition-colors hover:bg-surface-subtle/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-steel-900">{livraison.numero}</p>
                      <p className="text-xs text-steel-500">
                        {livraison.date_livraison ? formatDate(livraison.date_livraison) : '—'}
                      </p>
                    </div>
                    <Badge variant="info">
                      {formatMGA(livraison.total_livraison ?? 0)}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-steel-500">
                    <div>Statut: {livraison.statut}</div>
                    <div>Lignes: {livraison.lignes_count ?? 0}</div>
                    <div>BC: {livraison.reference_bc ?? '—'}</div>
                    <div>Facture: {livraison.reference_facture ?? '—'}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes de facture</h2>
            <p className="text-xs text-steel-500">Détail des produits facturés.</p>
          </div>
          <Badge variant="info" dot>
            {lignes.length} ligne(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : lignes.length === 0 ? (
            <div className="py-10 text-center text-steel-500">Aucune ligne disponible.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Produit', 'Classement', 'Quantité', 'PU', 'Total', 'Ligne'].map((h) => (
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
                  {lignes.map((ligne) => (
                    <tr key={ligne.id} className="transition-colors hover:bg-surface-muted/60">
                      <td className="px-4 py-3 font-medium text-steel-900">
                        {ligne.produit?.designation ?? ligne.produit?.nomencla ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {ligne.classement?.designation ?? ligne.classement?.libelle ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {formatQty(ligne.quantite)}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {formatMGA(ligne.prix_unitaire)}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {formatMGA(ligne.total_ligne)}
                      </td>
                      <td className="px-4 py-3 text-xs text-steel-500">#{ligne.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={showPayDialog}
        onClose={() => setShowPayDialog(false)}
        title="Enregistrer le paiement"
        size="sm"
      >
        <form onSubmit={handleSubmit(onPay)} className="space-y-4">
          <Input
            label="Montant payé *"
            type="number"
            step="0.01"
            min="0.01"
            error={errors.montant_paye?.message}
            {...register('montant_paye', { valueAsNumber: true })}
          />
          <Select
            label="Mode de paiement *"
            options={MODES_PAIEMENT.map((mode) => ({ value: mode.value, label: mode.label }))}
            placeholder="Choisir…"
            error={errors.mode_paiement?.message}
            {...register('mode_paiement')}
          />
          <div className="rounded-md border border-surface-border bg-surface-subtle/50 px-3 py-2 text-xs text-steel-600">
            Reste à payer: <span className="font-semibold text-steel-900">{formatMGA(montantRestant)}</span>
          </div>
          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <Button type="button" variant="outline" onClick={() => setShowPayDialog(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={payerFacture.isPending}>
              Confirmer le paiement
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}