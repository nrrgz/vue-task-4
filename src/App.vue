<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
import ToastContainer from './components/feedback/ToastContainer.vue'
</script>

<template>
  <AppLayout>
    <RouterView v-slot="{ Component }">
      <Transition name="route" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </AppLayout>

  <ToastContainer />
</template>

<style>
.route-enter-active,
.route-leave-active {
  transition: opacity 0.15s ease;
}

.route-enter-from,
.route-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .route-enter-active,
  .route-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
