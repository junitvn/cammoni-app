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

export function initTelegram(): void {
  safeCall(() => WebApp.ready())
  safeCall(() => WebApp.expand())
}

export function getInitData(): string {
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
