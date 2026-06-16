// src/components/layout/topbar.tsx
'use client'
import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth.store'

export function Topbar() {
  const utilisateur = useAuthStore((s) => s.utilisateur)

  return (
    <header className="fixed left-60 right-0 top-0 z-20 flex h-14 items-center gap-4 border-b border-surface-border bg-white px-6">
      <div className="relative flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400" />
        <input
          type="search"
          placeholder="Rechercher…"
          className="h-8 w-full rounded-md border border-surface-border bg-surface-subtle pl-8 pr-3 text-sm focus:border-steel-400 focus:outline-none focus:ring-1 focus:ring-steel-400/20"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-md p-1.5 text-steel-500 hover:bg-surface-subtle transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-7 w-px bg-surface-border" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-steel-700 text-xs font-bold text-white">
            {utilisateur?.nom?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-steel-700">{utilisateur?.location.nom}</span>
        </div>
      </div>
    </header>
  )
}