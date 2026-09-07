'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Erreur globale CMP ERP', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f8fafc' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
          <section style={{ maxWidth: '460px', padding: '24px', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <h1>Le service est momentanément indisponible</h1>
            <p>Veuillez réessayer dans un instant. Si le problème persiste, contactez l’administrateur.</p>
            <button type="button" onClick={unstable_retry}>
              Réessayer
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
