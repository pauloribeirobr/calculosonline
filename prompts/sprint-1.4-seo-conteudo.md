# Prompt de IA — Sprint 1.4: SEO e Conteúdo Editorial
**calculosonline.com.br | Fase 1 — MVP | Semanas 5–8**

---

## PRÉ-REQUISITO

- Sprint 1.3 concluída: páginas Next.js com SSG, rotas e schema markup funcionando
- `content/calculadoras/` criada na raiz do monorepo

---

## OBJETIVO DA SPRINT 1.4

Criar o conteúdo editorial MDX para as 20 calculadoras e configurar SEO técnico completo:

1. **20 arquivos MDX** — 1.500+ palavras cada, com FAQ e base legal
2. **SEO técnico** — sitemap, canonical, hreflang, Core Web Vitals
3. **Integração MDX** no Next.js App Router com renderização server-side
4. **FAQ Schema** dinâmico gerado a partir do frontmatter MDX

---

## TAREFA 1: Configurar MDX no Next.js

```bash
# Instalar dependências
pnpm --filter web add @next/mdx @mdx-js/loader @mdx-js/react remark-gfm rehype-slug rehype-autolink-headings
```

```typescript
// apps/web/next.config.ts
import createMDX from "@next/mdx"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
})

const nextConfig = withMDX({
  pageExtensions: ["ts", "tsx", "md", "mdx"],
})

export default nextConfig
```

### ContentLoader — carrega MDX dinamicamente

```typescript
// apps/web/src/components/ContentLoader.tsx
import { Suspense } from "react"

// Importação dinâmica do conteúdo MDX por slug
async function loadContent(slug: string) {
  try {
    const Content = (await import(`../../content/calculadoras/${slug}.mdx`)).default
    return <Content />
  } catch {
    return (
      <p className="text-gray-500 text-sm italic">
        Conteúdo detalhado em breve.
      </p>
    )
  }
}

export async function ContentLoader({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-xl" />}>
      {await loadContent(slug)}
    </Suspense>
  )
}
```

---

## TAREFA 2: Estrutura Padrão dos Arquivos MDX

Cada arquivo MDX em `content/calculadoras/[slug].mdx` deve seguir esta estrutura:

```mdx
---
titulo: "Calculadora de Rescisão Trabalhista Online e Gratuita 2026"
descricao: "Calcule rescisão com precisão: saldo de salário, aviso prévio, férias, 13º e multa FGTS."
dataAtualizacao: "2026-01-01"
faq:
  - pergunta: "O que é rescisão trabalhista?"
    resposta: "É o encerramento do contrato de trabalho..."
  - pergunta: "Quais verbas são devidas na demissão sem justa causa?"
    resposta: "Saldo de salário, aviso prévio indenizado (30 dias + 3 dias por ano), férias vencidas..."
  - pergunta: "Qual é o prazo para pagamento das verbas rescisórias?"
    resposta: "10 dias corridos a partir do término do contrato (CLT art. 477, §6º)."
---

## O que é rescisão trabalhista?

A rescisão trabalhista é o encerramento formal do vínculo empregatício entre empregado e
empregador, regida pelos **arts. 477 a 487 da CLT**. As verbas devidas variam conforme
o motivo da rescisão.

## Quais verbas são devidas por motivo?

| Verba | Sem Justa Causa | Justa Causa | Pedido de Demissão | Acordo Mútuo |
|-------|:--------------:|:-----------:|:------------------:|:------------:|
| Saldo de Salário | ✅ | ✅ | ✅ | ✅ |
| Aviso Prévio | ✅ indenizado | ❌ | ✅ trabalhado | 15 dias |
| Férias Proporcionais + 1/3 | ✅ | ❌ | ✅ | ✅ |
| 13º Proporcional | ✅ | ❌ | ✅ | ✅ |
| Multa FGTS 40% | ✅ | ❌ | ❌ | 20% |

## Como calcular o aviso prévio?

Desde a **Lei 12.506/2011**, o aviso prévio é proporcional ao tempo de serviço:

- **Até 1 ano:** 30 dias
- **A cada ano adicional:** + 3 dias
- **Limite máximo:** 90 dias

**Exemplo:** Empregado com 5 anos de empresa → 30 + (5 × 3) = **45 dias de aviso prévio**.

## Como calcular férias proporcionais na rescisão?

A fórmula é: **(Salário ÷ 12) × meses trabalhados × (1 + 1/3)**

O acréscimo de **1/3** é garantido pela CF/88, art. 7º, XVII, e incide sobre férias vencidas
e proporcionais na rescisão, independentemente do motivo.

## Quanto tempo o empregador tem para pagar?

O art. 477, §6º da CLT determina **10 dias corridos** a partir do término do contrato.
O descumprimento gera multa de 1 salário mínimo em favor do empregado.

## FAQ

<FAQ items={frontmatter.faq} />
```

