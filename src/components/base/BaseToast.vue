<script setup lang="ts">
interface ToastItem {
  id: string
  type: 'success' | 'error'
  message: string
}

interface Props {
  toasts: ToastItem[]
}

defineProps<Props>()

defineEmits<{
  dismiss: [id: string]
}>()
</script>

<template>
  <Teleport to="body">
    <div class="base-toast" role="status" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="base-toast__item"
        :class="`base-toast__item--${toast.type}`"
      >
        <span class="base-toast__message">{{ toast.message }}</span>

        <button
          type="button"
          class="base-toast__close"
          aria-label="Dismiss notification"
          @click="$emit('dismiss', toast.id)"
        >
          &times;
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.base-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(22rem, calc(100vw - 2rem));
  pointer-events: none;
}

.base-toast__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.12);
  font-size: 0.9rem;
  pointer-events: auto;
}

.base-toast__item--success {
  background-color: #dcfce7;
  border-color: #86efac;
  color: #14532d;
}

.base-toast__item--error {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #7f1d1d;
}

.base-toast__message {
  flex: 1;
}

.base-toast__close {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.7;
  cursor: pointer;
}

.base-toast__close:hover {
  opacity: 1;
  background-color: rgb(0 0 0 / 0.06);
}

.base-toast__close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 1px;
}
</style>
