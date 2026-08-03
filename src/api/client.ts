import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useNotificationStore } from '../stores/notifications'
import { FORBIDDEN_ERROR, SESSION_ERROR, apiErrorMessage } from './errors'

const LOGIN_PATH = '/auth/login'
const SERVER_ERROR_STATUS = 500

export const client = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

let readAuthToken: (() => string | null) | null = null
let handleUnauthorized: (() => void) | null = null

export function setAuthTokenGetter(fn: () => string | null): void {
  readAuthToken = fn
}

export function setUnauthorizedHandler(fn: () => void): void {
  handleUnauthorized = fn
}

function isLoginRequest(config: InternalAxiosRequestConfig | undefined): boolean {
  return config?.url?.includes(LOGIN_PATH) ?? false
}

function isUserRelevant(status: number | undefined): boolean {
  return status === undefined || status === 403 || status >= SERVER_ERROR_STATUS
}

function defaultMessage(error: AxiosError, status: number | undefined): string {
  return status === 403 ? FORBIDDEN_ERROR : apiErrorMessage(error)
}

client.interceptors.request.use((config) => {
  const token = readAuthToken?.() ?? null

  if (token !== null) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const notifications = useNotificationStore()

    if (status === 401 && !isLoginRequest(error.config)) {
      notifications.notify('error', SESSION_ERROR)
      handleUnauthorized?.()

      return Promise.reject(error)
    }

    if (error.config?.handledLocally !== true && isUserRelevant(status)) {
      notifications.notify('error', defaultMessage(error, status))
    }

    return Promise.reject(error)
  },
)
