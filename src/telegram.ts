import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

// The telegram-web-app.js script (loaded in index.html so initData works for real
// Telegram clients) also installs a partial window.Telegram.WebApp stub when opened
// in a plain browser — enough to look "present" but missing real methods like
// .ready(). Every call below is wrapped so a mismatched/incomplete client never
// crashes the app; at worst these become no-ops.

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
