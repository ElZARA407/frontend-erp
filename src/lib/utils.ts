// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Formatage dates ─────────────────────────────────────
export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  const parsed = parseISO(date)
  if (!isValid(parsed)) return '—'
  return format(parsed, 'dd MMM yyyy', { locale: fr })
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—'
  const parsed = parseISO(date)
  if (!isValid(parsed)) return '—'
  return format(parsed, 'dd MMM yyyy HH:mm', { locale: fr })
}

export function formatMonth(mois: string): string {
  if (!mois) return '—'
  const [year, month] = mois.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return format(date, 'MMMM yyyy', { locale: fr })
}

export function formatDurationHours(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'

  const totalMinutes = Math.round(Number(value) * 60)
  if (!Number.isFinite(totalMinutes)) return '—'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min`
  }

  if (minutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${minutes.toString().padStart(2, '0')}`
}

// ── Formatage montants ──────────────────────────────────
export function formatMGA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-MG', {
    style:    'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' Ar'
}

export function formatQty(qty: number | null | undefined, unit?: string): string {
  if (qty === null || qty === undefined) return '—'
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(qty)
  return unit ? `${formatted} ${unit}` : formatted
}

// ── Formatage pourcentages ──────────────────────────────
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

// ── Couleurs de statut ──────────────────────────────────
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'default'

export function getStatutColor(valeur: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    livree:              'success',
    non_livree:          'warning',
    partielle:           'info',
    en_attente:          'muted',
    emise:               'info',
    partiellement_payee: 'warning',
    payee:               'success',
    annulee:             'danger',
    ouvert:              'info',
    en_cours:            'warning',
    cloture:             'success',
    annule:              'danger',
    valide:              'success',
    brouillon:           'muted',
    validee:             'success',
    ouverte:             'info',
    prepare:             'info',
    livre:               'success',
    retourne:            'danger',
    soumise:             'info',
    approuvee:           'success',
    rejetee:             'danger',
  }
  return map[valeur] ?? 'default'
}

// ── Divers ──────────────────────────────────────────────
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      query.set(key, String(val))
    }
  }
  const str = query.toString()
  return str ? `?${str}` : ''
}