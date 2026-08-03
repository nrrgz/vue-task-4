<script setup lang="ts">
import AppNav from './AppNav.vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="app-layout">
    <AppNav v-if="auth.isAuthenticated" />

    <main class="app-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-canvas);
}

.app-layout__main {
  flex: 1;
  width: 100%;
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: 2rem var(--layout-gutter) 3.5rem;
}

@media (max-width: 40rem) {
  .app-layout__main {
    padding: 1.5rem 1rem 2.5rem;
  }
}
</style>
