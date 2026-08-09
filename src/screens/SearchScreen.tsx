import { ArrowLeft, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useSearchTransactions } from '../api/hooks'
import TransactionRow from '../components/TransactionRow'
import { formatDate } from '../lib/format'
import { useTelegramBackButton } from '../telegram'
import type { Category, Transaction } from '../types'

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

export default function SearchScreen() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useTelegramBackButton(goBack)

  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const trimmedQuery = query.trim()
  const debouncedQuery = useDebouncedValue(trimmedQuery, 300)
  const isDebouncing = trimmedQuery !== debouncedQuery

  const { data: categories } = useCategories()
  const { data: transactions, isFetching } = useSearchTransactions(debouncedQuery)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {}
    categories?.forEach((c) => {
      map[c.key] = c
    })
    return map
  }, [categories])

  const groups = useMemo(() => {
    const byDate = new Map<string, Transaction[]>()
    transactions?.forEach((tx) => {
      const label = formatDate(new Date(tx.timestamp))
      if (!byDate.has(label)) byDate.set(label, [])
      byDate.get(label)!.push(tx)
    })
    return Array.from(byDate.entries()).map(([label, txs]) => ({ label, transactions: txs }))
  }, [transactions])

  return (
    <div className="min-h-screen bg-neutral-50 pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3">
        <button onClick={goBack} aria-label="Back" className="shrink-0">
          <ArrowLeft size={22} />
        </button>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search title, amount, category"
            className="w-full rounded-xl border px-3 border-neutral-200 bg-neutral-50 py-2 pl-3 pr-10 text-base outline-none focus:border-black"
          />
          {focused && query && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-400"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {!trimmedQuery && <div className="text-center text-neutral-400 mt-10">Search transactions</div>}

      {trimmedQuery && (isDebouncing || isFetching) && (
        <div className="mt-10 flex items-center justify-center gap-2 text-neutral-400">
          <Loader2 size={18} className="animate-spin" />
          Searching…
        </div>
      )}

      {debouncedQuery && !isDebouncing && !isFetching && transactions?.length === 0 && (
        <div className="text-center text-neutral-400 mt-10">No results found</div>
      )}

      {!isDebouncing && groups.map((group) => (
        <div key={group.label} className="mt-4">
          <div className="px-4 text-sm text-neutral-400 mb-1">{group.label}</div>
          <div className="bg-white rounded-2xl mx-4 overflow-hidden divide-y divide-neutral-100">
            {group.transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                category={categoryMap[tx.category]}
                onClick={() => navigate(`/transactions/${tx.id}`)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
