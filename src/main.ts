import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { setAuthTokenGetter, setUnauthorizedHandler } from './api/client'
import { can } from './directives/can'
import { router } from './router'
import { watchAccess } from './router/guards'
import { useAuthStore } from './stores/auth'

async function startMockBackend(): Promise<void> {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

async function bootstrap(): Promise<void> {
  await startMockBackend()

  const app = createApp(App)
  app.use(createPinia())

  setAuthTokenGetter(() => useAuthStore().token)
  setUnauthorizedHandler(() => {
    useAuthStore().logout()

    const current = router.currentRoute.value
    if (current.name !== 'login') {
      void router.push({ name: 'login', query: { redirect: current.fullPath } })
    }
  })

  const auth = useAuthStore()
  auth.hydrate()
  watchAccess(router)

  app.directive('can', can)
  app.use(router)
  await router.isReady()

  app.mount('#app')

  if (auth.isAuthenticated) {
    void auth.refresh().catch(() => undefined)
  }
}

void bootstrap()
