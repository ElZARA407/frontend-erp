'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  BadgeInfo,
  CheckCircle2,
  Clock3,
  Factory,
  FlaskConical,
  Plus,
  Receipt,
  TrendingUp,
  UserRound,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { BpSessionCreateForm } from './bp-session-form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { useLocations } from '@/lib/hooks/use-organisation'
import { useEmployes } from '@/lib/hooks/use-rh'
import {
  useAddProductionEmploye,
  useAddProductionEvenement,
  useAddProductionMatiere,
  useAddProductionObtenu,
  useAnnulerBP,
  useBonProduction,
  useClotureBP,
  useCreateSession,
  useMachines,
  useValiderSession,
} from '@/lib/hooks/use-production'
import { useMatieres, useProducts } from '@/lib/hooks/use-catalogue'
import {
  bpEmployeSchema,
  bpEvenementSchema,
  bpMatiereSchema,
  bpObtenuSchema,
  sessionSchema,
  type BpEmployeSchema,
  type BpEvenementSchema,
  type BpMatiereSchema,
  type BpObtenuSchema,
  type SessionSchema,
} from '@/lib/schemas/production.schema'
import type { BpSession, Location, Machine } from '@/lib/types'
import type { CatalogueMatiere, CatalogueProduct } from '@/lib/catalogue.types'
import type { RhEmploye } from '@/lib/rh.types'
import { formatDate, formatDateTime, formatMGA, formatPercent, formatQty, getStatutColor } from '@/lib/utils'

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

