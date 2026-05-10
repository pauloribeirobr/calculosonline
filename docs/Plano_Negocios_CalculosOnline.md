# PLANO DE NEGÓCIOS — calculosonline.com.br

**Plataforma de Calculadoras Online para o Mercado Brasileiro**
Web • Android • Desktop • Plugin Google Sheets

*Março 2026*

---

## 1. Análise Competitiva do Mercado

O mercado brasileiro de calculadoras online é fragmentado, com vários players disputando tráfego orgânico em nichos de alta demanda como cálculos trabalhistas, financeiros e de impostos. Abaixo, o mapeamento dos principais concorrentes:

### 1.1 Mapeamento de Concorrentes

| Site | Tráfego/mês | DR (Ahrefs) | Foco Principal | Fraqueza |
|------|-------------|-------------|----------------|----------|
| calculoexato.com.br | ~1.2M | DR 65 | Trabalhista/Financeiro | UX datada, mobile lento (63/100) |
| calcule.net | ~500K | Estab. | Trabalhista/Financeiro | Design antigo (desde 1999) |
| calculoonline.com.br (Calculei) | N/D (novo) | Baixo | Amplo (todas categorias) | IA sem precisão garantida |
| calculadora-digital.com.br | ~50K | Baixo | Financeiro/Científico | Catálogo limitado (~15 tools) |
| calculadorafacil.com.br | ~62K | Baixo | Trabalhista | Nicho muito estreito |
| calculorescisao.com.br | ~157K | Médio | Rescisão CLT | Single-purpose |

### 1.2 Análise do calculoonline.com.br (Calculei)

#### Pontos Fortes

- Catálogo amplo: +60 calculadoras cobrindo 12 categorias (trabalhista, financeiro, investimentos, impostos/MEI, negócios, imobiliário, saúde, dia a dia, matemática, conversões)
- URLs limpas e SEO-friendly (/calculadora/rescisao-trabalhista)
- Modelo 100% gratuito e sem cadastro — baixa fricção
- Cálculos client-side (JavaScript) — resposta instantânea

#### Fraquezas Exploráveis

- Disclaimer de "baseado em IA" sem precisão garantida — destrói confiança em temas YMYL
- Homepage é apenas lista de links — sem conteúdo editorial, sem E-E-A-T
- Dependência total de JavaScript — possível problema de indexação
- Sem versão app/desktop/plugin — presente apenas na web
- Domínio recente, autoridade baixa

### 1.3 Oportunidades Identificadas

**1. Precisão como diferencial:** Enquanto o Calculei usa IA genérica, você pode usar fórmulas exatas baseadas na legislação vigente (CLT, tabelas do INSS/IRRF atualizadas) e deixar isso explícito.

**2. Multiplataforma:** Nenhum concorrente brasileiro oferece app nativo + plugin Google Sheets + desktop. Isso é um diferencial enorme.

**3. Conteúdo editorial:** Sites concorrentes são puramente ferramentas. Conteúdo explicativo melhora E-E-A-T e gera tráfego informacional.

**4. Sazonalidade:** Picos previsíveis (13º salário em nov/dez, IRPF em mar/abr, rescisão o ano todo) permitem planejamento de conteúdo.

---

## 2. Plano de Negócios — calculosonline.com.br

### 2.1 Visão e Proposta de Valor

Ser a plataforma de calculadoras mais precisa, rápida e acessível do Brasil — presente onde o usuário estiver: navegador, celular, desktop ou planilha.

#### Diferenciais Competitivos

1. **Precisão legislativa:** Fórmulas baseadas em legislação vigente, atualizadas em tempo real (tabelas INSS, IRRF, salário mínimo)
2. **Multiplataforma:** Web (PWA), Android (TWA/Capacitor), Desktop (Electron/Tauri), Plugin Google Sheets
3. **Conteúdo educativo:** Cada calculadora acompanhada de guia explicativo com base legal
4. **Performance:** Core Web Vitals otimizados, SSR/SSG para indexação perfeita
5. **Offline-first:** PWA com Service Worker permite uso sem internet

### 2.2 Stack Tecnológica Recomendada

A estratégia é maximizar o reaproveitamento de código com uma única codebase que roda em todas as plataformas:

| Plataforma | Tecnologia | Vantagem | Esforço |
|------------|------------|----------|---------|
| Web (Site) | Next.js + React | SSG/SSR, SEO perfeito, AdSense compatível | Base principal |
| Android | TWA (Trusted Web Activity) | Empacota o PWA na Play Store | ~2 dias |
| Desktop (Win/Mac/Linux) | Tauri | Leve (<10MB), usa WebView nativo | ~3 dias |
| Plugin Google Sheets | Apps Script + Sidebar HTML | Acessa as mesmas funções de cálculo | ~5 dias |
| iOS (futuro) | TWA/Capacitor | Mesmo PWA empacotado | ~2 dias |

