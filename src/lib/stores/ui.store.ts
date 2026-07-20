import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiStore {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileSidebar: () => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      toggleMobileSidebar: () =>
        set((state) => ({
          mobileSidebarOpen: !state.mobileSidebarOpen,
        })),

      openMobileSidebar: () => set({ mobileSidebarOpen: true }),

      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
    }),
    {
      name: 'cmp-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)