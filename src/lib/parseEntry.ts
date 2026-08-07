// Mirrors moni-bot/webapp/service.py's amount/description extraction (which itself
// mirrors moni-bot/parser.py's conventions): amounts are entered in thousands, and
// the amount can come before or after the description.
const AMOUNT_DESC_RE = /^(\d+(?:[.,]\d+)*)\s+(.+)$/
const DESC_AMOUNT_RE = /^(.+?)\s+(\d+(?:[.,]\d+)*)$/

export interface ParsedEntry {
  amount: number // VND, already x1000
  description: string
}

export function parseEntry(text: string): ParsedEntry | null {
  const trimmed = text.trim()

  let numStr: string | undefined
  let description: string | undefined

  const m1 = AMOUNT_DESC_RE.exec(trimmed)
  if (m1) {
    numStr = m1[1]
    description = m1[2].trim()
  } else {
    const m2 = DESC_AMOUNT_RE.exec(trimmed)
    if (m2) {
      description = m2[1].trim()
      numStr = m2[2]
    }
  }
  if (!numStr || !description) return null

  const amount = Number(numStr.replace(/[.,]/g, ''))
  if (!Number.isFinite(amount) || amount <= 0) return null

  return { amount: amount * 1000, description }
}
