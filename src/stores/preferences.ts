import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TableDensity = 'comfortable' | 'compact'

const DENSITY_KEY = 'admin-panel.density'

function isDensity(value: unknown): value is TableDensity {
  return value === 'comfortable' || value === 'compact'
}

function readStoredDensity(): TableDensity {
  const stored = localStorage.getItem(DENSITY_KEY)
  return isDensity(stored) ? stored : 'comfortable'
}

export const usePreferencesStore = defineStore('preferences', () => {
  const density = ref<TableDensity>(readStoredDensity())

  function setDensity(value: TableDensity): void {
    density.value = value
    localStorage.setItem(DENSITY_KEY, value)
  }

  return { density, setDensity }
})
