'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  BadgeInfo,
  CheckCircle2,
  Clock3,
  Factory,
  Plus,
  Recycle,
  Scale,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { formatDate, formatDateTime, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import {
  useBonTransformation,
  useBtSessions,
  useClotureBonTransformation,
  useValidateBtSession,
} from '@/lib/hooks/use-recyclage'
import type { RecyclageSession, RecyclageSessionEvenement, RecyclageSessionMatiere } from '@/lib/recyclage.types'
import { BtSessionForm } from './bt-session-form'

interface BtDetailViewProps {
  btId: number
}

type ConfirmAction =
  | { type: 'validate-session'; session: RecyclageSession }
  | { type: 'cloture-bt' }
  | null

function getSessionStatusLabel(statut: string) {
  return statut === 'validee' ? 'Validée' : 'Ouverte'
}

function getSessionStatusVariant(statut: string) {
  return statut === 'validee' ? 'success' : 'warning'
}

function getEventLabel(type: string | undefined): string {
  if (type === 'broyage') return 'Broyage'
  if (type === 'pause') return 'Pause'
  if (type === 'panne') return 'Panne'
  if (type === 'autre') return 'Autre'
  return '—'
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number | string
  icon: ReactNode
  accent: 'primary' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
          <p className="mt-1 text-lg font-semibold text-steel-900">{value}</p>
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

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-surface-border px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-steel-900">{value}</p>
    </div>
  )
}

