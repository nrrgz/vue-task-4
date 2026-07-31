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
