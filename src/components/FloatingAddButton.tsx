import { Plus } from 'lucide-react'
import { useRef } from 'react'

const LONG_PRESS_MS = 600

export default function FloatingAddButton({
  onClick,
  onLongPress,
}: {
  onClick: () => void
  onLongPress?: () => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressedRef = useRef(false)

  function startPress() {
    longPressedRef.current = false
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true
      onLongPress?.()
    }, LONG_PRESS_MS)
  }

  function endPress() {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  function handleClick() {
    if (longPressedRef.current) return
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg"
      aria-label="Add transaction"
    >
      <Plus size={28} />
    </button>
  )
}
