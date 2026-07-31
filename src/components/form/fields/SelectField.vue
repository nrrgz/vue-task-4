<script setup lang="ts">
import { computed } from 'vue'
import BaseField from '../../base/BaseField.vue'
import BaseSelect from '../../base/BaseSelect.vue'
import { useFormContext } from '../context'
import type { FieldConfig } from '../../../types/form'

const props = defineProps<{ field: FieldConfig }>()

const model = defineModel<string>({ default: '' })

const { errors, disabled } = useFormContext()

const error = computed(() => errors.value[props.field.name] ?? '')
const options = computed(() => props.field.options ?? [])
</script>

<template>
  <BaseField :label="field.label" :error="error">
    <template #default="{ id, describedBy, invalid }">
      <BaseSelect
        :id="id"
        v-model="model"
        :options="options"
        :invalid="invalid"
        :disabled="disabled"
        :aria-describedby="describedBy"
      />
    </template>
  </BaseField>
</template>
