# Prompt de IA — Sprint 2.4: Monetizacao Avancada
**calculosonline.com.br | Fase 2 — Expansao | Semanas 20–24**

---

## PRE-REQUISITO

- AdSense ativo com historico de pelo menos 60 dias de dados
- 50 calculadoras publicadas e indexadas
- 100.000+ pageviews/mes (meta para Header Bidding ser vantajoso)
- Google Analytics 4 configurado com eventos `calculator_submit`
- Paginas de calculadoras de IRPF, MEI e rescisao com trafego relevante

---

## OBJETIVO DA SPRINT 2.4

1. Avaliar e implementar **Header Bidding** com Google Ad Manager + Prebid.js
2. Integrar **programas de afiliados** financeiros nas paginas relevantes
3. Implementar **formularios de leads qualificados** (contador, advogado)
4. Criar **dashboard centralizado** de receita (AdSense + afiliados + leads)

---

## PARTE 1 — HEADER BIDDING

### TAREFA 1: Avaliar viabilidade (pre-condicao de 100K PV/mes)

```typescript
// apps/web/src/lib/ads/avaliar-header-bidding.ts
// Script de analise a ser rodado uma vez para decidir se vale implementar

/**
 * Regra de ouro: Header Bidding compensa quando:
 * - Pageviews/mes > 100.000 (abaixo disso o overhead nao vale)
 * - RPM atual do AdSense < R$20 (HB tipicamente aumenta 20-40%)
 * - Latencia aceitavel: Prebid.js adiciona ~300-500ms de timeout
 */

export const CRITERIOS_HB = {
  pageviewsMinimoMensal: 100_000,
  rpmMinimoAtualParaValer: 20, // se RPM > R$20, ganho marginal menor
  timeoutLances: 1000,          // ms — publishers aguardam lances ate este limite
  sspsRecomendados: [
    "AppNexus (Xandr)",
    "OpenX",
    "Rubicon Project (Magnite)",
    "Index Exchange",
    "Criteo",
    "Amazon Publisher Services (APS)",
  ],
}
```

---

### TAREFA 2: Configurar Google Ad Manager (GAM)

O GAM atua como o ad server central que coordena o AdSense e os SSPs do Prebid.

```
1. Acessar: https://admanager.google.com
2. Criar conta (gratis ate 90M impressoes/mes)
3. Vincular ao AdSense existente (Admin > Configuracoes > Vinculacao de produtos)
4. Criar 3 blocos de anuncio no GAM (espelhar os slots do AdSense):
   - /calculosonline/calc-topo    (728x90 desktop / 320x50 mobile)
   - /calculosonline/calc-meio    (336x280 / 300x250)
   - /calculosonline/calc-base    (336x280 / 300x250)
5. Configurar "Price Priority" line items para o Prebid
```

---

### TAREFA 3: Implementar Prebid.js

```bash
# Baixar build customizado do Prebid com apenas os adapters necessarios
# https://docs.prebid.org/download.html
# Selecionar: AppNexus, OpenX, Rubicon, IndexExchange, Amazon TAM
# Baixar como prebid.min.js e colocar em apps/web/public/js/

# Alternativa: usar prebid via CDN (nao recomendado para producao)
```

