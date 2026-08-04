import axios from 'axios'
import type { ApiError } from '../types/api'

const GENERIC_ERROR = 'Something went wrong. Please try again.'
const NETWORK_ERROR = 'Cannot reach the server. Check your connection and try again.'
export const SESSION_ERROR = 'Your session has expired. Please sign in again.'

const reportedErrors = new WeakSet<object>()

export function markErrorReported(error: object): void {
  reportedErrors.add(error)
}

export function isReportedError(cause: unknown): boolean {
  return typeof cause === 'object' && cause !== null && reportedErrors.has(cause)
}

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
