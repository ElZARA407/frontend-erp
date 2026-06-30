'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Factory,
  Plus,
  Receipt,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import {
  useAnnulerBP,
  useBonProduction,
  useClotureBP,
  useCreateSession,
  useValiderSession,
} from '@/lib/hooks/use-production'
import { sessionSchema, type SessionSchema } from '@/lib/schemas/production.schema'
import {
  formatDate,
  formatDateTime,
  formatMGA,
  formatPercent,
  getStatutColor,
} from '@/lib/utils'
import type { BpSession } from '@/lib/types'

interface ProductionDetailViewProps {
  bpId: number
}

type SessionRow = BpSession & {
  matieres?: unknown[]
  obtenus?: unknown[]
  employes?: unknown[]
  evenements?: unknown[]
}

export function ProductionDetailView({ bpId }: ProductionDetailViewProps) {
  const [showSessionDialog, setShowSessionDialog] = useState(false)

  const { data: bp, isLoading } = useBonProduction(bpId)
  const createSession = useCreateSession()
  const validateSession = useValiderSession()
  const clotureBP = useClotureBP()
  const annulerBP = useAnnulerBP()

  const sessions = Array.isArray(bp?.sessions) ? (bp.sessions as SessionRow[]) : []
  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SessionSchema>({
    resolver: zodResolver(sessionSchema)as any,
    defaultValues: {
      date_session: today,
      machine_production: '',
      cout_electricite: undefined,
    },
  })

  const openSessionDialog = () => {
    reset({
      date_session: today,
      machine_production: bp?.machine_production ?? '',
      cout_electricite: undefined,
    })
    setShowSessionDialog(true)
  }

  const onSubmit = (values: SessionSchema) => {
    createSession.mutate(
      { bpId, payload: values },
      {
        onSuccess: () => {
          reset({
            date_session: today,
            machine_production: bp?.machine_production ?? '',
            cout_electricite: undefined,
          })
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
            {bp && bp.statut.valeur === 'ouvert' && (
              <Button
                variant="danger"
                icon={<XCircle className="h-3.5 w-3.5" />}
                loading={annulerBP.isPending}
                onClick={() => annulerBP.mutate(bp.id)}
              >
                Annuler
              </Button>
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
            {bp && ['ouvert', 'en_cours'].includes(bp.statut.valeur) && (
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
            <StatCard
              label="Quantité cible"
              value={bp?.quantite_cible ?? 0}
              icon={<Factory className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              label="Quantité produite"
              value={bp?.quantite_produite ?? 0}
              icon={<TrendingUp className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              label="Taux de réalisation"
              value={formatPercent(bp?.taux_realisation ?? 0)}
              icon={<Clock3 className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              label="Coût total"
              value={bp?.cout_total ?? 0}
              isMoney
              icon={<Receipt className="h-5 w-5" />}
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
              Vue détaillée du bon de production et de ses sessions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {bp && (
              <Badge variant={getStatutColor(bp.statut.valeur)} dot>
                {bp.statut.libelle}
              </Badge>
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
              <InfoField label="Produit" value={bp.produit?.designation ?? '—'} />
              <InfoField label="Site" value={bp.location?.nom ?? '—'} />
              <InfoField label="Date" value={formatDate(bp.date)} />
              <InfoField label="Machine" value={bp.machine_production} />
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
              Les sessions validées alimentent les mouvements de stock et les coûts.
            </p>
          </div>
          <Badge variant="info" dot>
            {sessions.length} session(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={11} />
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
                      'Matières',
                      'Obtenus',
                      'Employés',
                      'Événements',
                      'Électricité',
                      'Coût total',
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
                    <tr key={session.id} className="transition-colors hover:bg-surface-muted/60">
                      <td className="px-4 py-3 font-medium text-steel-900">
                        #{session.session_numero}
                      </td>
                      <td className="px-4 py-3 text-steel-600">{formatDate(session.date_session)}</td>
                      <td className="px-4 py-3 text-steel-600">{session.machine_production}</td>
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
                        <Badge variant={getStatutColor(session.statut)} dot>
                          {session.statut === 'validee' ? 'Validée' : 'Ouverte'}
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
            error={errors.cout_electricite?.message}
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

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-surface-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-steel-400">{label}</p>
      <p className="mt-1 font-semibold text-steel-900">{value}</p>
    </div>
  )
}