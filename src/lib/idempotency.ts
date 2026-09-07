export function createIdempotencyKey(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID().replaceAll('-', '')
  }

  return `${Date.now()}${Math.random().toString(36).slice(2)}`
}

export function idempotencyHeaders(key: string) {
  return {
    'Idempotency-Key': key,
  }
}