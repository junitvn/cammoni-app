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

let panelOpen = false
const panelListeners = new Set<() => void>()

export function openDebugPanel(): void {
  panelOpen = true
  panelListeners.forEach((l) => l())
}

export function closeDebugPanel(): void {
  panelOpen = false
  panelListeners.forEach((l) => l())
}

export function subscribePanelOpen(listener: () => void): () => void {
  panelListeners.add(listener)
  return () => panelListeners.delete(listener)
}

export function getPanelOpenSnapshot(): boolean {
  return panelOpen
}
