<script setup lang="ts">
import { computed } from 'vue'
import BaseField from '../../base/BaseField.vue'
import { useFormContext } from '../context'
import type { FieldConfig } from '../../../types/form'

const props = defineProps<{ field: FieldConfig }>()

const model = defineModel<boolean>({ default: false })

const { errors, disabled } = useFormContext()

const error = computed(() => errors.value[props.field.name] ?? '')
</script>

<template>
  <BaseField :error="error">
    <template #default="{ id, describedBy, invalid }">
      <div class="checkbox-field">
        <input
          :id="id"
          v-model="model"
          class="checkbox-field__box"
          type="checkbox"
          :required="field.required"
          :disabled="disabled"
          :aria-describedby="describedBy"
          :aria-invalid="invalid || undefined"
        />

        <label class="checkbox-field__label" :for="id">{{ field.label }}</label>
      </div>
    </template>
  </BaseField>
</template>

<style scoped>
.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-field__box {
  width: 1rem;
  height: 1rem;
  margin: 0;
  flex-shrink: 0;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.checkbox-field__box:disabled {
  cursor: not-allowed;
}

.checkbox-field__box:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.checkbox-field__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.checkbox-field__box:disabled + .checkbox-field__label {
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
