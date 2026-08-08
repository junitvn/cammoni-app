export interface Category {
  key: string
  name: string
  emoji: string
  income: boolean
  keywords: string[]
}

export interface CategoryCreate {
  name: string
  emoji: string
  income: boolean
  keywords: string[]
}

export interface CategoryUpdate {
  name?: string
  emoji?: string
  keywords?: string[]
}

export type TxType = 'chi' | 'thu'

export interface Transaction {
  id: string
  timestamp: string
  type: TxType
  amount: number
  category: string
  description: string
  user_name: string
  excluded: boolean
}

export interface TransactionCreate {
  type: TxType
  amount: number
  description: string
  category?: string
  timestamp?: string
  user_name?: string
}

export interface TransactionUpdate {
  amount?: number
  category?: string
  description?: string
  timestamp?: string
  excluded?: boolean
  user_name?: string
}

export interface DailyTotals {
  expense: number
  income: number
}

export interface TransactionGroup {
  label: string
  transactions: Transaction[]
}

export interface HomeSummary {
  month: string
  today: DailyTotals
  month_totals: DailyTotals
  groups: TransactionGroup[]
}

export interface CategoryTotal {
  category: string
  amount: number
}

export interface MonthTotals {
  month: string
  expense: number
  income: number
}

export interface AnalysisSummary {
  by_category: CategoryTotal[]
  monthly: MonthTotals[]
}
