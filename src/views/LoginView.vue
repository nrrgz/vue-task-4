<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()

const email = ref('')
const password = ref('')
const submitting = ref(false)

function safeRedirectTarget(): string {
  const target = route.query.redirect
  if (typeof target !== 'string') {
    return '/dashboard'
  }
  return target.startsWith('/') && !target.startsWith('//') ? target : '/dashboard'
}

async function handleSubmit(): Promise<void> {
  if (submitting.value) {
    return
  }

  submitting.value = true

  try {
    await auth.login({ email: email.value, password: password.value })
    notifications.notify('success', 'Signed in')
    await router.replace(safeRedirectTarget())
  } catch {
    notifications.notify('error', 'Invalid email or password')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="login">
    <h1 class="login__title">Sign in</h1>

    <form class="login__form" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="username"
        required
        :disabled="submitting"
      />

      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        required
        :disabled="submitting"
      />

      <BaseButton type="submit" :loading="submitting">Sign in</BaseButton>
    </form>
  </section>
</template>

<style scoped>
.login {
  max-width: 22rem;
  margin: 3rem auto;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background-color: #fff;
}

.login__title {
  margin: 0 0 1.25rem;
  font-size: 1.25rem;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
