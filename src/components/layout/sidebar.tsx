// src/components/layout/sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  Truck, Receipt, Factory, Recycle, BarChart3,
  Settings, LogOut, Box
} from 'lucide-react'
import { useLogout } from '@/lib/hooks/use-auth'
import { useAuthStore } from '@/lib/stores/auth.store'

const navItems = [
  { href: '/dashboard',     label: 'Tableau de bord', icon: LayoutDashboard, group: 'main' },
  { href: '/clients',       label: 'Clients',          icon: Users,           group: 'commercial' },
  { href: '/commandes',     label: 'Commandes',        icon: ShoppingCart,    group: 'commercial' },
  { href: '/livraisons',    label: 'Livraisons',       icon: Truck,           group: 'commercial' },
  { href: '/factures',      label: 'Factures',         icon: Receipt,         group: 'finance' },
  { href: '/stocks',        label: 'Stocks',           icon: Box,             group: 'stock' },
  { href: '/achats',        label: 'Achats / BR',      icon: Package,         group: 'stock' },
  { href: '/production',    label: 'Production',       icon: Factory,         group: 'production' },
  { href: '/recyclage',     label: 'Recyclage',        icon: Recycle,         group: 'production' },
]

const groups = [
  { key: 'main',       label: null },
  { key: 'commercial', label: 'Commercial' },
  { key: 'finance',    label: 'Finance' },
  { key: 'stock',      label: 'Stock & Achats' },
  { key: 'production', label: 'Production' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { mutate: logout, isPending } = useLogout()
  const utilisateur = useAuthStore((s) => s.utilisateur)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-surface-border bg-steel-950">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-steel-800 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500">
          <Factory className="h-4 w-4 text-steel-900" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-white">CMP ERP</p>
          <p className="text-2xs text-steel-400">Malagasy de Plastique</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group.key)
          if (!items.length) return null
          return (
            <div key={group.key} className="mb-4">
              {group.label && (
                <p className="mb-1 px-2 text-2xs font-semibold uppercase tracking-widest text-steel-500">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-steel-700 text-white'
                            : 'text-steel-400 hover:bg-steel-800 hover:text-steel-100',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Utilisateur */}
      <div className="border-t border-steel-800 px-3 py-3">
        <div className="mb-2 rounded-md bg-steel-900 px-3 py-2">
          <p className="text-xs font-medium text-steel-200 truncate">{utilisateur?.nom}</p>
          <p className="text-2xs text-steel-500 truncate">{utilisateur?.role.nom}</p>
        </div>
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-steel-400 hover:bg-steel-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}