```typescript
// apps/web/src/components/ads/PrebidSetup.tsx
"use client"
import { useEffect } from "react"
import Script from "next/script"

interface AdUnit {
  code: string     // id do div do anuncio
  sizes: [number, number][]
  bids: { bidder: string; params: Record<string, unknown> }[]
}

const AD_UNITS: AdUnit[] = [
  {
    code: "calc-topo",
    sizes: [[728, 90], [320, 50], [300, 50]],
    bids: [
      { bidder: "appnexus", params: { placementId: "SEU_PLACEMENT_ID_TOPO" } },
      { bidder: "openx",    params: { unit: "SEU_UNIT_ID_TOPO", delDomain: "calculosonline-d.openx.net" } },
      { bidder: "rubicon",  params: { accountId: "SEU_ACCOUNT_ID", siteId: "SEU_SITE_ID", zoneId: "SEU_ZONE_TOPO" } },
    ],
  },
  {
    code: "calc-meio",
    sizes: [[336, 280], [300, 250]],
    bids: [
      { bidder: "appnexus", params: { placementId: "SEU_PLACEMENT_ID_MEIO" } },
      { bidder: "openx",    params: { unit: "SEU_UNIT_ID_MEIO", delDomain: "calculosonline-d.openx.net" } },
    ],
  },
]

export function PrebidSetup() {
  useEffect(() => {
    const pbjs = (window as any).pbjs || {}
    pbjs.que = pbjs.que || []
    ;(window as any).pbjs = pbjs

    const googletag = (window as any).googletag || {}
    googletag.cmd = googletag.cmd || []
    ;(window as any).googletag = googletag

    pbjs.que.push(() => {
      pbjs.addAdUnits(AD_UNITS)

      pbjs.setConfig({
        debug: process.env.NODE_ENV !== "production",
        bidderTimeout: 1000,  // aguardar lances ate 1s
        priceGranularity: "dense",
        currency: {
          adServerCurrency: "BRL",
          conversionRateFile: "https://currency.prebid.org/latest.json",
        },
        // Consentimento LGPD
        consentManagement: {
          gdpr: { defaultGdprScope: false },    // Brasil nao e GDPR
          usp:  { timeout: 100, defaultValue: "1YNN" },
        },
      })

      pbjs.requestBids({
        timeout: 1000,
        bidsBackHandler: () => {
          // Definir targeting no GAM e chamar refresh
          googletag.cmd.push(() => {
            pbjs.setTargetingForGPTAsync()
            googletag.pubads().refresh()
          })
        },
      })
    })
  }, [])

  return (
    <>
      {/* GPT (Google Publisher Tag) */}
      <Script
        id="gpt-loader"
        strategy="afterInteractive"
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
      />
      {/* Prebid.js (build customizado) */}
      <Script
        id="prebid-loader"
        strategy="afterInteractive"
        src="/js/prebid.min.js"
      />
    </>
  )
}
```

---

### TAREFA 4: Componente AdSlot para GAM + Prebid

```typescript
// packages/ui/src/AdSlot/GamAdSlot.tsx
// Versao do AdSlot adaptada para Google Ad Manager + Prebid
"use client"
import { useEffect, useRef } from "react"

interface GamAdSlotProps {
  adUnitPath: string    // ex: "/123456789/calculosonline/calc-topo"
  divId: string         // ex: "calc-topo" (deve ser unico na pagina)
  sizes: [number, number][]
  className?: string
}

export function GamAdSlot({ adUnitPath, divId, sizes, className }: GamAdSlotProps) {
  const slotRef = useRef<googletag.Slot | null>(null)

  useEffect(() => {
    const googletag = (window as any).googletag || { cmd: [] }
    ;(window as any).googletag = googletag

    googletag.cmd.push(() => {
      // Definir slot no GAM
      slotRef.current = googletag
        .defineSlot(adUnitPath, sizes, divId)
        ?.addService(googletag.pubads()) ?? null

      googletag.pubads().enableSingleRequest()
      googletag.pubads().disableInitialLoad() // Prebid controla o display
      googletag.enableServices()
      googletag.display(divId)
    })

    return () => {
      if (slotRef.current) {
        ;(window as any).googletag?.destroySlots?.([slotRef.current])
      }
    }
  }, [adUnitPath, divId])

  // Reservar espaco fixo para evitar CLS
  const [width, height] = sizes[0]

  return (
    <div
      className={`overflow-hidden ${className ?? ""}`}
      style={{ minHeight: height, textAlign: "center" }}
      role="complementary"
      aria-label="Anuncio"
    >
      <div id={divId} style={{ minHeight: height, display: "inline-block" }} />
    </div>
  )
}
```

---

### TAREFA 5: A/B Test AdSense vs Header Bidding

