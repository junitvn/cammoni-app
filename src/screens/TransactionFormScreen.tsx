import { ArrowLeft, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  useCategories,
  useCreateTransaction,
  useDeleteTransaction,
  useMe,
  useTransaction,
  useUpdateTransaction,
} from '../api/hooks'
import CategoryChip from '../components/CategoryChip'
import DatePicker from '../components/DatePicker'
import UserPicker from '../components/UserPicker'
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
import { USER_NAMES } from '../lib/users'
import type { TxType } from '../types'

export default function TransactionFormScreen() {
  const navigate = useNavigate()
  // Deep-linked opens (bot's Edit button) land here with no Home entry before them
  // in history, so navigate(-1) would exit the Mini App instead of going back.
  // history.state.idx (set by react-router) is 0 when there's no prior in-app entry.
  const goBack = useCallback(() => {
    if ((window.history.state as { idx?: number } | null)?.idx) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }, [navigate])
  useTelegramBackButton(goBack)

  const { id } = useParams()
  const [search] = useSearchParams()
  const isEdit = !!id

  const { data: existing } = useTransaction(id)
  const { data: categories } = useCategories()
  const { data: me } = useMe()

  const [type, setType] = useState<TxType>((search.get('type') as TxType) ?? 'chi')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [excluded, setExcluded] = useState(false)
  const [titleFocused, setTitleFocused] = useState(false)
  const [amountFocused, setAmountFocused] = useState(false)
  const [date, setDate] = useState(() => new Date())
  const [userName, setUserName] = useState(USER_NAMES[0])

  useEffect(() => {
    if (!existing) return
    setType(existing.type)
    setSelectedCategory(existing.category)
    setExcluded(existing.excluded)
    setTitle(existing.description)
    setAmount(String(existing.amount / 1000))
    setDate(new Date(existing.timestamp))
    setUserName(existing.user_name)
  }, [existing])

  useEffect(() => {
    if (isEdit || !me) return
    setUserName(USER_NAMES.includes(me.name) ? me.name : USER_NAMES[0])
  }, [isEdit, me])

  const createMut = useCreateTransaction()
  const updateMut = useUpdateTransaction()
  const deleteMut = useDeleteTransaction()

  const visibleCategories = useMemo(
    () => (categories ?? []).filter((c) => c.income === (type === 'thu')),
    [categories, type],
  )

  const resolvedTitle = title.trim() || undefined
  const resolvedAmount = amount.trim() ? Number(amount) * 1000 : undefined
  const canSave = !!resolvedTitle && !!resolvedAmount && Number.isFinite(resolvedAmount) && resolvedAmount > 0
  const isSaving = createMut.isPending || updateMut.isPending

  async function handleSave() {
    if (!canSave || !resolvedTitle || !resolvedAmount) return
    if (isEdit && id) {
      await updateMut.mutateAsync({
        id,
        body: {
          amount: resolvedAmount,
          description: resolvedTitle,
          category: selectedCategory ?? undefined,
          excluded,
          timestamp: date.toISOString(),
          user_name: userName,
        },
      })
    } else {
      await createMut.mutateAsync({
        type,
        amount: resolvedAmount,
        description: resolvedTitle,
        category: selectedCategory ?? undefined,
        timestamp: date.toISOString(),
        user_name: userName,
      })
    }
    goBack()
  }

  async function handleDelete(e: React.MouseEvent) {
    // Keep the alert dialog open (AlertDialogAction closes on click by default)
    // so the loading state is visible until the request finishes.
    e.preventDefault()
    if (!id) return
    await deleteMut.mutateAsync(id)
    goBack()
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

      <div className="mx-4">
        <label htmlFor="amount-input" className="text-sm text-neutral-400">
          Amount
        </label>
        <div className="relative flex items-center border-b border-neutral-200 focus-within:border-black">
          <input
            id="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            inputMode="decimal"
            className="flex-1 pb-2 pr-6 text-lg focus:outline-none"
          />
          {amountFocused && amount && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setAmount('')}
              aria-label="Clear amount"
              className="absolute right-0 pb-2 text-neutral-400"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mx-4 mt-4">
        <label htmlFor="title-input" className="text-sm text-neutral-400">
          Title
        </label>
        <div className="relative flex items-center border-b border-neutral-200 focus-within:border-black">
          <input
            id="title-input"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            className="flex-1 pb-2 pr-6 text-lg focus:outline-none"
          />
          {titleFocused && title && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTitle('')}
              aria-label="Clear title"
              className="absolute right-0 pb-2 text-neutral-400"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 px-4 flex flex-col sm:flex-row items-start sm:item-center gap-3">
        <DatePicker value={date} onChange={setDate} />
        <UserPicker value={userName} onChange={setUserName} />
      </div>

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
          <AlertDialog>
            <AlertDialogTrigger className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-medium">
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
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
          disabled={!canSave || isSaving}
          className="flex-1 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 size={18} className="animate-spin" />}
          Save
        </button>
      </div>
    </div>
  )
}
