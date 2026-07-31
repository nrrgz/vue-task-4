import type { User } from './user'

export type Permission = 'view_users' | 'edit_user' | 'delete_user' | 'view_settings'

export interface AuthUser extends User {
  permissions: Permission[]
}

export interface Credentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}
