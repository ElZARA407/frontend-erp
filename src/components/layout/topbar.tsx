'use client'

import { Bell, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useUiStore } from '@/lib/stores/ui.store'
import { cn } from '@/lib/utils'

export function Topbar() {
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const toggleMobileSidebar = useUiStore((s) => s.toggleMobileSidebar)

  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      toggleMobileSidebar()
      return
    }

    toggleSidebar()
  }

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-20 flex h-14 items-center gap-3 border-b border-surface-border bg-white px-3 sm:px-6 transition-[left] duration-200',
        sidebarCollapsed ? 'md:left-16' : 'md:left-60'
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 justify-center px-0"
        icon={<Menu className="h-4 w-4" />}
        aria-label="Basculer le panneau latéral"
        onClick={handleSidebarToggle}
      />

      <div className="relative flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400" />
        <input
          type="search"
          placeholder="Rechercher…"
          className="h-8 w-full rounded-md border border-surface-border bg-surface-subtle pl-8 pr-3 text-sm focus:border-steel-400 focus:outline-none focus:ring-1 focus:ring-steel-400/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-md p-1.5 text-steel-500 transition-colors hover:bg-surface-subtle">
          <Bell className="h-4 w-4" />
        </button>

        <div className="hidden h-7 w-px bg-surface-border sm:block" />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-steel-700 text-xs font-bold text-white">
            {utilisateur?.nom?.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[180px] truncate text-xs font-medium text-steel-700">
            {utilisateur?.location?.nom}
          </span>
        </div>
      </div>
    </header>
  )
}