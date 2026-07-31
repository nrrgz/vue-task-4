<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section>
    <h1>Edit user {{ route.params.id }}</h1>
  </section>
</template>
