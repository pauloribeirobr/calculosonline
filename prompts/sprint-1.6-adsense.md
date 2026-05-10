# Prompt de IA — Sprint 1.6: Google AdSense
**calculosonline.com.br | Fase 1 — MVP | Semanas 10–12**

---

## PRÉ-REQUISITO

- Sprint 1.3 e 1.4 concluídas: **15+ páginas** com conteúdo original publicadas
- Páginas `/sobre`, `/privacidade` e `/contato` existentes
- Domínio ativo com HTTPS e tráfego orgânico inicial
- `ads.txt` em `/public/ads.txt`

---

## OBJETIVO DA SPRINT 1.6

1. Cumprir os requisitos de aprovação do AdSense
2. Integrar as unidades de anúncio sem prejudicar Core Web Vitals
3. Configurar `ads.txt` corretamente
4. Implementar monitoramento de receita via AdSense API

---

## PARTE 1 — REQUISITOS PARA APROVAÇÃO

### TAREFA 1: Checklist pré-aplicação

O Google avalia os seguintes critérios antes de aprovar uma conta AdSense:

**Conteúdo:**
- [ ] **15+ páginas** com conteúdo original e de qualidade (≥ 500 palavras cada)
- [ ] Conteúdo não viola políticas: sem material adulto, violento, pirata ou enganoso
- [ ] Todas as páginas em português correto, sem erros gramaticais graves
- [ ] **Nenhum conteúdo "thin"** — páginas com apenas o formulário, sem texto, são recusadas

**Navegação e UX:**
- [ ] Menu de navegação claro e funcional
- [ ] Links internos entre calculadoras e categorias
- [ ] Velocidade de carregamento aceitável (LCP < 4s no mobile)

**Páginas obrigatórias:**
- [ ] `/sobre` — quem é o site, propósito, transparência
- [ ] `/privacidade` — mencionar uso de cookies e AdSense explicitamente
- [ ] `/contato` — formulário ou e-mail válido

**Domínio:**
- [ ] Site no ar há pelo menos 3–6 meses (ideal) — com site novo, aprovação pode demorar mais
- [ ] Domínio próprio (não subdomínio gratuito)
- [ ] HTTPS ativo

---

### TAREFA 2: Página /contato

```typescript
// apps/web/src/app/contato/page.tsx
"use client"
import { useState } from "react"

export const metadata = {
  title: "Contato | CalculosOnline.com.br",
}

export default function ContatoPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Entre em contato</h1>
        <p className="text-gray-600 mt-2">
          Dúvidas, sugestões de novas calculadoras ou reporte de erros nos cálculos.
        </p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <ContactForm />
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p><strong>E-mail:</strong> contato@calculosonline.com.br</p>
        <p><strong>Tempo de resposta:</strong> até 2 dias úteis</p>
      </div>
    </main>
  )
}
```

```typescript
// apps/web/src/components/ContactForm.tsx
"use client"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  nome:     z.string().min(2, "Nome obrigatório"),
  email:    z.string().email("E-mail inválido"),
  assunto:  z.enum(["duvida", "sugestao", "erro", "outro"]),
  mensagem: z.string().min(20, "Mensagem deve ter pelo menos 20 caracteres"),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const [enviado, setEnviado] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // Implementar com Resend, SendGrid ou Formspree
    await fetch("/api/contato", { method: "POST", body: JSON.stringify(data) })
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="text-4xl" aria-hidden>✅</div>
        <p className="font-medium text-gray-900">Mensagem enviada!</p>
        <p className="text-sm text-gray-500">Responderemos em até 2 dias úteis.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {[
        { name: "nome",     label: "Nome",    type: "text",  placeholder: "Seu nome" },
        { name: "email",    label: "E-mail",  type: "email", placeholder: "seu@email.com" },
      ].map(({ name, label, type, placeholder }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type={type}
            {...register(name as keyof FormData)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors[name as keyof FormData] && (
            <p className="text-xs text-red-600 mt-1">{errors[name as keyof FormData]?.message as string}</p>
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
        <select {...register("assunto")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="duvida">Dúvida sobre cálculo</option>
          <option value="sugestao">Sugestão de calculadora</option>
          <option value="erro">Reportar erro</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
        <textarea
          {...register("mensagem")}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {errors.mensagem && <p className="text-xs text-red-600 mt-1">{errors.mensagem.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
      >
        {isSubmitting ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  )
}
```