---

## TAREFA 3: Componente FAQ com Schema

```typescript
// apps/web/src/components/FAQ.tsx
interface FAQItem { pergunta: string; resposta: string }

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <section aria-label="Perguntas frequentes">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
      <dl className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <dt>
              <details className="group">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none font-medium text-gray-900 hover:bg-gray-50">
                  {item.pergunta}
                  <span className="ml-4 text-brand-600 group-open:rotate-180 transition-transform" aria-hidden>▼</span>
                </summary>
                <dd className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                  {item.resposta}
                </dd>
              </details>
            </dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
```

---

## TAREFA 4: Conteúdo Editorial das 20 Calculadoras

Crie os 20 arquivos abaixo. Cada um deve ter **mínimo 1.500 palavras** com conteúdo original.

### Guia de Conteúdo por Calculadora

---

#### `content/calculadoras/rescisao-trabalhista.mdx`
**Seções obrigatórias:**
1. O que é rescisão trabalhista
2. Tabela: verbas por motivo (matriz completa)
3. Como calcular aviso prévio proporcional (Lei 12.506/2011)
4. Como calcular férias proporcionais na rescisão
5. Como calcular 13º proporcional na rescisão
6. Multa FGTS: 40% vs 20% (acordo mútuo)
7. Prazo para pagamento (CLT art. 477, §6º)
8. Acordo Mútuo: o que mudou com a Reforma Trabalhista 2017
9. FAQ (5 perguntas com Schema)

---

#### `content/calculadoras/ferias.mdx`
**Seções:**
1. Período aquisitivo de férias (CLT art. 130)
2. Como as faltas reduzem os dias de férias (tabela de 4 faixas)
3. Adicional de 1/3 constitucional (CF/88 art. 7º, XVII)
4. Abono pecuniário: como funciona, quando vale a pena
5. Férias em dobro: quando o empregador deve pagar
6. Férias coletivas vs. individuais
7. Concessão parcelada de férias (Reforma Trabalhista 2017)
8. FAQ (5 perguntas)

---

#### `content/calculadoras/decimo-terceiro.mdx`
**Seções:**
1. O que é o 13º salário (gratificação natalina)
2. Como calcular proporcional (regra dos 15 dias)
3. Prazos: 1ª parcela (30/nov) e 2ª parcela (20/dez)
4. INSS e IRRF no 13º — como são calculados
5. 13º no primeiro emprego e na rescisão
6. 13º para autônomos e MEI (não é obrigatório — explicar diferença)
7. FAQ

---

#### `content/calculadoras/hora-extra.mdx`
**Seções:**
1. O que é hora extra e quando é permitida (CLT art. 59)
2. Percentuais mínimos: 50% (útil) e 100% (domingo/feriado)
3. Como calcular: fórmula passo a passo
4. Jornada 44h vs 40h vs 36h — como afeta o valor da hora
5. Banco de horas: vantagens e regras (lei vs. ACT/CCT)
6. Horas extras na rescisão
7. FAQ

---

#### `content/calculadoras/fgts.mdx`
**Seções:**
1. O que é o FGTS e por que existe
2. Como é calculado: 8% sobre remuneração bruta
3. Multa rescisória 40% vs 20% (acordo mútuo)
4. Saque-aniversário: tabela de alíquotas, prós e contras
5. Quando o trabalhador pode sacar o FGTS
6. FGTS inativo vs. ativo
7. FAQ

---

#### `content/calculadoras/salario-liquido.mdx`
**Seções:**
1. Diferença: salário bruto vs. líquido vs. CTC
2. Passo a passo: como chegar ao salário líquido
3. INSS progressivo 2026: tabela e exemplos
4. IRRF 2026: tabela, deduções por dependentes
5. Vale-transporte: desconto máximo de 6%
6. Outros descontos comuns (plano de saúde, alimentação)
7. FAQ

---

#### `content/calculadoras/inss.mdx`
**Seções:**
1. O que é o INSS e para que serve
2. Tabela progressiva INSS 2026 (faixas e alíquotas)
3. Empregado vs. autônomo vs. MEI: diferenças
4. Teto de contribuição INSS 2026 (R$8.157,41)
5. INSS e aposentadoria: como os anos contam
6. Alíquota efetiva vs. alíquota nominal
7. FAQ

---

