import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '../api/auth'
import type { AuthUser, Credentials, Permission } from '../types/auth'
import type { Role } from '../types/user'

const TOKEN_KEY = 'admin-panel.token'
const USER_KEY = 'admin-panel.user'

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'user') &&
    Array.isArray(candidate.permissions) &&
    candidate.permissions.every((permission) => typeof permission === 'string')
  )
}

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isAuthUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => token.value !== null && user.value !== null)
  const role = computed<Role | null>(() => user.value?.role ?? null)
  const permissions = computed<Permission[]>(() => user.value?.permissions ?? [])

  function hasPermission(permission: Permission): boolean {
    return permissions.value.includes(permission)
  }

  function clear(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(credentials: Credentials): Promise<AuthUser> {
    const response = await authApi.login(credentials)

    token.value = response.token
    user.value = response.user
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))

    return response.user
  }

  async function refresh(): Promise<void> {
    const requested = token.value
    const current = await authApi.me()

    if (token.value !== requested) {
      return
    }

    user.value = current
    localStorage.setItem(USER_KEY, JSON.stringify(current))
  }

  function logout(): void {
    clear()
  }

  function hydrate(): void {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = readStoredUser()

    if (storedToken === null || storedUser === null) {
      clear()
      return
    }

    token.value = storedToken
    user.value = storedUser
  }

  return {
    token,
    user,
    isAuthenticated,
    role,
    permissions,
    hasPermission,
    login,
    logout,
    refresh,
    hydrate,
  }
})
