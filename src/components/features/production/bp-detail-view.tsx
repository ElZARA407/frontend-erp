'use client'

import Link from 'next/link'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, CheckCircle2, Factory, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate, formatDateTime, formatPercent, formatQty, getStatutColor } from '@/lib/utils'
import { useBonProduction, useCreateSession, useValiderSession, useClotureBP } from '@/lib/hooks/use-production'
import { sessionSchema, type SessionSchema } from '@/lib/schemas/production.schema'
import type { BpSession } from '@/lib/types'

interface ProductionDetailViewProps {
  bpId: number
}

export function ProductionDetailView({ bpId }: ProductionDetailViewProps) {
  const [showSessionDialog, setShowSessionDialog] = useState(false)

  const { data: bp, isLoading } = useBonProduction(bpId)
  const createSession = useCreateSession()
  const validateSession = useValiderSession()
  const clotureBP = useClotureBP()

  const sessions = Array.isArray(bp?.sessions) ? bp.sessions : []

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SessionSchema>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      date_session: new Date().toISOString().slice(0, 10),
      machine_production: bp?.machine_production ?? '',
    },
  })

  const onSubmit = (data: SessionSchema) => {
    createSession.mutate(
      { bpId, payload: data },
      {
        onSuccess: () => {
          reset()
          setShowSessionDialog(false)
        },
      }
    )
  }

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
            <Button
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setShowSessionDialog(true)}
            >
              Nouvelle session
            </Button>
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
            <StatCard
              label="Quantité cible"
              value={bp?.quantite_cible ?? 0}
              icon={<Factory className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Quantité produite"
              value={bp?.quantite_produite ?? 0}
              icon={<Factory className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Réalisation"
              value={formatPercent(bp?.taux_realisation ?? 0)}
              icon={<Factory className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Coût total"
              value={bp?.cout_total ?? 0}
              isMoney
              icon={<Factory className="h-5 w-5" />}
              accent="primary"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations BP</h2>
            <p className="text-xs text-steel-500">
              Détail du bon de production avec multi-sessions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {bp && (
              <Badge variant={getStatutColor(bp.statut.valeur)} dot>
                {bp.statut.libelle}
              </Badge>
            )}
            {bp && bp.statut.valeur === 'en_cours' && (
              <Button
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={clotureBP.isPending}
                onClick={() => clotureBP.mutate(bp.id)}
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
          ) : bp ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Produit</p>
                <p className="mt-1 font-semibold text-steel-900">{bp.produit?.designation ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Site</p>
                <p className="mt-1 font-semibold text-steel-900">{bp.location?.nom ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Date</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(bp.date)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Machine</p>
                <p className="mt-1 font-semibold text-steel-900">{bp.machine_production}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créé le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDateTime(bp.created_at)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Référence</p>
                <p className="mt-1 font-semibold text-steel-900">{bp.numero}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Sessions de production</h2>
            <p className="text-xs text-steel-500">
              Saisie, suivi et validation par session.
            </p>
          </div>
          <Badge variant="info" dot>
            {sessions.length} session(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={9} />
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-steel-500">Aucune session enregistrée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['N°', 'Date', 'Machine', 'Entrée', 'Sortie', 'Matieres', 'Employés', 'Événements', 'Statut'].map((h) => (
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
                  {sessions.map((session: BpSession & {
                    matieres?: Array<unknown>
                    employes?: Array<unknown>
                    evenements?: Array<unknown>
                    quantite_entree?: number
                    quantite_sortie?: number
                  }) => (
                    <tr key={session.id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-steel-900">
                        #{session.session_numero}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatDate(session.date_session)}</td>
                      <td className="px-4 py-3 text-steel-600">{session.machine_production}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_entree)}</td>
                      <td className="px-4 py-3 text-steel-600">{formatQty(session.quantite_sortie)}</td>
                      <td className="px-4 py-3 text-steel-600">{session.matieres?.length ?? 0}</td>
                      <td className="px-4 py-3 text-steel-600">{session.employes?.length ?? 0}</td>
                      <td className="px-4 py-3 text-steel-600">{session.evenements?.length ?? 0}</td>
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
        title="Nouvelle session de production"
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
              placeholder="Machine INJ-01"
              error={errors.machine_production?.message}
              {...register('machine_production')}
            />
          </div>

          <Input
            label="Coût électricité"
            type="number"
            step="0.01"
            placeholder="0"
            {...register('cout_electricite')}
          />

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