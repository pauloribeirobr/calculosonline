# AGENTS.md — calculosonline.com.br

> Memória do projeto para assistentes de IA (Claude Code, Codex, Cursor, Aider, etc.).
> Mantenha este arquivo atualizado quando decisões arquiteturais ou de escopo mudarem.

## Projeto
Plataforma de calculadoras online para o mercado brasileiro.
Stack: **Next.js + TypeScript** em monorepo **Turborepo**, com aplicativos **Tauri** (desktop), **TWA** (Android) e plugin **Google Apps Script** (Sheets).

## Arquivos-chave (documentação)
- [docs/Plano_Negocios_CalculosOnline.md](docs/Plano_Negocios_CalculosOnline.md) — plano de negócios completo
- [docs/PLANO_IMPLEMENTACAO.md](docs/PLANO_IMPLEMENTACAO.md) — fases, checklists e loops de retroalimentação
- [docs/IDENTIDADE_VISUAL.md](docs/IDENTIDADE_VISUAL.md) — espelho do Recibo Fácil + tokens + estrutura de pastas
- [prompts/](prompts/) — `sprint-*.md`: prompts de IA por sprint (0.1 a 2.4)

## Projeto irmão — Recibo Fácil
- Localização: `/home/paulo/projects/next/recibofacil` (em produção em recibofacil.com.br)
- Stack visual: Next.js 16 + React 19 + Tailwind 3 + Inter Variable + Heroicons + Headless UI
- O calculosonline **reaproveita ~70% do sistema visual** do Recibo Fácil. Componentes a portar:
  `Header`, `Footer`, `Button`, `Input` (com máscaras), `Modal`, `Loading`, `Hero`, `HowItWorks`,
  `Features`, `Stats`, `Testimonials`, `FAQ`, `FinalCta`, `PageSeo`, `JsonLd`, `MicrosoftClarity`, `ErrorLogger`.
- **Não portar** (específicos de geração de PDF/login): `AuthContext`, `ExpirationBanner`,
  `A4Container`, `DocumentForm`, `SignatureField`, `WatermarkToggle`.
- **Decisão:** usar **Tailwind 3** (não 4) por compatibilidade com a base já existente do Recibo Fácil.

## Estrutura de pastas (definida no plano)
```
calculosonline/
├── packages/core/      — funções de cálculo TypeScript puras
├── packages/ui/        — componentes React reutilizáveis
├── apps/web/           — Next.js (site principal)
├── apps/android/       — TWA (bubblewrap)
├── apps/desktop/       — Tauri
├── apps/sheets-plugin/ — Google Apps Script
└── content/            — conteúdo editorial MDX
```

## Fases do roadmap
- **Fase 0** (Sem 1–2): Setup monorepo + core engine + 5 calculadoras trabalhistas
- **Fase 1** (Sem 3–12): 20 calculadoras + SEO + PWA + Android + AdSense
- **Fase 2** (Sem 9–24): +30 calculadoras + Desktop Tauri + Plugin Sheets + afiliados
- **Fase 3** (Sem 25–52): 100+ calculadoras + API pública + liderança de nicho

## Stack técnica
- **Web:** Next.js 14+ App Router, SSG/ISR, Tailwind CSS 3
- **Core Engine:** TypeScript puro, funções exportadas, testado com Vitest
- **Android:** TWA via bubblewrap
- **Desktop:** Tauri (binário ~5–10MB)
- **Plugin Sheets:** Google Apps Script + clasp

## Preferências de colaboração
- **Idioma:** comunicação em **português (pt-BR)**.
- **Commits e PRs:** mensagens em pt-BR; seguir convenção `feat:`, `fix:`, `chore:` etc.
- **Código:** identificadores e comentários em inglês quando técnicos; comentários de domínio (regras CLT, INSS, IRRF) podem ficar em pt-BR.