export function BtDetailView({ btId }: BtDetailViewProps) {
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const { data: bt, isLoading } = useBonTransformation(btId)
  const { data: sessionsData, isLoading: loadingSessions } = useBtSessions(btId)
  const validateSession = useValidateBtSession()
  const clotureBt = useClotureBonTransformation()

  const sessions = Array.isArray(sessionsData) ? sessionsData : []

  useEffect(() => {
    if (selectedSessionId !== null) return
    if (!sessions.length) return

    setSelectedSessionId(sessions[0].id)
  }, [selectedSessionId, sessions])

  const selectedSession = useMemo(() => {
    if (!sessions.length) return null

    return sessions.find((session) => session.id === selectedSessionId) ?? sessions[0] ?? null
  }, [selectedSessionId, sessions])

  const quantitePrevue = bt?.quantite_entree ?? 0
  const quantiteConsommee = bt?.quantite_nette_consomme ?? 0
  const quantiteBroyee = bt?.quantite_broyee ?? 0
  const tauxRendement = bt?.taux_rendement ?? 0
  const tauxPerte = bt?.taux_perte ?? 0
  const canCloturer = bt ? ['ouvert', 'en_cours'].includes(bt.statut.valeur) : false
  const confirmLoading = validateSession.isPending || clotureBt.isPending

  const handleConfirm = () => {
    if (!confirmAction || !bt) return

    if (confirmAction.type === 'validate-session') {
      validateSession.mutate(confirmAction.session.id, {
        onSuccess: () => setConfirmAction(null),
      })
      return
    }

    if (confirmAction.type === 'cloture-bt') {
      clotureBt.mutate(bt.id, {
        onSuccess: () => setConfirmAction(null),
      })
    }
  }

  const confirmDescription =
  confirmAction?.type === 'validate-session'
    ? 'Voulez vous vraiment valider cette session de transformation ?'
    : 'Voulez vous vraiment clôturer ce bon de transformation ?'
    
  if (!isLoading && !bt) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`BT #${btId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/recyclage"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />

        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Bon de transformation introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={bt?.numero ?? `BT #${btId}`}
        subtitle={bt ? `Matière brute ${bt.matiere_brute?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            {bt && canCloturer && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={clotureBt.isPending}
                onClick={() => setConfirmAction({ type: 'cloture-bt' })}
              >
                Clôturer
              </Button>
            )}

            {bt && !['annule', 'cloture'].includes(bt.statut.valeur) && (
              <Button
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setShowSessionDialog(true)}
              >
                Nouvelle session
              </Button>
            )}

            <Link
              href="/recyclage"
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
              label="Quantité prévue"
              value={formatQty(quantitePrevue)}
              icon={<Factory className="h-5 w-5" />}
              accent="primary"
            />
            <SummaryCard
              label="Nette consommée"
              value={formatQty(quantiteConsommee)}
              icon={<Scale className="h-5 w-5" />}
              accent="warning"
            />
            <SummaryCard
              label="Broyée obtenue"
              value={formatQty(quantiteBroyee)}
              icon={<Recycle className="h-5 w-5" />}
              accent="success"
            />
            <SummaryCard
              label="Rendement"
              value={formatPercent(tauxRendement)}
              icon={<TrendingUp className="h-5 w-5" />}
              accent={tauxRendement >= 90 ? 'success' : 'warning'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations du bon de transformation</h2>
            <p className="text-xs text-steel-500">
              Vue générale de l’ordre de transformation et de son avancement.
            </p>
          </div>

          {bt && (
            <Badge variant={getStatutColor(bt.statut.valeur)} dot>
              {bt.statut.libelle}
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
          ) : bt ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoField label="Site" value={bt.location?.nom ?? '—'} />
              <InfoField label="Date" value={formatDate(bt.date)} />
              <InfoField
                label="Matière brute"
                value={`${bt.matiere_brute?.reference ?? '—'} - ${bt.matiere_brute?.nom ?? '—'}`}
              />
              <InfoField label="Machine" value={bt.machine?.nom ?? bt.machine_broyage ?? '—'} />
              <InfoField label="Quantité prévue" value={formatQty(bt.quantite_entree)} />
              <InfoField label="Créé le" value={bt.created_at ? formatDateTime(bt.created_at) : '—'} />
              <InfoField label="Perte totale" value={formatQty(bt.perte ?? 0)} />
              <InfoField label="Taux de perte" value={formatPercent(tauxPerte)} />
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Sessions de transformation</h2>
            <p className="text-xs text-steel-500">
              Chaque session ouverte peut être consultée puis validée pour générer les mouvements de stock.
            </p>
          </div>

          <Badge variant="info" dot>
            {sessions.length} session(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {loadingSessions ? (
            <TableSkeleton rows={5} cols={9} />
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-steel-500">Aucune session enregistrée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {[
                      'N°',
                      'Date',
                      'Machine',
                      'Sortie brute',
                      'Restituée',
                      'Nette',
                      'Entrée broyée',
                      'Rendement',
                      'Statut',
                    ].map((h) => (
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
                        selectedSessionId === session.id ? 'bg-surface-subtle/70' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-steel-900">
                        {session.session_numero}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatDate(session.date_session)}</td>
                      <td className="px-4 py-3 text-steel-600">
                        {session.machine?.nom ?? session.machine_broyage ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_sortie)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_restituee)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_nette_consomme)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_entree)}</td>
                      <td className="px-4 py-3 text-steel-600">
                        {formatPercent(session.calcul?.rendement ?? 0)}
                      </td>
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
                              onClick={() => setConfirmAction({ type: 'validate-session', session })}
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

      {selectedSession && <BtSessionDetailsPanel session={selectedSession} />}

      <Dialog
        open={showSessionDialog}
        onClose={() => setShowSessionDialog(false)}
        title="Nouvelle session BT"
        size="wide"
      >
        {bt && (
          <BtSessionForm
            bt={bt}
            onSuccess={() => setShowSessionDialog(false)}
          />
        )}
      </Dialog>

      <ConfirmationDialog
        open={confirmAction !== null}
        title={confirmAction?.type === 'validate-session' ? 'Valider la session' : 'Clôturer le BT'}
        description={confirmDescription}
        confirmLabel={confirmAction?.type === 'validate-session' ? 'Valider' : 'Clôturer'}
        variant={confirmAction?.type === 'validate-session' ? 'primary' : 'danger'}
        loading={confirmLoading}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

function BtSessionDetailsPanel({ session }: { session: RecyclageSession }) {
  const matieres = Array.isArray(session.matieres) ? session.matieres : []
  const sorties = matieres.filter((line) => line.type === 'sortie')
  const entrees = matieres.filter((line) => line.type === 'entree')
  const employes = Array.isArray(session.employes) ? session.employes : []
  const evenements = Array.isArray(session.evenements) ? session.evenements : []

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold text-steel-900">
            Session {session.session_numero}
          </h2>
          <p className="text-xs text-steel-500">
            Détail complet de la session sélectionnée.
          </p>
        </div>

        <Badge variant={getSessionStatusVariant(session.statut)} dot>
          {getSessionStatusLabel(session.statut)}
        </Badge>
      </CardHeader>

      <CardBody className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <MiniStat label="Sorties" value={sorties.length} />
          <MiniStat label="Entrées" value={entrees.length} />
          <MiniStat label="Employés" value={employes.length} />
          <MiniStat label="Événements" value={evenements.length} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Brute utilisée"
            value={formatQty(session.quantite_sortie)}
            icon={<Scale className="h-5 w-5" />}
            accent="warning"
          />
          <SummaryCard
            label="Restituée"
            value={formatQty(session.quantite_restituee)}
            icon={<Scale className="h-5 w-5" />}
            accent="primary"
          />
          <SummaryCard
            label="Nette consommée"
            value={formatQty(session.quantite_nette_consomme)}
            icon={<Factory className="h-5 w-5" />}
            accent="danger"
          />
          <SummaryCard
            label="Broyée obtenue"
            value={formatQty(session.quantite_entree)}
            icon={<Recycle className="h-5 w-5" />}
            accent="success"
          />
        </div>

        {session.calcul && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Perte"
              value={formatQty(session.calcul.perte)}
              icon={<Scale className="h-5 w-5" />}
              accent="danger"
            />
            <SummaryCard
              label="Rendement"
              value={formatPercent(session.calcul.rendement)}
              icon={<TrendingUp className="h-5 w-5" />}
              accent={session.calcul.rendement >= 90 ? 'success' : 'warning'}
            />
            <SummaryCard
              label="Taux perte"
              value={formatPercent(session.calcul.taux_perte)}
              icon={<TrendingUp className="h-5 w-5" />}
              accent="warning"
            />
            <SummaryCard
              label="Temps brut"
              value={`${formatQty(session.calcul.temps_brut)} h`}
              icon={<Clock3 className="h-5 w-5" />}
              accent="primary"
            />
            <SummaryCard
              label="Temps effectif"
              value={`${formatQty(session.calcul.temps_effectif)} h`}
              icon={<Clock3 className="h-5 w-5" />}
              accent="success"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DetailListBlock
            title="Sorties matière brute"
            emptyText="Aucune sortie saisie."
            items={sorties}
            renderItem={(line) => <MatiereLine line={line} />}
          />

          <DetailListBlock
            title="Entrées matière broyée"
            emptyText="Aucune entrée saisie."
            items={entrees}
            renderItem={(line) => <MatiereLine line={line} />}
          />

          <DetailListBlock
            title="Équipe"
            emptyText="Aucun employé ajouté."
            items={employes}
            renderItem={(line) => (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-steel-900">
                    {line.employe?.nom_complet ?? `Employé #${line.id}`}
                  </p>
                  <p className="text-xs text-steel-500">
                    {line.employe?.matricule ?? '—'} - {line.employe?.poste?.nom ?? 'Sans poste'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Badge variant="info">{formatQty(line.heures_effectives ?? line.heures_brutes)} h</Badge>
                  <Badge variant="default">TH {formatQty(line.taux_horaire)}</Badge>
                  <Badge variant="success">Coût {formatQty(line.cout ?? 0)}</Badge>
                </div>
              </div>
            )}
          />

          <DetailListBlock
            title="Événements"
            emptyText="Aucun événement enregistré."
            items={evenements}
            renderItem={(line) => <EvenementLine line={line} />}
          />
        </div>
      </CardBody>
    </Card>
  )
}

function MatiereLine({ line }: { line: RecyclageSessionMatiere }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-medium text-steel-900">
          {line.matiere?.reference ?? '—'} - {line.matiere?.nom ?? `Matière #${line.id}`}
        </p>
        <p className="text-xs text-steel-500">
          Type : {line.type === 'sortie' ? 'Sortie' : 'Entrée'}
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Badge variant={line.type === 'sortie' ? 'warning' : 'success'}>
          Quantité {formatQty(line.quantite)}
        </Badge>

        {line.type === 'sortie' && (
          <Badge variant="info">
            Restituée {formatQty(line.quantite_restituee)}
          </Badge>
        )}
      </div>
    </div>
  )
}

function EvenementLine({ line }: { line: RecyclageSessionEvenement }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-medium text-steel-900">{getEventLabel(line.type_evenement)}</p>
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
  renderItem: (item: T) => ReactNode
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