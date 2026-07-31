<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  label?: string
  error?: string
}

defineProps<Props>()

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label" :for="inputId">{{ label }}</label>

    <input
      :id="inputId"
      v-model="model"
      class="base-input__field"
      :class="{ 'has-error': error }"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      v-bind="$attrs"
    />

    <p v-if="error" :id="errorId" class="base-input__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.base-input__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.base-input__field {
  padding: 0.5rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font: inherit;
  color: #111827;
  background-color: #fff;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.base-input__field::placeholder {
  color: #9ca3af;
}

.base-input__field:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15);
}

.base-input__field:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.base-input__field.has-error {
  border-color: #dc2626;
}

.base-input__field.has-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.15);
}

.base-input__error {
  margin: 0;
  font-size: 0.8rem;
  color: #dc2626;
}
</style>
