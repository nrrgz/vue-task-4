import { watch } from 'vue'
import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'
import { canAccess } from './access'
import { useAuthStore } from '../stores/auth'

function resolveAccess(to: RouteLocationNormalized): true | RouteLocationRaw {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (!canAccess(to.meta, auth.role)) {
    return { name: 'forbidden' }
  }

  return true
}

export function registerGuards(router: Router): void {
  router.beforeEach((to) => resolveAccess(to))
}

export function watchAccess(router: Router): void {
  const auth = useAuthStore()

  watch(
    () => auth.role,
    (role) => {
      if (role === null) {
        return
      }

      const target = resolveAccess(router.currentRoute.value)
      if (target !== true) {
        void router.replace(target)
      }
    },
  )
}
