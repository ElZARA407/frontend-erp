// src/components/features/auth/login-form.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginSchema } from '@/lib/schemas/auth.schema'
import { useLogin } from '@/lib/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Lock } from 'lucide-react'

export function LoginForm() {
  const { mutate: login, isPending } = useLogin()

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
      <Input
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        icon={<Lock className="h-3.5 w-3.5" />}
        error={errors.password?.message}
        {...register('password')}
      />
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