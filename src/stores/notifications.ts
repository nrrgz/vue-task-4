import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

const AUTO_DISMISS_MS = 3000
let nextId = 0

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref<Toast[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function dismiss(id: string) {
    const timer = timers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.delete(id)
    }

    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  function notify(type: ToastType, message: string): string {
    const id = `toast-${++nextId}`

    toasts.value.push({ id, type, message })
    timers.set(
      id,
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
    )

    return id
  }

  return { toasts, notify, dismiss }
})
