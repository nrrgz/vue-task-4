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

const initials = computed(() => {
  const parts = (auth.user?.name ?? '').split(' ').filter((part) => part.length > 0)
  const first = parts.at(0)?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : ''
  return `${first}${last}`.toUpperCase() || '?'
})

const roleBadgeClass = computed(() => (auth.role === 'admin' ? 'badge--accent' : 'badge--neutral'))

async function handleLogout(): Promise<void> {
  auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <header class="app-nav">
    <div class="app-nav__inner">
      <RouterLink class="app-nav__brand" :to="{ name: 'dashboard' }">
        <span class="app-nav__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
            <rect x="13" y="3" width="8" height="5" rx="2" fill="currentColor" opacity="0.55" />
            <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.55" />
            <rect x="13" y="10" width="8" height="11" rx="2" fill="currentColor" />
          </svg>
        </span>
        <span class="app-nav__brand-text">Admin Panel</span>
      </RouterLink>

      <nav class="app-nav__primary" aria-label="Main">
        <ul class="app-nav__links">
          <li v-for="item in visibleItems" :key="item.name">
            <RouterLink class="app-nav__link" :to="{ name: item.name }">{{
              item.label
            }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="app-nav__account">
        <span class="app-nav__avatar" aria-hidden="true">{{ initials }}</span>

        <span class="app-nav__identity">
          <span class="app-nav__name">{{ auth.user?.name }}</span>
          <span class="badge" :class="roleBadgeClass">{{ auth.role }}</span>
        </span>

        <BaseButton variant="secondary" @click="handleLogout">Log out</BaseButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--color-border);
  background-color: rgb(255 255 255 / 0.85);
  backdrop-filter: blur(8px);
}

.app-nav__inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: 0.75rem var(--layout-gutter);
}

.app-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
  letter-spacing: -0.011em;
}

.app-nav__mark {
  display: inline-flex;
  color: var(--color-accent);
}

.app-nav__mark svg {
  width: 1.375rem;
  height: 1.375rem;
}

.app-nav__primary {
  flex: 1;
}

.app-nav__links {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-nav__link {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.app-nav__link:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-text);
}

.app-nav__link.router-link-active {
  background-color: var(--color-accent-soft);
  color: var(--color-accent-strong);
}

.app-nav__account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-nav__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--color-accent-soft);
  color: var(--color-accent-strong);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.app-nav__identity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.2;
}

.app-nav__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

@media (max-width: 52rem) {
  .app-nav__inner {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .app-nav__primary {
    order: 3;
    flex-basis: 100%;
  }

  .app-nav__account {
    margin-left: auto;
  }

  .app-nav__identity {
    display: none;
  }
}
</style>
