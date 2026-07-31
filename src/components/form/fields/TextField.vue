<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from '../../base/BaseInput.vue'
import { useFormContext } from '../context'
import type { FieldConfig } from '../../../types/form'

const props = defineProps<{ field: FieldConfig }>()

const model = defineModel<string>({ default: '' })

const { errors, disabled } = useFormContext()

const error = computed(() => errors.value[props.field.name] ?? '')
</script>

<template>
  <BaseInput
    v-model="model"
    :label="field.label"
    :error="error"
    :required="field.required"
    :disabled="disabled"
  />
</template>
