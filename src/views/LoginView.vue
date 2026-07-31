<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const redirectTarget = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' ? target : null
})
</script>

<template>
  <section>
    <h1>Login</h1>
    <p data-testid="redirect-target">{{ redirectTarget ?? 'no redirect' }}</p>
  </section>
</template>
