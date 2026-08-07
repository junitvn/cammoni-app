import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  useCategories,
  useCreateTransaction,
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '../api/hooks'
import CategoryChip from '../components/CategoryChip'
import { parseEntry } from '../lib/parseEntry'
import { useTelegramBackButton } from '../telegram'
import type { TxType } from '../types'

export default function TransactionFormScreen() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useTelegramBackButton(goBack)

  const { id } = useParams()
  const [search] = useSearchParams()
  const isEdit = !!id

  const { data: existing } = useTransaction(id)
  const { data: categories } = useCategories()

  const [type, setType] = useState<TxType>((search.get('type') as TxType) ?? 'chi')
  const [text, setText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [excluded, setExcluded] = useState(false)

  useEffect(() => {
    if (!existing) return
    setType(existing.type)
    setText(`${existing.amount / 1000} ${existing.description}`)
    setSelectedCategory(existing.category)
    setExcluded(existing.excluded)
  }, [existing])

  const createMut = useCreateTransaction()
  const updateMut = useUpdateTransaction()
  const deleteMut = useDeleteTransaction()

  const parsed = useMemo(() => parseEntry(text), [text])
  const visibleCategories = useMemo(
    () => (categories ?? []).filter((c) => c.income === (type === 'thu')),
    [categories, type],
  )

  async function handleSave() {
    if (!parsed) return
    if (isEdit && id) {
      await updateMut.mutateAsync({
        id,
        body: {
          amount: parsed.amount,
          description: parsed.description,
          category: selectedCategory ?? undefined,
          excluded,
        },
      })
    } else {
      await createMut.mutateAsync({
        type,
        amount: parsed.amount,
        description: parsed.description,
        category: selectedCategory ?? undefined,
      })
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!id) return
    await deleteMut.mutateAsync(id)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={goBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className={`text-lg font-semibold ${type === 'thu' ? 'text-emerald-500' : 'text-red-500'}`}>
          {type === 'thu' ? 'Income' : 'Expenses'}
        </h1>
        <div className="ml-auto flex bg-neutral-100 rounded-full p-1">
          <button
            onClick={() => setType('chi')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${type === 'chi' ? 'bg-black text-white' : 'text-neutral-500'}`}
          >
            Expense
          </button>
          <button
            onClick={() => setType('thu')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${type === 'thu' ? 'bg-black text-white' : 'text-neutral-500'}`}
          >
            Income
          </button>
        </div>
      </header>

      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Products 300 or 300 products"
        className="mx-4 border-b border-neutral-200 pb-2 text-lg focus:outline-none focus:border-black"
      />

      <div className="mt-6 px-4">
        <div className="text-sm text-neutral-400 mb-2">Select quick category:</div>
        <div className="flex flex-wrap gap-2">
          {visibleCategories.map((c) => (
            <CategoryChip
              key={c.key}
              category={c}
              selected={selectedCategory === c.key}
              onClick={() => setSelectedCategory(c.key)}
            />
          ))}
        </div>
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 px-4 mt-6 text-sm text-neutral-500">
          <input type="checkbox" checked={excluded} onChange={(e) => setExcluded(e.target.checked)} />
          Exclude from budget/stats
        </label>
      )}

      <div className="mt-auto p-4 flex gap-3">
        {isEdit && (
          <button onClick={handleDelete} className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-medium">
            Delete
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!parsed}
          className="flex-1 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  )
}
