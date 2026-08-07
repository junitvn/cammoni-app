import { getInitData } from '../telegram'
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  HomeSummary,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  detail: unknown
  constructor(status: number, detail: unknown) {
    super(`API error ${status}`)
    this.status = status
    this.detail = detail
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const initData = getInitData()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(initData ? { Authorization: `tma ${initData}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    let detail: unknown = null
    try {
      detail = await res.json()
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, (detail as { detail?: unknown })?.detail ?? detail)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  me: () => request<{ id: number; name: string }>('/api/me'),

  categories: {
    list: () => request<Category[]>('/api/categories'),
    create: (body: CategoryCreate) =>
      request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
    update: (key: string, body: CategoryUpdate) =>
      request<Category>(`/api/categories/${key}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (key: string, reassign: boolean) =>
      request<void>(`/api/categories/${key}${reassign ? '?reassign=true' : ''}`, { method: 'DELETE' }),
  },

  transactions: {
    get: (id: string) => request<Transaction>(`/api/transactions/${id}`),
    create: (body: TransactionCreate) =>
      request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: TransactionUpdate) =>
      request<Transaction>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/api/transactions/${id}`, { method: 'DELETE' }),
  },

  home: (month: string) => request<HomeSummary>(`/api/home?month=${month}`),
}