#### Arquitetura do Código

**Core Engine (TypeScript):** Biblioteca pura de funções de cálculo sem dependência de UI. Exemplo: calcularRescisao(), calcularINSS(), calcularJurosCompostos(). Publicada como pacote npm privado e reutilizada em TODAS as plataformas.

**UI Layer (React):** Componentes de formulário e resultado que importam o core engine. Renderizados via Next.js no site e reutilizados no Tauri/TWA.

**Google Sheets Plugin:** Importa o core engine como biblioteca, expondo funções como fórmulas customizadas (=CALCRESCISAO(...)) e também oferece sidebar com UI completa.

### 2.3 Catálogo Inicial de Calculadoras (MVP)

Foco nas calculadoras de maior volume de busca e maior RPM de AdSense (nicho financeiro/trabalhista):

#### Fase 1 — Lançamento (Mês 1-2): 20 Calculadoras

| Categoria | Calculadoras | Volume Estimado |
|-----------|-------------|-----------------|
| Trabalhistas (6) | Rescisão, Férias, 13º, Hora Extra, FGTS, Salário Líquido | Alto (50K-200K/mês cada) |
| Impostos (4) | IRPF, IRRF, INSS, DAS MEI | Alto (30K-150K/mês) |
| Financeiras (4) | Juros Compostos, Porcentagem, Empréstimo, Financiamento | Alto (50K-300K/mês) |
| Investimentos (3) | CDB, Poupança, Tesouro Direto | Médio (20K-80K/mês) |
| Saúde (2) | IMC, Calorias | Médio (30K-100K/mês) |
| Negócios (1) | Margem de Lucro | Médio (15K-40K/mês) |

#### Fase 2 — Expansão (Mês 3-6): +30 Calculadoras

Imobiliário (aluguel, IPTU, financiamento), Simples Nacional, Aposentadoria, Consignado, Fundos Imobiliários, Markup, ROI, Freelancer, Conversões de unidades/moedas, e mais.

#### Fase 3 — Consolidação (Mês 7-12): +50 Calculadoras

Conteúdo de cauda longa: calculadoras de nicho (churrasco, gorjeta, combustível, partilha de bens), matemáticas (regra de 3, equações), e ferramentas interativas avançadas.

---

## 3. Estratégia de SEO Programático

### 3.1 Estrutura de Páginas

Cada calculadora terá uma página otimizada com a seguinte estrutura:

- **URL:** /calculadora/[slug] — ex: /calculadora/rescisao-trabalhista
- **H1:** Calculadora de [Nome] Online e Gratuita
- **Ferramenta interativa:** Formulário + resultado instantâneo
- **Conteúdo editorial (1.500+ palavras):** Como funciona, base legal, exemplos práticos, FAQ com schema markup
- **Schema.org:** FAQPage, HowTo, WebApplication — rich snippets no Google
- **Internal linking:** Calculadoras relacionadas + árvore de categorias

### 3.2 Estratégia de Conteúdo

**Páginas programáticas:** Cada calculadora gera automaticamente 3-5 variações de página (ex: "Como calcular rescisão trabalhista", "Simulador de rescisão CLT 2026", "Calcular verbas rescisórias online").

**Blog:** Artigos sazonais (ex: "Como declarar IRPF 2026" em fevereiro, "Como calcular 13º salário" em outubro) que linkam para as calculadoras.

**Tabelas atualizadas:** Páginas de referência com tabelas do INSS, IRRF, salário mínimo histórico — geram backlinks naturais.

---

## 4. Estratégia de Monetização

### 4.1 Fase 1: Google AdSense (Mês 1-6)

O AdSense é o modelo inicial pela simplicidade de implementação e por não exigir volume mínimo alto. O nicho de finanças e trabalhista é um dos melhores pagantes do AdSense no Brasil.

#### RPM Estimado por Categoria

| Categoria | RPM Estimado | Justificativa | CPC Médio BR |
|-----------|-------------|---------------|-------------|
| Trabalhista | R$ 15-25 | Alto CPC (advogados, contadores) | R$ 1,50-3,00 |
| Financeiro/Investimentos | R$ 20-35 | Bancos, fintechs, corretoras | R$ 2,00-5,00 |
| Impostos/MEI | R$ 18-30 | Contadores, ERPs, fintechs | R$ 1,80-4,00 |
| Saúde/Fitness | R$ 8-15 | Planos de saúde, suplementos | R$ 0,80-2,00 |
| Utilidades gerais | R$ 5-10 | Menor intenção comercial | R$ 0,30-1,00 |

