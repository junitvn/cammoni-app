import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useCategories, useCategoryTransactions } from '../api/hooks'
import { formatDate, formatVnd, monthLabel, startOfMonth, toISODate } from '../lib/format'
import { userEmoji } from '../lib/users'
import { useTelegramBackButton } from '../telegram'
import type { Transaction } from '../types'

export default function CategoryDetailScreen() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useTelegramBackButton(goBack)

  const { category: categoryKey = '' } = useParams<{ category: string }>()
  const [searchParams] = useSearchParams()
  const start = searchParams.get('start') ?? toISODate(startOfMonth(new Date()))
  const end = searchParams.get('end') ?? toISODate(new Date())
  const spansMultipleMonths = start.slice(0, 7) !== end.slice(0, 7)

  const { data: categories } = useCategories()
  const { data: transactions, isLoading } = useCategoryTransactions(categoryKey, start, end)
  const category = useMemo(() => categories?.find((c) => c.key === categoryKey), [categories, categoryKey])

  const groups = useMemo(() => {
    if (!transactions) return []
    if (!spansMultipleMonths) return [{ label: null as string | null, transactions }]
    const byMonth = new Map<string, Transaction[]>()
    transactions.forEach((tx) => {
      const key = tx.timestamp.slice(0, 7)
      if (!byMonth.has(key)) byMonth.set(key, [])
      byMonth.get(key)!.push(tx)
    })
    return Array.from(byMonth.entries()).map(([key, txs]) => ({ label: monthLabel(key), transactions: txs }))
  }, [transactions, spansMultipleMonths])

  return (
    <div className="min-h-screen bg-neutral-50 pb-10">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={goBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">{category ? `${category.emoji} ${category.name}` : 'Category'}</h1>
      </header>

      {isLoading && <div className="text-center text-neutral-400 mt-10">Loading…</div>}

      {!isLoading && transactions?.length === 0 && (
        <div className="text-center text-neutral-400 mt-10">No transactions yet</div>
      )}

      {transactions && transactions.length > 0 && (
        <div className="mx-4 space-y-4">
          {groups.map((group, i) => (
            <div key={group.label ?? i}>
              {group.label && <h3 className="mb-1 px-1 text-xs font-medium text-neutral-400">{group.label}</h3>}
              <div className="bg-white rounded-2xl overflow-hidden divide-y divide-neutral-100">
                {group.transactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${tx.excluded ? 'opacity-50' : ''}`}
                  >
                    <span className="flex-1 truncate">
                      <span className="block font-medium text-neutral-800 truncate">
                        {tx.description || category?.name || tx.category}
                      </span>
                      <span className="block text-xs text-neutral-400 truncate">
                        {`${userEmoji(tx.user_name)} • ${formatDate(new Date(tx.timestamp))}`}
                      </span>
                    </span>
                    <span className="font-medium shrink-0 text-red-500">-{formatVnd(tx.amount)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
