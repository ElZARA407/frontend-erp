'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, LockKeyhole, LogOut } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLogout } from '@/lib/hooks/use-auth'
import { useCanRoute } from '@/lib/hooks/use-permissions'
import { useAuthStore } from '@/lib/stores/auth.store'

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const utilisateur = useAuthStore((s) => s.utilisateur)
  const canAccessCurrentRoute = useCanRoute()
  const { mutate: logout, isPending } = useLogout()

  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || !utilisateur)) {
      router.replace('/login')
    }
  }, [hasHydrated, isAuthenticated, utilisateur, router])

  if (!hasHydrated || !isAuthenticated || !utilisateur) {
    return (
      <div className="min-h-screen bg-surface-subtle">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-subtle">
      <Sidebar />
      <Topbar />

      <main className="ml-60 min-h-screen pt-14">
        <div className="p-6">
          {canAccessCurrentRoute ? (
            children
          ) : (
            <Card className="mx-auto max-w-2xl">
              <CardBody className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600">
                    <LockKeyhole className="h-5 w-5" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg font-semibold text-steel-900">
                        Accès restreint
                      </h1>
                      <Badge variant="muted">
                        {utilisateur.role?.nom ?? 'Rôle inconnu'}
                      </Badge>
                    </div>
                    <p className="text-sm text-steel-600">
                      Votre profil n&apos;a pas accès à cette page.
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-steel-600">
                  <span className="font-medium text-steel-900">Chemin demandé :</span>{' '}
                  <span className="font-mono">{pathname}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    icon={<ArrowLeft className="h-3.5 w-3.5" />}
                    onClick={() => router.push('/dashboard')}
                  >
                    Retour au tableau de bord
                  </Button>
                  <Button
                    variant="outline"
                    icon={<LogOut className="h-3.5 w-3.5" />}
                    loading={isPending}
                    onClick={() => logout()}
                  >
                    Déconnexion
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}