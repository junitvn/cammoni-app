import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

// @twa-dev/sdk bundles its own copy of telegram-web-app.js and parses initData
// from location.hash the first time it's imported — don't also load the official
// telegram.org script in index.html, it consumes/clears the hash first and leaves
// the SDK with an empty stub. Outside Telegram there's no WebApp at all, so every
// call below is wrapped: a missing/incomplete client never crashes the app, at
// worst these become no-ops.

function safeCall(fn: () => void): void {
  try {
    fn()
  } catch {
    // best-effort Telegram integration — ignore unsupported/missing methods
  }
}

function readFromHash(): string {
  try {
    const hash = window.location.hash.replace(/^#/, '')
    return new URLSearchParams(hash).get('tgWebAppData') ?? ''
  } catch {
    return ''
  }
}

// Client-side navigation (react-router's navigate()) rewrites location.hash to
// empty, since the target URL never mentions it — so tgWebAppData must be captured
// once, up front, into a value that survives navigating away from it. Telegram also
// sets the hash *asynchronously* on some clients (slightly after this module first
// runs), with no reliable event for it, so we poll briefly in addition to listening
// for hashchange.
let capturedInitData = ''

function captureOnce(): void {
  if (capturedInitData) return
  const fromHash = readFromHash()
  if (!fromHash) return
  capturedInitData = fromHash
  try {
    sessionStorage.setItem('tgWebAppData', fromHash)
  } catch {
    // best-effort persistence only
  }
}

captureOnce()
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', captureOnce)
  let attempts = 0
  const pollId = window.setInterval(() => {
    captureOnce()
    attempts += 1
    if (capturedInitData || attempts > 20) window.clearInterval(pollId)
  }, 100)
}

export function initTelegram(): void {
  safeCall(() => WebApp.ready())
  safeCall(() => WebApp.expand())
}

export function getInitData(): string {
  const fromHash = readFromHash()
  if (fromHash) return fromHash
  if (capturedInitData) return capturedInitData
  try {
    const stored = sessionStorage.getItem('tgWebAppData')
    if (stored) return stored
  } catch {
    // ignore
  }
  try {
    return WebApp.initData ?? ''
  } catch {
    return ''
  }
}

function setBackButton(visible: boolean, onClick?: () => void): void {
  if (visible) {
    safeCall(() => WebApp.BackButton.show())
    if (onClick) safeCall(() => WebApp.BackButton.onClick(onClick))
  } else {
    safeCall(() => WebApp.BackButton.hide())
  }
}

/** Shows the Telegram in-app back button (a no-op outside Telegram) while a screen is mounted. */
export function useTelegramBackButton(onBack: () => void): void {
  useEffect(() => {
    setBackButton(true, onBack)
    return () => setBackButton(false)
  }, [onBack])
}
