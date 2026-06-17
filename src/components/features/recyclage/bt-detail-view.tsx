'use client'

import Link from 'next/link'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, CheckCircle2, Plus, Factory } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { Select } from '@/components/ui/select'
import { formatDate, formatDateTime, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import {
  useBonTransformation,
  useBtSessions,
  useCreateBtSession,
  useValidateBtSession,
  useClotureBonTransformation,
} from '@/lib/hooks/use-recyclage'
import { btSessionSchema, type BtSessionSchema } from '@/lib/schemas/recyclage.schema'
import type { RecyclageSession } from '@/lib/recyclage.types'

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BtSessionSchema>({
    resolver: zodResolver(btSessionSchema),
    defaultValues: {
      date_session: new Date().toISOString().slice(0, 10),
      machine_broyage: bt?.machine_broyage ?? '',
    },
  })

  const onSubmit = (data: BtSessionSchema) => {
    createSession.mutate(
      { btId, payload: data },
      {
        onSuccess: () => {
          reset()
          setShowSessionDialog(false)
        },
      }
    )
  }

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
              label="Quantité entrée"
              value={bt?.quantite_entree ?? 0}
              icon={<Factory className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Quantité broyée"
              value={bt?.quantite_broyee ?? 0}
              icon={<Factory className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Rendement"
              value={formatPercent(bt?.taux_rendement ?? 0)}
              icon={<Factory className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Perte"
              value={formatPercent(bt?.taux_perte ?? 0)}
              icon={<Factory className="h-5 w-5" />}
              accent={bt && bt.taux_perte > 10 ? 'danger' : 'success'}
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations BT</h2>
            <p className="text-xs text-steel-500">
              Le backend expose le BT et ses sessions de transformation.
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
                <p className="mt-1 font-semibold text-steel-900">{bt.matiere_brute?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Matière broyée</p>
                <p className="mt-1 font-semibold text-steel-900">{bt.matiere_broyee?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Machine</p>
                <p className="mt-1 font-semibold text-steel-900">{bt.machine_broyage}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créé le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(bt.created_at)}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Sessions BT</h2>
            <p className="text-xs text-steel-500">
              Phase 2 et validation de transformation.
            </p>
          </div>
          <Badge variant="info" dot>
            {sessions.length} session(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {loadingSessions ? (
            <TableSkeleton rows={5} cols={8} />
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-steel-500">Aucune session enregistrée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['N°', 'Date', 'Machine', 'Entrée', 'Sortie', 'Matières', 'Employés', 'Statut'].map((h) => (
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
                  {sessions.map((session: RecyclageSession) => (
                    <tr key={session.id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-steel-900">
                        #{session.session_numero}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatDate(session.date_session)}</td>
                      <td className="px-4 py-3 text-steel-600">{session.machine_broyage}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_entree)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_sortie)}</td>
                      <td className="px-4 py-3 text-steel-600">{session.matieres?.length ?? 0}</td>
                      <td className="px-4 py-3 text-steel-600">{session.employes?.length ?? 0}</td>
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
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Date session *"
              type="date"
              error={errors.date_session?.message}
              {...register('date_session')}
            />
            <Input
              label="Machine *"
              placeholder="Machine BT-01"
              error={errors.machine_broyage?.message}
              {...register('machine_broyage')}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSessionDialog(false)}
            >
              Annuler
            </Button>
            <Button type="submit" loading={createSession.isPending}>
              Créer la session
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}