import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useNotificationStore } from '../stores/notifications'
import { SESSION_ERROR, markErrorReported } from './errors'

const LOGIN_PATH = '/auth/login'

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
    if (!axios.isAxiosError(error) || axios.isCancel(error)) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !isLoginRequest(error.config)) {
      markErrorReported(error)
      useNotificationStore().notify('error', SESSION_ERROR)
      handleUnauthorized?.()
    }

    return Promise.reject(error)
  },
)
