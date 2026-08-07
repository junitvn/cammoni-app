import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../api/hooks'
import { useTelegramBackButton } from '../telegram'

export default function CategoryFormScreen() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useTelegramBackButton(goBack)

  const { key } = useParams()
  const isEdit = !!key
  const { data: categories } = useCategories()
  const existing = categories?.find((c) => c.key === key)

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [income, setIncome] = useState(false)
  const [keywords, setKeywords] = useState('')
  const [confirmCount, setConfirmCount] = useState<number | null>(null)

  useEffect(() => {
    if (!existing) return
    setName(existing.name)
    setEmoji(existing.emoji)
    setIncome(existing.income)
    setKeywords(existing.keywords.join(', '))
  }, [existing])

  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const deleteMut = useDeleteCategory()

  const parsedKeywords = useMemo(
    () => keywords.split(',').map((k) => k.trim()).filter(Boolean),
    [keywords],
  )

  async function handleSave() {
    if (!name.trim()) return
    if (isEdit && key) {
      await updateMut.mutateAsync({ key, body: { name, emoji, keywords: parsedKeywords } })
    } else {
      await createMut.mutateAsync({ name, emoji, income, keywords: parsedKeywords })
    }
    navigate(-1)
  }

  async function handleDelete(reassign: boolean) {
    if (!key) return
    try {
      await deleteMut.mutateAsync({ key, reassign })
      navigate(-1)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const count = (e.detail as { count?: number } | null)?.count ?? 0
        setConfirmCount(count)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={goBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">{isEdit ? 'Edit category' : 'New category'}</h1>
      </header>

      <div className="px-4 space-y-4">
        <div className="flex gap-3">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-14 text-center text-2xl border border-neutral-200 rounded-xl py-2"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="flex-1 border border-neutral-200 rounded-xl px-3 py-2"
          />
        </div>

        {!isEdit && (
          <div className="flex bg-neutral-100 rounded-full p-1 w-fit">
            <button
              onClick={() => setIncome(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${!income ? 'bg-black text-white' : 'text-neutral-500'}`}
            >
              Expense
            </button>
            <button
              onClick={() => setIncome(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${income ? 'bg-black text-white' : 'text-neutral-500'}`}
            >
              Income
            </button>
          </div>
        )}

        <div>
          <div className="text-sm text-neutral-400 mb-1">Keywords (comma separated, used for auto-categorizing)</div>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm"
            rows={3}
          />
        </div>
      </div>

      <div className="p-4 flex gap-3">
        {isEdit && (
          <button
            onClick={() => handleDelete(false)}
            className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-medium"
          >
            Delete
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-40"
        >
          Save
        </button>
      </div>

      {confirmCount !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-5 max-w-sm">
            <p className="text-neutral-700">
              {confirmCount} transaction{confirmCount === 1 ? '' : 's'} use this category. Reassign them to the
              default category and delete?
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirmCount(null)} className="flex-1 py-2 rounded-xl border">
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmCount(null)
                  handleDelete(true)
                }}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white"
              >
                Reassign &amp; delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
