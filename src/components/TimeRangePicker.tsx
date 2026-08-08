import DatePicker from './DatePicker'
import { startOfMonth } from '../lib/format'

export type RangePreset = 'month' | '2m' | '3m' | '6m' | 'custom'

export interface TimeRange {
  start: Date
  end: Date
  preset: RangePreset
}

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: 'month', label: 'This month' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: 'custom', label: 'Custom' },
]

const PRESET_MONTHS: Record<'2m' | '3m' | '6m', number> = { '2m': 2, '3m': 3, '6m': 6 }

export function defaultRange(): TimeRange {
  const end = new Date()
  return { start: startOfMonth(end), end, preset: 'month' }
}

export function rangeForPreset(preset: RangePreset, current: TimeRange): TimeRange {
  if (preset === 'custom') return { ...current, preset }
  const end = new Date()
  if (preset === 'month') return { start: startOfMonth(end), end, preset }
  const months = PRESET_MONTHS[preset]
  return { start: new Date(end.getFullYear(), end.getMonth() - (months - 1), 1), end, preset }
}

interface Props {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export default function TimeRangePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2 gap-2">
      <div className="flex gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1 mb-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(rangeForPreset(p.key, value))}
            className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${value.preset === p.key ? 'bg-black text-white' : 'text-neutral-500'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div className="flex items-center gap-2 mb-2">
          <DatePicker fullWidth value={value.start} onChange={(start) => onChange({ ...value, start })} />
          <span className="text-neutral-400">–</span>
          <DatePicker fullWidth value={value.end} onChange={(end) => onChange({ ...value, end })} />
        </div>
      )}
    </div>
  )
}
