import type { ApiResponse, Utilisateur } from '../types'
import apiClient from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  utilisateur: Utilisateur
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T

  if (!response.ok) {
    throw payload
  }

  return payload
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await readJson<ApiResponse<LoginResponse>>(response)

    return data.data
  },

  logout: async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })

    await readJson<ApiResponse<null>>(response)
  },

  me: async () => {
    const { data } = await apiClient.get<ApiResponse<Utilisateur>>('/auth/me')
    return data.data
  },

  changePassword: async (payload: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }) => {
    const { data } = await apiClient.put<ApiResponse<null>>('/auth/password', payload)
    return data
  },
}