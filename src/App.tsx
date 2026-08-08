import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import AnalysisScreen from './screens/AnalysisScreen'
import DebugPanel from './components/DebugPanel'
import CategoriesScreen from './screens/CategoriesScreen'
import CategoryDetailScreen from './screens/CategoryDetailScreen'
import CategoryFormScreen from './screens/CategoryFormScreen'
import HomeScreen from './screens/HomeScreen'
import TransactionFormScreen from './screens/TransactionFormScreen'
import { initTelegram } from './telegram'

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
      </BrowserRouter>
      <DebugPanel />
    </QueryClientProvider>
  )
}
