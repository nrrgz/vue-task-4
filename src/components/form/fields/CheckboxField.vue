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
  <BaseField :label="field.label" :error="error">
    <template #default="{ id, describedBy, invalid }">
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
    </template>
  </BaseField>
</template>

<style scoped>
.checkbox-field__box {
  width: 1rem;
  height: 1rem;
  margin: 0.35rem 0;
  accent-color: #2563eb;
}

.checkbox-field__box:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
</style>
