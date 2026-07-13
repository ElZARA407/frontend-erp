// src/components/features/organisation/organisation-view.tsx
'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { formatDateTime } from '@/lib/utils'
import {
  useDeleteLocation,
  useDeleteRole,
  useDeleteUser,
  useLocations,
  useRoles,
  useToggleUserActive,
  useUsers,
} from '@/lib/hooks/use-organisation'
import type {
  OrganisationLocation,
  OrganisationRole,
  OrganisationUtilisateur,
} from '@/lib/organisation.types'
import { LocationForm } from './location-form'
import { RoleForm } from './role-form'
import { UtilisateurForm } from './utilisateur-form'
import {
  Building2,
  Plus,
  Shield,
  Trash2,
  Users,
  ToggleLeft,
  ToggleRight,
  PencilLine,
} from 'lucide-react'

type TabKey = 'utilisateurs' | 'roles' | 'locations'

export function OrganisationView() {
  const [tab, setTab] = useState<TabKey>('utilisateurs')

  const [userPage, setUserPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleId, setUserRoleId] = useState<string>('')
  const [userLocationId, setUserLocationId] = useState<string>('')
  const [userActive, setUserActive] = useState<string>('')

  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showLocationDialog, setShowLocationDialog] = useState(false)

  const [selectedUser, setSelectedUser] = useState<OrganisationUtilisateur | null>(null)
  const [selectedRole, setSelectedRole] = useState<OrganisationRole | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<OrganisationLocation | null>(null)

  const { data: roles, isLoading: rolesLoading } = useRoles()
  const { data: locations, isLoading: locationsLoading } = useLocations()
  const { data: usersPage, isLoading: usersLoading } = useUsers({
    search: userSearch || undefined,
    role_id: userRoleId ? Number(userRoleId) : undefined,
    location_id: userLocationId ? Number(userLocationId) : undefined,
    actif: userActive === '' ? undefined : userActive === 'true',
    page: userPage,
    per_page: 20,
  })

  const deleteRole = useDeleteRole()
  const deleteLocation = useDeleteLocation()
  const deleteUser = useDeleteUser()
  const toggleUserActive = useToggleUserActive()

  const rolesList = useMemo(() => roles ?? [], [roles])
  const locationsList = useMemo(() => locations ?? [], [locations])
