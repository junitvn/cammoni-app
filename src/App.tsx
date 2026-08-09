import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { initTelegram } from './telegram'

const AnalysisScreen = lazy(() => import('./screens/AnalysisScreen'))
const DebugPanel = lazy(() => import('./components/DebugPanel'))
const CategoriesScreen = lazy(() => import('./screens/CategoriesScreen'))
const CategoryDetailScreen = lazy(() => import('./screens/CategoryDetailScreen'))
const CategoryFormScreen = lazy(() => import('./screens/CategoryFormScreen'))
const HomeScreen = lazy(() => import('./screens/HomeScreen'))
const TransactionFormScreen = lazy(() => import('./screens/TransactionFormScreen'))

const queryClient = new QueryClient()

// Telegram only reliably injects tgWebAppData (in the URL hash) when opening the Mini
// App's root URL — deep sub-paths opened with no initData at all. So bot.py links to
// `/?tx=<id>` and we redirect client-side, which preserves the hash Telegram already set.
function DeepLinkRedirect() {
  const navigate = useNavigate()
  const [search] = useSearchParams()

  useEffect(() => {
    const tx = search.get('tx')
    if (tx) navigate(`/transactions/${tx}`, { replace: true })
  }, [search, navigate])

  return null
}

export default function App() {
  useEffect(() => {
    initTelegram()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DeepLinkRedirect />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/add" element={<TransactionFormScreen />} />
            <Route path="/transactions/:id" element={<TransactionFormScreen />} />
            <Route path="/categories" element={<CategoriesScreen />} />
            <Route path="/categories/new" element={<CategoryFormScreen />} />
            <Route path="/categories/:key" element={<CategoryFormScreen />} />
            <Route path="/analysis" element={<AnalysisScreen />} />
            <Route path="/analysis/:category" element={<CategoryDetailScreen />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Suspense fallback={null}>
        <DebugPanel />
      </Suspense>
    </QueryClientProvider>
  )
}
