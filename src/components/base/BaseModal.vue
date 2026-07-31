<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const open = defineModel<boolean>({ default: false })

const panel = ref<HTMLElement | null>(null)

const titleId = useId()

const token: ModalToken = Symbol('base-modal')

let previouslyFocused: HTMLElement | null = null

function close() {
  open.value = false
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) close()
}

function isTopmost(): boolean {
  return modalStack[modalStack.length - 1] === token
}

function handleKeydown(event: KeyboardEvent) {
  if (!isTopmost()) return

  if (event.key === 'Escape') {
    close()
    return
  }

  if (event.key !== 'Tab') return

  const root = panel.value
  if (!root) return

  const items = focusableWithin(root)

  if (items.length === 0) {
    event.preventDefault()
    return
  }

  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  const inside = active instanceof HTMLElement && root.contains(active)

  if (event.shiftKey && (!inside || active === first)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (!inside || active === last)) {
    event.preventDefault()
    first.focus()
  }
}

let isLocked = false

async function lock() {
  if (isLocked) return
  isLocked = true

  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null

  modalStack.push(token)
  lockBodyScroll()
  window.addEventListener('keydown', handleKeydown)

  await nextTick()
  const root = panel.value
  if (root) (focusableWithin(root)[0] ?? root).focus()
}

function unlock() {
  if (!isLocked) return
  isLocked = false

  const index = modalStack.indexOf(token)
  if (index !== -1) modalStack.splice(index, 1)

  unlockBodyScroll()
  window.removeEventListener('keydown', handleKeydown)

  if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
  previouslyFocused = null
}

watch(open, (isOpen) => (isOpen ? lock() : unlock()), { immediate: true })

onBeforeUnmount(unlock)
</script>

<script lang="ts">

export type ModalToken = symbol

const modalStack: ModalToken[] = []

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable]'

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0),
  )
}

let lockCount = 0
let previousOverflow = ''

function lockBodyScroll() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

function unlockBodyScroll() {
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="base-modal">
      <div
        v-if="open"
        class="base-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="$slots.header ? titleId : undefined"
        @click="handleBackdropClick"
      >
        <div ref="panel" class="base-modal__panel" tabindex="-1">
          <header class="base-modal__header">
            <div :id="titleId" class="base-modal__title">
              <slot name="header" />
            </div>

            <button type="button" class="base-modal__close" aria-label="Close" @click="close">
              &times;
            </button>
          </header>

          <div class="base-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-modal-enter-active,
.base-modal-leave-active {
  transition: opacity 0.18s ease;
}

.base-modal-enter-active .base-modal__panel,
.base-modal-leave-active .base-modal__panel {
  transition:
    opacity 0.18s ease,
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.base-modal-enter-from,
.base-modal-leave-to {
  opacity: 0;
}

.base-modal-enter-from .base-modal__panel,
.base-modal-leave-to .base-modal__panel {
  opacity: 0;
  transform: scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .base-modal-enter-active,
  .base-modal-leave-active,
  .base-modal-enter-active .base-modal__panel,
  .base-modal-leave-active .base-modal__panel {
    transition-duration: 0.01ms;
  }

  .base-modal-enter-from .base-modal__panel,
  .base-modal-leave-to .base-modal__panel {
    transform: none;
  }
}

.base-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgb(17 24 39 / 0.5);
}

.base-modal__panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 32rem;
  max-height: calc(100vh - 2rem);
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 20px 45px rgb(0 0 0 / 0.25);
  overflow: hidden;
}

.base-modal__header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.base-modal__title {
  flex: 1;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.base-modal__close {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.base-modal__close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.base-modal__close:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.base-modal__body {
  padding: 1.25rem;
  overflow-y: auto;
}

.base-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}
</style>
