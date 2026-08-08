import { PieChart, Tags } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  open: boolean
  onClose: () => void
}

const ITEMS = [
  { icon: Tags, label: 'Categories', to: '/categories' },
  { icon: PieChart, label: 'Analysis', to: '/analysis' },
]

export default function MenuSheet({ open, onClose }: Props) {
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}>
      <div
        className="absolute right-4 top-16 w-48 overflow-hidden rounded-2xl bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {ITEMS.map(({ icon: Icon, label, to }) => (
          <button
            key={to}
            onClick={() => {
              onClose()
              navigate(to)
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50"
          >
            <Icon size={20} className="text-neutral-700" />
            <span className="font-medium text-neutral-800">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
