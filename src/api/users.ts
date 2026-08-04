import { client } from './client'
import { USERS_QUERY_KEYS as PARAM } from '../types/user'
import type { Paginated } from '../types/api'
import type { User, UserUpdate, UsersQuery, UsersRequestParams } from '../types/user'

function toRequestParams(query: UsersQuery): UsersRequestParams {
  const params: UsersRequestParams = {}

  if (query.page !== undefined) params[PARAM.page] = query.page
  if (query.pageSize !== undefined) params[PARAM.pageSize] = query.pageSize
  if (query.sort !== undefined) params[PARAM.sort] = query.sort
  if (query.order !== undefined) params[PARAM.order] = query.order
  if (query.search !== undefined) params[PARAM.search] = query.search
  if (query.role !== undefined) params[PARAM.role] = query.role

  return params
}

export async function list(query: UsersQuery, signal?: AbortSignal): Promise<Paginated<User>> {
  const { data } = await client.get<Paginated<User>>('/users', {
    params: toRequestParams(query),
    signal,
  })
  return data
}

export async function get(id: number): Promise<User> {
  const { data } = await client.get<User>(`/users/${id}`)
  return data
}

export async function update(id: number, patch: UserUpdate): Promise<User> {
  const { data } = await client.patch<User>(`/users/${id}`, patch)
  return data
}

export async function remove(id: number): Promise<void> {
  await client.delete<void>(`/users/${id}`)
}
