'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics } from '@/lib/analytics'

export function RouteTracker(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousRouteRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    const queryString = searchParams?.toString() || undefined
    const currentRoute = queryString ? `${pathname}?${queryString}` : pathname
    const referer =
      previousRouteRef.current ||
      (typeof document !== 'undefined' ? document.referrer : undefined)

    analytics.routeViewed(pathname, queryString, referer, {
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    })

    previousRouteRef.current = currentRoute
  }, [pathname, searchParams])

  return null
}
