// src/lib/api/auth.ts
import apiClient, { setToken, removeToken } from './client'
import type { ApiResponse, Utilisateur } from '../types'

export interface LoginPayload { email: string; password: string }

export interface LoginResponse {
  token: string
  token_type: string
  expires_in: number
  utilisateur: Utilisateur
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
    setToken(data.data.token)
    return data.data
  },

  logout: async () => {
    await apiClient.post('/auth/logout')
    removeToken()
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