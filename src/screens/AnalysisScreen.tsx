import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts'
import { useAnalysis, useCategories } from '../api/hooks'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../components/ui/chart'
import TimeRangePicker, { defaultRange, type TimeRange } from '../components/TimeRangePicker'
import { formatDate, formatVnd, toISODate } from '../lib/format'
import { useTelegramBackButton } from '../telegram'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Fixed 8-hue categorical palette (index.css) — never cycle past it. Beyond
// that many categories, fold the smallest into "Other" instead of reusing a slot.
const MAX_PIE_SLICES = 8
const OTHER_KEY = '__other__'

const RADIAN = Math.PI / 180
const PIE_OUTER_RADIUS = 58
const PIE_INNER_RADIUS = 32
const LABEL_ROW_HEIGHT = 50
const LABEL_BOX_WIDTH = 250
const LABEL_BOX_HEIGHT = 34

// Draws a leader-line + pill badge (icon, percent) with the category name
// below it, anchored left/right of the donut like a design mockup. Vertical
// slots per side are pre-assigned (see `side`/`rank`/`count` below) so labels
// never overlap even when several thin slices sit close together in angle.
function renderCategoryPieLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, fill, percent, side, rank, count, catName, catEmoji } = props
  const cos = Math.cos(-midAngle * RADIAN)
  const sin = Math.sin(-midAngle * RADIAN)
  const isRight = side === 'right'

  const sx = cx + outerRadius * cos
  const sy = cy + outerRadius * sin
  const bendX = cx + (isRight ? 1 : -1) * (outerRadius + 8)
  const stubX = bendX + (isRight ? 1 : -1) * 6
  const labelY = cy + (rank - (count - 1) / 2) * LABEL_ROW_HEIGHT

  const boxX = isRight ? stubX + 4 : stubX - 4 - LABEL_BOX_WIDTH
  const boxY = labelY - LABEL_BOX_HEIGHT / 2

  return (
    <g>
      <path
        d={`M ${sx},${sy} L ${bendX},${labelY} L ${stubX},${labelY}`}
        fill="none"
        stroke="var(--color-border)"
        strokeDasharray="3 3"
      />
      <foreignObject x={boxX} y={boxY} width={LABEL_BOX_WIDTH} height={LABEL_BOX_HEIGHT}>
        <div className={`flex h-full flex-col justify-center gap-0.5 ${isRight ? 'items-start' : 'items-end'}`}>
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-neutral-50 px-1.5 py-0.5 text-[11px] font-semibold shadow-sm">
            <span>{catEmoji}</span>
            <span style={{ color: fill }}>{`${Math.round((percent ?? 0) * 100)}%`}</span>
          </span>
          <span
            className={`w-full truncate px-1 text-[10px] leading-tight text-neutral-500 ${isRight ? 'text-left' : 'text-right'}`}
          >
            {catName}
          </span>
        </div>
      </foreignObject>
    </g>
  )
}

