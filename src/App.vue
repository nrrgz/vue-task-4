<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
import ToastContainer from './components/feedback/ToastContainer.vue'
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>

  <ToastContainer />
</template>
