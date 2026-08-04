import { client } from './client'
import type { AuthResponse, AuthUser, Credentials } from '../types/auth'

export async function login(credentials: Credentials): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/login', credentials, {
    handledLocally: true,
  })
  return data
}

export async function me(): Promise<AuthUser> {
  const { data } = await client.get<AuthUser>('/auth/me', { handledLocally: true })
  return data
}
