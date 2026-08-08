import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useHomeSummary } from '../api/hooks'
import DayGroup from '../components/DayGroup'
import FloatingAddButton from '../components/FloatingAddButton'
import MonthBar from '../components/MonthBar'
import SummaryCards from '../components/SummaryCards'
import TopTabs, { type Filter } from '../components/TopTabs'
import { monthKey, shiftMonth } from '../lib/format'
import type { Category, Transaction } from '../types'

export default function HomeScreen() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [month, setMonth] = useState(() => monthKey(new Date()))

  const { data, isLoading } = useHomeSummary(month)
  const { data: categories } = useCategories()

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {}
    categories?.forEach((c) => {
      map[c.key] = c
    })
    return map
  }, [categories])

  const filteredGroups = useMemo(() => {
    if (!data) return []
    if (filter === 'all') return data.groups
    return data.groups
      .map((g) => ({ ...g, transactions: g.transactions.filter((t) => t.type === filter) }))
      .filter((g) => g.transactions.length > 0)
  }, [data, filter])

  function openTransaction(tx: Transaction) {
    navigate(`/transactions/${tx.id}`)
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-28">
      <TopTabs value={filter} onChange={setFilter} onMenu={() => navigate('/categories')} />


      {data && (
        <MonthBar
          month={month}
          expense={data.month_totals.expense}
          income={data.month_totals.income}
          onPrev={() => setMonth((m) => shiftMonth(m, -1))}
          onNext={() => setMonth((m) => shiftMonth(m, 1))}
        />
      )}
      {data && <SummaryCards expense={data.today.expense} income={data.today.income} />}

      {isLoading && <div className="text-center text-neutral-400 mt-10">Loading…</div>}
      {!isLoading && filteredGroups.length === 0 && (
        <div className="text-center text-neutral-400 mt-10">No transactions yet</div>
      )}

      {filteredGroups.map((g) => (
        <DayGroup key={g.label} label={g.label} transactions={g.transactions} categories={categoryMap} onSelect={openTransaction} />
      ))}

      <FloatingAddButton onClick={() => navigate(`/add?type=${filter === 'thu' ? 'thu' : 'chi'}`)} />
    </div>
  )
}
