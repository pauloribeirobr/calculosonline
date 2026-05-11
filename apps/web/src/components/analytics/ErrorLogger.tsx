'use client'

import { useEffect } from 'react'

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

function attemptRecoveryReload() {
  if (typeof window === 'undefined') return
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  } catch {
    return
  }
  window.location.reload()
}

export function ErrorLogger() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadFailure(event.target, event.error)) {
        attemptRecoveryReload()
        return
      }
      // Sem backend dedicado: registramos no console — Vercel Analytics e
      // Microsoft Clarity capturam os erros do lado deles.
      console.error('[ErrorLogger]', event.message, event.error)
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      if (isChunkLoadFailure(null, error)) {
        attemptRecoveryReload()
        return
      }
      console.error('[ErrorLogger] unhandledrejection', error)
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
