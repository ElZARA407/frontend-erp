'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BadgeInfo, CheckCircle2, Clock3, Factory, Plus, Receipt, TrendingUp, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { BpSessionCreateForm } from './bp-session-form'
import { useAnnulerBP, useBonProduction, useClotureBP, useValiderSession } from '@/lib/hooks/use-production'
import { formatDate, formatDateTime, formatMGA, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import type { BpSession } from '@/lib/types'

interface ProductionDetailViewProps {
  bpId: number
}

type SessionMatiereRow = {
  id: number
  quantite_utilisee: number
  quantite_restituee: number
  cout_matiere?: number
  matiere?: {
    id: number
    nom: string
    reference: string
  }
}

type SessionObtenuRow = {
  id: number
  quantite_produite: number
  produit?: {
    id: number
    nomencla: string
    designation: string
  }
  classement?: {
    id: number
    qualite?: string
    libelle?: string
  }
  destination?: {
    id: number
    nom: string
  }
}

type SessionEmployeRow = {
  id: number
  heures_brutes: number
  heures_effectives?: number
  cout?: number
  employe?: {
    id: number
    nom: string
    prenom: string
    matricule: string
    nom_complet?: string
    poste?: {
      id: number
      nom: string
    }
  }
}

type SessionEvenementType = 'production' | 'panne' | 'autre'

type SessionEvenementRow = {
  id: number
  type_evenement: SessionEvenementType
  heure_debut: string
  heure_fin?: string | null
  description?: string | null
  operateur?: {
    id: number
    nom: string
  }
}

type SessionRow = BpSession & {
  matieres?: SessionMatiereRow[]
  obtenus?: SessionObtenuRow[]
  employes?: SessionEmployeRow[]
  evenements?: SessionEvenementRow[]
}

function getEventLabel(type: SessionEvenementType | string | undefined): string {
  if (type === 'production') return 'Production'
  if (type === 'panne') return 'Panne'
  if (type === 'autre') return 'Autre'
  return '—'
}

function getSessionStatusLabel(statut: string) {
  return statut === 'validee' ? 'Validée' : 'Ouverte'
}

function getSessionStatusVariant(statut: string) {
  return statut === 'validee' ? 'success' : 'warning'
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
  isMoney,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent: 'primary' | 'success' | 'warning' | 'danger'
  isMoney?: boolean
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
          <p className="mt-1 text-lg font-semibold text-steel-900">
            {isMoney ? formatMGA(Number(value)) : value}
          </p>
        </div>
        <div
          className={[
            'rounded-md p-2',
            accent === 'primary' ? 'bg-sky-50 text-sky-600' : '',
            accent === 'success' ? 'bg-emerald-50 text-emerald-600' : '',
            accent === 'warning' ? 'bg-amber-50 text-amber-600' : '',
            accent === 'danger' ? 'bg-red-50 text-red-600' : '',
          ].join(' ')}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-surface-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-1 font-semibold text-steel-900">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-surface-border px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-steel-900">{value}</p>
    </div>
  )
}

