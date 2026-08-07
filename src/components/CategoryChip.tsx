import type { Category } from '../types'

interface Props {
  category: Category
  selected: boolean
  onClick: () => void
}

export default function CategoryChip({ category, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm whitespace-nowrap ${
        selected ? 'bg-black text-white border-black' : 'bg-white text-neutral-700 border-neutral-200'
      }`}
    >
      <span>{category.emoji}</span>
      <span>{category.name}</span>
    </button>
  )
}
