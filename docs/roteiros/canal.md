# Criação do canal e dos perfis — Calculos Online (F91)

Textos para colar na criação, escritos em 25/11/2026. O nome segue o site (`siteConfig.name` = "Calculos
Online", sem acento). Nada do Paulo em lugar nenhum: sem nome, sem foto, sem e-mail pessoal
(`docs/roteiros/README.md`). Os arquivos de imagem estão em [`identidade/`](identidade/) e saem de
`pnpm --filter web gen:identidade-video`.

## YouTube

✅ **Criado pelo Paulo em 25/11/2026: https://www.youtube.com/@calculosonline** (id
`UCP0pocTn43bfBf70XQXxtqA`). Conferido na página pública no mesmo dia: nome "Calculos Online",
identificador `@calculosonline`, descrição do bloco abaixo e foto do perfil no ar.

Criar numa **conta Google da marca** (não a pessoal), como canal com nome próprio.

| Campo | O que colocar |
|---|---|
| Nome | `Calculos Online` |
| Identificador | `@calculosonline` (o mesmo `@` do `twitter` em `siteConfig`). Se estiver ocupado: `@calculosonlinebr` |
| Foto do perfil | `identidade/foto-perfil-800.png` |
| Banner | `identidade/banner-2560x1440.png` (o texto fica na área segura de 1546×423, que aparece em TV, computador e celular) |
| Marca d'água | `identidade/marca-dagua-150.png`, "vídeo inteiro" |
| Link | Título `Calculadoras grátis` → `https://calculosonline.com.br` |
| E-mail de contato | `contato@calculosonline.com.br` (o do site) |

**Descrição** (cerca de 850 dos 1.000 caracteres):

```
Calculadoras grátis, com a conta feita na tela.

Toda semana, um vídeo curto refaz uma conta do dia a dia: quanto rende o Tesouro Reserva, por que a segunda parcela do 13º vem menor, quanto cai na rescisão, Price ou SAC no financiamento. A conta é feita numa calculadora do calculosonline.com.br, com o passo a passo aberto e a origem de cada regra (lei, Receita Federal, Banco Central).

Investimentos · Trabalhistas · Impostos · Financiamento

Conteúdo educativo: não recomendamos investimento nem instituição financeira. Taxas e tabelas mudam: a data de cada número está na descrição do vídeo, e a calculadora do site usa sempre a mais recente.

Grátis e sem cadastro: https://calculosonline.com.br
```

**Studio → Configurações:**

- **Canal → Informações básicas → Palavras-chave:** `calculadora` `simulador` `"tesouro reserva"` `"tesouro direto"`
  `cdb` `poupança` `"juros compostos"` `"13º salário"` `férias` `"rescisão trabalhista"` `"salário líquido"`
  `"imposto de renda"` `financiamento` `"educação financeira"`
- **Canal → Configurações avançadas:** país `Brasil`; público: **"Não, configurar este canal como não
  destinado a crianças"**.
- **Padrões de envio:** categoria `Educação`; idioma do vídeo e do título `Português (Brasil)`; licença
  padrão do YouTube; comentários "Reter os potencialmente inadequados para revisão".
- **Uso de IA** (em cada envio): "Não" (clone da própria voz; regra do RF).

## Instagram

⏳ **Pendente:** o Paulo cria depois (25/11: *"Instagram e Facebook deixe registrado. Farei mais tarde"*). Até lá, os Shorts saem só no YouTube; os Reels sobem quando as contas existirem, com o mesmo arquivo.

Conta profissional, categoria **"Site de educação"** (ou "Página de app", como o RF).

| Campo | O que colocar |
|---|---|
| Usuário | `@calculosonline` (se ocupado, `@calculosonline.com.br`, como o `@recibofacil.com.br`) |
| Nome (entra na busca; até 64) | `Calculos Online · Calculadoras` |
| Foto | `identidade/foto-perfil-1080.png` |
| Link | `https://calculosonline.com.br` |

**Bio** (121 dos 150 caracteres):

```
A conta feita na tela, com o passo a passo 🧮
Investimentos, trabalhistas e impostos
Calculadoras grátis e sem cadastro 👇
```

## Facebook (página)

⏳ **Pendente**, junto com o Instagram (ver acima).

| Campo | O que colocar |
|---|---|
| Nome da página | `Calculos Online` |
| Categoria | `Site de educação` |
| Foto | `identidade/foto-perfil-1080.png` |
| Capa | `identidade/banner-2560x1440.png` (o Facebook corta em 1640×624 no computador; o texto central cabe) |
| Site | `https://calculosonline.com.br` |
| Bio | `Calculadoras grátis com a conta feita na tela: investimentos, trabalhistas e impostos. Sem cadastro.` |

## Os Reels

O mesmo arquivo do Short, o mesmo título, a mesma descrição e o mesmo comentário fixado nas três redes
(regra do RF de 08/11: "um vídeo só, um texto só"). Nada na fala ou na imagem que só exista no YouTube. O
link muda de rede para rede só pela UTM (`docs/roteiros/README.md`, regra 7).

## Depois de criar (me passe os três endereços)

- **No site:** os perfis entram no `sameAs` da `Organization` (hoje só o próprio site, em
  `components/seo/JsonLd.tsx`), no `llms.txt` e numa linha "Onde encontrar" na página Sobre, como o F276 do
  RF. Isso ajuda o Google e as IAs a ligar o canal ao site. É uma entrega pequena de site, com commit próprio.
- Registrar os endereços neste arquivo e no `MEMORY.md`.
