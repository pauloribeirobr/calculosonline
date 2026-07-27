/**
 * Compartilhamento de cálculo por link: os valores preenchidos no formulário
 * (não o resultado) viajam em base64url na query param `d`, então abrir o
 * link reconstrói o formulário e reexecuta o cálculo — sem backend, sem
 * persistir nada, só serialização.
 */

const QUERY_PARAM = 'd'

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(base64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

export function encodeShareData(data: Record<string, unknown>): string {
  const json = JSON.stringify(data)
  return bytesToBase64Url(new TextEncoder().encode(json))
}

export function decodeShareData(raw: string | null | undefined): Record<string, unknown> | null {
  if (!raw) return null
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(raw))
    const parsed: unknown = JSON.parse(json)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

/** URL completa (absoluta) pra colar direto na mensagem do WhatsApp. */
export function buildShareUrl(pageUrl: string, data: Record<string, unknown>): string {
  return `${pageUrl}?${QUERY_PARAM}=${encodeShareData(data)}`
}

export function readShareParam(searchParams: URLSearchParams): Record<string, unknown> | null {
  return decodeShareData(searchParams.get(QUERY_PARAM))
}
