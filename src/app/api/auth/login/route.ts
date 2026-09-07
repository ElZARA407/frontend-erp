import { NextRequest, NextResponse } from 'next/server'

const TOKEN_COOKIE = 'cmp_access_token'
const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60

type LoginResponse = {
  success?: boolean
  message?: string
  data?: {
    token?: string
    token_type?: string
    expires_in?: number
    utilisateur?: unknown
  }
}

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL?.replace(/\/$/, '')

  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        message: 'La configuration du backend est incomplète.',
        code: 'BACKEND_CONFIGURATION_ERROR',
      },
      { status: 500 },
    )
  }

  try {
    const body = await request.text()

    const upstream = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
      },
      body,
      cache: 'no-store',
    })

    const payload = (await upstream.json()) as LoginResponse

    if (!upstream.ok || !payload.data?.token) {
      return NextResponse.json(payload, { status: upstream.status })
    }

    const { token, expires_in, ...safeData } = payload.data

    const response = NextResponse.json(
      {
        ...payload,
        data: safeData,
      },
      { status: upstream.status },
    )

    response.cookies.set({
      name: TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expires_in ?? TOKEN_LIFETIME_SECONDS,
    })

    return response
  } catch (error) {
    console.error('Connexion CMP impossible', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Impossible de joindre le service de connexion.',
        code: 'AUTH_SERVICE_UNAVAILABLE',
      },
      { status: 503 },
    )
  }
}