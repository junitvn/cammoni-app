import { formatVnd } from '../lib/format'
import { userEmoji } from '../lib/users'
import type { Category, Transaction } from '../types'

interface Props {
  tx: Transaction
  category: Category | undefined
  onClick: () => void
}

export default function TransactionRow({ tx, category, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left ${tx.excluded ? 'opacity-50' : ''}`}
    >
      <span className="text-xl">{category?.emoji ?? '📦'}</span>
      <span className="flex-1 truncate">
        <span className="block font-medium text-neutral-800 truncate">{category?.name ?? tx.category}</span>
        {
          tx.description && <span className="block text-xs text-neutral-400 truncate">
            {`${userEmoji(tx.user_name)} • ${tx.description}`}
          </span>
        }
      </span>
      <span className={`font-medium shrink-0 ${tx.type === 'thu' ? 'text-emerald-500' : 'text-red-500'}`}>
        {tx.type === 'thu' ? '+' : '-'}
        {formatVnd(tx.amount)}
      </span>
    </button>
  )
}
