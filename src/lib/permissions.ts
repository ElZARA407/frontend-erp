// src/lib/permissions.ts

export type AppRole =
  | 'admin'
  | 'responsable_prod'
  | 'operateur_saisie'
  | 'commercial'
  | 'logistique'
  | 'finance'
  | 'responsable_achat'

export type PermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'validate'
  | 'approve'
  | 'pay'
  | 'cancel'
  | 'export'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_locations'

const ALL_ROLES: AppRole[] = [
  'admin',
  'responsable_prod',
  'operateur_saisie',
  'commercial',
  'logistique',
  'finance',
  'responsable_achat',
]

const ROUTE_PREFIXES: Record<AppRole, string[]> = {
  admin: [
    '/dashboard',
    '/organisation',
    '/rh',
    '/catalogue',
    '/stocks',
    '/achats',
    '/demandes-achat',
    '/production',
    '/recyclage',
    '/clients',
    '/commandes',
    '/livraisons',
    '/ventes-directes',
    '/fournisseurs',
    '/contrats',
    '/factures',
    '/bons-sortie',
  ],
  responsable_prod: ['/dashboard', '/catalogue', '/stocks', '/production', '/recyclage'],
  operateur_saisie: ['/dashboard', '/catalogue', '/stocks', '/production', '/recyclage'],
  commercial: [
    '/dashboard',
    '/catalogue',
    '/stocks',
    '/clients',
    '/commandes',
    '/livraisons',
    '/ventes-directes',
    '/fournisseurs',
    '/contrats',
  ],
  logistique: ['/dashboard', '/stocks', '/commandes', '/livraisons', '/bons-sortie'],
  finance: ['/dashboard', '/factures', '/clients', '/commandes'],
  responsable_achat: ['/dashboard', '/catalogue', '/stocks', '/fournisseurs', '/achats', '/demandes-achat'],
}

const ACTION_MATRIX: Record<AppRole, Partial<Record<PermissionAction, boolean>>> = {
  admin: {
    view: true,
    create: true,
    update: true,
    delete: true,
    validate: true,
    approve: true,
    pay: true,
    cancel: true,
    export: true,
    manage_users: true,
    manage_roles: true,
    manage_locations: true,
  },
  responsable_prod: {
    view: true,
    create: true,
    update: true,
    validate: true,
    export: true,
  },
  operateur_saisie: {
    view: true,
    create: true,
  },
  commercial: {
    view: true,
    create: true,
    update: true,
    delete: true,
    validate: true,
    export: true,
  },
  logistique: {
    view: true,
    create: true,
    update: true,
    validate: true,
    export: true,
  },
  finance: {
    view: true,
    pay: true,
    cancel: true,
    export: true,
  },
  responsable_achat: {
    view: true,
    create: true,
    update: true,
    delete: true,
    approve: true,
    validate: true,
    export: true,
  },
}

function normalizeRole(role?: string | null): AppRole | null {
  if (!role) return null
  return (ALL_ROLES as string[]).includes(role) ? (role as AppRole) : null
}

function normalizePath(path: string): string {
  if (!path) return '/'
  const clean = path.split('?')[0]?.split('#')[0] ?? path
  if (clean === '/') return '/'
  return clean.endsWith('/') ? clean.slice(0, -1) : clean
}

export function canAccessRoute(role: string | null | undefined, path: string): boolean {
  const normalizedRole = normalizeRole(role)
  const normalizedPath = normalizePath(path)

  if (!normalizedRole) {
    return normalizedPath === '/dashboard'
  }

  if (normalizedRole === 'admin') {
    return true
  }

  return ROUTE_PREFIXES[normalizedRole].some((prefix) => {
    const cleanPrefix = normalizePath(prefix)
    return normalizedPath === cleanPrefix || normalizedPath.startsWith(`${cleanPrefix}/`)
  })
}

export function canPerform(
  role: string | null | undefined,
  action: PermissionAction
): boolean {
  const normalizedRole = normalizeRole(role)

  if (!normalizedRole) return false
  if (normalizedRole === 'admin') return true

  return ACTION_MATRIX[normalizedRole]?.[action] ?? false
}

export function getVisibleRoles(): AppRole[] {
  return [...ALL_ROLES]
}