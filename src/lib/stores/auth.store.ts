// src/lib/stores/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Utilisateur } from '../types'
import { removeToken } from '../api/client'

interface AuthStore {
  utilisateur: Utilisateur | null
  isAuthenticated: boolean
  setUtilisateur: (u: Utilisateur) => void
  logout: () => void
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      utilisateur:     null,
      isAuthenticated: false,

      setUtilisateur: (utilisateur) =>
        set({ utilisateur, isAuthenticated: true }),

      logout: () => {
        removeToken()
        set({ utilisateur: null, isAuthenticated: false })
      },

      hasRole: (role: string) =>
        get().utilisateur?.role.nom === role,
    }),
    { name: 'cmp-auth', partialize: (s) => ({ utilisateur: s.utilisateur, isAuthenticated: s.isAuthenticated }) }
  )
)