'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

const CHUNK_RELOAD_KEY = 'co_chunk_reload_attempted'

/**
 * Teto de eventos de erro por sessão de página.
 *
 * O export do GA4 de 08/09 trouxe **286 `exception` para 323 `page_view`** —
 * quase um por pageview. Uma proporção dessas nunca é "um erro diferente por
 * visita": é o mesmo erro repetindo, e o que ele faz é afogar o relatório e
 * gastar cota de eventos. O teto e a deduplicação existem para que o painel
 * responda "quais erros acontecem", e não "quantas vezes o mesmo erro
 * aconteceu" — essa segunda pergunta já é respondida pela contagem de
 * sessões afetadas.
 */
const MAX_ERROR_EVENTS_POR_SESSAO = 10

const jaReportados = new Set<string>()
let eventosReportados = 0

function podeReportar(assinatura: string): boolean {
  if (eventosReportados >= MAX_ERROR_EVENTS_POR_SESSAO) return false
  if (jaReportados.has(assinatura)) return false
  jaReportados.add(assinatura)
  eventosReportados += 1
  return true
}

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

/**
 * O evento `error` em fase de captura entrega duas coisas diferentes no mesmo
 * handler: exceção de JavaScript (alvo é `window`, vem `event.error`) e
 * **falha de carregamento de recurso** (alvo é o elemento, `event.error` é
 * `undefined` e `event.message` vem vazia). Só a primeira é exceção.
 *
 * É aqui que se decide, e não no painel: um `exception` com `description`
 * vazia não tem como ser classificado depois.
 */
function recursoQueFalhou(target: EventTarget | null): { tag: string; url: string } | null {
  if (target instanceof HTMLScriptElement) return { tag: 'script', url: target.src }
  if (target instanceof HTMLLinkElement) return { tag: 'link', url: target.href }
  if (target instanceof HTMLImageElement) return { tag: 'img', url: target.currentSrc || target.src }
  if (target instanceof HTMLMediaElement) return { tag: 'media', url: target.currentSrc || target.src }
  return null
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
    // A página recarrega e volta a funcionar — o usuário não perdeu a sessão.
    fatal: false,
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

      const recurso = recursoQueFalhou(event.target)
      if (recurso) {
        if (!podeReportar(`resource:${recurso.tag}:${recurso.url}`)) return
        analytics.resourceError(recurso.tag, recurso.url)
        return
      }

      if (!podeReportar(`js:${event.message}:${event.filename}:${event.lineno}`)) return
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
      if (!podeReportar(`rejection:${error.name}:${error.message}`)) return
      analytics.errorOccurred(error, {
        digest: 'unhandled_promise_rejection',
        // Promessa rejeitada sem `catch` quase nunca derruba a renderização —
        // marcá-la fatal fazia toda rejeição de script de terceiro entrar no
        // painel com o mesmo peso de uma tela de erro.
        fatal: false,
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
