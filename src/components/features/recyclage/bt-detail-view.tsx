'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Factory, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate, formatDateTime, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import {
  useBonTransformation,
  useBtSessions,
  useCreateBtSession,
  useValidateBtSession,
  useClotureBonTransformation,
} from '@/lib/hooks/use-recyclage'
import type { RecyclageSession } from '@/lib/recyclage.types'
import { BtSessionForm } from './bt-session-form'

interface BtDetailViewProps {
  btId: number
}

export function BtDetailView({ btId }: BtDetailViewProps) {
  const [showSessionDialog, setShowSessionDialog] = useState(false)

  const { data: bt, isLoading } = useBonTransformation(btId)
  const { data: sessionsData, isLoading: loadingSessions } = useBtSessions(btId)
  const createSession = useCreateBtSession()
  const validateSession = useValidateBtSession()
  const clotureBt = useClotureBonTransformation()

  const sessions = Array.isArray(sessionsData) ? sessionsData : []

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

  const quantitePrevue = bt?.quantite_entree ?? 0
  const quantiteConsommee = bt?.quantite_nette_consomme ?? 0
  const quantiteBroyee = bt?.quantite_broyee ?? 0
  const tauxRendement = bt?.taux_rendement ?? 0
  const tauxPerte = bt?.taux_perte ?? 0

  return (
    <div className="space-y-5">
      <PageHeader
        title={bt?.numero ?? `BT #${btId}`}
        subtitle={bt ? `Site ${bt.location?.nom ?? '—'}` : 'Chargement...'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setShowSessionDialog(true)}
            >
              Nouvelle session
            </Button>
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
            <StatCard
              label="Quantité prévue"
              value={quantitePrevue}
              icon={<Factory className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Consommée"
              value={quantiteConsommee}
              icon={<Factory className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Broyée produite"
              value={quantiteBroyee}
              icon={<Factory className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Rendement"
              value={formatPercent(tauxRendement)}
              icon={<Factory className="h-5 w-5" />}
              accent={tauxRendement >= 90 ? 'success' : 'warning'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations BT</h2>
            <p className="text-xs text-steel-500">
              Détail du bon de transformation et des sessions associées.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {bt && (
              <Badge variant={getStatutColor(bt.statut.valeur)} dot>
                {bt.statut.libelle}
              </Badge>
            )}
            {bt && ['ouvert', 'en_cours'].includes(bt.statut.valeur) && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={clotureBt.isPending}
                onClick={() => clotureBt.mutate(bt.id)}
              >
                Clôturer
              </Button>
            )}
          </div>
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
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Site</p>
                <p className="mt-1 font-semibold text-steel-900">{bt.location?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(bt.date)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Matière brute</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {bt.matiere_brute?.reference ?? '—'} - {bt.matiere_brute?.nom ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Machine</p>
                <p className="mt-1 font-semibold text-steel-900">{bt.machine?.nom ?? bt.machine_broyage ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Prévu</p>
                <p className="mt-1 font-semibold text-steel-900">{formatQty(bt.quantite_entree)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Observations</p>
                <p className="mt-1 font-semibold text-steel-900">{bt.observations ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Progression</h2>
            <p className="text-xs text-steel-500">Quantité consommée, broyée et pertes.</p>
          </div>
          <Badge variant="info" dot>
            {formatPercent(bt?.taux_avancement ?? 0)} atteint
          </Badge>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-surface-border p-4">
              <p className="text-xs uppercase tracking-wide text-steel-400">Prévu</p>
              <p className="mt-1 text-lg font-semibold text-steel-900">{formatQty(quantitePrevue)}</p>
            </div>
            <div className="rounded-lg border border-surface-border p-4">
              <p className="text-xs uppercase tracking-wide text-steel-400">Nette consommée</p>
              <p className="mt-1 text-lg font-semibold text-steel-900">{formatQty(quantiteConsommee)}</p>
            </div>
            <div className="rounded-lg border border-surface-border p-4">
              <p className="text-xs uppercase tracking-wide text-steel-400">Broyée obtenue</p>
              <p className="mt-1 text-lg font-semibold text-steel-900">{formatQty(quantiteBroyee)}</p>
            </div>
            <div className="rounded-lg border border-surface-border p-4">
              <p className="text-xs uppercase tracking-wide text-steel-400">Perte</p>
              <p className="mt-1 text-lg font-semibold text-steel-900">{formatQty(bt?.perte ?? 0)}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-subtle">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, bt?.taux_avancement ?? 0)}%` }}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Sessions BT</h2>
            <p className="text-xs text-steel-500">Saisie, validation et calculs de transformation.</p>
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
                    {['N°', 'Date', 'Machine', 'Consommée', 'Broyée', 'Perte', 'Rendement', 'Statut', 'Actions'].map((h) => (
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
                  {sessions.map((session: RecyclageSession) => (
                    <tr key={session.id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-steel-900">
                        {session.session_numero}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatDate(session.date_session)}</td>
                      <td className="px-4 py-3 text-steel-600">
                        {session.machine?.nom ?? session.machine_broyage ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_nette_consomme)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_entree)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.calcul?.perte ?? 0)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatPercent(session.calcul?.rendement ?? 0)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={session.statut === 'validee' ? 'success' : 'warning'} dot>
                          {session.statut}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={showSessionDialog}
        onClose={() => setShowSessionDialog(false)}
        title="Nouvelle session BT"
        size="xl"
      >
        {bt && (
          <BtSessionForm
            bt={bt}
            onSuccess={() => setShowSessionDialog(false)}
          />
        )}
      </Dialog>
    </div>
  )
}