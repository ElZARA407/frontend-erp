import { describe, expect, it, vi } from 'vitest'
import { createIdempotencyKey, idempotencyHeaders } from './idempotency'

describe('idempotence frontend', () => {
  it('crée une clé exploitable quand crypto.randomUUID est disponible', () => {
    const randomUUID = vi.fn(() => '123e4567-e89b-12d3-a456-426614174000')

    Object.defineProperty(window, 'crypto', {
      configurable: true,
      value: { randomUUID },
    })

    expect(createIdempotencyKey()).toBe('123e4567e89b12d3a456426614174000')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('utilise une solution de secours si randomUUID est indisponible', () => {
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      value: {},
    })

    const key = createIdempotencyKey()

    expect(key).toBeTypeOf('string')
    expect(key.length).toBeGreaterThan(8)
  })

  it('construit correctement l’en-tête transmis au backend', () => {
    expect(idempotencyHeaders('vente-42-cle-unique')).toEqual({
      'Idempotency-Key': 'vente-42-cle-unique',
    })
  })
})