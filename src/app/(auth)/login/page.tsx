// src/app/(auth)/login/page.tsx
import Image from 'next/image'
import type { Metadata } from 'next'
import { LoginForm } from '@/components/features/auth/login-form'

export const metadata: Metadata = { title: 'Connexion' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Panneau gauche - identite */}
      <div className="hidden w-[420px] flex-col justify-between bg-steel-950 p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-16 items-center justify-center rounded-lg bg-white px-2 py-1 shadow-sm">
            <Image
              src="/images/logo-cmp.png"
              alt="Logo CMP"
              width={96}
              height={56}
              priority
              className="h-auto max-h-9 w-auto object-contain"
            />
          </div>
          <div className="h-11 items-center justify-center rounded-lg bg-white px-6">
            <p className="text-xs font-bold text-steel-20">COMPAGNIE MALAGASY</p>
            <p className="text-base font-bold text-steel-20">DE P L A S T I Q U E</p>
          </div>
        </div>

        <div>
          <blockquote className="text-2xl font-light leading-snug text-steel-200">
            &quot;Omeo lanja ny vokatrao, safidio ny kalitao.&quot;
          </blockquote>
          <p className="mt-4 text-sm text-steel-500">
            Compagnie Malagasy de Plastique - Antananarivo
          </p>
        </div>

        <p className="text-xs text-steel-600">
          © {new Date().getFullYear()} CMP.
        </p>
      </div>

      {/* Panneau droit - formulaire */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm justify rounded-2xl bg-steel-100 px-10 py-8 ">
          <div className="mb-8">
            <div className="mb-4 flex flex-1 items-center justify-center rounded-xl bg-white px-3 lg:hidden">
              <Image
                src="/images/logo-cmp.png"
                alt="Logo CMP"
                width={200}
                height={64}
                priority
                className="h-auto max-h-36 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-steel-20">Connexion</h1>
            <p className="mt-1 text-sm text-steel-20">Accédez à votre espace ERP.</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}