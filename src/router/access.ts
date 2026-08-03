import type { RouteMeta } from 'vue-router'
import type { Role } from '../types/user'

export function canAccess(meta: RouteMeta, role: Role | null): boolean {
  const allowedRoles = meta.roles

  if (allowedRoles === undefined || allowedRoles.length === 0) {
    return true
  }

  return role !== null && allowedRoles.includes(role)
}
