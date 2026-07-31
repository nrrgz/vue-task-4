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
  <section class="settings">
    <h1>Settings</h1>

    <p class="settings__hint">Visible to every signed-in role, including {{ auth.role }}.</p>

    <label class="settings__field">
      <span class="settings__label">Table density</span>
      <BaseSelect v-model="density" :options="densityOptions" />
      <span class="settings__help">
        Controls row spacing on the users table. Saved to this browser.
      </span>
    </label>
  </section>
</template>

<style scoped>
.settings__hint {
  color: #6b7280;
  font-size: 0.9rem;
}

.settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 18rem;
  margin-top: 1rem;
}

.settings__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.settings__help {
  font-size: 0.8rem;
  color: #6b7280;
}
</style>
