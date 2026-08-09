import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../api/hooks'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'
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
  const [deleteOpen, setDeleteOpen] = useState(false)

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
  const canSave = !!name.trim()
  const isSaving = createMut.isPending || updateMut.isPending
  const isBusy = isSaving || deleteMut.isPending

  async function handleSave() {
    if (!canSave || isBusy) return
    if (isEdit && key) {
      await updateMut.mutateAsync({ key, body: { name, emoji, keywords: parsedKeywords } })
    } else {
      await createMut.mutateAsync({ name, emoji, income, keywords: parsedKeywords })
    }
    navigate(-1)
  }

  async function handleDelete(e: React.MouseEvent, reassign: boolean) {
    e.preventDefault()
    if (!key) return
    try {
      await deleteMut.mutateAsync({ key, reassign })
      navigate(-1)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const count = (e.detail as { count?: number } | null)?.count ?? 0
        setDeleteOpen(false)
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
            disabled={isBusy}
            maxLength={4}
            className="w-14 text-center text-2xl border border-neutral-200 rounded-xl py-2 disabled:opacity-60"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isBusy}
            placeholder="Category name"
            className="flex-1 border border-neutral-200 rounded-xl px-3 py-2 disabled:opacity-60"
          />
        </div>

        {!isEdit && (
          <div className="flex bg-neutral-100 rounded-full p-1 w-fit">
            <button
              onClick={() => setIncome(false)}
              disabled={isBusy}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${!income ? 'bg-black text-white' : 'text-neutral-500'}`}
            >
              Expense
            </button>
            <button
              onClick={() => setIncome(true)}
              disabled={isBusy}
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
            disabled={isBusy}
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm disabled:opacity-60"
            rows={3}
          />
        </div>
      </div>

      <div className="p-4 flex gap-3">
        {isEdit && (
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <button
                disabled={isBusy}
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-medium disabled:opacity-40"
              >
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this category?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Categories with transactions may need reassignment before deleting.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => handleDelete(e, false)}
                  disabled={deleteMut.isPending}
                  className="flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deleteMut.isPending && <Loader2 size={18} className="animate-spin" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <button
          onClick={handleSave}
          disabled={!canSave || isBusy}
          className="flex-1 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 size={18} className="animate-spin" />}
          Save
        </button>
      </div>

      <AlertDialog open={confirmCount !== null} onOpenChange={(open) => !open && setConfirmCount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reassign transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmCount} transaction{confirmCount === 1 ? '' : 's'} use this category. Reassign them to the default
              category and delete?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => handleDelete(e, true)}
              disabled={deleteMut.isPending}
              className="flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {deleteMut.isPending && <Loader2 size={18} className="animate-spin" />}
              Reassign &amp; delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
