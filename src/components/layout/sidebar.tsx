'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Box,
  Factory,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Recycle,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLogout } from '@/lib/hooks/use-auth'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useUiStore } from '@/lib/stores/ui.store'
import { canAccessRoute } from '@/lib/permissions'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, group: 'main' },
  { href: '/clients', label: 'Clients', icon: Users, group: 'commercial' },
  { href: '/commandes', label: 'Commandes', icon: ShoppingCart, group: 'commercial' },
  { href: '/livraisons', label: 'Livraisons', icon: Truck, group: 'commercial' },
  { href: '/ventes-directes', label: 'Ventes directes', icon: Receipt, group: 'commercial' },
  { href: '/factures', label: 'Factures', icon: Receipt, group: 'finance' },
  { href: '/organisation', label: 'Organisation', icon: Settings, group: 'main' },
  { href: '/stocks', label: 'Stocks', icon: Box, group: 'stock' },
  { href: '/achats', label: 'Achats / BR', icon: Package, group: 'stock' },
  { href: '/bons-sortie', label: 'Bons de sortie', icon: Package, group: 'stock' },
  { href: '/demandes-achat', label: 'Demandes achat', icon: Package, group: 'stock' },
  { href: '/production', label: 'Production', icon: Factory, group: 'production' },
  { href: '/recyclage', label: 'Recyclage', icon: Recycle, group: 'production' },
  { href: '/catalogue', label: 'Catalogue', icon: Package, group: 'main' },
  { href: '/fournisseurs', label: 'Fournisseurs', icon: Truck, group: 'commercial' },
  { href: '/contrats', label: 'Contrats', icon: ShieldCheck, group: 'commercial' },
  { href: '/rh', label: 'RH', icon: Users, group: 'main' },
]

const groups = [
  { key: 'main', label: null },
  { key: 'commercial', label: 'Commercial' },
  { key: 'finance', label: 'Finance' },
  { key: 'stock', label: 'Stock & Achats' },
  { key: 'production', label: 'Production' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { mutate: logout, isPending } = useLogout()
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const role = utilisateur?.role?.nom ?? null
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen)
  const closeMobileSidebar = useUiStore((s) => s.closeMobileSidebar)

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-20 bg-steel-950/50 transition-opacity duration-200 md:hidden',
          mobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex h-screen flex-col border-r border-steel-800 bg-steel-950 shadow-2xl transition-all duration-200 ease-in-out',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          sidebarCollapsed ? 'md:w-16' : 'md:w-60',
          'w-60'
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-steel-800 px-4">
          <div className="flex h-11 w-16 items-center justify-center rounded-lg bg-white px-2 shadow-sm">
            <Image
              src="/images/logo-cmp.png"
              alt="Logo CMP"
              width={96}
              height={56}
              priority
              className="h-auto max-h-9 w-auto object-contain"
            />
          </div>

          <div className={cn('min-w-0', sidebarCollapsed ? 'md:hidden' : '')}>
            <p className="text-sm font-bold tracking-wide text-white">CMP ERP</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {groups.map((group) => {
            const items = navItems.filter(
              (n) => n.group === group.key && canAccessRoute(role, n.href)
            )
            if (!items.length) return null

            return (
              <div key={group.key} className="mb-4">
                {group.label && (
                  <p
                    className={cn(
                      'mb-1 px-2 text-2xs font-semibold uppercase tracking-widest text-steel-500',
                      sidebarCollapsed ? 'md:hidden' : ''
                    )}
                  >
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
                          onClick={closeMobileSidebar}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                            sidebarCollapsed ? 'md:justify-center md:px-0' : '',
                            active
                              ? 'bg-steel-700 text-white'
                              : 'text-steel-400 hover:bg-steel-800 hover:text-steel-100'
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className={sidebarCollapsed ? 'md:hidden' : ''}>{label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        <div className="border-t border-steel-800 px-3 py-3">
          <div className={cn('mb-2 rounded-md bg-steel-900 px-3 py-2', sidebarCollapsed ? 'md:px-2' : '')}>
            <p className={cn('truncate text-xs font-medium text-steel-200', sidebarCollapsed ? 'md:hidden' : '')}>
              {utilisateur?.nom}
            </p>
            <p className={cn('truncate text-2xs text-steel-500', sidebarCollapsed ? 'md:hidden' : '')}>
              {utilisateur?.role?.nom}
            </p>
          </div>

          <button
            onClick={() => {
              closeMobileSidebar()
              logout()
            }}
            disabled={isPending}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-steel-400 transition-colors hover:bg-steel-800 hover:text-red-400',
              sidebarCollapsed ? 'md:justify-center md:px-0' : ''
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className={sidebarCollapsed ? 'md:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}