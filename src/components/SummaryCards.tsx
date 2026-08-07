import { formatVnd } from '../lib/format'

interface Props {
  expense: number
  income: number
}

export default function SummaryCards({ expense, income }: Props) {
  return (
    <div className="flex justify-between px-4 pt-4">
      <div>
        <div className="text-sm text-neutral-400">Expenses for today</div>
        <div className="text-red-500 font-semibold text-lg">-{formatVnd(expense)}</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-neutral-400">Income for today</div>
        <div className="text-emerald-500 font-semibold text-lg">+{formatVnd(income)}</div>
      </div>
    </div>
  )
}
