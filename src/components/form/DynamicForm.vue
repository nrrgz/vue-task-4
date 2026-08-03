<script setup lang="ts" generic="T extends FormModel">
import { provide, ref, toRef } from 'vue'
import type { Component } from 'vue'
import { FORM_CONTEXT } from './context'
import CheckboxField from './fields/CheckboxField.vue'
import SelectField from './fields/SelectField.vue'
import TextField from './fields/TextField.vue'
import type { FieldConfig, FieldType, FieldValue, FormModel } from '../../types/form'

interface Props {
  fields: FieldConfig<T>[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { disabled: false })

const model = defineModel<T>({ required: true })

const emit = defineEmits<{ submit: [] }>()

const FIELD_COMPONENTS: Record<FieldType, Component> = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
}

function resolve(type: FieldType): Component {
  return FIELD_COMPONENTS[type]
}

const errors = ref<Record<string, string>>({})

provide(FORM_CONTEXT, { errors, disabled: toRef(props, 'disabled') })

function setValue(name: Extract<keyof T, string>, value: FieldValue): void {
  model.value = { ...model.value, [name]: value }

  if (errors.value[name] !== undefined) {
    const next = { ...errors.value }
    delete next[name]
    errors.value = next
  }
}

function isMissing(field: FieldConfig<T>): boolean {
  const value = model.value[field.name]
  return typeof value === 'string' ? value.trim() === '' : value !== true
}

function validate(): boolean {
  const next: Record<string, string> = {}

  for (const field of props.fields) {
    if (field.required === true && isMissing(field)) {
      next[field.name] = `${field.label} is required`
    }
  }

  errors.value = next
  return Object.keys(next).length === 0
}

function handleSubmit(): void {
  if (validate()) emit('submit')
}

defineExpose({ validate })
</script>

<template>
  <form class="dynamic-form" novalidate @submit.prevent="handleSubmit">
    <component
      :is="resolve(field.type)"
      v-for="field in fields"
      :key="field.name"
      :field="field"
      :model-value="model[field.name]"
      @update:model-value="(value: FieldValue) => setValue(field.name, value)"
    />

    <div class="dynamic-form__actions">
      <slot name="actions" />
    </div>
  </form>
</template>

<style scoped>
.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 28rem;
}

.dynamic-form__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
