import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { router } from '../router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import type { ApiError } from '../types/api'

const LOGIN_PATH = '/auth/login'
const GENERIC_ERROR = 'Something went wrong. Please try again.'
const FORBIDDEN_ERROR = 'You do not have permission to do that.'
const SESSION_ERROR = 'Your session has expired. Please sign in again.'

export function apiErrorMessage(cause: unknown): string {
  if (axios.isAxiosError<ApiError>(cause)) {
    return cause.response?.data?.message ?? GENERIC_ERROR
  }

  return GENERIC_ERROR
}

export const client = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

function isLoginRequest(config: InternalAxiosRequestConfig | undefined): boolean {
  return config?.url?.includes(LOGIN_PATH) ?? false
}

export function isReportedGlobally(cause: unknown): boolean {
  if (!axios.isAxiosError(cause) || isLoginRequest(cause.config)) {
    return false
  }

  return cause.response?.status === 401 || cause.response?.status === 403
}

client.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.token !== null) {
    config.headers.set('Authorization', `Bearer ${auth.token}`)
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status

    if (status === 401 && !isLoginRequest(error.config)) {
      const auth = useAuthStore()
      auth.logout()
      useNotificationStore().notify('error', SESSION_ERROR)

      const current = router.currentRoute.value
      if (current.name !== 'login') {
        await router.push({ name: 'login', query: { redirect: current.fullPath } })
      }
    }

    if (status === 403) {
      useNotificationStore().notify('error', FORBIDDEN_ERROR)
    }

    return Promise.reject(error)
  },
)
