import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { router } from '../router'
import { useAuthStore } from '../stores/auth'

const LOGIN_PATH = '/auth/login'

export const client = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

function isLoginRequest(config: InternalAxiosRequestConfig | undefined): boolean {
  return config?.url?.includes(LOGIN_PATH) ?? false
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

    if (error.response?.status === 401 && !isLoginRequest(error.config)) {
      const auth = useAuthStore()
      auth.logout()

      const current = router.currentRoute.value
      if (current.name !== 'login') {
        await router.push({ name: 'login', query: { redirect: current.fullPath } })
      }
    }

    return Promise.reject(error)
  },
)