```typescript
// apps/web/src/hooks/useAdExperiment.ts
"use client"

export type AdStrategy = "ADSENSE" | "HEADER_BIDDING"

/**
 * Divide trafego 50/50 entre AdSense puro e Header Bidding.
 * Registra a variante no GA4 para analise de RPM.
 */
export function useAdExperiment(): AdStrategy {
  if (typeof window === "undefined") return "ADSENSE"

  const stored = localStorage.getItem("ad_experiment_v1")
  if (stored === "ADSENSE" || stored === "HEADER_BIDDING") return stored

  // Distribucao 10% HB no inicio (cautela com impacto em performance)
  const strategy: AdStrategy = Math.random() < 0.10 ? "HEADER_BIDDING" : "ADSENSE"
  localStorage.setItem("ad_experiment_v1", strategy)

  ;(window as any).gtag?.("event", "ad_experiment_assigned", {
    strategy,
    experiment_id: "ads_v1_hb_vs_adsense",
  })

  return strategy
}
```

```typescript
// apps/web/src/components/ads/AdSlotRouter.tsx
// Escolhe AdSense ou GAM baseado no experimento
"use client"
import { useAdExperiment } from "@/hooks/useAdExperiment"
import { AdSlot } from "@calculosonline/ui"
import { GamAdSlot } from "@calculosonline/ui"

interface AdSlotRouterProps {
  position: "topo" | "meio" | "base"
  adSenseSlotId: string
}

const GAM_UNITS = {
  topo: { path: "/123456789/calculosonline/calc-topo", sizes: [[728, 90], [320, 50]] as [number, number][] },
  meio: { path: "/123456789/calculosonline/calc-meio", sizes: [[336, 280], [300, 250]] as [number, number][] },
  base: { path: "/123456789/calculosonline/calc-base", sizes: [[336, 280], [300, 250]] as [number, number][] },
}

export function AdSlotRouter({ position, adSenseSlotId }: AdSlotRouterProps) {
  const strategy = useAdExperiment()

  if (strategy === "HEADER_BIDDING") {
    const unit = GAM_UNITS[position]
    return <GamAdSlot adUnitPath={unit.path} divId={`calc-${position}`} sizes={unit.sizes} />
  }

  return <AdSlot slotId={adSenseSlotId} format={position === "topo" ? "horizontal" : "rectangle"} />
}
```

---

## PARTE 2 — PROGRAMA DE AFILIADOS

### TAREFA 6: Estrutura de links de afiliados

```typescript
// apps/web/src/data/afiliados.ts

export interface ProgramaAfiliado {
  id: string
  nome: string
  descricao: string
  urlAfiliado: string     // URL com tracking UTM ou parametro de afiliado
  comissao: string        // descricao da comissao
  tipoComissao: "CPA" | "CPL" | "REVENUE_SHARE"
  categorias: string[]    // slugs das calculadoras onde exibir
  logoUrl: string
  cta: string             // texto do call-to-action
  destaque: boolean
}

export const AFILIADOS: ProgramaAfiliado[] = [
  {
    id: "nu-invest",
    nome: "NuInvest",
    descricao: "Invista no Tesouro Direto e CDB com taxa zero e rentabilidade competitiva.",
    urlAfiliado: "https://nubank.com.br/investimentos/?utm_source=calculosonline&utm_medium=afiliado&utm_campaign=cdb_tesouro",
    comissao: "R$30-80 por conta aberta",
    tipoComissao: "CPA",
    categorias: ["cdb", "tesouro-direto", "poupanca", "fii"],
    logoUrl: "/images/afiliados/nuinvest.svg",
    cta: "Abrir conta no NuInvest",
    destaque: true,
  },
  {
    id: "inter-invest",
    nome: "Inter Invest",
    descricao: "Plataforma completa de investimentos com CDB, FIIs e Tesouro Direto.",
    urlAfiliado: "https://www.bancointer.com.br/investimentos/?utm_source=calculosonline&utm_medium=afiliado",
    comissao: "R$20-60 por conta ativada",
    tipoComissao: "CPA",
    categorias: ["cdb", "tesouro-direto", "fii", "previdencia-privada"],
    logoUrl: "/images/afiliados/inter.svg",
    cta: "Investir no Inter",
    destaque: false,
  },
  {
    id: "contabilizei",
    nome: "Contabilizei",
    descricao: "Contabilidade online para MEI, Simples Nacional e Lucro Presumido a partir de R$79/mes.",
    urlAfiliado: "https://www.contabilizei.com.br/?utm_source=calculosonline&utm_medium=afiliado&utm_campaign=mei_simples",
    comissao: "R$80-200 por cliente contratado",
    tipoComissao: "CPA",
    categorias: ["das-mei", "simples-nacional", "lucro-presumido", "pis-cofins"],
    logoUrl: "/images/afiliados/contabilizei.svg",
    cta: "Abrir empresa com a Contabilizei",
    destaque: true,
  },
  {
    id: "idinheiro",
    nome: "iDinheiro",
    descricao: "Compare financiamentos imobiliarios e emprestimos de dezenas de bancos.",
    urlAfiliado: "https://www.idinheiro.com.br/?utm_source=calculosonline&utm_medium=afiliado",
    comissao: "R$15-50 por lead qualificado",
    tipoComissao: "CPL",
    categorias: ["financiamento-imobiliario", "emprestimo", "consignado"],
    logoUrl: "/images/afiliados/idinheiro.svg",
    cta: "Comparar financiamentos",
    destaque: true,
  },
  {
    id: "xp-investimentos",
    nome: "XP Investimentos",
    descricao: "A maior plataforma de investimentos do Brasil. CDB, acoes, FIIs e muito mais.",
    urlAfiliado: "https://www.xpi.com.br/abra-sua-conta/?utm_source=calculosonline&utm_medium=afiliado",
    comissao: "R$60-150 por conta ativada",
    tipoComissao: "CPA",
    categorias: ["cdb", "fii", "previdencia-privada", "tesouro-direto", "roi-payback"],
    logoUrl: "/images/afiliados/xp.svg",
    cta: "Abrir conta na XP",
    destaque: false,
  },
]

export function getAfiliadosPorCalculadora(slug: string): ProgramaAfiliado[] {
  return AFILIADOS.filter((a) => a.categorias.includes(slug))
}
```

