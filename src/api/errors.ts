import axios from 'axios'
import type { ApiError } from '../types/api'

declare module 'axios' {
  export interface AxiosRequestConfig {
    handledLocally?: boolean
  }
}

const GENERIC_ERROR = 'Something went wrong. Please try again.'
const NETWORK_ERROR = 'Cannot reach the server. Check your connection and try again.'
export const FORBIDDEN_ERROR = 'You do not have permission to do that.'
export const SESSION_ERROR = 'Your session has expired. Please sign in again.'

export function isCanceledError(cause: unknown): boolean {
  return axios.isCancel(cause)
}

export function apiErrorMessage(cause: unknown): string {
  if (axios.isAxiosError<ApiError>(cause)) {
    if (cause.response === undefined) {
      return NETWORK_ERROR
    }

    return cause.response.data?.message ?? GENERIC_ERROR
  }

  return GENERIC_ERROR
}
