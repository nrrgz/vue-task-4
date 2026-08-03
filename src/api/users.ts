import { client } from './client'
import type { Paginated } from '../types/api'
import type { User, UserUpdate, UsersQuery } from '../types/user'

export async function list(query: UsersQuery, signal?: AbortSignal): Promise<Paginated<User>> {
  const { data } = await client.get<Paginated<User>>('/users', {
    params: query,
    handledLocally: true,
    signal,
  })
  return data
}

export async function get(id: number): Promise<User> {
  const { data } = await client.get<User>(`/users/${id}`, { handledLocally: true })
  return data
}

export async function update(id: number, patch: UserUpdate): Promise<User> {
  const { data } = await client.patch<User>(`/users/${id}`, patch, { handledLocally: true })
  return data
}

export async function remove(id: number): Promise<void> {
  await client.delete<void>(`/users/${id}`, { handledLocally: true })
}
