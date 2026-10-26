import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // `/_next/` não entra: é de lá que saem o CSS e o JS de toda página, e
      // o Googlebot precisa deles para renderizar (F78).
      disallow: ['/api/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
