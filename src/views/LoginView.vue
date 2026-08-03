<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiErrorMessage } from '../api/client'
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
  } catch (cause) {
    notifications.notify('error', apiErrorMessage(cause))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="login">
    <div class="card login__card">
      <span class="login__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
          <rect x="13" y="3" width="8" height="5" rx="2" fill="currentColor" opacity="0.55" />
          <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.55" />
          <rect x="13" y="10" width="8" height="11" rx="2" fill="currentColor" />
        </svg>
      </span>

      <div class="login__heading">
        <h1>Sign in</h1>
        <p class="login__subtitle">Enter your credentials to continue.</p>
      </div>

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

        <BaseButton class="login__submit" type="submit" :loading="submitting">Sign in</BaseButton>
      </form>
    </div>
  </section>
</template>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 5.5rem);
}

.login__card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 23rem;
  padding: 1.75rem;
  box-shadow: var(--shadow-lg);
}

.login__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
}

.login__mark svg {
  width: 1.5rem;
  height: 1.5rem;
}

.login__heading {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.login__subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login__submit {
  margin-top: 0.25rem;
}
</style>
