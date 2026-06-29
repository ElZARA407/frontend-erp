import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Utilisateur } from '../types'
import { removeToken } from '../api/client'

interface AuthStore {
  utilisateur: Utilisateur | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setUtilisateur: (u: Utilisateur) => void
  setHasHydrated: (hydrated: boolean) => void
  logout: () => void
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      utilisateur: null,
      isAuthenticated: false,
      hasHydrated: false,

      setUtilisateur: (utilisateur) =>
        set({
          utilisateur,
          isAuthenticated: true,
          hasHydrated: true,
        }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      logout: () => {
        removeToken()
        set({
          utilisateur: null,
          isAuthenticated: false,
          hasHydrated: true,
        })
      },

      hasRole: (role: string) =>
        get().utilisateur?.role?.nom === role,
    }),
    {
      name: 'cmp-auth',
      partialize: (state) => ({
        utilisateur: state.utilisateur,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)