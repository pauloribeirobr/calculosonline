'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '../utils/cn'

export type AdFormat = 'banner' | 'rectangle' | 'leaderboard' | 'anchor'

const AD_DIMENSIONS: Record<
  AdFormat,
  { width: number; height: number; mobile?: { w: number; h: number } }
> = {
  banner: { width: 728, height: 90, mobile: { w: 320, h: 50 } },
  rectangle: { width: 336, height: 280, mobile: { w: 300, h: 250 } },
  leaderboard: { width: 728, height: 90 },
  anchor: { width: 320, height: 50 },
}

export interface AdSlotProps {
  /** `data-ad-slot` do AdSense */
  slotId: string
  format: AdFormat
  className?: string
  /** Rótulo discreto acima do anúncio (padrão: "Publicidade") */
  label?: string
}

interface AdsByGoogleWindow extends Window {
  adsbygoogle?: Array<Record<string, unknown>>
}

/**
 * Wrapper para unidades AdSense com:
 *  - Lazy-load via IntersectionObserver
 *  - Espaço reservado antes do load (CLS = 0)
 *  - Placeholder em desenvolvimento
 */
export function AdSlot({ slotId, format, className, label = 'Publicidade' }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)
  const dims = AD_DIMENSIONS[format]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisivel(true)
      },
      { rootMargin: '200px' },
    )
    const el = ref.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visivel) return
    try {
      const w = window as AdsByGoogleWindow
      w.adsbygoogle = w.adsbygoogle ?? []
      w.adsbygoogle.push({})
    } catch {
      // Ignora silenciosamente — bloqueador de anúncios costuma quebrar o push.
    }
  }, [visivel])

  const publisherId =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID : undefined

  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

  if (!publisherId || isDev) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-100',
          className,
        )}
        style={{
          width: dims.mobile?.w ?? dims.width,
          height: dims.mobile?.h ?? dims.height,
          maxWidth: '100%',
        }}
        aria-label="Área de anúncio (desativado em desenvolvimento)"
      >
        <span className="text-xs text-gray-400">
          Ad {dims.width}×{dims.height}
        </span>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn('overflow-hidden', className)}
      style={{ minHeight: dims.mobile?.h ?? dims.height, maxWidth: '100%' }}
    >
      {label && (
        <p className="mb-1 text-center text-xs text-gray-400" aria-hidden>
          {label}
        </p>
      )}
      {visivel && (
        <ins
          className="adsbygoogle block"
          style={{
            display: 'block',
            width: dims.width,
            height: dims.height,
            maxWidth: '100%',
          }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
