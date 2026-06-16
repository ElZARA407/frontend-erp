// src/lib/schemas/auth.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email requis').email('Format invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})
export type LoginSchema = z.infer<typeof loginSchema>