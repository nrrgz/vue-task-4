<script setup lang="ts">
import { computed } from 'vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { usePreferencesStore } from '../stores/preferences'
import type { TableDensity } from '../stores/preferences'

const auth = useAuthStore()
const notifications = useNotificationStore()
const preferences = usePreferencesStore()

const densityOptions = [
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Compact', value: 'compact' },
]

const density = computed<string>({
  get: () => preferences.density,
  set: (value) => {
    const next: TableDensity = value === 'compact' ? 'compact' : 'comfortable'
    if (next === preferences.density) return

    preferences.setDensity(next)
    notifications.notify('success', 'Preferences saved')
  },
})
</script>

<template>
  <section class="page">
    <div class="page__header">
      <div>
        <h1>Settings</h1>
        <p class="page__subtitle">
          Visible to every signed-in role, including <strong>{{ auth.role }}</strong
          >.
        </p>
      </div>
    </div>

    <div class="card settings__card">
      <div class="settings__row">
        <div class="settings__copy">
          <h2>Table density</h2>
          <p class="settings__help">
            Controls row spacing on the users table. Saved to this browser.
          </p>
        </div>

        <label class="settings__field">
          <span class="settings__label">Density</span>
          <BaseSelect v-model="density" :options="densityOptions" />
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings__card {
  padding: 1.25rem;
}

.settings__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.settings__copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 28rem;
}

.settings__help {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 12rem;
}

.settings__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}
</style>
