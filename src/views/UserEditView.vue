<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { apiErrorMessage } from '../api/client'
import * as usersApi from '../api/users'
import BaseButton from '../components/base/BaseButton.vue'
import BaseModal from '../components/base/BaseModal.vue'
import SkeletonLoader from '../components/feedback/SkeletonLoader.vue'
import DynamicForm from '../components/form/DynamicForm.vue'
import { useNotificationStore } from '../stores/notifications'
import type { FieldConfig, FieldValue, FormModel } from '../types/form'
import type { Role, User } from '../types/user'

const route = useRoute()
const router = useRouter()
const notifications = useNotificationStore()

const fields: FieldConfig[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  { type: 'text', name: 'email', label: 'Email', required: true },
  {
    type: 'select',
    name: 'role',
    label: 'Role',
    required: true,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  },
]

const userId = computed(() => Number.parseInt(String(route.params.id), 10))

const model = ref<FormModel>({ name: '', email: '', role: 'user' })
const initial = ref<FormModel | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const isDirty = computed(() => {
  const base = initial.value
  if (base === null) return false

  return fields.some((field) => model.value[field.name] !== base[field.name])
})

function text(value: FieldValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

function toModel(user: User): FormModel {
  return { name: user.name, email: user.email, role: user.role }
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const user = await usersApi.get(userId.value)
    model.value = toModel(user)
    initial.value = toModel(user)
  } catch (cause) {
    error.value = apiErrorMessage(cause)
    initial.value = null
  } finally {
    loading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  saving.value = true

  try {
    const role: Role = text(model.value.role) === 'admin' ? 'admin' : 'user'
    const updated = await usersApi.update(userId.value, {
      name: text(model.value.name),
      email: text(model.value.email),
      role,
    })

    model.value = toModel(updated)
    initial.value = toModel(updated)
    notifications.notify('success', `Saved ${updated.name}`)
  } catch (cause) {
    notifications.notify('error', apiErrorMessage(cause))
  } finally {
    saving.value = false
  }
}

const confirmOpen = ref(false)
let resolveLeave: ((value: boolean) => void) | null = null

function settle(value: boolean): void {
  const resolve = resolveLeave
  resolveLeave = null
  confirmOpen.value = false
  resolve?.(value)
}

watch(confirmOpen, (open) => {
  if (!open) settle(false)
})

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true

  confirmOpen.value = true
  return new Promise<boolean>((resolve) => {
    resolveLeave = resolve
  })
})

async function goToUsers(): Promise<void> {
  await router.push({ name: 'users' })
}

watch(userId, load, { immediate: true })
</script>

<template>
  <section class="user-edit">
    <h1>Edit user</h1>

    <p v-if="error" class="user-edit__error" role="alert">
      {{ error }}
      <BaseButton variant="secondary" @click="load">Retry</BaseButton>
    </p>

    <SkeletonLoader v-else-if="loading" :rows="3" />

    <DynamicForm v-else v-model="model" :fields="fields" :disabled="saving" @submit="handleSubmit">
      <template #actions>
        <BaseButton type="submit" :loading="saving">Save</BaseButton>
        <BaseButton variant="secondary" @click="goToUsers">Cancel</BaseButton>
      </template>
    </DynamicForm>

    <BaseModal v-model="confirmOpen">
      <template #header>Unsaved changes</template>

      <p class="user-edit__warning">
        This form has changes that have not been saved. Leaving now discards them.
      </p>

      <template #footer>
        <BaseButton variant="secondary" @click="settle(false)">Keep editing</BaseButton>
        <BaseButton variant="danger" @click="settle(true)">Discard and leave</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.user-edit__error {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  background-color: #fee2e2;
  color: #7f1d1d;
}

.user-edit__warning {
  margin: 0;
  color: #374151;
}
</style>
