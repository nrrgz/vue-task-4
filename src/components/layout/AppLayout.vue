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
  min-height: 100vh;
  background-color: #f9fafb;
}

.app-layout__main {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
