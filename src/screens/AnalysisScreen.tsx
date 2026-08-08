import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts'
import { useAnalysis, useCategories } from '../api/hooks'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../components/ui/chart'
import { useTelegramBackButton } from '../telegram'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AnalysisScreen() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useTelegramBackButton(goBack)

  const year = String(new Date().getFullYear())
  const { data, isLoading } = useAnalysis(year)
  const { data: categories } = useCategories()

  const categoryMap = useMemo(() => {
    const map: Record<string, { name: string; emoji: string }> = {}
    categories?.forEach((c) => {
      map[c.key] = c
    })
    return map
  }, [categories])

  const pieData = useMemo(
    () => data?.by_category.map((c) => ({ category: c.category, amount: c.amount, fill: `var(--color-${c.category})` })) ?? [],
    [data],
  )

  const pieConfig = useMemo(() => {
    const config: ChartConfig = {}
    data?.by_category.forEach((c, i) => {
      const info = categoryMap[c.category]
      config[c.category] = {
        label: info ? `${info.emoji} ${info.name}` : c.category,
        color: `var(--color-chart-${(i % 5) + 1})`,
      }
    })
    return config
  }, [data, categoryMap])

  const monthlyData = useMemo(
    () =>
      data?.monthly.map((m) => ({
        month: MONTH_LABELS[Number(m.month.slice(5, 7)) - 1],
        expense: m.expense,
        income: m.income,
      })) ?? [],
    [data],
  )

  const monthlyConfig: ChartConfig = {
    expense: { label: 'Expense', color: 'var(--color-chart-1)' },
    income: { label: 'Income', color: 'var(--color-chart-2)' },
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-10">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={goBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">Analysis</h1>
      </header>

      {isLoading && <div className="text-center text-neutral-400 mt-10">Loading…</div>}

      {data && (
        <div className="space-y-4 px-4 pb-6">
          <div className="rounded-2xl bg-white p-4">
            <h2 className="mb-2 font-medium text-neutral-800">Expense by category</h2>
            {pieData.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-400">No expenses yet this year</div>
            ) : (
              <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-72">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                  <Pie data={pieData} dataKey="amount" nameKey="category" innerRadius={50}>
                    {pieData.map((entry) => (
                      <Cell key={entry.category} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </div>

          <div className="rounded-2xl bg-white p-4">
            <h2 className="mb-2 font-medium text-neutral-800">Expense / income since {data.year}</h2>
            <ChartContainer config={monthlyConfig} className="max-h-64 w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      )}
    </div>
  )
}
