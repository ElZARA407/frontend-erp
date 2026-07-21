// src/components/features/clients/clients-view.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, PencilLine, Plus, Search, Trash2, UserX } from 'lucide-react'
import { useClients, useDeleteClient } from '@/lib/hooks/use-clients'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { ClientForm } from './client-form'
import type { Client } from '@/lib/types'

const PAGE_SIZE = 10

export function ClientsView() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actif, setActif] = useState<boolean | undefined>(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const { data, isLoading } = useClients({ search, actif, page, per_page: PAGE_SIZE })
  const deleteClient = useDeleteClient()

  const clients = Array.isArray(data?.data?.data) ? data.data.data : []
  const paginate = data?.data

  const openCreate = () => {
    setSelectedClient(null)
    setShowForm(true)
  }

  const openEdit = (client: Client) => {
    setSelectedClient(client)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setSelectedClient(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        subtitle={`${paginate?.total ?? 0} client${(paginate?.total ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau client
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Rechercher un client..."
            className="search-input w-72 pl-9"
          />
        </div>

        <div className="flex overflow-hidden rounded-md border border-surface-border text-xs">
          {[
            { label: 'Actifs', value: true as boolean | undefined },
            { label: 'Inactifs', value: false as boolean | undefined },
            { label: 'Tous', value: undefined },
          ].map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setActif(value)
                setPage(1)
              }}
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
          <TableSkeleton rows={10} cols={7} />
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-steel-400">
            <UserX className="mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Aucun client trouvé</p>
            <p className="text-xs">Ajustez vos filtres ou créez un nouveau client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">NIF</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-400">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-border">
                {clients.map((client: Client) => (
                  <tr key={client.id} className="transition-colors hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <span className="ref-code">{client.reference}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-steel-800">{client.nom}</td>
                    <td className="px-4 py-3 text-steel-600">{client.contact}</td>
                    <td className="px-4 py-3 text-steel-500">{client.NIF ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={client.est_divers ? 'warning' : 'info'}>
                        {client.est_divers ? 'Divers' : 'Normal'}
                      </Badge>
                    </td>
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

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<PencilLine className="h-3.5 w-3.5" />}
                          onClick={() => openEdit(client)}
                        >
                          Modifier
                        </Button>

                        {client.actif && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            loading={deleteClient.isPending}
                            onClick={() => deleteClient.mutate(client.id)}
                          >
                            Archiver
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

      <Dialog
        open={showForm}
        onClose={closeForm}
        title={selectedClient ? 'Modifier le client' : 'Nouveau client'}
        size="lg"
      >
        <ClientForm defaultValues={selectedClient} onSuccess={closeForm} />
      </Dialog>
    </div>
  )
}