export function ProductionDetailView({ bpId }: ProductionDetailViewProps) {
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

  const { data: bp, isLoading } = useBonProduction(bpId)
  const validateSession = useValiderSession()
  const clotureBP = useClotureBP()
  const annulerBP = useAnnulerBP()

  const sessions = Array.isArray(bp?.sessions) ? (bp.sessions as SessionRow[]) : []

  useEffect(() => {
    if (selectedSessionId !== null) return
    if (!sessions.length) return
    setSelectedSessionId(sessions[0].id)
  }, [selectedSessionId, sessions])

  const selectedSession = useMemo(() => {
    if (!sessions.length) return null
    return sessions.find((session) => session.id === selectedSessionId) ?? sessions[0] ?? null
  }, [selectedSessionId, sessions])

  const openSessionDialog = () => {
    setShowSessionDialog(true)
  }

  const canAnnuler = bp?.statut?.valeur === 'ouvert'
  const canCloturer = bp?.statut?.valeur === 'en_cours' && (bp?.taux_realisation ?? 0) >= 100

  if (!isLoading && !bp) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`BP #${bpId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/production"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Bon de production introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={bp?.numero ?? `BP #${bpId}`}
        subtitle={bp ? `Produit ${bp.produit?.designation ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {bp && canAnnuler && (
              <Button
                variant="danger"
                icon={<XCircle className="h-3.5 w-3.5" />}
                loading={annulerBP.isPending}
                onClick={() => annulerBP.mutate(bp.id)}
              >
                Annuler
              </Button>
            )}
            {bp && canCloturer && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={clotureBP.isPending}
                onClick={() => clotureBP.mutate(bp.id)}
              >
                Clôturer
              </Button>
            )}
            {bp && bp.statut?.valeur !== 'annule' && bp.statut?.valeur !== 'cloture' && (
              <Button
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={openSessionDialog}
              >
                Nouvelle session
              </Button>
            )}
            <Link
              href="/production"
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
            <SummaryCard
              label="Quantité cible"
              value={formatQty(bp?.quantite_cible ?? 0)}
              icon={<Factory className="h-5 w-5" />}
              accent="primary"
            />
            <SummaryCard
              label="Quantité produite"
              value={formatQty(bp?.quantite_produite ?? 0)}
              icon={<TrendingUp className="h-5 w-5" />}
              accent="success"
            />
            <SummaryCard
              label="Taux de réalisation"
              value={formatPercent(bp?.taux_realisation ?? 0)}
              icon={<Clock3 className="h-5 w-5" />}
              accent="warning"
            />
            <SummaryCard
              label="Coût total"
              value={bp?.cout_total ?? 0}
              icon={<Receipt className="h-5 w-5" />}
              accent="primary"
              isMoney
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations du bon de production</h2>
            <p className="text-xs text-steel-500">
              Vue simple, lisible et centrée sur le suivi de fabrication.
            </p>
          </div>
          {bp && (
            <Badge variant={getStatutColor(bp.statut.valeur)} dot>
              {bp.statut.libelle}
            </Badge>
          )}
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : bp ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoField label="Produit" value={bp.produit?.designation ?? '—'} />
              <InfoField label="Site" value={bp.location?.nom ?? '—'} />
              <InfoField label="Machine" value={bp.machine?.nom ?? '—'} />
              <InfoField label="Date" value={formatDate(bp.date)} />
              <InfoField label="Créé le" value={formatDateTime(bp.created_at)} />
              <InfoField label="Référence" value={bp.numero} />
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Sessions de production</h2>
            <p className="text-xs text-steel-500">
              Chaque session saisie alimente ensuite les mouvements de stock après validation.
            </p>
          </div>
          <Badge variant="info" dot>
            {sessions.length} session(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={10} />
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-steel-500">Aucune session enregistrée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['N°', 'Date', 'Machine', 'Matières', 'Obtenus', 'Employés', 'Événements', 'Électricité', 'Coût total', 'Statut'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className={`transition-colors hover:bg-surface-muted/60 ${
                        selectedSessionId === session.id ? 'bg-surface-subtle/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-steel-900">
                        #{session.session_numero}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatDate(session.date_session)}</td>
                      <td className="px-4 py-3 text-steel-600">{session.machine?.nom ?? '—'}</td>
                      <td className="px-4 py-3 text-steel-600">
                        {Array.isArray(session.matieres) ? session.matieres.length : 0}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {Array.isArray(session.obtenus) ? session.obtenus.length : 0}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {Array.isArray(session.employes) ? session.employes.length : 0}
                      </td>
                      <td className="px-4 py-3 text-steel-600">
                        {Array.isArray(session.evenements) ? session.evenements.length : 0}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatMGA(session.cout_electricite)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatMGA(session.cout_total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getSessionStatusVariant(session.statut)} dot>
                          {getSessionStatusLabel(session.statut)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant={selectedSessionId === session.id ? 'primary' : 'ghost'}
                            size="sm"
                            icon={<BadgeInfo className="h-3.5 w-3.5" />}
                            onClick={() => setSelectedSessionId(session.id)}
                          >
                            Détails
                          </Button>
                          {session.statut === 'ouverte' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                              loading={validateSession.isPending}
                              onClick={() => validateSession.mutate(session.id)}
                            >
                              Valider
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {selectedSession && (
        <SessionDetailsPanel session={selectedSession} />
      )}

      <Dialog
        open={showSessionDialog}
        onClose={() => setShowSessionDialog(false)}
        title="Nouvelle session de production"
        size="wide"
      >
        <BpSessionCreateForm
          bp={bp}
          bpId={bpId}
          onSuccess={() => setShowSessionDialog(false)}
        />
      </Dialog>
    </div>
  )
}

function SessionDetailsPanel({ session }: { session: SessionRow }) {
  const counts = {
    matieres: Array.isArray(session.matieres) ? session.matieres.length : 0,
    obtenus: Array.isArray(session.obtenus) ? session.obtenus.length : 0,
    employes: Array.isArray(session.employes) ? session.employes.length : 0,
    evenements: Array.isArray(session.evenements) ? session.evenements.length : 0,
  }

  const totalMatiere = Array.isArray(session.matieres)
    ? session.matieres.reduce((sum, row) => sum + Number(row.quantite_utilisee ?? 0), 0)
    : 0

  const totalProduit = Array.isArray(session.obtenus)
    ? session.obtenus.reduce((sum, row) => sum + Number(row.quantite_produite ?? 0), 0)
    : 0

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold text-steel-900">
            Session #{session.session_numero}
          </h2>
          <p className="text-xs text-steel-500">
            Résumé lisible de la session sélectionnée.
          </p>
        </div>
        <Badge variant={getSessionStatusVariant(session.statut)} dot>
          {getSessionStatusLabel(session.statut)}
        </Badge>
      </CardHeader>

      <CardBody className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <MiniStat label="Matières" value={counts.matieres} />
          <MiniStat label="Produits obtenus" value={counts.obtenus} />
          <MiniStat label="Employés" value={counts.employes} />
          <MiniStat label="Événements" value={counts.evenements} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-surface-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Informations</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-steel-400">Date</p>
                <p className="font-medium text-steel-900">{formatDate(session.date_session)}</p>
              </div>
              <div>
                <p className="text-xs text-steel-400">Machine</p>
                <p className="font-medium text-steel-900">{session.machine?.nom ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-steel-400">Électricité</p>
                <p className="font-medium text-steel-900">{formatMGA(session.cout_electricite)}</p>
              </div>
              <div>
                <p className="text-xs text-steel-400">Coût total</p>
                <p className="font-medium text-steel-900">{formatMGA(session.cout_total)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-surface-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Totaux saisis</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-steel-400">Matières utilisées</p>
                <p className="font-medium text-steel-900">{formatQty(totalMatiere)}</p>
              </div>
              <div>
                <p className="text-xs text-steel-400">Produits obtenus</p>
                <p className="font-medium text-steel-900">{formatQty(totalProduit)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DetailListBlock
            title="Matières consommées"
            emptyText="Aucune matière saisie."
            items={Array.isArray(session.matieres) ? session.matieres : []}
            renderItem={(line) => (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-steel-900">
                    {line.matiere?.nom ?? line.matiere?.reference ?? `Matière #${line.id}`}
                  </p>
                  <p className="text-xs text-steel-500">
                    Utilisée {formatQty(line.quantite_utilisee)} - Restituée {formatQty(line.quantite_restituee)}
                  </p>
                </div>
                <Badge variant="info">{formatMGA(line.cout_matiere ?? 0)}</Badge>
              </div>
            )}
          />

          <DetailListBlock
            title="Produits obtenus"
            emptyText="Aucun produit obtenu."
            items={Array.isArray(session.obtenus) ? session.obtenus : []}
            renderItem={(line) => (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-steel-900">
                    {line.produit?.designation ?? line.produit?.nomencla ?? `Produit #${line.id}`}
                  </p>
                  <p className="text-xs text-steel-500">
                    {line.classement?.libelle ?? line.classement?.qualite ?? '—'} - {line.destination?.nom ?? '—'}
                  </p>
                </div>
                <Badge variant="success">{formatQty(line.quantite_produite)}</Badge>
              </div>
            )}
          />

          <DetailListBlock
            title="Équipe"
            emptyText="Aucun employé ajouté."
            items={Array.isArray(session.employes) ? session.employes : []}
            renderItem={(line) => (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-steel-900">
                    {line.employe?.nom_complet ||
                      `${line.employe?.prenom ?? ''} ${line.employe?.nom ?? ''}`.trim() ||
                      `Employé #${line.id}`}
                  </p>
                  <p className="text-xs text-steel-500">
                    {line.employe?.matricule ?? '—'} - {line.employe?.poste?.nom ?? 'Sans poste'}
                  </p>
                </div>
                <Badge variant="info">{formatQty(line.heures_brutes)} h</Badge>
              </div>
            )}
          />

          <DetailListBlock
            title="Événements"
            emptyText="Aucun événement enregistré."
            items={Array.isArray(session.evenements) ? session.evenements : []}
            renderItem={(line) => (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-steel-900">
                    {getEventLabel(line.type_evenement)}
                  </p>
                  <p className="text-xs text-steel-500">
                    {line.heure_debut}
                    {line.heure_fin ? ` - ${line.heure_fin}` : ''}
                    {line.operateur?.nom ? ` • ${line.operateur.nom}` : ''}
                  </p>
                  {line.description && (
                    <p className="mt-1 text-xs text-steel-600">{line.description}</p>
                  )}
                </div>
                <Badge variant="warning">{getEventLabel(line.type_evenement)}</Badge>
              </div>
            )}
          />
        </div>
      </CardBody>
    </Card>
  )
}

function DetailListBlock<T>({
  title,
  emptyText,
  items,
  renderItem,
}: {
  title: string
  emptyText: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-surface-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{title}</p>

      {items.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-surface-border px-3 py-4 text-sm text-steel-500">
          {emptyText}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((item, index) => (
            <div
              key={(item as { id?: number }).id ?? index}
              className="rounded-md border border-surface-border bg-white px-3 py-2 text-sm"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}