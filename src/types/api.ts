export interface Paginated<T> {
  data: T[]
  total: number
}

export interface ApiError {
  message: string
}

export type SortOrder = 'asc' | 'desc'