type SessionEvenementRow = {
  id: number
  type_evenement: 'debut' | 'fin' | 'panne' | 'autre'
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

type DetailTab = 'matieres' | 'obtenus' | 'employes' | 'evenements'

export function ProductionDetailView({ bpId }: ProductionDetailViewProps) {
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

  const { data: bp, isLoading } = useBonProduction(bpId)
  const { data: locationsData } = useLocations()
  const { data: machinesData } = useMachines()

  const createSession = useCreateSession()
  const validateSession = useValiderSession()
  const clotureBP = useClotureBP()
  const annulerBP = useAnnulerBP()

  const sessions = Array.isArray(bp?.sessions) ? (bp.sessions as SessionRow[]) : []
  const locations = Array.isArray(locationsData) ? locationsData : []
  const machines = Array.isArray(machinesData) ? machinesData : []
  const today = new Date().toISOString().slice(0, 10)

  const machineOptions = useMemo(
    () => machines.map((machine) => ({ value: machine.id, label: machine.nom })),
    [machines]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<SessionSchema>({
    resolver: zodResolver(sessionSchema) as any,
    defaultValues: {
      date_session: today,
      machine_id: 0,
      cout_electricite: undefined,
    },
  })

  useEffect(() => {
    if (!machines.length) return
    if (getValues('machine_id') > 0) return

    reset({
      date_session: today,
      machine_id: bp?.machine_id ?? machines[0]?.id ?? 0,
      cout_electricite: undefined,
    })
  }, [bp?.machine_id, getValues, machines, reset, today])

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
    reset({
      date_session: today,
      machine_id: bp?.machine_id ?? machines[0]?.id ?? 0,
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
            machine_id: bp?.machine_id ?? machines[0]?.id ?? 0,
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
            {bp && bp.statut.valeur === 'en_cours' && bp.taux_realisation >= 100 && (
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
              Les sessions validées alimentent les mouvements de stock et les coûts.
            </p>
          </div>
          <Badge variant="info" dot>
            {sessions.length} session(s)
          </Badge>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={12} />
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
                        {/* {Array.isArray(session.obtenus) ? session.obtenus.length : 0} */}
                        {session.obtenus?.map((obtenu) => (
                          <div key={obtenu.id} className="text-[11px] text-steel-400">
                             {formatQty(obtenu.quantite_produite)}
                          </div>
                        ))}
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
        <SessionDetailsPanel
          key={selectedSession.id}
          session={selectedSession}
        />
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
  const [tab, setTab] = useState<DetailTab>('matieres')

  const counts = {
    matieres: Array.isArray(session.matieres) ? session.matieres.length : 0,
    obtenus: Array.isArray(session.obtenus) ? session.obtenus.length : 0,
    employes: Array.isArray(session.employes) ? session.employes.length : 0,
    evenements: Array.isArray(session.evenements) ? session.evenements.length : 0,
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-sm font-semibold text-steel-900">
            Saisie détaillée de la session #{session.session_numero}
          </h2>
          <p className="text-xs text-steel-500">
            Les lignes de session sont saisies ici. La validation reste ce qui déclenche les mouvements de stock.
          </p>
        </div>
        <Badge variant={session.statut === 'validee' ? 'success' : 'warning'} dot>
          {session.statut === 'validee' ? 'Verrouillée' : 'Ouverte'}
        </Badge>
      </CardHeader>

      <CardBody className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <MiniStat label="Matières" value={counts.matieres} />
          <MiniStat label="Obtenus" value={counts.obtenus} />
          <MiniStat label="Employés" value={counts.employes} />
          <MiniStat label="Événements" value={counts.evenements} />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'matieres', label: 'Matières', icon: FlaskConical },
            { key: 'obtenus', label: 'Produits obtenus', icon: Factory },
            { key: 'employes', label: 'Employés', icon: UserRound },
            { key: 'evenements', label: 'Événements', icon: Clock3 },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant={tab === key ? 'primary' : 'outline'}
              size="sm"
              icon={<Icon className="h-3.5 w-3.5" />}
              onClick={() => setTab(key as DetailTab)}
            >
              {label}
            </Button>
          ))}
        </div>

        {session.statut === 'validee' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Session validée. La saisie est verrouillée.
          </div>
        ) : tab === 'matieres' ? (
          <SessionMatiereSection session={session} />
        ) : tab === 'obtenus' ? (
          <SessionObtenuSection session={session} />
        ) : tab === 'employes' ? (
          <SessionEmployeSection session={session} />
        ) : (
          <SessionEvenementSection session={session} />
        )}
      </CardBody>
    </Card>
  )
}

function SessionMatiereSection({ session }: { session: SessionRow }) {
  const { data: matieresPage } = useMatieres({ actif: true, per_page: 100 })
  const matieres = Array.isArray(matieresPage?.data?.data) ? matieresPage.data.data : []
  const addMatiere = useAddProductionMatiere()

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<BpMatiereSchema>({
    resolver: zodResolver(bpMatiereSchema) as any,
    defaultValues: {
      matiere_id: 0,
      quantite_utilisee: 1,
      quantite_restituee: 0,
    },
  })

  useEffect(() => {
    if (!matieres.length) return
    if (getValues('matiere_id') > 0) return

    reset({
      matiere_id: matieres[0]?.id ?? 0,
      quantite_utilisee: 1,
      quantite_restituee: 0,
    })
  }, [getValues, matieres, reset])

  const onSubmit = async (values: BpMatiereSchema) => {
    await addMatiere.mutateAsync({
      sessionId: session.id,
      payload: values,
    })

    reset({
      matiere_id: getValues('matiere_id') || matieres[0]?.id || 0,
      quantite_utilisee: 1,
      quantite_restituee: 0,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Select
          label="Matière *"
          options={matieres.map((matiere: CatalogueMatiere) => ({
            value: matiere.id,
            label: `${matiere.reference} - ${matiere.nom}`,
          }))}
          placeholder={matieres.length ? 'Choisir une matière' : 'Aucune matière disponible'}
          error={errors.matiere_id?.message}
          disabled={!matieres.length}
          {...register('matiere_id', { valueAsNumber: true })}
        />
        <Input
          label="Quantité utilisée *"
          type="number"
          step="0.001"
          error={errors.quantite_utilisee?.message}
          {...register('quantite_utilisee', { valueAsNumber: true })}
        />
        <Input
          label="Quantité restituée"
          type="number"
          step="0.001"
          error={errors.quantite_restituee?.message}
          {...register('quantite_restituee', { valueAsNumber: true })}
        />
        <div className="flex items-end">
          <Button type="submit" loading={addMatiere.isPending} className="w-full">
            Ajouter
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {Array.isArray(session.matieres) && session.matieres.length > 0 ? (
          session.matieres.map((line) => (
            <div key={line.id} className="rounded-md border border-surface-border px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
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
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-surface-border px-3 py-4 text-sm text-steel-500">
            Aucune matière saisie pour cette session.
          </div>
        )}
      </div>
    </div>
  )
}

function SessionObtenuSection({ session }: { session: SessionRow }) {
  const { data: productsPage } = useProducts({ actif: true, per_page: 100 })
  const { data: locationsData } = useLocations()
  const products = Array.isArray(productsPage?.data?.data) ? productsPage.data.data : []
  const locations = Array.isArray(locationsData) ? locationsData : []
  const addObtenu = useAddProductionObtenu()

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BpObtenuSchema>({
    resolver: zodResolver(bpObtenuSchema) as any,
    defaultValues: {
      produit_id: 0,
      classement_id: 0,
      quantite_produite: 1,
      destination_location_id: 0,
    },
  })

  const selectedProductId = watch('produit_id')

  const selectedProduct = useMemo(() => {
    const fallback = products.find((product) => Array.isArray(product.stocks_par_qualite) && product.stocks_par_qualite.length > 0)
      ?? products[0]
    return products.find((product) => product.id === selectedProductId) ?? fallback ?? null
  }, [products, selectedProductId])

  const classementOptions = useMemo(() => {
    const rows = Array.isArray(selectedProduct?.stocks_par_qualite) ? selectedProduct.stocks_par_qualite : []

    return rows.map((item) => ({
      value: item.classement_id,
      label: `${item.libelle ?? item.qualite} (${formatQty(item.stock_total)})`,
    }))
  }, [selectedProduct])

  useEffect(() => {
    if (!products.length || !locations.length) return

    const current = getValues()
    if (current.produit_id > 0 && current.classement_id > 0 && current.destination_location_id > 0) return

    const defaultProduct = products.find((product) => Array.isArray(product.stocks_par_qualite) && product.stocks_par_qualite.length > 0)
      ?? products[0]
    const defaultClassement = defaultProduct?.stocks_par_qualite?.[0]?.classement_id ?? 0

    reset({
      produit_id: defaultProduct?.id ?? 0,
      classement_id: defaultClassement,
      quantite_produite: 1,
      destination_location_id: locations[0]?.id ?? 0,
    })
  }, [getValues, locations, products, reset])

  useEffect(() => {
    if (!classementOptions.length) return
    const currentClassement = getValues('classement_id')

    if (!classementOptions.some((option) => option.value === currentClassement)) {
      setValue('classement_id', classementOptions[0]?.value ?? 0, { shouldValidate: true })
    }
  }, [classementOptions, getValues, setValue])

  const onSubmit = async (values: BpObtenuSchema) => {
    await addObtenu.mutateAsync({
      sessionId: session.id,
      payload: values,
    })

    const current = getValues()
    reset({
      produit_id: current.produit_id || selectedProduct?.id || products[0]?.id || 0,
      classement_id: current.classement_id || classementOptions[0]?.value || 0,
      quantite_produite: 1,
      destination_location_id: current.destination_location_id || locations[0]?.id || 0,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Select
          label="Produit *"
          options={products.map((product: CatalogueProduct) => ({
            value: product.id,
            label: `${product.nomencla} - ${product.designation}`,
          }))}
          placeholder={products.length ? 'Choisir un produit' : 'Aucun produit actif'}
          error={errors.produit_id?.message}
          disabled={!products.length}
          {...register('produit_id', { valueAsNumber: true })}
        />
        <Select
          label="Classement *"
          options={classementOptions}
          placeholder={
            classementOptions.length
              ? 'Choisir un classement'
              : 'Aucun classement disponible pour ce produit'
          }
          error={errors.classement_id?.message}
          disabled={!classementOptions.length}
          {...register('classement_id', { valueAsNumber: true })}
        />
        <Input
          label="Quantité produite *"
          type="number"
          step="0.001"
          error={errors.quantite_produite?.message}
          {...register('quantite_produite', { valueAsNumber: true })}
        />
        <Select
          label="Destination *"
          options={locations.map((location: Location) => ({
            value: location.id,
            label: location.nom,
          }))}
          placeholder={locations.length ? 'Choisir une destination' : 'Aucune location'}
          error={errors.destination_location_id?.message}
          disabled={!locations.length}
          {...register('destination_location_id', { valueAsNumber: true })}
        />
        <div className="md:col-span-4 flex justify-end">
          <Button type="submit" loading={addObtenu.isPending}>
            Ajouter le produit obtenu
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {Array.isArray(session.obtenus) && session.obtenus.length > 0 ? (
          session.obtenus.map((line) => (
            <div key={line.id} className="rounded-md border border-surface-border px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-steel-900">
                    {line.produit?.designation ?? line.produit?.nomencla ?? `Produit #${line.id}`}
                  </p>
                  <p className="text-xs text-steel-500">
                    Classement {line.classement?.libelle ?? line.classement?.qualite ?? '—'} - Destination{' '}
                    {line.destination?.nom ?? '—'}
                  </p>
                </div>
                <Badge variant="success">{formatQty(line.quantite_produite)}</Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-surface-border px-3 py-4 text-sm text-steel-500">
            Aucun produit obtenu saisi pour cette session.
          </div>
        )}
      </div>
    </div>
  )
}

function SessionEmployeSection({ session }: { session: SessionRow }) {
  const { data: employesPage } = useEmployes({ actif: true, per_page: 100 })
  const employes = Array.isArray(employesPage?.data?.data) ? employesPage.data.data : []
  const addEmploye = useAddProductionEmploye()

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<BpEmployeSchema>({
    resolver: zodResolver(bpEmployeSchema) as any,
    defaultValues: {
      employe_id: 0,
      heures_brutes: 1,
    },
  })

  useEffect(() => {
    if (!employes.length) return
    if (getValues('employe_id') > 0) return

    reset({
      employe_id: employes[0]?.id ?? 0,
      heures_brutes: 1,
    })
  }, [employes, getValues, reset])

  const onSubmit = async (values: BpEmployeSchema) => {
    await addEmploye.mutateAsync({
      sessionId: session.id,
      payload: values,
    })

    reset({
      employe_id: getValues('employe_id') || employes[0]?.id || 0,
      heures_brutes: 1,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          label="Employé *"
          options={employes.map((employe: RhEmploye) => ({
            value: employe.id,
            label: employe.nom_complet ?? `${employe.prenom} ${employe.nom}`,
          }))}
          placeholder={employes.length ? 'Choisir un employé' : 'Aucun employé actif'}
          error={errors.employe_id?.message}
          disabled={!employes.length}
          {...register('employe_id', { valueAsNumber: true })}
        />
        <Input
          label="Heures brutes *"
          type="number"
          step="0.1"
          error={errors.heures_brutes?.message}
          {...register('heures_brutes', { valueAsNumber: true })}
        />
        <div className="flex items-end">
          <Button type="submit" loading={addEmploye.isPending} className="w-full">
            Ajouter
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {Array.isArray(session.employes) && session.employes.length > 0 ? (
          session.employes.map((line) => (
            <div key={line.id} className="rounded-md border border-surface-border px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
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
                <Badge variant="info">
                  {formatQty(line.heures_brutes)} h
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-surface-border px-3 py-4 text-sm text-steel-500">
            Aucun employé ajouté à cette session.
          </div>
        )}
      </div>
    </div>
  )
}

function SessionEvenementSection({ session }: { session: SessionRow }) {
  const addEvenement = useAddProductionEvenement()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BpEvenementSchema>({
    resolver: zodResolver(bpEvenementSchema) as any,
    defaultValues: {
      type_evenement: 'debut',
      heure_debut: '',
      heure_fin: '',
      description: '',
    },
  })

  const onSubmit = async (values: BpEvenementSchema) => {
    await addEvenement.mutateAsync({
      sessionId: session.id,
      payload: values,
    })

    reset({
      type_evenement: 'debut',
      heure_debut: '',
      heure_fin: '',
      description: '',
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Select
          label="Type *"
          options={[
            { value: 'debut', label: 'Début' },
            { value: 'fin', label: 'Fin' },
            { value: 'panne', label: 'Panne' },
            { value: 'autre', label: 'Autre' },
          ]}
          error={errors.type_evenement?.message}
          {...register('type_evenement')}
        />
        <Input
          label="Heure début *"
          type="time"
          error={errors.heure_debut?.message}
          {...register('heure_debut')}
        />
        <Input
          label="Heure fin"
          type="time"
          error={errors.heure_fin?.message}
          {...register('heure_fin')}
        />
        <Input
          label="Description"
          placeholder="Optionnelle"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="md:col-span-4 flex justify-end">
          <Button type="submit" loading={addEvenement.isPending}>
            Ajouter l’événement
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {Array.isArray(session.evenements) && session.evenements.length > 0 ? (
          session.evenements.map((line) => (
            <div key={line.id} className="rounded-md border border-surface-border px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-steel-900">
                    {line.type_evenement === 'debut'
                      ? 'Début'
                      : line.type_evenement === 'fin'
                        ? 'Fin'
                        : line.type_evenement === 'panne'
                          ? 'Panne'
                          : 'Autre'}
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
                <Badge variant="warning">{line.type_evenement}</Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-surface-border px-3 py-4 text-sm text-steel-500">
            Aucun événement enregistré pour cette session.
          </div>
        )}
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