export type AppRole =
  | 'admin'
  | 'responsable_prod'
  | 'operateur_saisie'
  | 'commercial'
  | 'logistique'
  | 'finance'
  | 'responsable_achat'

export type ReportTabPermission =
  | 'commercial'
  | 'stock'
  | 'production'
  | 'recyclage'
  | 'finance'
  | 'mouvements'

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
  | 'deliver'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_locations'

export type DashboardWidget =
  | 'commandes_en_attente'
  | 'bons_production_en_cours'
  | 'bons_transformation_en_cours'
  | 'livraisons_du_jour'
  | 'factures_en_attente'
  | 'valeur_totale_stock'
  | 'produits_sous_minimum'
  | 'matieres_sous_minimum'
  | 'ventes_30_jours'
  | 'stock_entrees_sorties'
  | 'production_objectif_realise'
  | 'top_produits'
  | 'top_clients'
  | 'alertes'

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
    '/rapports',
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
  responsable_prod: ['/dashboard', '/catalogue', '/stocks', '/production', '/recyclage', '/rapports'],
  operateur_saisie: ['/dashboard', '/catalogue', '/stocks', '/production', '/recyclage'],
  commercial: [
    '/dashboard',
    '/catalogue',
    '/clients',
    '/commandes',
    '/livraisons',
    '/ventes-directes',
    '/rapports',
    '/contrats',
  ],
  logistique: ['/dashboard', '/stocks', '/commandes', '/livraisons', '/rapports', '/bons-sortie'],
  finance: ['/dashboard', '/factures', '/clients', '/rapports', '/commandes', '/livraisons'],
  responsable_achat: ['/dashboard', '/catalogue', '/rapports', '/stocks', '/fournisseurs', '/achats', '/demandes-achat'],
}

const REPORT_TABS: Record<AppRole, ReportTabPermission[]> = {
  admin: ['commercial', 'stock', 'production', 'recyclage', 'finance', 'mouvements'],
  commercial: ['commercial'],
  logistique: ['commercial', 'stock', 'mouvements'],
  finance: ['commercial', 'finance'],
  responsable_prod: ['stock', 'production', 'recyclage', 'mouvements'],
  operateur_saisie: ['production', 'recyclage'],
  responsable_achat: ['stock', 'mouvements'],
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
    deliver: true,
    manage_users: true,
    manage_roles: true,
    manage_locations: true,
  },
  responsable_prod: {
    view: true,
    create: true,
    update: true,
    validate: true,
    cancel: true,
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
    approve: true,
    cancel: true,
    export: true,
    deliver: true,
    validate: true,
  },
  logistique: {
    view: true,
    create: true,
    update: true,
    validate: true,
    deliver: true,
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
    cancel: true,
    export: true,
  },
}

const DASHBOARD_WIDGETS: Record<AppRole, DashboardWidget[]> = {
  admin: [
    'commandes_en_attente',
    'bons_production_en_cours',
    'bons_transformation_en_cours',
    'livraisons_du_jour',
    'factures_en_attente',
    'valeur_totale_stock',
    'produits_sous_minimum',
    'matieres_sous_minimum',
    'ventes_30_jours',
    'stock_entrees_sorties',
    'production_objectif_realise',
    'top_produits',
    'top_clients',
    'alertes',
  ],
  commercial: [
    'commandes_en_attente',
    'livraisons_du_jour',
    'factures_en_attente',
    'ventes_30_jours',
    'top_produits',
    'top_clients',
    'alertes',
  ],
  logistique: [
    'commandes_en_attente',
    'livraisons_du_jour',
    'produits_sous_minimum',
    'matieres_sous_minimum',
    'stock_entrees_sorties',
    'alertes',
  ],
  finance: [
    'commandes_en_attente',
    'livraisons_du_jour',
    'factures_en_attente',
    'ventes_30_jours',
    'top_clients',
    'alertes',
  ],
  responsable_prod: [
    'bons_production_en_cours',
    'bons_transformation_en_cours',
    'produits_sous_minimum',
    'matieres_sous_minimum',
    'production_objectif_realise',
    'stock_entrees_sorties',
    'alertes',
  ],
  operateur_saisie: [
    'bons_production_en_cours',
    'bons_transformation_en_cours',
    'production_objectif_realise',
    'alertes',
  ],
  responsable_achat: [
    'valeur_totale_stock',
    'produits_sous_minimum',
    'matieres_sous_minimum',
    'stock_entrees_sorties',
    'alertes',
  ],
}

function normalizeRole(role?: string | null): AppRole | null {
  if (!role) return null
  return (ALL_ROLES as string[]).includes(role) ? (role as AppRole) : null
}

export function canSeeReportTab(
  role: string | null | undefined,
  tab: ReportTabPermission
): boolean {
  const normalizedRole = normalizeRole(role)
  if (!normalizedRole) return false
  if (normalizedRole === 'admin') return true
  return REPORT_TABS[normalizedRole].includes(tab)
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

  if (!normalizedRole) return normalizedPath === '/dashboard'
  if (normalizedRole === 'admin') return true

  return ROUTE_PREFIXES[normalizedRole].some((prefix) => {
    const cleanPrefix = normalizePath(prefix)
    return normalizedPath === cleanPrefix || normalizedPath.startsWith(`${cleanPrefix}/`)
  })
}

export function canPerform(role: string | null | undefined, action: PermissionAction): boolean {
  const normalizedRole = normalizeRole(role)
  if (!normalizedRole) return false
  if (normalizedRole === 'admin') return true
  return ACTION_MATRIX[normalizedRole]?.[action] ?? false
}

export function canSeeDashboardWidget(
  role: string | null | undefined,
  widget: DashboardWidget
): boolean {
  const normalizedRole = normalizeRole(role)
  if (!normalizedRole) return false
  if (normalizedRole === 'admin') return true
  return DASHBOARD_WIDGETS[normalizedRole].includes(widget)
}

export function getVisibleRoles(): AppRole[] {
  return [...ALL_ROLES]
}