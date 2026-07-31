import type { ObjectDirective } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { Permission } from '../types/auth'

export const can: ObjectDirective<Element, Permission> = {
  mounted(el, binding) {
    if (useAuthStore().hasPermission(binding.value)) {
      return
    }

    el.replaceWith(document.createComment('v-can'))
  },
}