export default function AnalysisScreen() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useTelegramBackButton(goBack)

  const [searchParams] = useSearchParams()
  const [range, setRange] = useState<TimeRange>(() => {
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    if (start && end) return { start: new Date(start), end: new Date(end), preset: 'custom' }
    return defaultRange()
  })
  const startIso = toISODate(range.start)
  const endIso = toISODate(range.end)
  const { data, isLoading } = useAnalysis(startIso, endIso)
  const { data: categories } = useCategories()

  const categoryMap = useMemo(() => {
    const map: Record<string, { name: string; emoji: string }> = {}
    categories?.forEach((c) => {
      map[c.key] = c
    })
    return map
  }, [categories])

  const { pieData, pieConfig, pieMaxSideCount } = useMemo(() => {
    const byCategory = data?.by_category ?? []
    // by_category is already sorted descending by amount (see service.py).
    const overflow = byCategory.length > MAX_PIE_SLICES
    const visible = overflow ? byCategory.slice(0, MAX_PIE_SLICES - 1) : byCategory
    const otherAmount = overflow ? byCategory.slice(MAX_PIE_SLICES - 1).reduce((sum, c) => sum + c.amount, 0) : 0
    const entries = overflow ? [...visible, { category: OTHER_KEY, amount: otherAmount }] : visible
    const total = entries.reduce((sum, c) => sum + c.amount, 0)

    const config: ChartConfig = {}
    let cumulativePercent = 0
    const points = entries.map((c, i) => {
      const info = categoryMap[c.category]
      config[c.category] = {
        label: c.category === OTHER_KEY ? 'Other' : info ? `${info.emoji} ${info.name}` : c.category,
        color: `var(--color-chart-${i + 1})`,
      }

      // Mirrors Recharts' own angle math (default startAngle=0, endAngle=360,
      // no padding) so the precomputed side/order lines up with what Pie renders.
      const percent = total > 0 ? c.amount / total : 0
      const midAngleDeg = (cumulativePercent + percent / 2) * 360
      cumulativePercent += percent
      const side: 'left' | 'right' = Math.cos(-midAngleDeg * RADIAN) >= 0 ? 'right' : 'left'
      const sortKey = Math.sin(-midAngleDeg * RADIAN)

      return {
        category: c.category,
        amount: c.amount,
        fill: `var(--color-${c.category})`,
        catName: c.category === OTHER_KEY ? 'Other' : (info?.name ?? c.category),
        catEmoji: c.category === OTHER_KEY ? '•' : (info?.emoji ?? ''),
        side,
        sortKey,
      }
    })

    // Assign each side's vertical slot (rank) by top-to-bottom visual order,
    // without reordering `points` itself — slice order must stay untouched
    // for Pie's own angle computation to match what we derived above.
    const bySide: Record<'left' | 'right', typeof points> = { left: [], right: [] }
    points.forEach((p) => bySide[p.side].push(p))
    const slotByCategory = new Map<string, { rank: number; count: number }>()
    let maxSideCount = 0
      ; (['left', 'right'] as const).forEach((side) => {
        const list = [...bySide[side]].sort((a, b) => a.sortKey - b.sortKey)
        list.forEach((p, rank) => slotByCategory.set(p.category, { rank, count: list.length }))
        maxSideCount = Math.max(maxSideCount, list.length)
      })

    const finalPoints = points.map((p) => ({ ...p, ...slotByCategory.get(p.category)! }))
    return { pieData: finalPoints, pieConfig: config, pieMaxSideCount: maxSideCount }
  }, [data, categoryMap])

  const pieChartHeight = Math.max(240, pieMaxSideCount * LABEL_ROW_HEIGHT)
  const totalExpense = useMemo(() => (data?.by_category ?? []).reduce((sum, c) => sum + c.amount, 0), [data])

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

      <div className="px-4">
        <TimeRangePicker value={range} onChange={setRange} />
      </div>

      {isLoading && <div className="text-center text-neutral-400 mt-10">Loading…</div>}

      {data && (
        <div className="space-y-4 px-4 pb-6">
          <div className="rounded-2xl bg-white p-4">
            <h2 className="mb-2 font-medium text-neutral-800">Expense by category</h2>
            {pieData.length === 0 ? (
              <div className="py-2 text-center text-sm text-neutral-400">No expenses in this range</div>
            ) : (
              <ChartContainer config={pieConfig} className="mx-auto aspect-auto w-full pb-0" style={{ height: pieChartHeight }}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                  <Pie
                    data={pieData}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={PIE_INNER_RADIUS}
                    outerRadius={PIE_OUTER_RADIUS}
                    label={renderCategoryPieLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.category} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </div>

          {data.by_category.length > 0 && (
            <div className="rounded-2xl bg-white px-4 py-2">
              <div className="divide-y divide-neutral-100">
                {data.by_category.map((c) => {
                  const info = categoryMap[c.category]
                  const percent = totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0
                  return (
                    <button
                      key={c.category}
                      onClick={() => navigate(`/analysis/${c.category}?start=${startIso}&end=${endIso}`)}
                      className="w-full flex items-center gap-3 py-3 text-left"
                    >
                      <span className="text-xl">{info?.emoji ?? '📦'}</span>
                      <span className="flex-1 truncate font-medium text-neutral-800">{info?.name ?? c.category}</span>
                      <span className="text-xs text-neutral-400">{percent}%</span>
                      <span className="font-medium text-neutral-800">{formatVnd(c.amount)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* <div className="rounded-2xl bg-white p-4">
            <h2 className="mb-2 font-medium text-neutral-800">
              Expense / income · {formatDate(range.start)} – {formatDate(range.end)}
            </h2>
            <ChartContainer config={monthlyConfig} className="max-h-64 w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div> */}
        </div>
      )}
    </div>
  )
}
