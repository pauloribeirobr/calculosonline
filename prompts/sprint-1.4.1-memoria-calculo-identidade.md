# Prompt de IA — Sprint 1.4.1: Memória de Cálculo e Identidade Visual
**calculosonline.com.br | Fase 1 — MVP | Pós Sprint 1.4**

---

## CONTEXTO

A Sprint 1.4 entregou SEO e conteúdo editorial, mas a experiência de resultado ainda precisa
ficar mais clara para o usuário final e mais preparada para a futura API pública.

Problemas identificados:

1. Valores numéricos aparecem com aparência estranha quando renderizados em fonte monoespaçada.
2. O detalhamento linha a linha não explica suficientemente como reproduzir o cálculo.
3. O projeto ainda precisa de logotipo, favicon e ícones próprios, nos moldes do Recibo Fácil.

---

## OBJETIVO DA SPRINT 1.4.1

Criar uma camada de transparência e identidade antes da Sprint 1.5:

1. **Memória de cálculo** — contrato reproduzível no core, preparado para futura API pública.
2. **Contrato pronto para API** — estrutura de passos no core engine, sem depender da UI.
3. **Tipografia numérica corrigida** — usar Inter com `tabular-nums`, não `font-mono`, para valores.
4. **Logo, favicon e ícones** — assets e pictogramas próprios, seguindo o padrão visual do Recibo Fácil.

---

## TAREFA 1: Contrato de Memória de Cálculo no Core

Adicionar tipos ao `@calculosonline/core`:

```typescript
export type TipoPassoCalculo = 'entrada' | 'calculo' | 'resultado' | 'aviso'

export interface PassoCalculo {
  id: string
  ordem: number
  titulo: string
  explicacao: string
  tipo: TipoPassoCalculo
  natureza: 'credito' | 'debito' | 'neutro'
  valor: number
  formula?: string
}

export interface MemoriaCalculo {
  resumo: string
  passos: PassoCalculo[]
}
```

`ResultadoCalculo<T>` deve aceitar `memoriaCalculo?: MemoriaCalculo`.

---

## TAREFA 2: Configuração de Explicabilidade

Criar um módulo reutilizável:

```text
packages/core/src/explainability/index.ts
```

Responsabilidades:

- manter uma configuração padrão de termos para classificar passos como `entrada`, `calculo`,
  `resultado` ou `aviso`;
- gerar `MemoriaCalculo` a partir de `detalhamento`;
- preservar fórmulas já existentes;
- manter IDs estáveis para futura API pública e auditoria.

Esse arquivo funciona como a primeira versão do “arquivo de configuração” de explicabilidade.
No futuro, ele pode receber configurações por calculadora.

---

## TAREFA 3: UI de Detalhamento

Atualizar `packages/ui/src/CalculatorResult/index.tsx`:

- manter o detalhamento compacto antigo (“Ver detalhamento do cálculo”), pois ele é mais claro
  para leitura rápida no MVP;
- renderizar lista linha a linha com descrição, fórmula quando houver e valor formatado;
- preservar o contrato `MemoriaCalculo` no core para API/auditoria futura, sem forçar a UI web
  a exibir passos numerados;
- manter acessibilidade com `aria-expanded`, `aria-controls` e labels claros.

---

## TAREFA 4: Corrigir Tipografia e Formatos Numéricos

- Remover `font-mono` de valores monetários e resultados principais.
- Usar `tabular-nums` para alinhamento sem aparência de terminal.
- Usar `font-mono` apenas em fórmulas.
- Permitir formatos de resultado por calculadora:
  - `currency`
  - `number`
  - `percent`
  - `integer`
  - `kcal`
- Não renderizar IMC, calorias, gramas, quilos e percentuais como moeda.

---

## TAREFA 5: Logo, Favicon e Ícones

Criar assets públicos:

```text
apps/web/public/images/logo.svg
apps/web/public/images/logo-dark.svg
apps/web/public/favicon.svg
apps/web/public/favicon-48.svg
apps/web/public/icons/icon-72x72.png
apps/web/public/icons/icon-96x96.png
apps/web/public/icons/icon-128x128.png
apps/web/public/icons/icon-144x144.png
apps/web/public/icons/icon-152x152.png
apps/web/public/icons/icon-192x192.png
apps/web/public/icons/icon-384x384.png
apps/web/public/icons/icon-512x512.png
apps/web/public/icons/apple-touch-icon.png
```

Direção visual:

- manter parentesco com Recibo Fácil: círculo azul, pictograma branco e acento verde;
- adaptar o símbolo para uma calculadora;
- usar SVG como fonte principal e PNGs exportados para favicon/PWA;
- atualizar o componente `Logo` para usar os assets em vez do SVG inline;
- registrar os ícones em `metadata.icons`.

Atualizar também os cards e listas de calculadoras:

- remover emojis do registry canônico;
- usar ícones vetoriais estilizados por calculadora;
- manter cores por categoria;
- centralizar o mapeamento em um componente reutilizável.

Atualizar o hero da home:

- distribuir os mockups de calculadora de forma descentralizada;
- manter movimento contínuo com durações e atrasos diferentes por card;
- preservar `prefers-reduced-motion` para usuários que reduzem animações no sistema.

---

## CRITÉRIOS DE ACEITE

- O resultado principal não usa fonte monoespaçada.
- Cada cálculo exibe detalhamento compacto e claro, com fórmula quando disponível.
- A memória de cálculo pode ser reaproveitada por web, desktop, Sheets e futura API.
- Calculadoras não monetárias não exibem `R$` indevidamente.
- Logo, favicon e ícones das calculadoras aparecem com estilo consistente.
- `pnpm --filter @calculosonline/core test` passa.
- `pnpm --filter @calculosonline/ui typecheck` passa.
- `pnpm --filter web typecheck` passa.
