import type { Router } from 'vue-router'
import { canAccess } from './access'
import { useAuthStore } from '../stores/auth'

export function registerGuards(router: Router): void {
  router.beforeEach((to) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return to.name === 'login' ? true : { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.name === 'login' && auth.isAuthenticated) {
      return { name: 'dashboard' }
    }

    if (!canAccess(to.meta, auth.role)) {
      return to.name === 'forbidden' ? true : { name: 'forbidden' }
    }

    return true
  })
}
