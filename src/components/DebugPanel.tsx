import WebApp from '@twa-dev/sdk'
import { useState, useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from '../lib/debugLog'
import { getInitData } from '../telegram'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

export default function DebugPanel() {
  const [open, setOpen] = useState(false)
  const log = useSyncExternalStore(subscribe, getSnapshot)
  const initData = getInitData()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          zIndex: 9999,
          width: 36,
          height: 36,
          borderRadius: 18,
          background: '#111',
          color: '#fff',
          border: 'none',
          fontSize: 16,
          opacity: 0.6,
        }}
      >
        🐞
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 11,
        overflow: 'auto',
        padding: 12,
      }}
    >
      <button
        onClick={() => setOpen(false)}
        style={{ position: 'fixed', top: 8, right: 8, background: '#333', color: '#fff', border: 'none', padding: '4px 10px' }}
      >
        close
      </button>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#fff', fontWeight: 'bold' }}>Environment</div>
        <div>BASE_URL: {BASE_URL || '(empty)'}</div>
        <div>
          window.Telegram.WebApp present:{' '}
          {String(typeof window !== 'undefined' && !!(window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp)}
        </div>
        <div>WebApp.platform: {WebApp.platform ?? '(none)'}</div>
        <div>WebApp.version: {WebApp.version ?? '(none)'}</div>
        <div>initData length: {initData.length}</div>
        <div style={{ wordBreak: 'break-all' }}>initData raw: {initData || '(empty)'}</div>
        <div style={{ wordBreak: 'break-all' }}>
          initDataUnsafe.user: {JSON.stringify(WebApp.initDataUnsafe?.user) ?? '(none)'}
        </div>
      </div>

      <div>
        <div style={{ color: '#fff', fontWeight: 'bold' }}>API calls ({log.length})</div>
        {log.length === 0 && <div>(no calls yet)</div>}
        {log.map((entry, i) => (
          <div
            key={i}
            style={{
              borderBottom: '1px solid #333',
              padding: '4px 0',
              color: entry.status === 'error' || (typeof entry.status === 'number' && entry.status >= 400) ? '#f66' : '#0f0',
            }}
          >
            <div>
              [{entry.time}] {entry.method} {entry.path} → {entry.status}
            </div>
            <div>auth header sent: {String(entry.hasAuthHeader)}</div>
            {entry.detail && <div>detail: {entry.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
