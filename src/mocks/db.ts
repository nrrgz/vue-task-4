import type { AuthUser, Permission } from '../types/auth'
import type { Role, User, UserUpdate } from '../types/user'

interface SeedAccount {
  name: string
  email: string
  password: string
  role: Role
}

export const TEST_ACCOUNTS: SeedAccount[] = [
  { name: 'Amelia Hart', email: 'admin@example.com', password: 'admin', role: 'admin' },
  { name: 'Noah Brennan', email: 'user@example.com', password: 'user', role: 'user' },
]

export const GENERATED_ACCOUNT_PASSWORD = 'password123'

const SEED_SIZE = 50

const FIRST_NAMES = [
  'Olivia',
  'Liam',
  'Emma',
  'Mateo',
  'Sofia',
  'Kai',
  'Priya',
  'Lucas',
  'Zara',
  'Elias',
  'Nadia',
  'Omar',
  'Isla',
  'Hugo',
  'Freya',
  'Diego',
  'Anya',
  'Theo',
  'Maya',
  'Ivan',
]

const LAST_NAMES = [
  'Novak',
  'Fitzgerald',
  'Okafor',
  'Lindqvist',
  'Moreau',
  'Silva',
  'Haddad',
  'Kowalski',
  'Bergman',
  'Nakamura',
  'Duarte',
  'Petrov',
  'Ashford',
  'Ibrahim',
  'Castellan',
  'Rowan',
  'Vasquez',
  'Thornton',
  'Mensah',
  'Halvorsen',
]

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ['view_users', 'edit_user', 'delete_user', 'view_settings'],
  user: ['view_settings'],
}

function seed(): User[] {
  const seeded: User[] = TEST_ACCOUNTS.map((account, index) => ({
    id: index + 1,
    name: account.name,
    email: account.email,
    role: account.role,
  }))

  for (let index = seeded.length; index < SEED_SIZE; index += 1) {
    const id = index + 1
    const cycle = Math.floor(index / FIRST_NAMES.length)
    const first = FIRST_NAMES[index % FIRST_NAMES.length]
    const last = LAST_NAMES[(index * 7 + cycle) % LAST_NAMES.length]

    seeded.push({
      id,
      name: `${first} ${last}`,
      email: `${first}.${last}${id}@example.com`.toLowerCase(),
      role: id % 5 === 0 ? 'admin' : 'user',
    })
  }

  return seeded
}

let users: User[] = seed()

export function listUsers(): User[] {
  return [...users]
}

export function findUserById(id: number): User | undefined {
  return users.find((user) => user.id === id)
}

export function findUserByEmail(email: string): User | undefined {
  const normalised = email.trim().toLowerCase()
  return users.find((user) => user.email.toLowerCase() === normalised)
}

export function passwordFor(email: string): string {
  const account = TEST_ACCOUNTS.find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  )
  return account ? account.password : GENERATED_ACCOUNT_PASSWORD
}

export function verifyCredentials(email: string, password: string): User | undefined {
  const user = findUserByEmail(email)
  if (!user) {
    return undefined
  }
  return passwordFor(user.email) === password ? user : undefined
}

export function updateUser(id: number, changes: UserUpdate): User | undefined {
  const user = findUserById(id)
  if (!user) {
    return undefined
  }
  if (changes.name !== undefined) {
    user.name = changes.name
  }
  if (changes.email !== undefined) {
    user.email = changes.email
  }
  if (changes.role !== undefined) {
    user.role = changes.role
  }
  return user
}

export function deleteUser(id: number): boolean {
  const before = users.length
  users = users.filter((user) => user.id !== id)
  return users.length < before
}

export function permissionsFor(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]]
}

export function toAuthUser(user: User): AuthUser {
  return { ...user, permissions: permissionsFor(user.role) }
}

const TOKEN_PREFIX = 'mock-jwt.'

export function issueToken(user: User): string {
  return `${TOKEN_PREFIX}${btoa(JSON.stringify({ sub: user.id }))}`
}

export function userFromToken(token: string | undefined): User | undefined {
  if (!token || !token.startsWith(TOKEN_PREFIX)) {
    return undefined
  }

  try {
    const payload: unknown = JSON.parse(atob(token.slice(TOKEN_PREFIX.length)))
    if (typeof payload !== 'object' || payload === null) {
      return undefined
    }
    const subject = (payload as { sub?: unknown }).sub
    return typeof subject === 'number' ? findUserById(subject) : undefined
  } catch {
    return undefined
  }
}
