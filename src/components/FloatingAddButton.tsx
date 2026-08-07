import { Plus } from 'lucide-react'

export default function FloatingAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg"
      aria-label="Add transaction"
    >
      <Plus size={28} />
    </button>
  )
}
