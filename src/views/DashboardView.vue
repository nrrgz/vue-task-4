<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <section class="dashboard">
    <h1>Dashboard</h1>

    <p class="dashboard__greeting">Signed in as {{ auth.user?.name }} ({{ auth.user?.email }}).</p>

    <dl class="dashboard__facts">
      <dt>Role</dt>
      <dd>{{ auth.role }}</dd>

      <dt>Permissions</dt>
      <dd>{{ auth.permissions.join(', ') }}</dd>
    </dl>
  </section>
</template>

<style scoped>
.dashboard__greeting {
  color: #374151;
}

.dashboard__facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.35rem 1rem;
  margin: 1rem 0 0;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fff;
  font-size: 0.9rem;
}

.dashboard__facts dt {
  font-weight: 600;
  color: #374151;
}

.dashboard__facts dd {
  margin: 0;
  color: #111827;
}
</style>
