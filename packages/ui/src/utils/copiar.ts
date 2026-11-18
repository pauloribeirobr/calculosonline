'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copia texto para a área de transferência (F70).
 *
 * Mesmo padrão do Recibo Fácil (`ShareService.copyToClipboard`): a API
 * moderna e, quando ela não existe ou recusa (http, webview, iframe sem
 * permissão), um `textarea` fora da tela com `execCommand('copy')`. Rejeita se
 * as duas falharem — quem chama decide se mostra "Copiado" ou não.
 */
export async function copiarTexto(texto: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto)
      return
    } catch {
      // Permissão negada ou documento sem foco: tenta o caminho antigo.
    }
  }
  const area = document.createElement('textarea')
  area.value = texto
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.select()
  try {
    if (!document.execCommand('copy')) throw new Error('Cópia recusada pelo navegador')
  } finally {
    document.body.removeChild(area)
  }
}

/**
 * Estado de "acabou de copiar" por chave, que some sozinho depois de
 * `duracaoMs`. A chave identifica o que foi copiado (o headline, a linha 3, o
 * bloco do FGTS) para só aquele elemento mostrar a confirmação.
 */
export function useCopiarValor(duracaoMs = 2000) {
  const [copiado, setCopiado] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copiar = useCallback(
    async (chave: string, texto: string): Promise<boolean> => {
      try {
        await copiarTexto(texto)
      } catch {
        return false
      }
      clearTimeout(timer.current)
      setCopiado(chave)
      timer.current = setTimeout(() => setCopiado(null), duracaoMs)
      return true
    },
    [duracaoMs],
  )

  return { copiado, copiar }
}
