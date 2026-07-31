import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

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
  createApp(App).mount('#app')
}

void bootstrap()
