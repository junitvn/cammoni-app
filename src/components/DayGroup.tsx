import type { Category, Transaction } from '../types'
import TransactionRow from './TransactionRow'

interface Props {
  label: string
  transactions: Transaction[]
  categories: Record<string, Category>
  onSelect: (tx: Transaction) => void
}

export default function DayGroup({ label, transactions, categories, onSelect }: Props) {
  return (
    <div className="mt-4">
      <div className="px-4 text-sm text-neutral-400 mb-1">{label}</div>
      <div className="bg-white rounded-2xl mx-4 overflow-hidden divide-y divide-neutral-100">
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} category={categories[tx.category]} onClick={() => onSelect(tx)} />
        ))}
      </div>
    </div>
  )
}
