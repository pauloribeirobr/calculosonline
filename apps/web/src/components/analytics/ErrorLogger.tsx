'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

const CHUNK_RELOAD_KEY = 'co_chunk_reload_attempted'

/**
 * Recupera usuários presos com HTML cacheado referenciando chunks que
 * sumiram após deploy. Sem isso, parte das sessões fica com CSS/JS
 * quebrados até a aba ser fechada.
 */
function isChunkLoadFailure(target: EventTarget | null, error?: Error): boolean {
  if (target instanceof HTMLLinkElement && target.rel === 'stylesheet') return true
  if (target instanceof HTMLScriptElement && target.src.includes('/_next/static/')) return true
  if (!error) return false
  if (error.name === 'ChunkLoadError') return true
  return /Loading (CSS )?chunk \d+ failed/i.test(error.message)
}

function attemptRecoveryReload(reason: string) {
  if (typeof window === 'undefined') return
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  } catch {
    return
  }
  analytics.errorOccurred(new Error(`chunk_load_failure_recovered: ${reason}`), {
    digest: 'chunk_load_recovery',
  })
  window.location.reload()
}

export function ErrorLogger() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadFailure(event.target, event.error)) {
        attemptRecoveryReload(event.message || 'error_event')
        return
      }
      analytics.jsError(
        event.message,
        event.filename,
        event.lineno,
        event.colno,
        event.error,
      )
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      if (isChunkLoadFailure(null, error)) {
        attemptRecoveryReload(error.message)
        return
      }
      analytics.errorOccurred(error, {
        digest: 'unhandled_promise_rejection',
      })
    }

    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
