// src/components/features/clients/clients-view.tsx
'use client'
import { useState } from 'react'
import { useClients, useCreateClient, useDeleteClient } from '@/lib/hooks/use-clients'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { ClientForm } from './client-form'
import { Plus, Search, UserX, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Client } from '@/lib/types'

export function ClientsView() {
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [actif, setActif]         = useState<boolean | undefined>(true)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useClients({ search, actif, page, per_page: 20 })
  const { mutate: deleteClient } = useDeleteClient()

  const clients  = data?.data.data ?? []
  const paginate = data?.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        subtitle={`${paginate?.total ?? 0} client${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau client
          </Button>
        }
      />

      {/* Filtres */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher un client…"
            className="search-input w-64 pl-9"
          />
        </div>
        <div className="flex rounded-md border border-surface-border overflow-hidden text-xs">
          {[
            { label: 'Actifs',  value: true  as boolean | undefined },
            { label: 'Inactifs',value: false as boolean | undefined },
            { label: 'Tous',    value: undefined },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => { setActif(value); setPage(1) }}
              className={
                actif === value
                  ? 'bg-steel-700 px-3 py-1.5 font-medium text-white'
                  : 'bg-white px-3 py-1.5 text-steel-600 hover:bg-surface-subtle'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <UserX className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucun client trouvé</p>
            <p className="text-xs">Ajustez vos filtres ou créez un nouveau client.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Référence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">NIF</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {clients.map((client: Client) => (
                <tr key={client.id} className="hover:bg-surface-muted/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className="ref-code">{client.reference}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-steel-800">{client.nom}</td>
                  <td className="px-4 py-3 text-steel-600">{client.contact}</td>
                  <td className="px-4 py-3 text-steel-500">{client.NIF ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={client.actif ? 'success' : 'muted'} dot>
                      {client.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />}>
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {paginate && (
          <Pagination
            currentPage={paginate.current_page}
            lastPage={paginate.last_page}
            total={paginate.total}
            from={paginate.from ?? 0}
            to={paginate.to ?? 0}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau client" size="lg">
        <ClientForm onSuccess={() => setShowCreate(false)} />
      </Dialog>
    </div>
  )
}