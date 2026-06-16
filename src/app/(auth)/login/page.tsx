// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { LoginForm } from '@/components/features/auth/login-form'
import { Factory } from 'lucide-react'

export const metadata: Metadata = { title: 'Connexion' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Panneau gauche — identité */}
      <div className="hidden w-[420px] flex-col justify-between bg-steel-950 p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
            <Factory className="h-4.5 w-4.5 text-steel-900" />
          </div>
          <span className="text-base font-bold text-white">CMP ERP</span>
        </div>

        <div>
          <blockquote className="text-2xl font-light leading-snug text-steel-200">
            "Centraliser pour mieux produire, tracer pour mieux décider."
          </blockquote>
          <p className="mt-4 text-sm text-steel-500">
            Compagnie Malagasy de Plastique — Antananarivo
          </p>
        </div>

        <p className="text-xs text-steel-600">
          © {new Date().getFullYear()} CMP. Tous droits réservés.
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 items-center justify-center bg-surface-muted px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-steel-700 lg:hidden">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-steel-900">Connexion</h1>
            <p className="mt-1 text-sm text-steel-500">Accédez à votre espace ERP.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}