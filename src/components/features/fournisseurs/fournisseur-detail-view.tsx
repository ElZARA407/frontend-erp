// src/components/features/fournisseurs/fournisseur-detail-view.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFournisseurDetail } from '@/lib/hooks/use-commercial-details'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Building2, Mail, PencilLine, Phone, Tag } from 'lucide-react'
import { FournisseurForm } from '@/components/features/fournisseurs/fournisseur-form'
import type { Fournisseur } from '@/lib/lot3.types'

interface FournisseurDetailViewProps {
  fournisseurId: number
}

export function FournisseurDetailView({ fournisseurId }: FournisseurDetailViewProps) {
  const [showEdit, setShowEdit] = useState(false)
  const { data: fournisseur, isLoading } = useFournisseurDetail(fournisseurId)

  if (!isLoading && !fournisseur) {
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Fournisseur #${fournisseurId}`}
          subtitle="Fiche non trouvée"
          actions={
            <Link
              href="/fournisseurs"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          }
        />
        <Card>
          <CardBody className="py-16 text-center text-steel-500">
            Fournisseur introuvable.
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={fournisseur?.nom ?? `Fournisseur #${fournisseurId}`}
        subtitle={fournisseur ? fournisseur.reference : 'Chargement...'}
        actions={
          <>
            <Link
              href="/fournisseurs"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-steel-700 hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            {fournisseur && (
              <Button
                variant="outline"
                icon={<PencilLine className="h-3.5 w-3.5" />}
                onClick={() => setShowEdit(true)}
              >
                Modifier
              </Button>
            )}
          </>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-steel-900">Informations fournisseur</h2>
            <p className="text-xs text-steel-500">
              Données de référence utilisées dans les achats.
            </p>
          </div>
          <Badge variant={fournisseur?.actif ? 'success' : 'muted'} dot>
            {fournisseur?.actif ? 'Actif' : 'Inactif'}
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
          ) : fournisseur ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Référence</p>
                <p className="mt-1 font-semibold text-steel-900">{fournisseur.reference}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Créé le</p>
                <p className="mt-1 font-semibold text-steel-900">{formatDate(fournisseur.created_at)}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">NIF / STAT</p>
                <p className="mt-1 font-semibold text-steel-900">
                  {fournisseur.NIF ?? '—'} / {fournisseur.STAT ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Code compta</p>
                <p className="mt-1 font-semibold text-steel-900">{fournisseur.code_compta ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Adresse</p>
                <p className="mt-1 font-semibold text-steel-900">{fournisseur.adresse}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Interlocuteur</p>
                <p className="mt-1 font-semibold text-steel-900">{fournisseur.interlocutaire ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Contact</p>
                <p className="mt-1 font-semibold text-steel-900">{fournisseur.contact}</p>
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">Email</p>
                <p className="mt-1 font-semibold text-steel-900">{fournisseur.email ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Dialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Modifier le fournisseur"
        size="lg"
      >
        {fournisseur && (
          <FournisseurForm
            defaultValues={fournisseur as Partial<Fournisseur> & { id: number }}
            onSuccess={() => setShowEdit(false)}
          />
        )}
      </Dialog>
    </div>
  )
}