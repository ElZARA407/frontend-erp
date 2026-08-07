// src/lib/api/client.ts
import axios, { AxiosError, type AxiosInstance } from 'axios'
import Cookies from 'js-cookie'


const TOKEN_KEY = 'cmp_token'

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: 'Strict' })
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY)
}

const apiClient: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`,
  headers: { Accept: 'application/json' },
  timeout: 30_000,
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken()

      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient