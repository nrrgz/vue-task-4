<script setup lang="ts">
interface Props {
  rows?: number
}

withDefaults(defineProps<Props>(), { rows: 5 })
</script>

<template>
  <div class="skeleton" role="status" aria-live="polite">
    <span class="skeleton__label">Loading…</span>

    <div v-for="row in rows" :key="row" class="skeleton__row" aria-hidden="true" />
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton__label {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.skeleton__row {
  height: 2.25rem;
  border-radius: 6px;
  background-color: #e5e7eb;
  background-image: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton__row {
    animation: none;
  }
}
</style>
