import { HttpResponse, delay, http } from 'msw'
import type { DefaultBodyType, PathParams } from 'msw'
import type { ApiError, Paginated, SortOrder } from '../types/api'
import type { AuthResponse, AuthUser, Credentials, Permission } from '../types/auth'
import type { Role, User, UserSortField, UserUpdate } from '../types/user'
import {
  deleteUser,
  findUserById,
  issueToken,
  listUsers,
  toAuthUser,
  updateUser,
  userFromToken,
  verifyCredentials,
} from './db'

const LATENCY_MS = 200

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

type UserParams = {
  id: string
}

const SORT_FIELDS: UserSortField[] = ['id', 'name', 'email', 'role']
const ROLES: Role[] = ['admin', 'user']

function isSortField(value: string | null): value is UserSortField {
  return SORT_FIELDS.some((field) => field === value)
}

function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role === value)
}

function positiveInt(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }
  return Math.min(parsed, max)
}

function bearerToken(request: Request): string | undefined {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return undefined
  }
  return header.slice('Bearer '.length).trim()
}

function authenticate(request: Request): AuthUser | undefined {
  const user = userFromToken(bearerToken(request))
  return user ? toAuthUser(user) : undefined
}

function unauthorized(): HttpResponse<ApiError> {
  return HttpResponse.json<ApiError>({ message: 'Missing or invalid token' }, { status: 401 })
}

function forbidden(permission: Permission): HttpResponse<ApiError> {
  return HttpResponse.json<ApiError>(
    { message: `Missing required permission: ${permission}` },
    { status: 403 },
  )
}

function notFound(): HttpResponse<ApiError> {
  return HttpResponse.json<ApiError>({ message: 'User not found' }, { status: 404 })
}

function badRequest(message: string): HttpResponse<ApiError> {
  return HttpResponse.json<ApiError>({ message }, { status: 400 })
}

function conflict(message: string): HttpResponse<ApiError> {
  return HttpResponse.json<ApiError>({ message }, { status: 409 })
}

function compare(left: User, right: User, field: UserSortField): number {
  if (field === 'id') {
    return left.id - right.id
  }
  return left[field].localeCompare(right[field])
}

const login = http.post<PathParams, Credentials, AuthResponse | ApiError>(
  '/auth/login',
  async ({ request }) => {
    await delay(LATENCY_MS)

    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''
    const password = typeof body.password === 'string' ? body.password : ''

    const user = verifyCredentials(email, password)
    if (!user) {
      return HttpResponse.json<ApiError>({ message: 'Invalid email or password' }, { status: 401 })
    }

    return HttpResponse.json<AuthResponse>({
      token: issueToken(user),
      user: toAuthUser(user),
    })
  },
)

const me = http.get<PathParams, DefaultBodyType, AuthUser | ApiError>(
  '/auth/me',
  async ({ request }) => {
    await delay(LATENCY_MS)

    const caller = authenticate(request)
    if (!caller) {
      return unauthorized()
    }

    return HttpResponse.json<AuthUser>(caller)
  },
)

const listUsersRoute = http.get<PathParams, DefaultBodyType, Paginated<User> | ApiError>(
  '/users',
  async ({ request }) => {
    await delay(LATENCY_MS)

    const caller = authenticate(request)
    if (!caller) {
      return unauthorized()
    }
    if (!caller.permissions.includes('view_users')) {
      return forbidden('view_users')
    }

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const roleFilter = url.searchParams.get('role')
    const sortParam = url.searchParams.get('sort')
    const sort: UserSortField = isSortField(sortParam) ? sortParam : 'id'
    const order: SortOrder = url.searchParams.get('order') === 'desc' ? 'desc' : 'asc'
    const page = positiveInt(url.searchParams.get('page'), 1, Number.MAX_SAFE_INTEGER)
    const pageSize = positiveInt(url.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)

    let matched = listUsers()

    if (search) {
      matched = matched.filter(
        (user) =>
          user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
      )
    }

    if (isRole(roleFilter)) {
      matched = matched.filter((user) => user.role === roleFilter)
    }

    matched.sort((left, right) => {
      const result = compare(left, right, sort)
      return order === 'desc' ? -result : result
    })

    const start = (page - 1) * pageSize

    return HttpResponse.json<Paginated<User>>({
      data: matched.slice(start, start + pageSize),
      total: matched.length,
    })
  },
)

const getUser = http.get<UserParams, DefaultBodyType, User | ApiError>(
  '/users/:id',
  async ({ request, params }) => {
    await delay(LATENCY_MS)

    const caller = authenticate(request)
    if (!caller) {
      return unauthorized()
    }
    if (!caller.permissions.includes('view_users')) {
      return forbidden('view_users')
    }

    const user = findUserById(Number.parseInt(params.id, 10))
    return user ? HttpResponse.json<User>(user) : notFound()
  },
)

const patchUser = http.patch<UserParams, UserUpdate, User | ApiError>(
  '/users/:id',
  async ({ request, params }) => {
    await delay(LATENCY_MS)

    const caller = authenticate(request)
    if (!caller) {
      return unauthorized()
    }
    if (!caller.permissions.includes('edit_user')) {
      return forbidden('edit_user')
    }

    const body = await request.json()
    if (body.role !== undefined && !isRole(body.role)) {
      return badRequest('Role must be either "admin" or "user"')
    }
    if (body.email !== undefined && !body.email.includes('@')) {
      return badRequest('Email is not valid')
    }
    if (body.active !== undefined && typeof body.active !== 'boolean') {
      return badRequest('Active must be true or false')
    }

    const updated = updateUser(Number.parseInt(params.id, 10), body)
    return updated ? HttpResponse.json<User>(updated) : notFound()
  },
)

const removeUser = http.delete<UserParams, DefaultBodyType, ApiError | null>(
  '/users/:id',
  async ({ request, params }) => {
    await delay(LATENCY_MS)

    const caller = authenticate(request)
    if (!caller) {
      return unauthorized()
    }
    if (!caller.permissions.includes('delete_user')) {
      return forbidden('delete_user')
    }

    const targetId = Number.parseInt(params.id, 10)
    if (targetId === caller.id) {
      return conflict('You cannot delete the account you are signed in as')
    }

    return deleteUser(targetId) ? new HttpResponse(null, { status: 204 }) : notFound()
  },
)

export const handlers = [login, me, listUsersRoute, getUser, patchUser, removeUser]
