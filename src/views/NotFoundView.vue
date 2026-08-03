<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const target = computed(() => (auth.isAuthenticated ? 'dashboard' : 'login'))
const label = computed(() => (auth.isAuthenticated ? 'Back to dashboard' : 'Go to sign in'))
</script>

<template>
  <section class="error-page">
    <div class="card error-page__card">
      <span class="error-page__code">404</span>

      <div class="error-page__copy">
        <h1>Page not found</h1>
        <p class="error-page__message">
          That address does not match any page. It may have been moved, or the link may be out of
          date.
        </p>
      </div>

      <RouterLink class="error-page__link" :to="{ name: target }">{{ label }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 12rem);
}

.error-page__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 30rem;
  padding: 2rem;
  text-align: center;
}

.error-page__code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background-color: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.error-page__copy {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-page__message {
  color: var(--color-text-muted);
}

.error-page__link {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  background-color: var(--color-accent);
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.15s ease;
}

.error-page__link:hover {
  background-color: var(--color-accent-strong);
  color: #fff;
}
</style>
