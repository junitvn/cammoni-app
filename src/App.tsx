import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CategoriesScreen from './screens/CategoriesScreen'
import CategoryFormScreen from './screens/CategoryFormScreen'
import HomeScreen from './screens/HomeScreen'
import TransactionFormScreen from './screens/TransactionFormScreen'
import { initTelegram } from './telegram'

const queryClient = new QueryClient()

export default function App() {
  useEffect(() => {
    initTelegram()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/add" element={<TransactionFormScreen />} />
          <Route path="/transactions/:id" element={<TransactionFormScreen />} />
          <Route path="/categories" element={<CategoriesScreen />} />
          <Route path="/categories/new" element={<CategoryFormScreen />} />
          <Route path="/categories/:key" element={<CategoryFormScreen />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
