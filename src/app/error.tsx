'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Erreur de rendu CMP ERP', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-subtle p-6">
      <section className="w-full max-w-md rounded-xl border border-surface-border bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-steel-900">
          Une erreur est survenue
        </h1>
        <p className="mt-3 text-sm text-steel-600">
          La page n’a pas pu être affichée. Vérifiez votre connexion puis réessayez.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" onClick={unstable_retry}>
            Réessayer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.assign('/dashboard')}
          >
            Tableau de bord
          </Button>
        </div>
      </section>
    </main>
  )
}
