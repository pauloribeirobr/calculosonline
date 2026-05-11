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

  const normalized = rawQueryString.startsWith('?')
    ? rawQueryString.substring(1)
    : rawQueryString

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

  calculatorCalculated: (calculatorSlug: string, category: string) =>
    track('calculator_calculated', {
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
      description: `${error.name}: ${error.message}`,
      fatal: true,
      ...errorData,
    })

    if (process.env.NODE_ENV === 'development') {
      console.warn('Error tracked:', errorData)
    }
  },

  jsError: (
    message: string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error,
  ) =>
    track('exception', {
      description: message,
      fatal: false,
      source,
      lineno,
      colno,
      error_stack: error?.stack?.substring(0, 500),
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    }),
}
