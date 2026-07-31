<script setup lang="ts">
interface SelectOption {
  label: string
  value: string
}

interface Props {
  options: SelectOption[]
  placeholder?: string
  invalid?: boolean
}

defineProps<Props>()

const model = defineModel<string>({ default: '' })
</script>

<template>
  <select
    v-model="model"
    class="base-select"
    :class="{ 'is-placeholder': !model, 'has-error': invalid }"
    :aria-invalid="invalid || undefined"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>

    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
.base-select {
  appearance: none;
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font: inherit;
  color: #111827;
  background-color: #fff;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%236b7280' stroke-width='1.5'><path d='M4 6l4 4 4-4'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  background-size: 1rem;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.base-select.is-placeholder {
  color: #9ca3af;
}

.base-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15);
}

.base-select.has-error {
  border-color: #dc2626;
}

.base-select.has-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.15);
}

.base-select:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.base-select option {
  color: #111827;
}
</style>
