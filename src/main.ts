import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { can } from './directives/can'
import { router } from './router'
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

  useAuthStore().hydrate()

  app.directive('can', can)
  app.use(router)
  await router.isReady()

  app.mount('#app')
}

void bootstrap()
