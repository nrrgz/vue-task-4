<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseToast from '../base/BaseToast.vue'
import { useNotificationStore } from '../../stores/notifications'

const notifications = useNotificationStore()
const { toasts } = storeToRefs(notifications)
</script>

<template>
  <BaseToast :toasts="toasts" @dismiss="notifications.dismiss" />
</template>