#### `content/calculadoras/irrf.mdx`
**Seções:**
1. O que é IRRF (diferença de IRPF)
2. Tabela IRRF 2026 com exemplos práticos
3. Deduções: dependentes, pensão, previdência
4. Quem é isento em 2026 (até R$2.428,80)
5. IRRF em férias e 13º salário
6. Como recuperar IRRF na declaração anual
7. FAQ

---

#### `content/calculadoras/irpf.mdx`
**Seções:**
1. Quem é obrigado a declarar em 2026
2. Simplificado vs. completo: quando cada um vale
3. Deduções legais: médico, educação, dependentes
4. Tabela IRPF 2026 (anual)
5. Restituição: por que uns recebem mais
6. Prazo e multa por atraso
7. FAQ

---

#### `content/calculadoras/das-mei.mdx`
**Seções:**
1. O que é MEI e quem pode ser
2. Limite de faturamento MEI 2026 (R$81.000/ano)
3. Composição do DAS: INSS + ICMS/ISS
4. Categorias: comércio, indústria, serviço
5. Benefícios previdenciários do MEI (aposentadoria, auxílio-doença)
6. Quando migrar do MEI para ME
7. FAQ

---

#### `content/calculadoras/juros-compostos.mdx`
**Seções:**
1. Juros simples vs. compostos (diferença fundamental)
2. Fórmula: M = P(1+i)^n
3. Taxa mensal vs. anual (como converter)
4. O poder dos aportes mensais (exemplos com tabela)
5. Regra do 72: quanto tempo para dobrar o capital
6. Juros compostos em dívidas (o lado negativo)
7. FAQ

---

#### `content/calculadoras/porcentagem.mdx`
**Seções:**
1. Os 6 tipos de cálculo de porcentagem
2. Porcentagem no dia a dia: desconto, gorjeta, aumento
3. Variação percentual: como calcular alta e queda
4. Markup vs. margem: a confusão clássica
5. Porcentagem em questões ENEM/concursos (exemplos)
6. FAQ

---

#### `content/calculadoras/emprestimo.mdx`
**Seções:**
1. Tabela Price vs. SAC vs. SAM: diferenças
2. CET (Custo Efetivo Total): o que inclui
3. Como comparar empréstimos: o que importa
4. Juros rotativos do cartão vs. empréstimo pessoal
5. Consignado: vantagens e limitações
6. Como quitar antecipado e economizar
7. FAQ

---

#### `content/calculadoras/financiamento.mdx`
**Seções:**
1. Financiamento imobiliário: Price vs. SAC (qual escolher)
2. Financiamento de veículo: CDC vs. leasing
3. Entrada e o impacto nos juros totais
4. FGTS na amortização do financiamento imobiliário
5. Portabilidade de crédito imobiliário
6. FAQ

---

#### `content/calculadoras/cdb.mdx`
**Seções:**
1. O que é CDB (Certificado de Depósito Bancário)
2. Prefixado vs. CDI vs. IPCA+: qual escolher
3. IR regressivo: tabela e estratégia de prazo
4. IOF nos primeiros 29 dias
5. Garantia FGC (até R$250.000)
6. CDB vs. Poupança vs. Tesouro Direto (comparativo)
7. FAQ

---

#### `content/calculadoras/poupanca.mdx`
**Seções:**
1. Como a poupança funciona hoje (regra dos 70%)
2. Rendimento 2026: 0,5%/mês + TR (Selic > 8,5%)
3. Poupança é isenta de IR — vantagem real?
4. Aniversário da poupança: como funciona
5. Poupança vs. CDB 100% CDI: comparativo objetivo
6. FAQ

---

#### `content/calculadoras/tesouro-direto.mdx`
**Seções:**
1. O que é Tesouro Direto e quem pode investir
2. Tipos: Selic, Prefixado, IPCA+ (diferenças)
3. Taxa de custódia B3 (0,20% a.a.)
4. IR regressivo: estratégia para minimizar imposto
5. Resgate antecipado: como funciona o preço de mercado
6. Tesouro Selic vs. CDB: quando cada um é melhor
7. FAQ

---

#### `content/calculadoras/imc.mdx`
**Seções:**
1. O que é IMC e como foi criado (Adolphe Quetelet)
2. Tabela de classificação OMS (8 categorias)
3. Limitações do IMC (não diferencia massa gorda de muscular)
4. IMC ideal para adultos, idosos e crianças (diferenças)
5. Como calcular o peso ideal pelo IMC
6. IMC e riscos de saúde associados
7. FAQ

---

