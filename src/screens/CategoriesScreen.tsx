import { ArrowLeft, Plus } from 'lucide-react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../api/hooks'
import { useTelegramBackButton } from '../telegram'

export default function CategoriesScreen() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useTelegramBackButton(goBack)

  const { data: categories, isLoading } = useCategories()

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={goBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">Categories</h1>
        <button onClick={() => navigate('/categories/new')} className="ml-auto p-2" aria-label="New category">
          <Plus size={22} />
        </button>
      </header>

      {isLoading && <div className="text-center text-neutral-400 mt-10">Loading…</div>}

      <div className="px-4 space-y-2 pb-6">
        {categories?.map((c) => (
          <button
            key={c.key}
            onClick={() => navigate(`/categories/${c.key}`)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3"
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="flex-1 text-left font-medium text-neutral-800">{c.name}</span>
            <span className="text-xs text-neutral-400">{c.income ? 'Income' : 'Expense'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
