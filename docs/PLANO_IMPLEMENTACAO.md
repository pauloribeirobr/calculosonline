# PLANO DE IMPLEMENTAÇÃO — calculosonline.com.br

> Baseado no Plano de Negócios (Março 2026)
> Estrutura: Fases → Sprints → Checklists → Retroalimentação

---

## REFERÊNCIA DE IDENTIDADE VISUAL

A identidade visual e a maior parte dos componentes UI são **herdados do projeto irmão Recibo Fácil** (`/home/paulo/projects/next/recibofacil`), que já está em produção e com sistema visual maduro.

Detalhes completos em [`IDENTIDADE_VISUAL.md`](./IDENTIDADE_VISUAL.md), incluindo:
- Mapa de equivalência Recibo Fácil → Calculos Online
- Tokens (cores, tipografia, sombras, bordas)
- Dependências NPM herdadas (`@heroicons/react`, `@headlessui/react`, `@fontsource-variable/inter`, etc.)
- Estrutura de pastas espelhada (`app/(marketing)`, `components/{common,home,calculator,seo,analytics}`)
- Ordem de cópia recomendada para a Sprint 1.2
- Componentes específicos do Recibo Fácil que **não** devem ser portados

**Impacto no cronograma:** Sprint 1.2 reduz de 10 para 6 dias de UI (apenas adaptação dos componentes existentes + criação dos específicos de calculadora).

---

## VISÃO GERAL DAS FASES

```
FASE 0: Fundação          (Semanas 1–2)   → Setup técnico e core engine
FASE 1: MVP Lançamento    (Semanas 3–8)   → 20 calculadoras + SEO + AdSense
FASE 2: Expansão          (Semanas 9–24)  → 50 calc + multiplataforma + diversificação
FASE 3: Consolidação      (Semanas 25–52) → 100+ calc + API + liderança de nicho
```

---

## FASE 0 — FUNDAÇÃO
### Semanas 1–2 | Objetivo: Infraestrutura pronta para desenvolvimento

---

### Sprint 0.1 — Setup do Projeto (Dias 1–4)

#### Checklist: Repositório e Monorepo
- [ ] Criar repositório Git (GitHub/GitLab)
- [ ] Inicializar monorepo com **Turborepo**
- [ ] Configurar estrutura de pastas:
  ```
  calculosonline/
  ├── packages/core/
  ├── packages/ui/
  ├── apps/web/
  ├── apps/android/
  ├── apps/desktop/
  ├── apps/sheets-plugin/
  └── content/
  ```
- [ ] Configurar TypeScript (tsconfig base compartilhado)
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Vitest para testes unitários
- [ ] `.env.example` com variáveis de ambiente documentadas

#### Checklist: Infraestrutura
- [ ] Registrar domínio **calculosonline.com.br** (R$40)
- [ ] Criar conta Vercel e conectar ao repositório
- [ ] Configurar Cloudflare (DNS + CDN gratuito)
- [ ] Criar conta Google Analytics 4
- [ ] Criar conta Google Search Console e verificar domínio
- [ ] Configurar `ads.txt` no domínio raiz

#### Checklist: Next.js (apps/web)
- [ ] Criar app Next.js 14+ com App Router
- [ ] Configurar SSG para páginas de calculadoras (`generateStaticParams`)
- [ ] Configurar ISR (revalidation) para tabelas legislativas (revalidar a cada 24h)
- [ ] Configurar `next-sitemap` para geração automática do sitemap.xml
- [ ] Configurar Open Graph e meta tags padrão
- [ ] Instalar e configurar Tailwind CSS

---

### Sprint 0.2 — Core Engine TypeScript (Dias 5–10)

#### Checklist: Arquitetura do packages/core
- [ ] Estrutura de pastas:
  ```
  packages/core/src/
  ├── trabalhista/
  ├── impostos/
  ├── financeiro/
  ├── investimentos/
  ├── saude/
  ├── negocios/
  ├── tabelas/        ← tabelas INSS, IRRF, SM atualizadas
  └── utils/
  ```
