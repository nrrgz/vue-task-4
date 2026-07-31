<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonType = 'button' | 'submit' | 'reset'

interface Props {
  variant?: ButtonVariant
  type?: ButtonType
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    class="base-button"
    :class="[`base-button--${variant}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  font-weight: 500;
  line-height: 1.25;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.base-button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.base-button--primary {
  background-color: #2563eb;
  color: #fff;
}

.base-button--primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.base-button--secondary {
  background-color: #fff;
  border-color: #d1d5db;
  color: #1f2937;
}

.base-button--secondary:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.base-button--danger {
  background-color: #dc2626;
  color: #fff;
}

.base-button--danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-button.is-loading {
  cursor: progress;
}

.base-button__spinner {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: base-button-spin 0.6s linear infinite;
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-button__spinner {
    animation-duration: 2s;
  }
}
</style>
