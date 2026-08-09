import { Menu, Search } from 'lucide-react'

export type Filter = 'all' | 'chi' | 'thu'

interface Props {
  value: Filter
  onChange: (f: Filter) => void
  onMenu: () => void
  onSearch: () => void
}

const TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'chi', label: 'Expenses' },
  { key: 'thu', label: 'Income' },
]

export default function TopTabs({ value, onChange, onMenu, onSearch }: Props) {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <div className="flex gap-1 bg-neutral-100 rounded-full p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              value === t.key ? 'bg-black text-white' : 'text-neutral-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onSearch} className="p-2 text-neutral-700" aria-label="Search transactions">
          <Search size={22} />
        </button>
        <button onClick={onMenu} className="p-2 text-neutral-700" aria-label="Categories menu">
          <Menu size={22} />
        </button>
      </div>
    </div>
  )
}