//   const users = usersPage?.data ?? []
  const users = usersPage?.data ?? ([] as OrganisationUtilisateur[])
  const pagination = usersPage

  const openCreateUser = () => {
    setSelectedUser(null)
    setShowUserDialog(true)
  }

  const openEditUser = (user: OrganisationUtilisateur) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const openCreateRole = () => {
    setSelectedRole(null)
    setShowRoleDialog(true)
  }

  const openEditRole = (role: OrganisationRole) => {
    setSelectedRole(role)
    setShowRoleDialog(true)
  }

  const openCreateLocation = () => {
    setSelectedLocation(null)
    setShowLocationDialog(true)
  }

  const openEditLocation = (location: OrganisationLocation) => {
    setSelectedLocation(location)
    setShowLocationDialog(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Organisation"
        subtitle="Gestion des rôles, utilisateurs et locations"
      />

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
          { key: 'roles', label: 'Rôles', icon: Shield },
          { key: 'locations', label: 'Locations', icon: Building2 },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={tab === key ? 'primary' : 'outline'}
            size="sm"
            icon={<Icon className="h-3.5 w-3.5" />}
            onClick={() => setTab(key as TabKey)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'utilisateurs' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              className="w-full md:w-72"
              label="Recherche"
              placeholder="Nom ou email"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value)
                setUserPage(1)
              }}
            />
            <Select
              className="w-full md:w-48"
              label="Rôle"
              placeholder="Tous"
              options={rolesList.map((role) => ({
                value: role.id,
                label: role.nom,
              }))}
              value={userRoleId}
              onChange={(e) => {
                setUserRoleId(e.target.value)
                setUserPage(1)
              }}
            />
            <Select
              className="w-full md:w-52"
              label="Location"
              placeholder="Toutes"
              options={locationsList.map((location) => ({
                value: location.id,
                label: location.nom,
              }))}
              value={userLocationId}
              onChange={(e) => {
                setUserLocationId(e.target.value)
                setUserPage(1)
              }}
            />
            <Select
              className="w-full md:w-40"
              label="Statut"
              placeholder="Tous"
              options={[
                { value: 'true', label: 'Actifs' },
                { value: 'false', label: 'Inactifs' },
              ]}
              value={userActive}
              onChange={(e) => {
                setUserActive(e.target.value)
                setUserPage(1)
              }}
            />
            <Button
              className="ml-auto"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={openCreateUser}
            >
              Nouvel utilisateur
            </Button>
          </div>

          <Card>
            {usersLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Créé le</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {(Array.isArray(users) ? users : (users as any)?.data || []).map((user: OrganisationUtilisateur) => (
                      <tr key={user.id} className="hover:bg-surface-subtle/70">
                        <td className="px-4 py-3 font-medium text-steel-900">{user.nom}</td>
                        <td className="px-4 py-3 text-steel-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{user.role?.nom ?? '—'}</Badge>
                        </td>
                        <td className="px-4 py-3 text-steel-600">{user.location?.nom ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={user.actif ? 'success' : 'muted'} dot>
                            {user.actif ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-steel-500">
                          {formatDateTime(user.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<PencilLine className="h-3.5 w-3.5" />}
                              onClick={() => openEditUser(user)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={user.actif ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                              onClick={() => toggleUserActive.mutate(user.id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              onClick={() => deleteUser.mutate(user.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && (
            <Pagination
                currentPage={userPage}
                lastPage={(pagination as any)?.last_page || 1}
                total={(pagination as any)?.total || 0}
                from={(pagination as any)?.from ?? 0}
                to={(pagination as any)?.to ?? 0}
                onPageChange={setUserPage}
            />
            )}
          </Card>
        </div>
      )}

      {tab === 'roles' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={openCreateRole}>
              Nouveau rôle
            </Button>
          </div>

          <Card>
            {rolesLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Utilisateurs</th>
                      <th className="px-4 py-3">Créé le</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {rolesList.map((role) => (
                      <tr key={role.id} className="hover:bg-surface-subtle/70">
                        <td className="px-4 py-3 font-medium text-steel-900">{role.nom}</td>
                        <td className="px-4 py-3 text-steel-600">{role.description ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{role.utilisateurs_count ?? 0}</Badge>
                        </td>
                        <td className="px-4 py-3 text-steel-500">
                          {formatDateTime(role.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<PencilLine className="h-3.5 w-3.5" />}
                              onClick={() => openEditRole(role)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              onClick={() => deleteRole.mutate(role.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'locations' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={openCreateLocation}>
              Nouvelle location
            </Button>
          </div>

          <Card>
            {locationsLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-steel-400">
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Utilisateurs</th>
                      <th className="px-4 py-3">Créé le</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {locationsList.map((location) => (
                      <tr key={location.id} className="hover:bg-surface-subtle/70">
                        <td className="px-4 py-3 font-medium text-steel-900">{location.nom}</td>
                        <td className="px-4 py-3">
                          <Badge variant={location.type === 'usine' ? 'warning' : 'info'}>
                            {location.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{location.utilisateurs_count ?? 0}</Badge>
                        </td>
                        <td className="px-4 py-3 text-steel-500">
                          {formatDateTime(location.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<PencilLine className="h-3.5 w-3.5" />}
                              onClick={() => openEditLocation(location)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              onClick={() => deleteLocation.mutate(location.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      <Dialog
        open={showUserDialog}
        onClose={() => setShowUserDialog(false)}
        title={selectedUser ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        <UtilisateurForm
          key={selectedUser?.id ?? 'user-new'}
          defaultValues={selectedUser ?? undefined}
          roles={rolesList}
          locations={locationsList}
          onSuccess={() => setShowUserDialog(false)}
        />
      </Dialog>

      <Dialog
        open={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        title={selectedRole ? 'Modifier le rôle' : 'Nouveau rôle'}
        size="md"
      >
        <RoleForm
          key={selectedRole?.id ?? 'role-new'}
          defaultValues={selectedRole ? { ...selectedRole, description: selectedRole.description ?? undefined } : undefined}
          onSuccess={() => setShowRoleDialog(false)}
        />
      </Dialog>

      <Dialog
        open={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        title={selectedLocation ? 'Modifier la location' : 'Nouvelle location'}
        size="md"
      >
        <LocationForm
          key={selectedLocation?.id ?? 'location-new'}
          defaultValues={selectedLocation ?? undefined}
          onSuccess={() => setShowLocationDialog(false)}
        />
      </Dialog>
    </div>
  )
}