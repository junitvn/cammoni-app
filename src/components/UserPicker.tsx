import { USER_NAMES, userEmoji, userLabel } from '../lib/users'

interface UserPickerProps {
  value: string
  onChange: (name: string) => void
}

export default function UserPicker({ value, onChange }: UserPickerProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1 min-w-[212px]">
      {USER_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          aria-label={name}
          aria-pressed={value === name}
          className={`flex h-8 w-fit items-center justify-center px-2 rounded-full text-base ${value === name ? 'bg-white shadow-sm' : 'opacity-40'
            }`}
        >
          {`${userEmoji(name)} ${userLabel(name)}`}
        </button>
      ))}
    </div>
  )
}
