'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, FileDown, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useAchat, useValiderAchat } from '@/lib/hooks/use-achats'
import { usePdfExport } from '@/lib/hooks/use-pdf-export'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { formatDate, formatDateTime, formatMGA, formatQty, getStatutColor } from '@/lib/utils'
import type { JournalAchat } from '@/lib/types'

interface AchatDetailViewProps {
  achatId: number
}

type AchatLine = NonNullable<JournalAchat['lignes']>[number]

function resolveArticle(line: AchatLine) {
  const article = line.article

  if (article) {
    return {
      reference: article.reference ?? '—',
      designation: article.designation ?? '—',
      unite: article.unite ?? '',
      categorie: article.categorie ?? null,
    }
  }

  if (line.article_type === 'produit') {
    return {
      reference: line.produit?.nomencla ?? '—',
      designation: line.produit?.designation ?? '—',
      unite: line.produit?.unite ?? '',
      categorie: line.produit?.categorie ?? null,
    }
  }

  return {
    reference: line.matiere?.reference ?? '—',
    designation: line.matiere?.nom ?? '—',
    unite: line.matiere?.unite ?? '',
    categorie: null,
  }
}

function resolveClassement(line: AchatLine) {
  return line.classement?.libelle ?? line.classement?.qualite ?? null
}

export function AchatDetailView({ achatId }: AchatDetailViewProps) {
  const { data: achat, isLoading } = useAchat(achatId)
  const validerAchat = useValiderAchat()
  const { exportPdf, isExporting } = usePdfExport()
  const router = useRouter()
  const permissions = usePermissions()
  const [confirmValidateOpen, setConfirmValidateOpen] = useState(false)

  const lignes = useMemo(
  () => (Array.isArray(achat?.lignes) ? achat.lignes : []),
  [achat],
)

  const stats = useMemo(() => {
    const matieres = lignes.filter((line) => (line.article_type ?? 'matiere') === 'matiere').length
    const produits = lignes.filter((line) => line.article_type === 'produit').length
    const quantite = lignes.reduce((sum, line) => sum + Number(line.quantite ?? 0), 0)

    return { matieres, produits, quantite }
  }, [lignes])

  if (!isLoading && !achat) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`BR #${achatId}`}
          subtitle="Bon de réception introuvable"
          actions={
            <Link
              href="/achats"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />

        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Bon de réception introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={achat?.numero ?? `BR #${achatId}`}
        subtitle={achat ? `Fournisseur ${achat.fournisseur?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {permissions.can('validate') && achat?.statut === 'brouillon' && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={validerAchat.isPending}
                onClick={() => setConfirmValidateOpen(true)}
              >
                Valider le BR
              </Button>
            )}

            {achat && (
              <Button
                variant="outline"
                icon={<FileDown className="h-3.5 w-3.5" />}
                loading={isExporting('br', achat.id)}
                onClick={() => exportPdf({ type: 'br', document: achat })}
              >
                Télécharger BR
              </Button>
            )}

            <Button
              variant="outline"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.back()}
            >
              Retour
            </Button>
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
              label="Total BR"
              value={achat?.total ?? 0}
              isMoney
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Lignes"
              value={lignes.length}
              icon={<Package className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Marchandises MCH"
              value={stats.produits}
              icon={<Package className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Quantité reçue"
              value={formatQty(stats.quantite)}
              icon={<Package className="h-5 w-5" />}
              accent="warning"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations BR</h2>
            <p className="text-xs text-steel-500">
              Détail du bon de réception achat.
            </p>
          </div>
          {achat && (
            <Badge variant={getStatutColor(achat.statut)} dot>
              {achat.statut === 'valide' ? 'Validé' : 'Brouillon'}
            </Badge>
          )}
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : achat ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Info label="Fournisseur" value={achat.fournisseur?.nom ?? '—'} />
              <Info label="Location" value={achat.location?.nom ?? '—'} />
              <Info label="Date BR" value={achat.date ? formatDate(achat.date) : '—'} />
              <Info label="Véhicule" value={achat.vehicule ?? '—'} />
              <Info label="Créé le" value={formatDateTime(achat.created_at ?? '')} />
              <Info label="Observations" value={achat.observations ?? '—'} />
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Lignes réceptionnées</h2>
            <p className="text-xs text-steel-500">
              Matières premières et produits MCH réceptionnés.
            </p>
          </div>
          <Badge variant="info" dot>
            {lignes.length} ligne(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : lignes.length === 0 ? (
            <div className="py-10 text-center text-steel-500">Aucune ligne enregistrée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Type', 'Référence', 'Désignation', 'Classement', 'Quantité', 'Prix unitaire', 'Total'].map((h) => (
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
                  {lignes.map((ligne) => {
                    const article = resolveArticle(ligne)
                    const classement = resolveClassement(ligne)
                    const isProduit = ligne.article_type === 'produit'

                    return (
                      <tr key={ligne.id} className="transition-colors hover:bg-surface-muted/60">
                        <td className="px-4 py-3">
                          <Badge variant={isProduit ? 'info' : 'muted'} dot>
                            {isProduit ? 'Produit MCH' : 'Matière'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="ref-code">{article.reference}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-steel-800">
                          {article.designation}
                          {article.categorie ? (
                            <span className="ml-2 text-xs font-normal text-steel-400">
                              {article.categorie}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {classement ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {formatQty(ligne.quantite)} {article.unite}
                        </td>
                        <td className="px-4 py-3 text-steel-600">
                          {formatMGA(ligne.prix_unitaire)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-steel-900">
                          {formatMGA(ligne.total_ligne)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmationDialog
        open={confirmValidateOpen}
        title="Validation"
        description="Voulez vous vraiment valider ce bon de réception ?"
        confirmLabel="Oui"
        cancelLabel="Non"
        loading={validerAchat.isPending}
        onClose={() => setConfirmValidateOpen(false)}
        onConfirm={() => {
          if (!achat) return
          validerAchat.mutate(achat.id, {
            onSuccess: () => setConfirmValidateOpen(false),
          })
        }}
      />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-surface-border bg-surface-subtle px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-steel-900">{value}</p>
    </div>
  )
}