---

## PARTE 2 — INTEGRAÇÃO ADSENSE

### TAREFA 3: Aplicar para AdSense

1. Acesse [adsense.google.com](https://adsense.google.com)
2. Clique em "Começar"
3. Informe `https://calculosonline.com.br`
4. Escolha o idioma principal: **Português (Brasil)**
5. Cole o snippet de verificação no `<head>` (próxima tarefa)

---

### TAREFA 4: Script de Verificação e Auto Ads

```typescript
// apps/web/src/components/AdSenseScript.tsx
// Componente server — adicionar ao layout.tsx

export function AdSenseScript() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  if (!publisherId || process.env.NODE_ENV !== "production") return null

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
    />
  )
}
```

```typescript
// apps/web/src/app/layout.tsx — adicionar <AdSenseScript> no <head>
import { AdSenseScript } from "@/components/AdSenseScript"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <AdSenseScript />
      </head>
      <body>...{children}</body>
    </html>
  )
}
```

---

### TAREFA 5: Configurar ads.txt

Após aprovação, o Google fornece o Publisher ID (formato: `ca-pub-XXXXXXXXXXXXXXXX`).

```
// apps/web/public/ads.txt
google.com, ca-pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

**Verificar que está acessível:**
```bash
curl https://calculosonline.com.br/ads.txt
# Deve retornar: google.com, ca-pub-...
```

---

### TAREFA 6: Unidades de Anúncio Manuais

Após aprovação, criar 3 unidades no painel AdSense:

| Unidade | Formato | Tamanho | Posição na Página |
|---------|---------|---------|-------------------|
| `calc-topo` | Banner responsivo | 728×90 desktop / 320×50 mobile | Acima do formulário |
| `calc-meio` | Retângulo responsivo | 336×280 desktop / 300×250 mobile | Entre resultado e conteúdo |
| `calc-base` | Retângulo responsivo | 336×280 | Fim da página |

**Atualizar o registro de calculadoras com os IDs dos slots:**

```typescript
// apps/web/src/data/calculadoras.ts — atualizar cada calculadora
{
  slug: "rescisao-trabalhista",
  // ...
  adSlotTop:    "1234567890",   // ID do slot calc-topo
  adSlotMid:    "0987654321",   // ID do slot calc-meio
  adSlotBottom: "1122334455",   // ID do slot calc-base
}
```

---

### TAREFA 7: AdSlot com Medição de Performance

```typescript
// packages/ui/src/AdSlot/index.tsx — versão com tracking de CLS

// Adicionar ao useEffect que pusha o ad:
useEffect(() => {
  if (!visivel) return
  const startTime = performance.now()

  try {
    ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
    ;(window as any).adsbygoogle.push({})

    // Reportar tempo de carregamento do ad ao GA4
    const loadTime = performance.now() - startTime
    ;(window as any).gtag?.("event", "ad_load", {
      ad_slot: slotId,
      load_time_ms: Math.round(loadTime),
      format,
    })
  } catch (_) {}
}, [visivel])
```

---

### TAREFA 8: Validação de Core Web Vitals com Ads

O principal risco dos ads é o **CLS (Cumulative Layout Shift)**. A implementação do `<AdSlot>` já reserva espaço, mas é necessário validar:

```typescript
// apps/web/src/components/CLSMonitor.tsx
"use client"
import { useEffect } from "react"

export function CLSMonitor() {
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as LayoutShift
        if (!layoutShift.hadRecentInput && layoutShift.value > 0.05) {
          console.warn("CLS detectado:", layoutShift.value, layoutShift.sources)
          ;(window as any).gtag?.("event", "cls_warning", {
            value: layoutShift.value,
            sources: layoutShift.sources?.map((s) => s.node?.nodeName).join(","),
          })
        }
      }
    })
    observer.observe({ type: "layout-shift", buffered: true })
    return () => observer.disconnect()
  }, [])

  return null
}
```

---

## PARTE 3 — OTIMIZAÇÃO DE RECEITA

### TAREFA 9: A/B Testing de Posição de Ads

Após 2 semanas com dados, testar variações de posicionamento:

```typescript
// apps/web/src/hooks/useAdVariant.ts
"use client"

