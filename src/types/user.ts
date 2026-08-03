import type { SortOrder } from './api'

export type Role = 'admin' | 'user'

export type UserSortField = 'id' | 'name' | 'email' | 'role'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  active: boolean
}

export interface UserUpdate {
  name?: string
  email?: string
  role?: Role
  active?: boolean
}

export interface UsersQuery {
  page?: number
  pageSize?: number
  sort?: UserSortField
  order?: SortOrder
  search?: string
  role?: Role
}

export const USERS_QUERY_KEYS = {
  page: 'page',
  pageSize: 'pageSize',
  sort: 'sort',
  order: 'order',
  search: 'search',
  role: 'role',
} as const satisfies Record<keyof UsersQuery, string>