- [ ] Definir interfaces TypeScript para inputs/outputs de cada calculadora
- [ ] Implementar sistema de **tabelas versionadas** (INSS, IRRF, Salário Mínimo com data de vigência)
- [ ] Cada função retorna `{ resultado, detalhamento[], baseCalculo, fonteJuridica }`
- [ ] 100% cobertura de testes unitários nas funções do core

#### Checklist: 5 Calculadoras Trabalhistas Prioritárias (Core)
- [ ] `calcularRescisao(params)` — CLT arts. 477-487
- [ ] `calcularFerias(params)` — CLT arts. 129-153
- [ ] `calcularDecimoTerceiro(params)` — Lei 4.090/62
- [ ] `calcularHoraExtra(params)` — CLT art. 59
- [ ] `calcularSalarioLiquido(params)` — INSS + IRRF + descontos

#### Checklist: Tabelas Legislativas (dados iniciais)
- [ ] Tabela INSS 2026 (faixas e alíquotas)
- [ ] Tabela IRRF 2026 (faixas, alíquotas, deduções)
- [ ] Salário Mínimo 2026 (R$1.518)
- [ ] Piso regional por estado (principais estados)
- [ ] Testes de validação cruzada com calculadoras concorrentes

---

## FASE 1 — MVP LANÇAMENTO
### Semanas 3–12 | Objetivo: 20 calculadoras indexadas + primeiro AdSense

---

### Sprint 1.1 — Calculadoras Core (Semanas 3–4)

#### Checklist: Completar 20 Calculadoras no Core Engine

**Trabalhistas (6):**
- [ ] Rescisão Trabalhista ✓ (fase 0)
- [ ] Férias ✓ (fase 0)
- [ ] 13º Salário ✓ (fase 0)
- [ ] Hora Extra ✓ (fase 0)
- [ ] Salário Líquido ✓ (fase 0)
- [ ] `calcularFGTS(params)` — Lei 8.036/90

**Impostos (4):**
- [ ] `calcularIRPF(params)` — Declaração anual
- [ ] `calcularIRRF(params)` — Retenção na fonte
- [ ] `calcularINSS(params)` — Contribuição mensal
- [ ] `calcularDASMEI(params)` — Lei Complementar 123/06

**Financeiras (4):**
- [ ] `calcularJurosCompostos(params)`
- [ ] `calcularPorcentagem(params)`
- [ ] `calcularEmprestimo(params)` — Tabela Price e SAC
- [ ] `calcularFinanciamento(params)` — Tabela Price e SAC

**Investimentos (3):**
- [ ] `calcularCDB(params)` — CDI, prefixado, IPCA+
- [ ] `calcularPoupanca(params)` — TR, regras vigentes
- [ ] `calcularTesouroDireto(params)` — tipos disponíveis

**Saúde (2):**
- [ ] `calcularIMC(params)` — tabela OMS
- [ ] `calcularCalorias(params)` — Harris-Benedict / Mifflin

**Negócios (1):**
- [ ] `calcularMargemLucro(params)`

---

### Sprint 1.2 — UI Components (Semanas 3–4, paralelo)

> **Estratégia:** Esta sprint reaproveita ~70% do sistema visual do **Recibo Fácil**.
> Ver [`IDENTIDADE_VISUAL.md`](./IDENTIDADE_VISUAL.md) para mapa completo de equivalência e ordem de cópia.

