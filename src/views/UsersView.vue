<script setup lang="ts">
import { computed, ref } from 'vue'
import { apiErrorMessage } from '../api/errors'
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
    notifications.notify('error', apiErrorMessage(cause))
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <section class="page">
    <div class="page__header">
      <div>
        <h1>Users</h1>
        <p class="page__subtitle">
          Search, sort and filter the directory. Every query runs on the server.
        </p>
      </div>
    </div>

    <div class="card users__toolbar">
      <div class="users__search">
        <BaseInput v-model="searchInput" label="Search" type="search" placeholder="Name or email" />
      </div>

      <label class="users__filter">
        <span class="users__filter-label">Role</span>
        <BaseSelect v-model="roleFilter" :options="roleOptions" />
      </label>
    </div>

    <p v-if="error" class="users__error" role="alert">
      <span>{{ error }}</span>
      <BaseButton variant="secondary" @click="refresh">Retry</BaseButton>
    </p>

    <div v-else-if="loading" class="card users__loading">
      <SkeletonLoader :rows="state.pageSize" />
    </div>

    <div v-else class="card users__panel">
      <div class="users__scroll">
        <BaseTable
          class="users__table"
          :class="densityClass"
          :columns="columns"
          :rows="rows"
          row-key="id"
          :sort-key="state.sort"
          :sort-order="state.order"
          @update:sort="handleSort"
        >
          <template #cell-name="{ row }">
            <span class="users__name">
              {{ row.name }}
              <span v-if="isSelf(row)" class="badge badge--muted">You</span>
            </span>
          </template>

          <template #cell-email="{ row }">
            <span class="users__email">{{ row.email }}</span>
          </template>

          <template #cell-role="{ row }">
            <span class="badge" :class="row.role === 'admin' ? 'badge--accent' : 'badge--neutral'">
              {{ row.role }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="users__actions">
              <RouterLink class="users__edit" :to="{ name: 'user-edit', params: { id: row.id } }">
                Edit
              </RouterLink>

              <BaseButton
                v-can="'delete_user'"
                class="users__delete"
                variant="secondary"
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
            <div class="users__empty">
              <template v-if="isPageOutOfRange">
                <p>Page {{ state.page }} is past the end of the results.</p>
                <BaseButton variant="secondary" @click="setPage(1)">Back to first page</BaseButton>
              </template>

              <template v-else-if="isFiltered">
                <p>No users match these filters.</p>
              </template>

              <template v-else>
                <p>No users yet.</p>
              </template>
            </div>
          </template>
        </BaseTable>
      </div>

      <div v-if="total > 0" class="users__footer">
        <p class="users__range">
          Showing <strong>{{ rangeStart }}–{{ rangeEnd }}</strong> of {{ total }}
        </p>

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

        <label class="users__rows">
          <span class="users__filter-label">Rows</span>
          <BaseSelect v-model="pageSize" :options="pageSizeOptions" />
        </label>
      </div>
    </div>

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
.users__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem;
}

.users__search {
  flex: 1 1 20rem;
}

.users__filter,
.users__rows {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 10rem;
}

.users__filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.users__error {
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

.users__loading {
  padding: 1rem;
}

.users__panel {
  overflow: hidden;
}

.users__scroll {
  overflow-x: auto;
}

.users__table :deep(th) {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.users__table :deep(.base-table__sort) {
  letter-spacing: inherit;
  text-transform: inherit;
}

.users__table :deep(td) {
  vertical-align: middle;
}

.users__table :deep(tbody tr:last-child td) {
  border-bottom: none;
}

.users__table--compact :deep(th),
.users__table--compact :deep(td) {
  padding: 0.3rem 0.75rem;
}

.users__name {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.users__email {
  color: var(--color-text-muted);
}

.users__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.users__edit {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.7rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.users__edit:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-text);
}

.users__actions .users__delete {
  border-color: transparent;
  background-color: transparent;
  color: var(--color-danger);
  font-size: 0.875rem;
  padding: 0.375rem 0.7rem;
}

.users__actions .users__delete:hover:not(:disabled) {
  border-color: var(--color-danger-border);
  background-color: var(--color-danger-soft);
  color: var(--color-danger-strong);
}

.users__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
}

.users__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-canvas);
}

.users__range,
.users__page {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.users__range strong {
  color: var(--color-text-secondary);
}

.users__pager {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.users__rows {
  flex-direction: row;
  align-items: center;
  min-width: 0;
}

.users__confirm {
  color: var(--color-text-secondary);
}
</style>
