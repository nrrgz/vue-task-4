<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseButton from '../base/BaseButton.vue'
import { useAuthStore } from '../../stores/auth'

interface NavItem {
  name: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { name: 'dashboard', label: 'Dashboard' },
  { name: 'users', label: 'Users' },
  { name: 'settings', label: 'Settings' },
]

const router = useRouter()
const auth = useAuthStore()

const visibleItems = computed(() =>
  NAV_ITEMS.filter((item) => {
    const allowedRoles = router.resolve({ name: item.name }).meta.roles
    if (allowedRoles === undefined) {
      return true
    }
    return auth.role !== null && allowedRoles.includes(auth.role)
  }),
)

async function handleLogout(): Promise<void> {
  auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <nav class="app-nav">
    <ul class="app-nav__links">
      <li v-for="item in visibleItems" :key="item.name">
        <RouterLink class="app-nav__link" :to="{ name: item.name }">{{ item.label }}</RouterLink>
      </li>
    </ul>

    <div class="app-nav__account">
      <span class="app-nav__user">{{ auth.user?.name }} ({{ auth.role }})</span>
      <BaseButton variant="secondary" @click="handleLogout">Log out</BaseButton>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
}

.app-nav__links {
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-nav__link {
  display: inline-block;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
}

.app-nav__link:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.app-nav__link.router-link-active {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.app-nav__account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-nav__user {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