#### `content/calculadoras/calorias.mdx`
**Seções:**
1. O que é TMB (Taxa Metabólica Basal) e TDEE
2. Fórmula Mifflin-St Jeor vs. Harris-Benedict
3. Nível de atividade: como classificar corretamente
4. Déficit calórico para perda de peso (500 kcal/dia = 500g/semana)
5. Superávit para ganho de massa muscular
6. Macronutrientes: proteínas, carboidratos, gorduras
7. FAQ

---

#### `content/calculadoras/margem-lucro.mdx`
**Seções:**
1. Diferença entre margem de lucro e markup
2. Como precificar corretamente (passo a passo)
3. Margem bruta vs. margem líquida vs. margem operacional
4. Erros comuns na precificação de serviços
5. Ponto de equilíbrio (breakeven)
6. Precificação para MEI e pequenas empresas
7. FAQ

---

## TAREFA 5: SEO Técnico

### next-sitemap

```bash
pnpm --filter web add next-sitemap
```

```javascript
// apps/web/next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://calculosonline.com.br",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.8,
  sitemapSize: 5000,
  exclude: ["/api/*", "/admin/*"],
  additionalPaths: async (config) => {
    // Calculadoras têm prioridade máxima
    const calculadoras = require("./src/data/calculadoras").CALCULADORAS
    return calculadoras.map((c) => ({
      loc: `/calculadora/${c.slug}`,
      changefreq: "monthly",
      priority: 0.9,
      lastmod: c.dataAtualizacao,
    }))
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/_next/"] },
    ],
    additionalSitemaps: ["https://calculosonline.com.br/sitemap.xml"],
  },
}
```

### IndexNow (indexação rápida Bing/Yandex)

```typescript
// apps/web/src/app/api/indexnow/route.ts
// Endpoint para submeter URLs ao IndexNow após publicação de nova calculadora

export async function POST(req: Request) {
  const { urls } = await req.json() as { urls: string[] }
  const key = process.env.INDEXNOW_KEY

  if (!key) return Response.json({ error: "No key" }, { status: 500 })

  await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: "calculosonline.com.br",
      key,
      keyLocation: `https://calculosonline.com.br/${key}.txt`,
      urlList: urls,
    }),
  })

  return Response.json({ ok: true })
}
```

### Core Web Vitals — checklist de implementação

```typescript
// apps/web/src/app/layout.tsx — adicionar Web Vitals reporting
"use client"
import { useReportWebVitals } from "next/web-vitals"

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Enviar para GA4
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", metric.name, {
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })
  return null
}
```

---

## TAREFA 6: Verificações SEO Técnico

### Checklist por página (verificar com `View Source`)

- [ ] `<title>` único em cada página (máx 60 chars)
- [ ] `<meta name="description">` único (máx 155 chars)
- [ ] `<link rel="canonical">` apontando para URL sem trailing slash
- [ ] `<meta property="og:*">` preenchidos
- [ ] `<html lang="pt-BR">` no elemento raiz
- [ ] Apenas 1 `<h1>` por página
- [ ] Imagens com `alt` descritivo
- [ ] JSON-LD no `<head>` com WebApplication + FAQPage + BreadcrumbList

### Checklist de performance

- [ ] Fontes com `display: swap` (configurado nas Next Fonts)
- [ ] Nenhuma imagem sem `width` e `height` (CLS = 0)
- [ ] Script AdSense com `async` e sem bloquear rendering
- [ ] `<AdSlot>` com altura reservada antes de carregar (CLS = 0)
- [ ] Executar Lighthouse: Performance > 90, SEO > 95

### Submissão ao Google

- [ ] Verificar domínio no Google Search Console (DNS TXT record)
- [ ] Submeter `https://calculosonline.com.br/sitemap.xml`
- [ ] Solicitar indexação das 5 páginas mais importantes manualmente (URL Inspection)
- [ ] Criar arquivo `{INDEXNOW_KEY}.txt` em `/public/` com a chave

---

## CRITÉRIOS DE ACEITE

```bash
# Build gera sitemap.xml
pnpm build
ls apps/web/public/sitemap*.xml  # deve existir

# Verificar que MDX renderiza
curl https://calculosonline.com.br/calculadora/rescisao-trabalhista | grep "período aquisitivo"
```

**Checklist final:**
- [ ] 20 arquivos MDX criados em `content/calculadoras/`
- [ ] Cada arquivo com ≥ 1.500 palavras de conteúdo original
- [ ] FAQ com mínimo 5 perguntas por arquivo
- [ ] `sitemap.xml` gerado com todas as URLs e `lastmod`
- [ ] `robots.txt` bloqueando apenas `/api/` e `/_next/`
- [ ] JSON-LD FAQPage gerado dinamicamente a partir do frontmatter

> **Próximo passo:** Sprint 1.5 — configurar PWA e TWA Android.
