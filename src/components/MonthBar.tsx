import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatVnd, monthLabel } from '../lib/format'

interface Props {
  month: string
  expense: number
  income: number
  onPrev: () => void
  onNext: () => void
  onClickMonth: () => void
}

export default function MonthBar({ month, expense, income, onPrev, onNext, onClickMonth }: Props) {

  return (
    <div className="mx-4 mt-4 bg-black text-white rounded-2xl px-3 py-3 flex items-center justify-between">
      <button onClick={onPrev} className="p-1" aria-label="Previous month">
        <ChevronLeft size={18} />
      </button>
      <div className="flex-1 px-3 text-lg">
        <div className="flex items-center justify-center gap-3">
          <button onClick={onClickMonth} className="font-medium underline-offset-2 hover:underline">
            {monthLabel(month)}
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-red-400">-{formatVnd(expense)}</span>
          <span className="text-emerald-400">+{formatVnd(income)}</span>
        </div>
      </div>
      <button onClick={onNext} className="p-1" aria-label="Next month">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