#### Projeção de Receita AdSense

| Período | Pageviews/mês | RPM Médio | Receita/mês | Receita/ano | Nota |
|---------|--------------|-----------|-------------|-------------|------|
| Mês 3 | 15.000 | R$ 15 | R$ 225 | - | Indexação inicial |
| Mês 6 | 50.000 | R$ 18 | R$ 900 | - | Primeiros rankings |
| Mês 9 | 150.000 | R$ 20 | R$ 3.000 | - | Crescimento orgânico |
| Mês 12 | 400.000 | R$ 22 | R$ 8.800 | R$ 105.600 | Consolidação |
| Mês 18 | 800.000 | R$ 25 | R$ 20.000 | R$ 240.000 | Autoridade estabelecida |
| Mês 24 | 1.500.000 | R$ 28 | R$ 42.000 | R$ 504.000 | Líder do nicho |

Nota: Projeções baseadas em benchmarks do mercado brasileiro para sites de finanças. O RPM médio do Brasil para sites genéricos é de R$ 3-5, mas sites financeiros/trabalhistas conseguem 3-8x mais por conta do alto CPC dos anunciantes desses nichos.

### 4.2 Otimização de Ads

- **Auto Ads + posicionamento manual:** Um banner antes do formulário, um entre resultado e conteúdo editorial, e um no final
- **Âncora e Vinheta mobile:** Formatos nativos do AdSense para mobile com bom CTR
- **Lazy loading de ads:** Carregar ads apenas quando visíveis para manter Core Web Vitals
- **A/B testing:** Testar posicionamento e quantidade de ads semanalmente
- **Ads.txt:** Configurar corretamente para maximizar competição entre anunciantes

### 4.3 Fase 2: Diversificação (Mês 6-12)

| Canal | Descrição | Receita Potencial | Prioridade |
|-------|-----------|-------------------|------------|
| Header Bidding | AdX/Prebid.js ao atingir 100K+ pageviews — 20-70% mais que AdSense puro | +35-65% sobre AdSense | Alta |
| Afiliados | Links para fintechs (Nu, Inter), corretoras, ERPs contábeis | R$ 2.000-8.000/mês | Alta |
| Leads qualificados | Venda de leads para contadores, advogados trabalhistas via formulários | R$ 5.000-15.000/mês | Média |
| Freemium (API) | Versão gratuita limitada + planos pagos para desenvolvedores e empresas | R$ 3.000-10.000/mês | Média |
| Plugin Google Sheets (pago) | Versão básica grátis, premium com fórmulas avançadas | R$ 1.000-5.000/mês | Baixa (fase 3) |

---

## 5. Custos e Investimento Inicial

### 5.1 Custos de Setup

| Item | Custo | Frequência |
|------|-------|------------|
| Domínio calculosonline.com.br | R$ 40 | Anual |
| Hospedagem Vercel (Pro) | ~R$ 100/mês | Mensal |
| Cloudflare (CDN + DNS) | Gratuito | - |
| Google Search Console + Analytics | Gratuito | - |
| Conta Google Play (TWA Android) | R$ 130 (one-time) | Única vez |
| Ferramentas SEO (Ahrefs Lite ou Ubersuggest) | ~R$ 200/mês | Mensal |
| Design/Logo (Fiverr ou Canva Pro) | R$ 100-500 | Única vez |

**Investimento inicial estimado:** R$ 500-1.000 (setup) + R$ 300/mês (recorrente)

**Break-even estimado:** Mês 6-9 com AdSense (quando atingir ~50K pageviews/mês)

### 5.2 Cronograma de Implementação

| Semana | Entrega | Meta |
|--------|---------|------|
| 1-2 | Setup Next.js + Core Engine TypeScript + 5 primeiras calculadoras trabalhistas | Deploy em produção |
| 3-4 | Mais 5 calculadoras (financeiras/impostos) + conteúdo editorial | Submeter ao Google Search Console |
| 5-6 | PWA configurado + TWA Android na Play Store | Presença mobile |
| 7-8 | Mais 10 calculadoras + blog + schema markup | Primeiras indexações |
| 8-10 | Desktop (Tauri) + Plugin Google Sheets (beta) | Multiplataforma |
| 10-12 | Ativar AdSense + otimizar posicionamento + mais conteúdo | Primeira receita |

---

## 6. KPIs e Métricas de Sucesso

