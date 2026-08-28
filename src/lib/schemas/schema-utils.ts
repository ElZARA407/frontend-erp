import { z } from 'zod'

export function emptyToUndefined(value: unknown) {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().max(500, 'Maximum 500 caractères').optional(),
)

export const optionalLongText = z.preprocess(
  emptyToUndefined,
  z.string().max(2000, 'Maximum 2000 caractères').optional(),
)

export const optionalPositiveInt = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return undefined
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  },
  z.number().int('Nombre entier requis').positive('Valeur requise').optional(),
)

export const optionalPositiveNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return undefined
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  },
  z.number().min(0, 'La valeur doit être positive').optional(),
)

export function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export function isBefore(date: string | undefined | null, minDate: string) {
  if (!date) return false
  return date < minDate
}

export function hasDuplicateBy<T>(
  rows: T[],
  keyBuilder: (row: T) => string,
) {
  const seen = new Set<string>()

  for (const row of rows) {
    const key = keyBuilder(row)
    if (seen.has(key)) return true
    seen.add(key)
  }

  return false
}