---

### TAREFA 7: Componente AfiliadoCard

```typescript
// packages/ui/src/AfiliadoCard/index.tsx
import type { ProgramaAfiliado } from "@calculosonline/web/data/afiliados"

interface AfiliadoCardProps {
  afiliado: ProgramaAfiliado
  contexto?: string   // texto complementar especifico da calculadora
}

export function AfiliadoCard({ afiliado, contexto }: AfiliadoCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-5 space-y-3">
      <div className="flex items-start gap-4">
        <img
          src={afiliado.logoUrl}
          alt={afiliado.nome}
          className="w-12 h-12 object-contain rounded-lg bg-white border border-gray-100 p-1"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-gray-900 text-sm">{afiliado.nome}</h3>
          <p className="text-xs text-gray-500">{contexto ?? afiliado.descricao}</p>
        </div>
      </div>

      <a
        href={afiliado.urlAfiliado}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block w-full text-center bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors"
        // Tracking GA4
        data-ga-event="affiliate_click"
        data-ga-afiliado={afiliado.id}
        data-ga-calculadora="contextual"
      >
        {afiliado.cta}
      </a>

      <p className="text-[10px] text-gray-400 text-center">
        Parceria comercial — sem custo adicional para voce
      </p>
    </div>
  )
}
```

```typescript
// apps/web/src/app/calculadora/[slug]/page.tsx — adicionar afiliados abaixo do resultado
import { getAfiliadosPorCalculadora } from "@/data/afiliados"
import { AfiliadoCard } from "@calculosonline/ui"

// Dentro do componente de pagina:
const afiliados = getAfiliadosPorCalculadora(params.slug)

// No JSX, apos o resultado:
{afiliados.length > 0 && (
  <aside className="space-y-3">
    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
      Ferramentas relacionadas
    </h2>
    <div className="grid gap-3 sm:grid-cols-2">
      {afiliados.slice(0, 2).map((a) => (
        <AfiliadoCard key={a.id} afiliado={a} />
      ))}
    </div>
  </aside>
)}
```

---

### TAREFA 8: Tracking de conversoes de afiliados