#### Checklist: Fundação visual (Dia 1) — copiar do Recibo Fácil
- [ ] `globals.css` (sem regras de impressão A4) + Inter Variable + classes `.prose`
- [ ] `tailwind.config.ts` com tokens `brand.*`, `result.*`, `text-result-{lg,md}`
- [ ] Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`
- [ ] `Logo.tsx` (criar SVG novo do calculosonline)
- [ ] Componentes comuns: `Button`, `Input` (com máscaras CPF/CNPJ/CEP/currency), `Modal`, `Loading`, `Breadcrumbs`, `ScrollToTop`

#### Checklist: Layout principal (Dia 2) — adaptar do Recibo Fácil
- [ ] `Header.tsx` + `Navigation.tsx` — trocar links de documentos por categorias de calculadoras
- [ ] `Footer.tsx` — 5 colunas: Trabalhistas, Impostos, Financeiras, Investimentos, Institucional
- [ ] `app/layout.tsx` raiz com `ClientProviders`, analytics e JsonLd globais

#### Checklist: Home page (Dia 3-4) — adaptar do Recibo Fácil
- [ ] `Hero.tsx` + `CalculatorStack` (substitui `DocumentStack` com 5 mockups: Rescisão, IRPF, Juros Compostos, IMC, FGTS)
- [ ] `CalculatorTypes.tsx` (adaptado de `DocumentTypes.tsx`) — featured + grid completo
- [ ] `HowItWorks.tsx`, `Features.tsx`, `Stats.tsx`, `Testimonials.tsx`, `FAQ.tsx`, `FinalCta.tsx`, `SeoContent.tsx`

#### Checklist: Componentes específicos de calculadora (Dia 5) — novos
- [ ] `<CalculatorForm />` — genérico com schema Zod + React Hook Form
- [ ] `<CalculatorResult />` — exibe resultado em destaque + detalhamento accordion
- [ ] `<CalculatorLayout />` — layout padrão com 3 áreas de ad (top/mid/bottom)
- [ ] `<AdSlot />` — wrapper lazy-loaded para unidades AdSense
- [ ] `<RelatedCalculators />` — links internos automáticos por categoria
- [ ] `<LegalBadge />` — exibe a base legal (ex: "CLT Art. 477")
- [ ] `<UpdatedBadge />` — exibe a data da última atualização das tabelas

#### Checklist: SEO e analytics (Dia 6) — copiar do Recibo Fácil
- [ ] `seo/PageSeo.tsx`, `seo/JsonLd.tsx` (Website, Organization, FAQ, WebApplication, ItemList, BreadcrumbList)
- [ ] `analytics/MicrosoftClarity.tsx`, `analytics/ErrorLogger.tsx`
- [ ] Responsividade conferida: mobile-first (375px → 1440px)

---

### Sprint 1.3 — Páginas Web (Semanas 5–6)

#### Checklist: Estrutura de Páginas Next.js

**Roteamento:**
- [ ] `/` — Homepage com categorias, destaques e busca
- [ ] `/calculadora/[slug]` — página dinâmica para cada calculadora
- [ ] `/categoria/[categoria]` — listagem por categoria
- [ ] `/blog/[slug]` — artigos editoriais (MDX)
- [ ] `/sitemap.xml` — geração automática
- [ ] `/robots.txt` — configurado corretamente
- [ ] `/ads.txt` — publisher ID do AdSense

**Página de Calculadora (/calculadora/[slug]):**
- [ ] H1: "Calculadora de [Nome] Online e Gratuita"
- [ ] Ferramenta interativa acima do fold
- [ ] `<AdSlot>` antes do formulário (banner 728x90 desktop / 320x50 mobile)
- [ ] Resultado + detalhamento
- [ ] `<AdSlot>` entre resultado e conteúdo editorial
- [ ] Conteúdo editorial 1.500+ palavras (MDX)
- [ ] FAQ com schema FAQPage
- [ ] `<AdSlot>` ao final da página
- [ ] Calculadoras relacionadas
- [ ] Breadcrumb com schema BreadcrumbList
- [ ] Schema WebApplication
- [ ] Schema HowTo

**Homepage:**
- [ ] Hero com busca por calculadora
- [ ] Grid de categorias
- [ ] Top 6 calculadoras mais acessadas
- [ ] Banner de "Plataforma mais precisa do Brasil" com selos

---

### Sprint 1.4 — SEO e Conteúdo Editorial (Semanas 5–8)

#### Checklist: Conteúdo das 20 Calculadoras

Para cada calculadora, criar em `content/calculadoras/[slug].mdx`:
- [ ] Rescisão Trabalhista — guia completo
- [ ] Férias — como funciona, 1/3 constitucional, etc.
- [ ] 13º Salário — cálculo proporcional, descontos
- [ ] Hora Extra — percentuais, banco de horas
- [ ] FGTS — multa rescisória, saque-aniversário
- [ ] Salário Líquido — passo a passo INSS → IRRF
- [ ] IRPF — deduções, declaração simplificada vs. completa
- [ ] IRRF — tabela progressiva, dependentes
- [ ] INSS — faixas 2026, teto
- [ ] DAS MEI — limites, categorias
- [ ] Juros Compostos — juros sobre juros, montante
- [ ] Porcentagem — tipos de cálculo, exemplos
- [ ] Empréstimo — Price vs. SAC, CET
- [ ] Financiamento — imóvel, veículo
- [ ] CDB — prefixado, CDI, IPCA+, IR regressivo
- [ ] Poupança — regra dos 70%, nova poupança
- [ ] Tesouro Direto — tipos, tributação
- [ ] IMC — categorias OMS, riscos
- [ ] Calorias — TDEE, déficit/superávit
- [ ] Margem de Lucro — markup vs. margem, breakeven

#### Checklist: SEO Técnico
- [ ] `sitemap.xml` com todas as URLs gerado automaticamente
- [ ] `robots.txt` otimizado (bloquear /api/, /admin/)
- [ ] Canonical tags em todas as páginas
- [ ] Hreflang pt-BR
- [ ] Open Graph tags + Twitter Cards
- [ ] Core Web Vitals verificados (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Imagens com `next/image` (WebP, lazy load, width/height definidos)
- [ ] Fontes com `font-display: swap`
- [ ] Submeter sitemap no Google Search Console
- [ ] Ativar IndexNow (Bing/Yandex para indexação rápida)

---

### Sprint 1.5 — PWA e Android (Semanas 5–6)

#### Checklist: PWA (apps/web)
- [ ] `manifest.json` com ícones (192px, 512px), name, theme_color
- [ ] Service Worker com Workbox (cache-first para assets, network-first para dados)
- [ ] Splash screen para iOS e Android
- [ ] Instalação via banner "Adicionar à tela inicial"
- [ ] Funcionalidade offline: últimas 5 calculadoras usadas ficam disponíveis
- [ ] Testar Lighthouse PWA score > 90

#### Checklist: TWA Android (apps/android)
- [ ] Instalar `bubblewrap` CLI
- [ ] Configurar `twa-manifest.json` com URL do site
- [ ] Gerar assinatura digital (keystore)
- [ ] Verificar `/.well-known/assetlinks.json` no domínio
- [ ] Build APK/AAB
- [ ] Criar conta Google Play (R$130, one-time)
- [ ] Criar listing na Play Store (screenshots, descrição, categorias)
- [ ] Submeter para revisão (1-3 dias)

---

### Sprint 1.6 — AdSense (Semanas 10–12)

#### Checklist: Aprovação AdSense
- [ ] Verificar requisitos: 15+ páginas com conteúdo original, política de privacidade, sobre nós
- [ ] Criar página `/privacidade` (política de privacidade com dados AdSense)
- [ ] Criar página `/sobre`
- [ ] Criar página `/contato`
- [ ] Aplicar para conta AdSense
- [ ] Aguardar aprovação (3-14 dias)
- [ ] Configurar Auto Ads + unidades manuais
- [ ] Implementar lazy loading de anúncios
- [ ] Configurar `ads.txt` com Publisher ID
- [ ] Verificar que anúncios não prejudicam Core Web Vitals

---

## FASE 2 — EXPANSÃO
### Semanas 9–24 | Objetivo: 50 calculadoras + Desktop + Plugin Sheets + R$3.000/mês

---

### Sprint 2.1 — +30 Calculadoras (Semanas 9–20, contínuo)

#### Checklist: Imobiliário (6)
- [ ] Financiamento Imobiliário (Price/SAC/SAM)
- [ ] FIPE — consulta integrada
- [ ] Aluguel — índices IGPM/IPCA, reajuste
- [ ] IPTU estimado por município
- [ ] Yield imobiliário
- [ ] Corretagem imobiliária

#### Checklist: Tributário Empresarial (5)
- [ ] Simples Nacional — faixas e alíquotas por atividade
- [ ] Lucro Presumido
- [ ] PIS/COFINS
- [ ] ISS por município
- [ ] Pró-labore × salário

#### Checklist: Investimentos Avançados (5)
- [ ] Fundos Imobiliários (FII) — rendimento, yield
- [ ] Consignado — prestação, custo total
- [ ] Aposentadoria — INSS, tempo de contribuição
- [ ] Previdência Privada (PGBL/VGBL)
- [ ] Inflação / Poder de Compra

#### Checklist: Negócios (5)
- [ ] Markup / Preço de Venda
- [ ] ROI / Payback
- [ ] Breakeven / Ponto de Equilíbrio
- [ ] Precificação para Freelancers
- [ ] Participação nos Lucros (PLR)

#### Checklist: Conversões (5)
- [ ] Unidades (comprimento, peso, volume, temperatura)
- [ ] Moedas (cotação em tempo real via API pública)
- [ ] Salário: hora → mês → ano
- [ ] Horas de trabalho
- [ ] Combustível (km/L, custo por km)

#### Checklist: Dia a Dia (4)
- [ ] Gorjeta
- [ ] Divisão de conta
- [ ] Combustível × transporte público
- [ ] Churrasco (quantidade de carne por pessoa)

---

### Sprint 2.2 — Desktop com Tauri (Semanas 13–15)

#### Checklist: apps/desktop (Tauri)
- [ ] Instalar Tauri CLI e Rust toolchain
- [ ] Configurar `tauri.conf.json` apontando para o front-end Next.js (build estático)
- [ ] Configurar janela: dimensões mínimas, ícone, título
- [ ] Build para Windows (.exe installer / .msi)
- [ ] Build para Linux (.AppImage / .deb)
- [ ] Build para macOS (.dmg) — requer assinatura Apple (futuro)
- [ ] CI/CD: GitHub Actions para build automático em tag
- [ ] Página de download no site com detecção de OS
- [ ] Publicar no GitHub Releases

---

### Sprint 2.3 — Plugin Google Sheets (Semanas 16–20)

#### Checklist: apps/sheets-plugin
- [ ] Compilar core engine para Google Apps Script (clasp + webpack)
- [ ] Implementar funções customizadas expostas como fórmulas:
  - [ ] `=CALCRESCISAO(salario; meses; motivo)`
  - [ ] `=CALCINSS(salario)`
  - [ ] `=CALCIRRF(salario; dependentes)`
  - [ ] `=CALCFERIAS(salario; diasGozados)`
  - [ ] `=CALCDECIMOTERCEIRO(salario; mesesTrabalhados)`
  - [ ] `=CALCJUROS(principal; taxa; periodo; tipo)`
- [ ] Criar sidebar HTML com UI completa (reutiliza packages/ui)
- [ ] Menu "Calculadoras Online" no Google Sheets
- [ ] Publicar no Google Workspace Marketplace (gratuito)
- [ ] Criar página `/plugin-google-sheets` no site com instruções
- [ ] Documentação das fórmulas

---

### Sprint 2.4 — Header Bidding e Diversificação de Receita (Semanas 20–24)

#### Checklist: Header Bidding (ao atingir 100K pageviews/mês)
- [ ] Avaliar Google Ad Manager (GAM) — grátis até 90M impressões/mês
- [ ] Implementar Prebid.js com SSPs parceiros
- [ ] A/B test: AdSense puro vs. Header Bidding
- [ ] Monitorar RPM antes/depois da mudança

#### Checklist: Afiliados
- [ ] Cadastro em programas de afiliados:
  - [ ] Nubank / Nu Invest
  - [ ] Inter / Inter Invest
  - [ ] XP Investimentos / Clear
  - [ ] Conta Azul / Nibo (ERPs contábeis)
  - [ ] iDinheiro / Comparaonline (comparadores financeiros)
- [ ] Criar páginas de comparativo que linkam naturalmente para afiliados
- [ ] Tracking de conversões com UTM

#### Checklist: Leads Qualificados
- [ ] Formulário "Falar com um contador" nas calculadoras de IRPF/MEI/Simples
- [ ] Parceria com plataforma de contadores (Contabilizei, Agilize, etc.)
- [ ] Formulário "Consultar advogado trabalhista" nas calculadoras de rescisão
- [ ] Definir modelo de precificação (CPL — custo por lead)

---

## FASE 3 — CONSOLIDAÇÃO
### Semanas 25–52 | Objetivo: 100+ calculadoras + API + Liderança de nicho

---

### Sprint 3.1 — API Pública (Semanas 25–30)

#### Checklist: API REST (packages/core como serviço)
- [ ] Criar `apps/api/` com Next.js API Routes ou Fastify
- [ ] Endpoints: `POST /api/calcular/[tipo]`
- [ ] Autenticação por API Key
- [ ] Rate limiting (free: 100 req/dia, pro: ilimitado)
- [ ] Documentação com Swagger/OpenAPI
- [ ] Página de desenvolvedores (`/developers`)
- [ ] Planos de preços (Stripe para cobrança)
- [ ] SDK TypeScript publicado no npm

#### Checklist: Freemium (Plugin Sheets Premium)
- [ ] Versão gratuita: 5 fórmulas básicas
- [ ] Versão premium: todas as fórmulas + atualização automática de tabelas
- [ ] Integração com Stripe para assinatura
- [ ] Preço: R$15-29/mês ou R$129/ano

---

### Sprint 3.2 — +50 Calculadoras de Nicho (Semanas 25–52)

#### Checklist: Calculadoras de Cauda Longa
- [ ] Matemáticas: regra de 3, equações 1º/2º grau, MMC/MDC, porcentagem inversa
- [ ] Estatística: média, mediana, moda, desvio padrão
- [ ] Física/Química: velocidade, aceleração, densidade, pH
- [ ] Engenharia: concreto, aço, elétrica (residencial)
- [ ] Saúde avançada: gestação, ovulação, bioimpedância, taxa metabólica
- [ ] Agronegócio: área de terra, produtividade, custo de plantio
- [ ] Jurídico: honorários OAB, custas processuais, correção INPC/IPCA
- [ ] Educação: média escolar, vestibular, ENEM

---

## PROCESSOS DE RETROALIMENTAÇÃO DE DADOS

### Sistema de Monitoramento Contínuo

---

### Loop 1 — Atualização de Tabelas Legislativas

```
GATILHO: Publicação de nova legislação / início de ano fiscal
↓
DETECÇÃO: Script de monitoramento verifica portarias MF/MPS (semanalmente)
↓
ATUALIZAÇÃO: PR automático atualiza packages/core/src/tabelas/
↓
TESTE: CI roda testes unitários com novos valores
↓
DEPLOY: Merge → Vercel ISR revalida páginas afetadas em até 24h
↓
NOTIFICAÇÃO: Blog post "Tabelas atualizadas" + redes sociais
```

#### Checklist: Implementar Monitoramento de Tabelas
- [ ] Script Node.js que scrapa fontes oficiais (Receita Federal, MTE, INSS)
- [ ] GitHub Action agendada (cron semanal) que executa o script
- [ ] Se detectar mudança → abre PR automaticamente com diff das tabelas
- [ ] Testes de snapshot para validar cálculos não quebraram
- [ ] Alerta via e-mail/Slack quando PR é aberto

---

### Loop 2 — Retroalimentação de SEO

```
COLETA (semanal): Google Search Console API → exporta CTR, posição, impressões por página
↓
ANÁLISE: Script identifica páginas com CTR < 2% (oportunidade de title/description)
↓
ANÁLISE: Identifica queries sem página correspondente (oportunidade de nova calculadora)
↓
AÇÃO: Atualizar meta description e H1 das páginas com baixo CTR
↓
AÇÃO: Priorizar desenvolvimento de calculadoras para queries sem cobertura
↓
REVISÃO (mensal): Comparar posição antes/depois das otimizações
```

#### Checklist: Dashboard de SEO
- [ ] Conectar Google Search Console API
- [ ] Conectar Google Analytics 4 API
- [ ] Planilha Google Sheets ou Notion com KPIs semanais:
  - Pageviews por calculadora (top 20)
  - Posição média das top queries
  - CTR por página
  - Novas queries detectadas (sem cobertura)
  - Core Web Vitals por URL
- [ ] Relatório automático semanal (script → e-mail)

---

### Loop 3 — Retroalimentação de Receita (AdSense)

```
COLETA (diária): AdSense API → RPM, impressões, receita por página/categoria
↓
ANÁLISE (semanal): Identificar páginas com RPM > 20% acima da média (expandir conteúdo)
↓
ANÁLISE (semanal): Identificar páginas com RPM < 50% da média (ajustar posição de ads)
↓
TESTE A/B: Alterar posicionamento de anúncio em páginas de baixo RPM
↓
REVISÃO (mensal): Decidir se páginas de baixo RPM merecem investimento de conteúdo
```

#### Checklist: Dashboard de Receita
- [ ] Conectar AdSense API
- [ ] Métricas semanais:
  - Receita total e por categoria
  - RPM por página (top 20 e bottom 20)
  - CTR de anúncios por posição
  - Estimativa de receita do mês corrente
- [ ] Alerta quando receita diária cair > 30% vs. média dos 7 dias anteriores

---

### Loop 4 — Retroalimentação de Produto (UX)

```
COLETA (contínua): Hotjar / Microsoft Clarity → heatmaps, session recordings
↓
COLETA (contínua): Google Analytics → taxa de rejeição, tempo na página, eventos de cálculo
↓
ANÁLISE (quinzenal): Identificar pontos de abandono no funil de cálculo
↓
HIPÓTESE: Formular melhoria específica (ex: "Campo X está confuso")
↓
TESTE: Implementar variação e testar por 2 semanas
↓
DECISÃO: Manter ou reverter baseado em dados
```

#### Checklist: Implementar UX Analytics
- [ ] Instalar Microsoft Clarity (gratuito) para session recordings
- [ ] Configurar eventos GA4:
  - `calculator_view` — quando calculadora é visualizada
  - `calculator_submit` — quando usuário clica em "Calcular"
  - `calculator_result` — quando resultado é exibido com sucesso
  - `calculator_error` — quando validação falha (qual campo)
  - `ad_click` — clique em anúncio (automático via AdSense)
  - `content_scroll` — scroll depth no conteúdo editorial
- [ ] Funil: view → submit → result (taxa de conversão por calculadora)
- [ ] Meta: taxa de conversão view→result > 60% para calculadoras principais

---

### Loop 5 — Retroalimentação de App Android

```
COLETA (semanal): Google Play Console → avaliações, crashes, DAU/MAU
↓
ANÁLISE: Reviews negativos → identificar padrões de problema
↓
ANÁLISE: Crash reports → priorizar correções
↓
AÇÃO: Fix → nova versão TWA (apenas rebundle, não reescreve o PWA)
↓
MONITORAMENTO: Rating na Play Store (meta: ≥ 4.3 estrelas)
```

#### Checklist: Monitoramento do App
- [ ] Configurar alertas de crash no Play Console
- [ ] Responder a todos os reviews negativos (< 3 estrelas) em 48h
- [ ] Relatório mensal: DAU, rating médio, crashes por versão

---

### Loop 6 — Retroalimentação de Conteúdo Editorial

```
COLETA (mensal): Google Search Console → queries que chegam a cada artigo do blog
↓
ANÁLISE: Artigos com alto volume de impressões mas baixo CTR → oportunidade de atualização
↓
ANÁLISE: Queries não cobertas → oportunidade de novo artigo
↓
SAZONALIDADE: Calendario editorial baseado em picos previsíveis:
  - Jan/Fev: IRPF (publicar guias em dezembro antes do prazo)
  - Nov/Dez: 13º Salário
  - Rescisão: ano todo (maior volume)
  - Jul/Ago: Férias coletivas
