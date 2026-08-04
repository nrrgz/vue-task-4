<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { apiErrorMessage, isReportedError } from '../api/errors'
import * as usersApi from '../api/users'
import BaseButton from '../components/base/BaseButton.vue'
import BaseModal from '../components/base/BaseModal.vue'
import SkeletonLoader from '../components/feedback/SkeletonLoader.vue'
import DynamicForm from '../components/form/DynamicForm.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import type { FieldConfig } from '../types/form'
import type { Role, User } from '../types/user'

type UserForm = {
  name: string
  email: string
  role: Role
  active: boolean
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()

const fields: FieldConfig<UserForm>[] = [
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
  { type: 'checkbox', name: 'active', label: 'Active' },
]

const userId = computed(() => Number.parseInt(String(route.params.id), 10))

const model = ref<UserForm>({ name: '', email: '', role: 'user', active: true })
const initial = ref<UserForm | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const isDirty = computed(() => {
  const base = initial.value
  if (base === null) return false

  return fields.some((field) => model.value[field.name] !== base[field.name])
})

function toModel(user: User): UserForm {
  return { name: user.name, email: user.email, role: user.role, active: user.active }
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
    const updated = await usersApi.update(userId.value, {
      name: model.value.name,
      email: model.value.email,
      role: model.value.role,
      active: model.value.active,
    })

    model.value = toModel(updated)
    initial.value = toModel(updated)

    if (auth.user?.id === updated.id) {
      await auth.refresh().catch(() => undefined)
    }

    notifications.notify('success', `Saved ${updated.name}`)
  } catch (cause) {
    if (!isReportedError(cause)) {
      notifications.notify('error', apiErrorMessage(cause))
    }
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

  settle(false)
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
  <section class="page">
    <div class="page__header">
      <div>
        <RouterLink class="user-edit__back" :to="{ name: 'users' }">Back to users</RouterLink>
        <h1>Edit user</h1>
        <p class="page__subtitle">Update this user's details.</p>
      </div>
    </div>

    <p v-if="error" class="user-edit__error" role="alert">
      <span>{{ error }}</span>
      <BaseButton variant="secondary" @click="load">Retry</BaseButton>
    </p>

    <div v-else-if="loading" class="card user-edit__card">
      <SkeletonLoader :rows="3" />
    </div>

    <div v-else class="card user-edit__card">
      <DynamicForm v-model="model" :fields="fields" :disabled="saving" @submit="handleSubmit">
        <template #actions>
          <BaseButton type="submit" :loading="saving">Save changes</BaseButton>
          <BaseButton variant="secondary" @click="goToUsers">Cancel</BaseButton>
        </template>
      </DynamicForm>
    </div>

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
.user-edit__back {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.user-edit__back::before {
  content: '\2190';
  margin-right: 0.35rem;
}

.user-edit__back:hover {
  text-decoration: underline;
}

.user-edit__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-md);
  background-color: var(--color-danger-soft);
  color: var(--color-danger-text);
}

.user-edit__card {
  padding: 1.5rem;
}

.user-edit__warning {
  color: var(--color-text-secondary);
}
</style>
