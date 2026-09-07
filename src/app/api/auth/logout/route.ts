import { NextRequest, NextResponse } from 'next/server'

const TOKEN_COOKIE = 'cmp_access_token'

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL?.replace(/\/$/, '')
  const token = request.cookies.get(TOKEN_COOKIE)?.value

  try {
    if (backendUrl && token) {
      await fetch(`${backendUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })
    }
  } catch (error) {
    // La suppression locale du cookie doit toujours réussir.
    console.warn('Déconnexion backend non confirmée', error)
  }

  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie.',
  })

  response.cookies.set({
    name: TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}