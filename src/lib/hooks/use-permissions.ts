// src/lib/hooks/use-permissions.ts
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '../stores/auth.store'
import { canAccessRoute, canPerform, type PermissionAction } from '../permissions'

export function useCurrentRole() {
  return useAuthStore((state) => state.utilisateur?.role?.nom ?? null)
}

export function useCan(action: PermissionAction) {
  const role = useCurrentRole()

  return useMemo(() => canPerform(role, action), [role, action])
}

export function useCanRoute(path?: string) {
  const pathname = usePathname()
  const role = useCurrentRole()

  return useMemo(
    () => canAccessRoute(role, path ?? pathname),
    [role, path, pathname]
  )
}

export function usePermissions() {
  const role = useCurrentRole()
  const pathname = usePathname()

  return useMemo(
    () => ({
      role,
      can: (action: PermissionAction) => canPerform(role, action),
      canRoute: (path: string) => canAccessRoute(role, path),
      currentPathAllowed: canAccessRoute(role, pathname),
    }),
    [role, pathname]
  )
}