```typescript
// apps/web/src/components/AfiliadoTracker.tsx
"use client"
import { useEffect } from "react"

/**
 * Escuta cliques em links de afiliado e envia evento ao GA4.
 * Usar no layout das paginas de calculadora.
 */
export function AfiliadoTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-ga-event='affiliate_click']")
      if (!target) return

      const afiliado = target.getAttribute("data-ga-afiliado") ?? "unknown"
      const calculadora = window.location.pathname.split("/").pop() ?? "unknown"

      ;(window as any).gtag?.("event", "affiliate_click", {
        afiliado_id: afiliado,
        calculadora_slug: calculadora,
        page_url: window.location.href,
      })
    }

    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return null
}
```

---

## PARTE 3 — LEADS QUALIFICADOS

### TAREFA 9: Formulario "Falar com Contador"

```typescript
// apps/web/src/components/leads/LeadContador.tsx
"use client"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  nome:     z.string().min(2),
  email:    z.string().email(),
  telefone: z.string().min(10).regex(/^\d+$/, "Apenas numeros"),
  faturamento: z.enum(["ate_81k", "81k_360k", "360k_4_8m", "acima_4_8m"]),
  situacao: z.enum(["pf", "mei", "simples", "abrindo_empresa"]),
  mensagem: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface LeadContadorProps {
  contexto: "MEI" | "SIMPLES" | "IRPF" | "GERAL"
}

const TITULOS = {
  MEI: "Precisa de apoio contabil para MEI?",
  SIMPLES: "Otimize seus impostos no Simples Nacional",
  IRPF: "Declare seu IRPF sem preocupacoes",
  GERAL: "Fale com um contador especializado",
}

export function LeadContador({ contexto }: LeadContadorProps) {
  const [enviado, setEnviado] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await fetch("/api/leads/contador", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, contexto }),
    })

    // Evento GA4 para rastrear CPL
    ;(window as any).gtag?.("event", "lead_contador_submit", {
      contexto,
      faturamento: data.faturamento,
      situacao: data.situacao,
    })

    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center space-y-2">
        <div className="text-3xl" aria-hidden>✅</div>
        <p className="font-semibold text-green-800">Solicitacao enviada!</p>
        <p className="text-sm text-green-700">
          Um contador entrara em contato em ate 1 dia util pelo e-mail informado.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-brand-900">{TITULOS[contexto]}</h3>
        <p className="text-sm text-brand-700">
          Consultoria gratuita de 30 minutos com um contador parceiro.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <input {...register("nome")} placeholder="Seu nome" className="input-field" />
            {errors.nome && <p className="text-xs text-red-600 mt-0.5">{errors.nome.message}</p>}
          </div>
          <div>
            <input {...register("email")} type="email" placeholder="Seu e-mail" className="input-field" />
            {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <input {...register("telefone")} placeholder="WhatsApp (so numeros)" className="input-field" />
            {errors.telefone && <p className="text-xs text-red-600 mt-0.5">{errors.telefone.message}</p>}
          </div>
          <select {...register("situacao")} className="input-field">
            <option value="pf">Pessoa Fisica</option>
            <option value="mei">MEI</option>
            <option value="simples">Empresa (Simples/LP)</option>
            <option value="abrindo_empresa">Quero abrir empresa</option>
          </select>
        </div>

        <select {...register("faturamento")} className="input-field">
          <option value="ate_81k">Faturamento ate R$ 81 mil/ano</option>
          <option value="81k_360k">R$ 81k a R$ 360k/ano</option>
          <option value="360k_4_8m">R$ 360k a R$ 4,8 milhoes/ano</option>
          <option value="acima_4_8m">Acima de R$ 4,8 milhoes/ano</option>
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Enviando..." : "Falar com um contador gratis"}
        </button>
      </form>

      <p className="text-[10px] text-brand-600 text-center">
        Servico gratuito — voce sera contatado por uma contabilidade parceira
      </p>
    </div>
  )
}
```

---

### TAREFA 10: API Route para receber leads