↓
PRODUÇÃO: Atualizar artigos existentes antes de criar novos
```

#### Checklist: Calendário Editorial (Ano 1)
- [ ] **Março 2026:** Guia IRPF 2026 — declaração, deduções
- [ ] **Abril 2026:** Atualização tabelas INSS/IRRF pós-reajuste
- [ ] **Junho 2026:** Férias coletivas — guia completo
- [ ] **Agosto 2026:** PLR — melhores práticas, cálculo
- [ ] **Outubro 2026:** 13º Salário — guia antecipado
- [ ] **Novembro 2026:** Black Friday — calculadora de desconto (seasonal)
- [ ] **Dezembro 2026:** Retrospectiva de tabelas, projeções 2027

---

## KPIs E CADÊNCIA DE REVISÃO

### Dashboard Semanal (toda segunda-feira)
| Métrica | Fonte | Meta Mês 6 | Meta Mês 12 |
|---------|-------|-----------|------------|
| Pageviews/semana | GA4 | 12.500 | 100.000 |
| Receita AdSense/semana | AdSense | R$225 | R$2.200 |
| Posição média top 10 queries | GSC | Top 20 | Top 10 |
| Conversão calculadora (view→result) | GA4 eventos | >50% | >65% |
| Crashes Android | Play Console | 0 | 0 |
| Core Web Vitals (% green) | GSC CWV | 100% | 100% |

### Revisão Mensal (dia 1 de cada mês)
- [ ] Comparar KPIs com mês anterior
- [ ] Atualizar tabelas legislativas se necessário
- [ ] Revisar top 5 calculadoras com menor conversão
- [ ] Definir 5 novas calculadoras para o próximo mês
- [ ] Atualizar artigos do blog com dados desatualizados
- [ ] Exportar relatório de receita para controle financeiro

### Revisão Trimestral
- [ ] Avaliar posicionamento vs. concorrentes (Ahrefs)
- [ ] Revisar estratégia de monetização (AdSense vs. diversificação)
- [ ] Avaliar performance do app Android
- [ ] Decidir próxima plataforma a priorizar
- [ ] Revisar roadmap de calculadoras (ajustar por dados de busca)

---

## CRITÉRIOS DE LANÇAMENTO POR FASE

### Gate FASE 0 → FASE 1
- [ ] Monorepo configurado e buildando sem erros
- [ ] 5 calculadoras trabalhistas com testes passando (100% coverage)
- [ ] Deploy Vercel funcionando com domínio próprio
- [ ] Core Web Vitals: todos verde no Lighthouse

### Gate FASE 1 → FASE 2
- [ ] 20 calculadoras publicadas com conteúdo editorial
- [ ] Indexadas no Google (verificar no GSC)
- [ ] AdSense aprovado e ativo
- [ ] PWA instalável e testado em Android
- [ ] App na Play Store aprovado
- [ ] Primeiros 15.000 pageviews orgânicos/mês

### Gate FASE 2 → FASE 3
- [ ] 50 calculadoras publicadas
- [ ] 150.000 pageviews/mês
- [ ] R$3.000/mês de receita AdSense
- [ ] Desktop (Tauri) publicado com 100+ downloads
- [ ] Plugin Google Sheets com 100+ usuários ativos
- [ ] Domain Rating ≥ 20

---

## RISCOS E PLANOS DE CONTINGÊNCIA

| Risco | Sinal de Alerta | Resposta |
|-------|----------------|----------|
| Indexação lenta | < 5 páginas indexadas em 4 semanas | Intensificar link building, verificar robots.txt, submeter URLs manualmente |
| RPM abaixo do esperado | RPM < R$10 após aprovação | Revisar posicionamento de ads, testar formato âncora/vinheta |
| Play Store rejeição | App rejeitado na revisão | Corrigir problema apontado, resubmeter com descrição mais detalhada |
| Queda de rankings | -50% de impressões em 7 dias | Investigar GSC, verificar se foi core update, checar Core Web Vitals |
| Tabela desatualizada | Reclamação de usuário ou mudança legislativa | Hotfix prioritário em < 24h, comunicar no site |
| Concorrente atualiza | Calculei/CalculoExato lança feature similar | Acelerar diferencial (multiplataforma, precisão) |
