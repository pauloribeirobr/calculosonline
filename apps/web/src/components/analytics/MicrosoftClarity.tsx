'use client'

import Script from 'next/script'

/**
 * Carrega o snippet do Microsoft Clarity em produção, condicionado à
 * variável de ambiente `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
 */
export function MicrosoftClarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

  if (process.env.NODE_ENV !== 'production' || !projectId) return null

  return (
    // lazyOnload (não afterInteractive): o Clarity não é crítico e custa ~80–130ms de
    // bloqueio da main thread (medido no Lighthouse, mesmo achado do Recibo Fácil).
    // Carregando no idle pós-load, sai do caminho crítico e melhora TBT/INP no mobile.
    <Script id="microsoft-clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  )
}
