<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  label?: string
  error?: string
}

defineProps<Props>()

const fieldId = useId()
const errorId = `${fieldId}-error`

defineSlots<{
  default(props: { id: string; describedBy: string | undefined; invalid: boolean }): unknown
}>()
</script>

<template>
  <div class="base-field">
    <label v-if="label" class="base-field__label" :for="fieldId">{{ label }}</label>

    <slot :id="fieldId" :described-by="error ? errorId : undefined" :invalid="Boolean(error)" />

    <p v-if="error" :id="errorId" class="base-field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.base-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.base-field__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.base-field__error {
  margin: 0;
  font-size: 0.8rem;
  color: #dc2626;
}
</style>