| Métrica | Meta Mês 6 | Meta Mês 12 | Meta Mês 24 |
|---------|-----------|------------|------------|
| Pageviews/mês | 50.000 | 400.000 | 1.500.000 |
| Calculadoras publicadas | 30 | 60 | 100+ |
| Domain Rating (Ahrefs) | 15+ | 30+ | 45+ |
| Receita mensal (AdSense) | R$ 900 | R$ 8.800 | R$ 42.000 |
| Instalações Android | 500 | 5.000 | 25.000 |
| Usuários plugin Sheets | 100 | 1.000 | 5.000 |
| Posição média Google (top keywords) | Top 20 | Top 10 | Top 5 |
| Core Web Vitals | Todos verde | Todos verde | Todos verde |

---

## 7. Detalhamento da Stack Multiplataforma

### 7.1 Por que Next.js + Tauri + TWA?

A escolha da stack prioriza o princípio de "escreva uma vez, distribua em todo lugar" com o menor overhead possível:

**Next.js (Web):** SSG (Static Site Generation) gera HTML estático para cada calculadora, garantindo SEO perfeito e tempo de carregamento <1s. O React permite componentização e reuso total. ISR (Incremental Static Regeneration) atualiza páginas quando tabelas do INSS/IRRF mudam.

**TWA - Trusted Web Activity (Android):** Empacota o site PWA direto na Play Store sem precisar reescrever em Kotlin/Java. O usuário instala pela Play Store, mas roda o mesmo código web. Custo de manutenção quase zero.

**Tauri (Desktop):** Alternativa ao Electron, usa o WebView nativo do sistema (WebKitGTK no Linux, WebView2 no Windows, WKWebView no macOS). Resultado: binário de ~5-10MB vs ~150MB do Electron. Empacota o mesmo front-end React.

**Google Apps Script (Plugin Sheets):** O core engine é compilado para uma versão compatível com Apps Script. O usuário pode usar =CALCRESCISAO(salario, meses, motivo) diretamente nas células ou abrir uma sidebar com a interface completa.

### 7.2 Estrutura de Pastas do Projeto

```
calculosonline/
├── packages/core/          — Biblioteca TypeScript pura (funções de cálculo)
├── packages/ui/            — Componentes React reutilizáveis
├── apps/web/               — Next.js (site principal)
├── apps/android/           — TWA wrapper (bubblewrap)
├── apps/desktop/           — Tauri wrapper
├── apps/sheets-plugin/     — Google Apps Script + sidebar
└── content/                — Conteúdo editorial em MDX
```

### 7.3 Sinergia com BrazilGuide.net

O projeto calculosonline.com.br tem sinergias naturais com o BrazilGuide.net:

- **Cross-linking:** Páginas de empresas no BrazilGuide podem linkar para calculadoras relevantes (ex: página de escritório de contabilidade → calculadora de IRPF)
- **Dados CNPJ:** Calculadoras de impostos podem puxar dados públicos de empresas via a base do BrazilGuide
- **Público compartilhado:** Profissionais B2B que pesquisam empresas também precisam de cálculos trabalhistas e fiscais
- **Autoridade de domínio cruzada:** Backlinks entre os dois domínios fortalecem ambos

---

## 8. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Google core update | Queda de rankings | Diversificar fontes de tráfego (app, direto, social), investir em E-E-A-T |
| Queda do RPM AdSense | Receita menor que projetada | Diversificar com afiliados, header bidding e leads desde o mês 6 |
| Mudança na legislação | Cálculos desatualizados | Monitoramento automático de tabelas oficiais + alertas |
| Concorrente forte entra | Divisão de tráfego | Foco em multiplataforma como moat + conteúdo superior |
| Tempo de indexação lento | Receita atrasada | Sitemap XML, IndexNow, conteúdo frequente, links internos robustos |

---

## 9. Conclusão e Próximos Passos

O mercado de calculadoras online no Brasil movimenta milhões de pageviews mensais com players que, em sua maioria, têm tecnologia datada e ausência de estratégia multiplataforma. O calculosonline.com.br tem a oportunidade de se posicionar como a plataforma de referência ao combinar precisão legislativa, performance web superior, e presença onde nenhum concorrente está (Android, Desktop, Google Sheets).

Com um investimento inicial baixo (~R$ 1.000) e custos recorrentes modestos (~R$ 300/mês), o projeto pode atingir break-even em 6-9 meses e gerar receita relevante a partir do mês 12 exclusivamente com AdSense, com potencial de escalar significativamente com a diversificação de receita na fase 2.

### Ações Imediatas

1. Iniciar setup do projeto Next.js com monorepo (Turborepo ou Nx)
2. Desenvolver core engine TypeScript com as 5 calculadoras trabalhistas prioritárias
3. Configurar domínio, Vercel, Cloudflare e Google Search Console
4. Criar conteúdo editorial para as primeiras 5 páginas
5. Implementar schema markup (FAQPage, WebApplication)
6. Aplicar para o Google AdSense assim que tiver 15+ páginas com conteúdo
