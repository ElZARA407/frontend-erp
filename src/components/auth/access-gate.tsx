// src/components/auth/access-gate.tsx
'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/lib/hooks/use-permissions'
import type { PermissionAction } from '@/lib/permissions'

interface AccessGateProps {
  action?: PermissionAction
  route?: string
  fallback?: ReactNode
  children: ReactNode
  className?: string
}

export function AccessGate({
  action,
  route,
  fallback = null,
  children,
  className,
}: AccessGateProps) {
  const { can, canRoute, currentPathAllowed } = usePermissions()

  const allowed = action
    ? can(action)
    : route
      ? canRoute(route)
      : currentPathAllowed

  if (!allowed) {
    return <>{fallback}</>
  }

  return <div className={cn(className)}>{children}</div>
}