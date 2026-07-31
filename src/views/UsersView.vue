<script setup lang="ts">
import { computed, ref } from 'vue'
import { apiErrorMessage, isReportedGlobally } from '../api/client'
import * as usersApi from '../api/users'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseTable from '../components/base/BaseTable.vue'
import SkeletonLoader from '../components/feedback/SkeletonLoader.vue'
import { PAGE_SIZE_OPTIONS, useServerTable } from '../composables/useServerTable'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { usePreferencesStore } from '../stores/preferences'
import type { SortOrder } from '../types/api'
import type { User } from '../types/user'

const auth = useAuthStore()
const notifications = useNotificationStore()
const preferences = usePreferencesStore()

const {
  state,
  rows,
  total,
  totalPages,
  loading,
  error,
  isFiltered,
  isPageOutOfRange,
  searchInput,
  setSort,
  setRole,
  setPage,
  setPageSize,
  refresh,
} = useServerTable()

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'actions', label: 'Actions', hideLabel: true },
]

const roleOptions = [
  { label: 'All roles', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]

const pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => ({
  label: `${size} per page`,
  value: String(size),
}))

const roleFilter = computed({
  get: () => state.value.role ?? '',
  set: setRole,
})

const pageSize = computed({
  get: () => String(state.value.pageSize),
  set: setPageSize,
})

const rangeStart = computed(() => (state.value.page - 1) * state.value.pageSize + 1)
const rangeEnd = computed(() => Math.min(state.value.page * state.value.pageSize, total.value))

const deletingId = ref<number | null>(null)
const confirmTarget = ref<User | null>(null)

const densityClass = computed(() => `users__table--${preferences.density}`)

const confirmOpen = computed({
  get: () => confirmTarget.value !== null,
  set: (open: boolean) => {
    if (!open) confirmTarget.value = null
  },
})

function handleSort(value: { key: string | null; order: SortOrder }): void {
  setSort(value.key, value.order)
}

function isSelf(user: User): boolean {
  return user.id === auth.user?.id
}

function requestDelete(user: User): void {
  confirmTarget.value = user
}

async function confirmDelete(): Promise<void> {
  const user = confirmTarget.value
  if (user === null) return

  confirmTarget.value = null
  await handleDelete(user)
}

async function handleDelete(user: User): Promise<void> {
  deletingId.value = user.id

  try {
    await usersApi.remove(user.id)
    notifications.notify('success', `Deleted ${user.name}`)

    if (rows.value.length === 1 && state.value.page > 1) {
      setPage(state.value.page - 1)
      return
    }

    await refresh()
  } catch (cause) {
    if (!isReportedGlobally(cause)) {
      notifications.notify('error', apiErrorMessage(cause))
    }
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <section class="users">
    <h1>Users</h1>

    <div class="users__controls">
      <div class="users__search">
        <BaseInput v-model="searchInput" label="Search" type="search" placeholder="Name or email" />
      </div>

      <label class="users__filter">
        <span class="users__filter-label">Role</span>
        <BaseSelect v-model="roleFilter" :options="roleOptions" />
      </label>
    </div>

    <p v-if="error" class="users__error" role="alert">
      {{ error }}
      <BaseButton variant="secondary" @click="refresh">Retry</BaseButton>
    </p>

    <SkeletonLoader v-else-if="loading" :rows="state.pageSize" />

    <template v-else>
      <BaseTable
        :class="densityClass"
        :columns="columns"
        :rows="rows"
        row-key="id"
        :sort-key="state.sort"
        :sort-order="state.order"
        @update:sort="handleSort"
      >
        <template #cell-actions="{ row }">
          <div class="users__actions">
            <RouterLink :to="{ name: 'user-edit', params: { id: row.id } }">Edit</RouterLink>

            <BaseButton
              v-can="'delete_user'"
              variant="danger"
              :loading="deletingId === row.id"
              :disabled="isSelf(row)"
              :title="
                isSelf(row) ? 'You cannot delete the account you are signed in as' : undefined
              "
              @click="requestDelete(row)"
            >
              Delete
            </BaseButton>
          </div>
        </template>

        <template #empty>
          <template v-if="isPageOutOfRange">
            Page {{ state.page }} is past the end of the results.
            <BaseButton variant="secondary" @click="setPage(1)">Back to first page</BaseButton>
          </template>

          <template v-else-if="isFiltered">No users match these filters.</template>

          <template v-else>No users yet.</template>
        </template>
      </BaseTable>

      <div v-if="total > 0" class="users__pagination">
        <p class="users__range">Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }}</p>

        <div class="users__pager">
          <BaseButton
            variant="secondary"
            :disabled="state.page <= 1"
            @click="setPage(state.page - 1)"
          >
            Previous
          </BaseButton>

          <span class="users__page">Page {{ state.page }} of {{ totalPages }}</span>

          <BaseButton
            variant="secondary"
            :disabled="state.page >= totalPages"
            @click="setPage(state.page + 1)"
          >
            Next
          </BaseButton>
        </div>

        <label class="users__filter">
          <span class="users__filter-label">Rows</span>
          <BaseSelect v-model="pageSize" :options="pageSizeOptions" />
        </label>
      </div>
    </template>

    <BaseModal v-model="confirmOpen">
      <template #header>Delete user</template>

      <p class="users__confirm">
        Permanently delete <strong>{{ confirmTarget?.name }}</strong> ({{ confirmTarget?.email }})?
        This cannot be undone.
      </p>

      <template #footer>
        <BaseButton variant="secondary" @click="confirmOpen = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.users__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin: 1rem 0;
}

.users__search {
  flex: 1 1 18rem;
}

.users__filter {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 10rem;
}

.users__filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.users__error {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  background-color: #fee2e2;
  color: #7f1d1d;
}

.users__table--compact :deep(th),
.users__table--compact :deep(td) {
  padding: 0.3rem 0.5rem;
}

.users__confirm {
  margin: 0;
  color: #374151;
}

.users__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.users__pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.users__range,
.users__page {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.users__pager {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
