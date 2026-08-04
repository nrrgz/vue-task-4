<script setup lang="ts">
import { computed } from 'vue'
import BaseField from '../../base/BaseField.vue'
import { useFormContext } from '../context'
import type { FieldConfig } from '../../../types/form'

const props = defineProps<{ field: FieldConfig }>()

const model = defineModel<string>({ default: '' })

const { errors, disabled } = useFormContext()

const error = computed(() => errors.value[props.field.name] ?? '')
const inputType = computed(() => props.field.inputType ?? 'text')
</script>

<template>
  <BaseField :label="field.label" :error="error">
    <template #default="{ id, describedBy, invalid }">
      <input
        :id="id"
        v-model="model"
        class="text-field__input"
        :class="{ 'has-error': invalid }"
        :type="inputType"
        :required="field.required"
        :disabled="disabled"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
      />
    </template>
  </BaseField>
</template>

<style scoped>
.text-field__input {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font: inherit;
  color: var(--color-text);
  background-color: var(--color-surface);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.text-field__input::placeholder {
  color: var(--color-text-subtle);
}

.text-field__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15);
}

.text-field__input:disabled {
  background-color: var(--color-surface-muted);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.text-field__input.has-error {
  border-color: var(--color-danger);
}

.text-field__input.has-error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.15);
}
</style>
