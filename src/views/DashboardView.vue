<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const firstName = computed(() => (auth.user?.name ?? '').split(' ').at(0) ?? '')

const roleBadgeClass = computed(() => (auth.role === 'admin' ? 'badge--accent' : 'badge--neutral'))
</script>

<template>
  <section class="page">
    <div class="page__header">
      <div>
        <h1>Dashboard</h1>
        <p class="page__subtitle">Welcome back, {{ firstName }}.</p>
      </div>
    </div>

    <div class="dashboard__grid">
      <div class="card dashboard__card">
        <h2>Account</h2>

        <dl class="dashboard__facts">
          <dt>Name</dt>
          <dd>{{ auth.user?.name }}</dd>

          <dt>Email</dt>
          <dd>{{ auth.user?.email }}</dd>

          <dt>Role</dt>
          <dd>
            <span class="badge" :class="roleBadgeClass">{{ auth.role }}</span>
          </dd>
        </dl>
      </div>

      <div class="card dashboard__card">
        <h2>Permissions</h2>

        <p class="dashboard__hint">
          Issued by the backend on sign in. Individual controls are gated against this list.
        </p>

        <ul class="dashboard__permissions">
          <li v-for="permission in auth.permissions" :key="permission">
            <span class="badge badge--neutral">{{ permission }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1rem;
  align-items: start;
}

.dashboard__card {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem;
}

.dashboard__facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.6rem 1.25rem;
  margin: 0;
  font-size: 0.9rem;
}

.dashboard__facts dt {
  color: var(--color-text-muted);
}

.dashboard__facts dd {
  margin: 0;
  color: var(--color-text);
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
