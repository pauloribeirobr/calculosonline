import { track as vercelTrack } from '@vercel/analytics'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

type ErrorInfo = {
  componentStack?: string | undefined
  digest?: string | undefined
  /**
   * `fatal` no GA4 quer dizer "a pessoa perdeu a página", não "o erro é
   * grave". Só os error boundaries (`app/error.tsx`, `app/global-error.tsx`)
   * sabem disso — quando eles rodam, o usuário está olhando para uma tela de
   * erro. Rejeição de promessa e recuperação de chunk não interrompem a
   * renderização e por isso passam `fatal: false`.
   *
   * Enquanto tudo era `fatal: true`, o painel do GA4 não tinha como separar
   * "o site quebrou" de "um script de terceiro falhou".
   */
  fatal?: boolean | undefined
}

const SENSITIVE_QUERY_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'code',
  'state',
])

function cleanParams(params?: AnalyticsParams): AnalyticsParams | undefined {
  if (!params) return undefined

  const entries = Object.entries(params).filter(([, value]) => value !== undefined)
  if (entries.length === 0) return undefined

  return Object.fromEntries(entries) as AnalyticsParams
}

function sanitizeQueryString(rawQueryString?: string): string | undefined {
  if (!rawQueryString) return undefined

  const normalized = rawQueryString.startsWith('?') ? rawQueryString.substring(1) : rawQueryString

  const params = new URLSearchParams(normalized)
  for (const key of Array.from(params.keys())) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
      params.delete(key)
    }
  }

  const sanitized = params.toString()
  return sanitized || undefined
}

function track(eventName: string, params?: AnalyticsParams): void {
  const eventParams = cleanParams(params)

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams)
  }

  vercelTrack(eventName, eventParams)
}

export const analytics = {
  routeViewed: (
    route: string,
    queryString?: string,
    referer?: string,
    metadata?: AnalyticsParams,
  ) =>
    track('route_viewed', {
      route,
      query_string: sanitizeQueryString(queryString),
      referer,
      ...metadata,
    }),

  calculatorCalculated: (
    calculatorSlug: string,
    category: string,
    origin: 'manual' | 'shared_link' = 'manual',
  ) =>
    track('calculator_calculated', {
      calculator_slug: calculatorSlug,
      calculator_category: category,
      origin,
    }),

  calculatorShared: (calculatorSlug: string, category: string) =>
    track('calculator_shared', {
      calculator_slug: calculatorSlug,
      calculator_category: category,
    }),

  /**
   * "Editar cálculo" clicado ao abrir um cálculo salvo/compartilhado (F59).
   * Existe para responder à pergunta que ficou em aberto no registro da
   * feature: o botão deveria aparecer em toda abertura com resultado, ou só
   * nesta? Sem uso medido, a resposta seria palpite.
   */
  calculatorEdited: (calculatorSlug: string, category: string) =>
    track('calculator_edited', {
      calculator_slug: calculatorSlug,
      calculator_category: category,
    }),

  calculatorSaved: (calculatorSlug: string, category: string) =>
    track('calculator_saved', {
      calculator_slug: calculatorSlug,
      calculator_category: category,
    }),

  calculatorValidationError: (
    calculatorSlug: string,
    category: string,
    errorCount: number,
    errorFields?: string[],
  ) =>
    track('calculator_validation_error', {
      calculator_slug: calculatorSlug,
      calculator_category: category,
      error_count: errorCount,
      error_fields: errorFields?.join(','),
    }),

  errorOccurred: (error: Error, errorInfo?: ErrorInfo) => {
    const errorData = {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack?.substring(0, 500),
      component_stack: errorInfo?.componentStack?.substring(0, 500),
      error_digest: errorInfo?.digest,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }

    track('exception', {
      description: `${error.name}: ${error.message}`.trim(),
      fatal: errorInfo?.fatal ?? true,
      ...errorData,
    })

    if (process.env.NODE_ENV === 'development') {
      console.warn('Error tracked:', errorData)
    }
  },

  jsError: (message: string, source?: string, lineno?: number, colno?: number, error?: Error) =>
    track('exception', {
      // `description` vazio deixa a linha ilegível no painel do GA4, e era o
      // caso mais comum: erro de script cross-origin chega como `message`
      // vazia (ou "Script error.") sem `filename`/`lineno`. Sem rótulo não há
      // como decidir se é erro do site ou de extensão/terceiro.
      description: message?.trim() || (error ? `${error.name}: ${error.message}` : 'unknown_error'),
      fatal: false,
      error_name: error?.name,
      source,
      lineno,
      colno,
      error_stack: error?.stack?.substring(0, 500),
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    }),

  /**
   * Falha de **carregamento de recurso** (`<img>`, `<script>`, `<link>`), que
   * o listener em fase de captura recebe no mesmo evento `error` de um erro
   * de JavaScript, mas que não é exceção nenhuma: nada foi lançado, nenhuma
   * linha de código quebrou.
   *
   * Evento separado de propósito — misturado em `exception`, ele inflava a
   * contagem com bloqueio de tracker por adblock (o caso mais provável aqui,
   * já que Clarity e gtag são justamente os recursos de terceiro da página) e
   * tornava o relatório de erro do site inutilizável.
   */
  resourceError: (tag: string, url: string) =>
    track('resource_error', {
      resource_tag: tag,
      resource_url: url.substring(0, 500),
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    }),
}
