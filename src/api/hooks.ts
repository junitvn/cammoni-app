import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { CategoryUpdate, TransactionCreate, TransactionUpdate } from '../types'

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: api.me })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.categories.list })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.categories.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, body }: { key: string; body: CategoryUpdate }) => api.categories.update(key, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, reassign }: { key: string; reassign: boolean }) => api.categories.remove(key, reassign),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['home'] })
    },
  })
}

export function useHomeSummary(month: string) {
  return useQuery({ queryKey: ['home', month], queryFn: () => api.home(month) })
}

export function useAnalysis(start: string, end: string) {
  return useQuery({ queryKey: ['analysis', start, end], queryFn: () => api.analysis(start, end) })
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => api.transactions.get(id!),
    enabled: !!id,
  })
}

export function useCategoryTransactions(category: string, start: string, end: string) {
  return useQuery({
    queryKey: ['transactions', category, start, end],
    queryFn: () => api.transactions.byCategory(category, start, end),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TransactionCreate) => api.transactions.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['home'] }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TransactionUpdate }) => api.transactions.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['home'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.transactions.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['home'] }),
  })
}
