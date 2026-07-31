<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const target = computed(() => (auth.isAuthenticated ? 'dashboard' : 'login'))
const label = computed(() => (auth.isAuthenticated ? 'Back to dashboard' : 'Go to sign in'))
</script>

<template>
  <section class="error-page">
    <p class="error-page__code">404</p>

    <h1 class="error-page__title">Page not found</h1>

    <p class="error-page__message">
      That address does not match any page. It may have been moved, or the link may be out of date.
    </p>

    <RouterLink class="error-page__link" :to="{ name: target }">{{ label }}</RouterLink>
  </section>
</template>

<style scoped>
.error-page {
  max-width: 32rem;
}

.error-page__code {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: #d1d5db;
}

.error-page__title {
  margin: 0.25rem 0 0.75rem;
}

.error-page__message {
  margin: 0 0 1.25rem;
  color: #6b7280;
}

.error-page__link {
  color: #2563eb;
  font-weight: 500;
}
</style>
