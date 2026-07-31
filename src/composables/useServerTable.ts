import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQuery, LocationQueryRaw, LocationQueryValue } from 'vue-router'
import { apiErrorMessage } from '../api/client'
import * as usersApi from '../api/users'
import type { SortOrder } from '../types/api'
import type { Role, User, UserSortField, UsersQuery } from '../types/user'

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50]

const SEARCH_DEBOUNCE_MS = 350
const SORT_FIELDS: UserSortField[] = ['id', 'name', 'email', 'role']
const ROLES: Role[] = ['admin', 'user']

export interface TableState {
  page: number
  pageSize: number
  sort: UserSortField | null
  order: SortOrder
  search: string
  role: Role | null
}

function firstValue(value: LocationQueryValue | LocationQueryValue[] | undefined): string | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null)
}

function isSortField(value: string | null): value is UserSortField {
  return SORT_FIELDS.some((field) => field === value)
}

function isRole(value: string | null): value is Role {
  return ROLES.some((role) => role === value)
}

function positiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback
}

function parse(query: LocationQuery): TableState {
  const sort = firstValue(query.sort)
  const role = firstValue(query.role)
  const pageSize = positiveInt(firstValue(query.pageSize), DEFAULT_PAGE_SIZE)

  return {
    page: positiveInt(firstValue(query.page), 1),
    pageSize: PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    sort: isSortField(sort) ? sort : null,
    order: firstValue(query.order) === 'desc' ? 'desc' : 'asc',
    search: (firstValue(query.search) ?? '').trim(),
    role: isRole(role) ? role : null,
  }
}

function serialize(state: TableState): LocationQueryRaw {
  const query: LocationQueryRaw = {}

  if (state.search) query.search = state.search
  if (state.role) query.role = state.role

  if (state.sort) {
    query.sort = state.sort
    query.order = state.order
  }

  if (state.page > 1) query.page = String(state.page)
  if (state.pageSize !== DEFAULT_PAGE_SIZE) query.pageSize = String(state.pageSize)

  return query
}

function toApiQuery(state: TableState): UsersQuery {
  const query: UsersQuery = { page: state.page, pageSize: state.pageSize }

  if (state.sort) {
    query.sort = state.sort
    query.order = state.order
  }

  if (state.search) query.search = state.search
  if (state.role) query.role = state.role

  return query
}

export function useServerTable() {
  const route = useRoute()
  const router = useRouter()

  const rows = ref<User[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const state = computed<TableState>(() => parse(route.query))
  const stateKey = computed(() => JSON.stringify(serialize(state.value)))

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / state.value.pageSize)))
  const isFiltered = computed(() => state.value.search !== '' || state.value.role !== null)
  const isEmpty = computed(() => !loading.value && error.value === null && total.value === 0)
  const isPageOutOfRange = computed(
    () => !loading.value && error.value === null && total.value > 0 && rows.value.length === 0,
  )

  let requestId = 0

  async function fetchRows(): Promise<void> {
    const id = ++requestId
    loading.value = true
    error.value = null

    try {
      const result = await usersApi.list(toApiQuery(state.value))
      if (id !== requestId) return

      rows.value = result.data
      total.value = result.total
    } catch (cause) {
      if (id !== requestId) return

      error.value = apiErrorMessage(cause)
      rows.value = []
      total.value = 0
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  async function navigate(patch: Partial<TableState>, mode: 'push' | 'replace'): Promise<void> {
    const next = serialize({ ...state.value, ...patch })
    if (JSON.stringify(next) === stateKey.value) return

    if (mode === 'replace') {
      await router.replace({ query: next })
      return
    }

    await router.push({ query: next })
  }

  function setSort(key: string | null, order: SortOrder): void {
    void navigate({ sort: isSortField(key) ? key : null, order, page: 1 }, 'push')
  }

  function setRole(value: string): void {
    void navigate({ role: isRole(value) ? value : null, page: 1 }, 'push')
  }

  function setPageSize(value: string): void {
    void navigate({ pageSize: positiveInt(value, DEFAULT_PAGE_SIZE), page: 1 }, 'push')
  }

  function setPage(page: number): void {
    void navigate({ page: Math.max(1, page) }, 'push')
  }

  const searchInput = ref(state.value.search)
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  watch(searchInput, (value) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      void navigate({ search: value.trim(), page: 1 }, 'replace')
    }, SEARCH_DEBOUNCE_MS)
  })

  watch(
    () => state.value.search,
    (value) => {
      if (value !== searchInput.value.trim()) searchInput.value = value
    },
  )

  watch(stateKey, () => void fetchRows(), { immediate: true })

  onUnmounted(() => clearTimeout(searchTimer))

  return {
    state,
    rows,
    total,
    totalPages,
    loading,
    error,
    isEmpty,
    isFiltered,
    isPageOutOfRange,
    searchInput,
    setSort,
    setRole,
    setPage,
    setPageSize,
    refresh: fetchRows,
  }
}