// Divide usuários em grupos A/B baseado no userAgent hash
export function useAdVariant(): "A" | "B" {
  if (typeof window === "undefined") return "A"

  // Grupo estável por sessão (não muda na mesma visita)
  const stored = sessionStorage.getItem("ad_variant")
  if (stored === "A" || stored === "B") return stored

  const variant = Math.random() < 0.5 ? "A" : "B"
  sessionStorage.setItem("ad_variant", variant)

  // Reportar ao GA4 para segmentação
  ;(window as any).gtag?.("set", { "ad_variant": variant })

  return variant
}
```

**Variante A (controle):** 3 ads fixos (topo, meio, base)
**Variante B (teste):** 2 ads (topo removido, meio e base mantidos + âncora mobile)

---

### TAREFA 10: Âncora Mobile (Anchor Ad)

O formato âncora tem alto CTR em mobile sem prejudicar UX:

```typescript
// packages/ui/src/AdSlot/AnchorAd.tsx
"use client"
import { useEffect, useState } from "react"

export function AnchorAd({ slotId }: { slotId: string }) {
  const [mostrar, setMostrar] = useState(false)
  const [fechado, setFechado] = useState(false)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  useEffect(() => {
    // Mostrar âncora apenas em mobile após scroll de 500px
    const onScroll = () => {
      if (window.scrollY > 500) setMostrar(true)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (fechado || !mostrar || !publisherId) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200"
      style={{ height: 60 }}
      role="complementary"
      aria-label="Anúncio"
    >
      <button
        onClick={() => setFechado(true)}
        className="absolute -top-6 right-2 bg-gray-100 rounded-full w-6 h-6 text-xs text-gray-500 flex items-center justify-center"
        aria-label="Fechar anúncio"
      >
        ×
      </button>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", width: "100%", height: 60 }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
```

---

### TAREFA 11: Dashboard de Receita (Google Sheets)

Automatizar exportação de dados do AdSense para acompanhamento semanal:

```javascript
// Colar no Google Apps Script → criar trigger semanal (segunda-feira 8h)

const ADSENSE_ACCOUNT = "ca-pub-XXXXXXXXXXXXXXXX" // seu publisher ID
const SHEET_ID = "ID_DA_SUA_PLANILHA_GOOGLE"

function exportarDadosAdSense() {
  // Requer OAuth com escopo: https://www.googleapis.com/auth/adsense.readonly
  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - 7)

  const formato = (d) => Utilities.formatDate(d, "UTC", "yyyy-MM-dd")

  const url = `https://adsense.googleapis.com/v2/accounts/${ADSENSE_ACCOUNT}/reports:generate`
    + `?dateRange=LAST_7_DAYS`
    + `&metrics=ESTIMATED_EARNINGS&metrics=PAGE_VIEWS&metrics=PAGE_RPM`
    + `&metrics=IMPRESSIONS&metrics=CLICKS&metrics=COST_PER_CLICK`
    + `&dimensions=DATE`

  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
  })

  const data = JSON.parse(response.getContentText())
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("AdSense Semanal")

  // Adicionar linha com dados do dia
  if (data.rows) {
    data.rows.forEach((row) => {
      sheet.appendRow([
        new Date(),
        row.cells[0].value,   // data
        row.cells[1].value,   // receita
        row.cells[2].value,   // pageviews
        row.cells[3].value,   // RPM
        row.cells[4].value,   // impressões
        row.cells[5].value,   // cliques
        row.cells[6].value,   // CPC
      ])
    })
  }

  // Enviar resumo por e-mail
  const totalReceita = data.totals?.cells[1]?.value ?? "N/A"
  const totalPageviews = data.totals?.cells[2]?.value ?? "N/A"
  const rpm = data.totals?.cells[3]?.value ?? "N/A"

  MailApp.sendEmail({
    to: "SEU_EMAIL@gmail.com",
    subject: `📊 AdSense Semanal — R$ ${totalReceita}`,
    body: `Últimos 7 dias:\n\nReceita: R$ ${totalReceita}\nPageviews: ${totalPageviews}\nRPM: R$ ${rpm}\n\nVer planilha: https://docs.google.com/spreadsheets/d/${SHEET_ID}`,
  })
}
```

---

## PARTE 4 — MANUTENÇÃO PÓS-APROVAÇÃO

### TAREFA 12: Monitoramento de Políticas

O AdSense pode suspender a conta se as políticas forem violadas. Monitorar:

```typescript
// apps/web/src/app/layout.tsx — adicionar meta para conformidade
export const metadata: Metadata = {
  // Não usar robots: "noindex" em páginas com ads (violação de política)
  // Nunca incentivar cliques em ads (violação grave)
  other: {
    // Verificação da conta AdSense (substituir pelo valor real)
    "google-adsense-account": process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "",
  },
}
```

**Regras críticas do AdSense (não violar):**
- Nunca clicar nos próprios anúncios
- Nunca pedir para usuários clicarem ("Apoie o site clicando nos ads")
- Não colocar ads em páginas sem conteúdo
- Não colocar mais de 3 unidades de conteúdo por página
- Não colocar ads perto de botões de navegação (usuário clica por engano)

---

## CRITÉRIOS DE ACEITE

**Pré-aprovação:**
```bash
# Verificar pages com conteúdo suficiente (>500 palavras)
pnpm build
# Listar páginas geradas: ls .next/server/app/calculadora/
# Deve mostrar 20 slugs

# Verificar ads.txt
curl https://calculosonline.com.br/ads.txt
# Deve retornar: google.com, ca-pub-...
```

**Pós-aprovação:**
- [ ] Script AdSense carregando no `<head>` sem erros no console
- [ ] 3 unidades de anúncio visíveis nas páginas de calculadora
- [ ] `<AdSlot>` com altura reservada — CLS = 0 (verificar no Lighthouse)
- [ ] Áncora mobile aparece no scroll após 500px
- [ ] Dashboard Google Sheets com dados da semana anterior
- [ ] Alerta de e-mail semanal funcionando

**KPIs de lançamento (Mês 1 pós-AdSense):**
| Métrica | Meta mínima |
|---------|------------|
| RPM médio | ≥ R$10 |
| CTR anúncios | ≥ 1% |
| Receita/dia | ≥ R$5 (início) |
| CLS com ads | = 0 |
| LCP com ads | < 3s no mobile |

---

## CHECKLIST FINAL DA FASE 1

Com a Sprint 1.6 concluída, verificar o **Gate de entrada na Fase 2**:

- [ ] 20 calculadoras publicadas com conteúdo editorial
- [ ] Google Search Console: primeiras páginas indexadas
- [ ] AdSense aprovado e ativo com receita real
- [ ] App Android na Play Store (revisão aprovada)
- [ ] PWA com Lighthouse score ≥ 90
- [ ] Core Web Vitals: todos verdes no GSC
- [ ] Primeiros 15.000 pageviews orgânicos/mês atingidos

> **Próximo passo:** Sprint 2.1 — implementar as 30 calculadoras adicionais da Fase 2.