```typescript
// apps/web/src/app/api/leads/contador/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const leadSchema = z.object({
  nome:        z.string().min(2),
  email:       z.string().email(),
  telefone:    z.string().min(10),
  faturamento: z.string(),
  situacao:    z.string(),
  mensagem:    z.string().optional(),
  contexto:    z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const lead = leadSchema.parse(body)

    // Opcao 1: Enviar por e-mail via Resend
    await enviarEmailLead(lead)

    // Opcao 2: Salvar no Google Sheets via Apps Script Web App
    // await salvarNoSheets(lead)

    // Opcao 3: Enviar para CRM parceiro (Contabilizei, Agilize)
    // await enviarParaCRM(lead)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 })
  }
}

async function enviarEmailLead(lead: z.infer<typeof leadSchema>) {
  // Usando Resend (https://resend.com) — gratis ate 3.000 emails/mes
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "leads@calculosonline.com.br",
      to: [process.env.EMAIL_LEADS ?? "contato@calculosonline.com.br"],
      subject: `Novo Lead Contador — ${lead.contexto} | ${lead.nome}`,
      html: `
        <h2>Novo Lead — Calculadora ${lead.contexto}</h2>
        <p><strong>Nome:</strong> ${lead.nome}</p>
        <p><strong>E-mail:</strong> ${lead.email}</p>
        <p><strong>WhatsApp:</strong> ${lead.telefone}</p>
        <p><strong>Situacao:</strong> ${lead.situacao}</p>
        <p><strong>Faturamento:</strong> ${lead.faturamento}</p>
        ${lead.mensagem ? `<p><strong>Mensagem:</strong> ${lead.mensagem}</p>` : ""}
        <hr>
        <p style="color:#666;font-size:12px">Lead gerado em ${new Date().toLocaleString("pt-BR")} via CalculosOnline.com.br</p>
      `,
    }),
  })
}
```

---

## PARTE 4 — DASHBOARD DE RECEITA

### TAREFA 11: Planilha consolidada de metricas de monetizacao

```javascript
// Google Apps Script — adicionar a planilha de KPIs existente

const SHEETS_CONFIG = {
  adsense: "AdSense Semanal",
  afiliados: "Afiliados",
  leads: "Leads",
  consolidado: "Consolidado Mensal",
}

function consolidarReceitaMensal() {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  const hoje = new Date()
  const mes = Utilities.formatDate(hoje, "America/Sao_Paulo", "yyyy-MM")

  // Buscar dados do AdSense (ver sprint-1.6)
  const receitaAdSense = buscarReceitaAdSenseMes(mes)

  // Buscar afiliados (entrada manual ou via API do programa)
  const sheetAfiliados = ss.getSheetByName(SHEETS_CONFIG.afiliados)
  const receitaAfiliados = calcularReceitaAfiliadosMes(sheetAfiliados, mes)

  // Buscar leads (quantidade e valor estimado)
  const sheetLeads = ss.getSheetByName(SHEETS_CONFIG.leads)
  const totalLeads = contarLeadsMes(sheetLeads, mes)
  const receitaLeads = totalLeads * 50  // R$50 estimado por lead (ajustar com dados reais)

  const receitaTotal = receitaAdSense + receitaAfiliados + receitaLeads

  // Registrar no consolidado
  const sheetConsolidado = ss.getSheetByName(SHEETS_CONFIG.consolidado)
  sheetConsolidado.appendRow([
    mes,
    receitaAdSense,
    receitaAfiliados,
    receitaLeads,
    totalLeads,
    receitaTotal,
    new Date(),
  ])

  // Enviar relatorio
  const corpoEmail = `
📊 Receita ${mes}

AdSense:   R$ ${receitaAdSense.toFixed(2)}
Afiliados: R$ ${receitaAfiliados.toFixed(2)}
Leads:     R$ ${receitaLeads.toFixed(2)} (${totalLeads} leads)

TOTAL:     R$ ${receitaTotal.toFixed(2)}

Meta Fase 2: R$ 3.000/mes
Progresso: ${((receitaTotal / 3000) * 100).toFixed(1)}%

Ver planilha: https://docs.google.com/spreadsheets/d/${SHEET_ID}
  `

  MailApp.sendEmail({
    to: "SEU_EMAIL@gmail.com",
    subject: `💰 Receita ${mes} — R$ ${receitaTotal.toFixed(2)}`,
    body: corpoEmail,
  })
}

// Trigger: criar gatilho mensal no dia 1 as 9h
function criarTriggerMensal() {
  ScriptApp.newTrigger("consolidarReceitaMensal")
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create()
}
```

