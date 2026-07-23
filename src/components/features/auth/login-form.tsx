// src/components/features/auth/login-form.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginSchema } from '@/lib/schemas/auth.schema'
import { useLogin } from '@/lib/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const { mutate: login, isPending } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
      <Input
        label="Adresse email"
        type="email"
        placeholder="utilisateur@cmp.mg"
        icon={<Mail className="h-3.5 w-3.5" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="relative">
        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock className="h-3.5 w-3.5" />}
          error={errors.password?.message}
          className="pr-10"
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={showPassword}
          className="absolute right-3 top-9 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      <Button
        type="submit"
        className="mt-2 w-full"
        size="lg"
        loading={isPending}
      >
        Se connecter
      </Button>
    </form>
  )
}
