export interface ApiLogEntry {
  time: string
  method: string
  path: string
  status: number | 'error'
  detail?: string
  hasAuthHeader: boolean
}

const MAX_ENTRIES = 30
let entries: ApiLogEntry[] = []
const listeners = new Set<() => void>()

export function logApiCall(entry: Omit<ApiLogEntry, 'time'>): void {
  entries = [{ ...entry, time: new Date().toLocaleTimeString() }, ...entries].slice(0, MAX_ENTRIES)
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): ApiLogEntry[] {
  return entries
}