---

### TAREFA 12: Estrutura da planilha de leads

```
Aba "Leads" — colunas:
A: Data/Hora
B: Contexto (MEI, SIMPLES, IRPF, etc.)
C: Nome
D: Email
E: Telefone
F: Situacao (pf, mei, simples, abrindo_empresa)
G: Faturamento
H: Status (NOVO, CONTATADO, CONVERTIDO, PERDIDO)
I: Receita Gerada (R$) — preencher quando convertido
J: Parceiro (Contabilizei, Agilize, etc.)
K: Observacoes

Aba "Afiliados" — colunas:
A: Data
B: Parceiro (nuinvest, contabilizei, etc.)
C: Cliques (preencher do painel do afiliado)
D: Conversoes
E: Receita (R$)
F: EPC (receita/clique)

Aba "Consolidado Mensal":
A: Mes (AAAA-MM)
B: AdSense (R$)
C: Afiliados (R$)
D: Leads (R$)
E: Total Leads (quantidade)
F: Receita Total (R$)
G: Data Atualizacao
```

---

## CHECKLIST DE VERIFICACAO

### Header Bidding

```bash
# Verificar que Prebid.js esta carregando
# DevTools > Console: pbjs.getAdserverTargeting()
# Deve retornar objeto com targeting keys

# Verificar que GAM esta recebendo lances
# GAM > Relatorios > Delivery > filtrar por linha de preco "Prebid"

# Monitorar performance (Lighthouse com e sem HB)
# Meta: LCP nao deve piorar mais de 300ms
```

- [ ] Prebid.js carregando sem erros no console
- [ ] Pelo menos 2 SSPs configurados e fazendo lances
- [ ] RPM com HB >= RPM com AdSense puro (monitorar 2 semanas)
- [ ] LCP nao piorou acima de 300ms com HB
- [ ] Experimento A/B configurado (10% HB / 90% AdSense inicial)

### Afiliados

- [ ] Links de afiliados com UTMs configurados e rastreando no GA4
- [ ] `AfiliadoCard` exibindo nas paginas corretas (CDB, FII, MEI, financiamento)
- [ ] Evento `affiliate_click` disparando no GA4
- [ ] Disclosures de parceria presentes em todos os cards (`rel="sponsored"`)
- [ ] Relatorio semanal de cliques vs. conversoes por parceiro

### Leads

- [ ] Formulario `LeadContador` exibindo nas calculadoras de MEI, Simples, IRPF
- [ ] API `/api/leads/contador` retornando 200 e enviando e-mail
- [ ] Evento GA4 `lead_contador_submit` disparando
- [ ] Planilha "Leads" registrando submissoes
- [ ] Resposta ao lead em ate 1 dia util (processo definido com parceiro)

---

## CRITERIOS DE ACEITE — GATE FASE 2 → FASE 3

| KPI | Meta | Como medir |
|-----|------|-----------|
| Calculadoras publicadas | 50 | GSC: 50 URLs indexadas |
| Pageviews mensais | 150.000 | GA4 |
| Receita AdSense mensal | R$3.000 | Painel AdSense |
| Downloads desktop | 100+ | GitHub Releases + GA4 `desktop_download` |
| Usuarios plugin Sheets | 100+ | Google Workspace Marketplace |
| Receita total (AdSense + afiliados + leads) | R$3.500+ | Planilha Consolidado |
| Domain Rating | ≥ 20 | Ahrefs |
| Core Web Vitals | 100% verde | GSC CWV |

```bash
# Verificar todas as calculadoras indexadas
# GSC > Cobertura > Validos > filtrar por /calculadora/
# Deve mostrar 50 URLs

# Verificar Gate Fase 2
# Abrir planilha de KPIs → aba Consolidado Mensal → ultimo mes
# Todos os criterios acima devem estar atingidos
```

> **Proximo passo:** Sprint 3.1 — API publica REST com autenticacao, rate limiting e SDK TypeScript no npm.
