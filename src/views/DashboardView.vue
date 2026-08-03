<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const firstName = computed(() => (auth.user?.name ?? '').split(' ').at(0) ?? '')
</script>

<template>
  <section class="page">
    <div class="page__header">
      <div>
        <h1>Dashboard</h1>
        <p class="page__subtitle">Welcome back, {{ firstName }}.</p>
      </div>
    </div>

    <div class="card dashboard__card">
      <h2>What you can do here</h2>

      <p class="dashboard__hint">
        These permissions are issued by the backend when you sign in. Individual controls across the
        app are gated against this list.
      </p>

      <ul class="dashboard__permissions">
        <li v-for="permission in auth.permissions" :key="permission">
          <span class="badge badge--neutral">{{ permission }}</span>
        </li>
      </ul>

      <p class="dashboard__hint">
        Your account details are on the
        <RouterLink :to="{ name: 'settings' }">settings</RouterLink> page.
      </p>
    </div>
  </section>
</template>

<style scoped>
.dashboard__card {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem;
  max-width: 40rem;
}

.dashboard__hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.dashboard__permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
