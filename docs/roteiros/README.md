# Roteiros do YouTube — Calculos Online (F91)

Canal: **"Calculos Online"** (nome decidido pelo Paulo em 25/11/2026, grafado como no site; textos da
criação do canal, do Instagram e do Facebook em [`canal.md`](canal.md)). Molde: o canal do Recibo Fácil (`../recibofacil/docs/roteiros/README.md`), que já publicou 6 vídeos
e 6 Shorts com esta estrutura. Tudo o que vale lá vale aqui, salvo o que está escrito abaixo.

| # | Vídeo | Página | Roteiro | Status |
|---|---|---|---|---|
| V1 | Tesouro Reserva: quanto rende e quando o IOF morde | `/calculadora/tesouro-reserva` | [completo](v1-tesouro-reserva.md) (25/11/2026) | ✅ publicado em 25/11: [normal](https://youtu.be/kSFT8qBrfqA) · [Short](https://youtube.com/shorts/MDrxj1Vdkaw) |
| V2 | Por que a 2ª parcela do 13º vem menor | `/calculadora/decimo-terceiro` | [completo](v2-segunda-parcela-13.md) (25/11/2026) | ✅ publicado em 27/11: [normal](https://youtu.be/3GV6z9MdQig) · [Short](https://youtube.com/shorts/mFvF4lDTv88) |
| V3 | Férias e 13º juntos em dezembro: quanto cai na conta | `/calculadora/ferias-e-decimo-terceiro` | [completo](v3-ferias-e-13.md) (27/11/2026) | ⏳ texto para aprovar; sai em 29/11 |

## Formato (o do Recibo Fácil, não mais o de slides)

A ideia de 23/11 era slides de 5–8 min. Fica o formato que já roda no Recibo Fácil:

- **Vídeo normal**, horizontal 1920×1080, **1:30–2:40**: **a calculadora do site gravada em produção**,
  preenchida na tela enquanto a voz explica, e o resultado com o passo a passo aberto. A tela é gravada
  pelo assistente (Playwright, janela anônima, GA4/Clarity bloqueados) **depois** da voz, no tempo de cada fala.
- **Short**, vertical 1080×1920, **~30–40 s**, celular emulado (360×640, escala 3), legenda queimada no alto,
  pílula com o passo, cartão final. **O mesmo arquivo vira Reel no Instagram e no Facebook** (decisão do Paulo, 25/11), com o
  mesmo texto nas três redes.
- **Ordem no vídeo normal:** gancho primeiro (nada antes dele) → abertura de 1 s → corpo → fechamento →
  tela final de 10 s (lado direito vazio para os elementos do YouTube). Short sem abertura e sem tela final.
- **Fecho do Short:** *"Calculos Online ponto com ponto bê-érre. Link fixado nos comentários."*

**Por que esse formato e não slides:** a calculadora na tela é o próprio convite a usar o site, e nos
concorrentes ninguém faz isso hoje (ver "Pauta" abaixo). E a esteira já existe pronta.

## Voz, identidade e música

- **Voz:** o clone da voz do Paulo no ElevenLabs (o mesmo do Recibo Fácil), modelo `eleven_v4`, operado
  pelo assistente com `narrar.py`. **O Paulo não aparece:** sem rosto, sem nome, narrando como a marca
  ("aqui no Calculos Online"), nada de nome na descrição, na thumbnail ou na conta. Decisão do Paulo em
  25/11: *"sem aparecer meu nome, somente minha voz usando IA da Eleven Labs. Não me identifica."*
- **Créditos:** o plano Starter (40 mil caracteres/mês) é **dividido com o Recibo Fácil**. Um vídeo + Short
  gasta ~600 créditos (V4 e V6 do RF). Ver o saldo com `narrar.py --saldo` antes de cada geração, e gerar só
  com o ok do Paulo.
- **Siglas: a voz não fala "INSS"** (Paulo, 27/11/2026). O clone falou "í, ene, êsse, ésse" (o certo é "í, êne, ésse,
  ésse"); com a grafia "í êne ésse ésse" a sigla saía certa sozinha, mas no meio da frase o modelo fechava o "é" nas 9
  versões testadas, e a sigla colada na frase soava como IA. **Na fala: "o desconto da Previdência"** (e "o imposto de
  renda" no lugar de IRRF); a tela, a legenda, o título e a descrição seguem com a sigla. Sigla inevitável: gerar uma fala
  curta de teste e o Paulo ouve antes da voz inteira. Detalhe no fim de `v2-segunda-parcela-13.md`.
- **Atributos → Uso de IA: "Não"** (clone da própria voz; central de ajuda do YouTube, answer 14328491).
- **Identidade do canal** (feita em 25/11): [`identidade/`](identidade/), gerada por
  `pnpm --filter web gen:identidade-video` (`apps/web/scripts/gen-identidade-video.mjs`, porte do script do
  RF com o logo da calculadora). Mudou cor, texto ou tempo: editar o script e gerar de novo.

  | Arquivo | Para quê |
  |---|---|
  | `logo-horizontal-claro.png` / `-escuro.png` | Ícone + "Calculos Online", para fundo claro e para thumbnail escura |
  | `foto-perfil-800.png` | Foto do canal (quadrado azul; o corte em círculo não come nada) |
  | `foto-perfil-1080.png` | Foto do Instagram e do Facebook |
  | `marca-dagua-150.png` | Marca d'água do YouTube |
  | `banner-2560x1440.png` | Banner do canal (texto na área segura de 1546×423) e capa do Facebook |
  | `abertura-1s.mp4` / `abertura-1s-sobreposicao.webm` | Abertura de 1 s depois do gancho (a WebM tem fundo transparente) |
  | `tela-final-10s.mp4` | Marca, `calculosonline.com.br` e "A conta pronta, com o passo a passo, direto no navegador." à esquerda; lado direito vazio |
- **Música: faixa nova, feita no ElevenLabs (Eleven Music)**, decisão do Paulo em 25/11, no lugar da
  Biblioteca de áudio. É a mesma faixa em todos os vídeos, **8 LU abaixo da voz** com *ducking* (`"musica_abaixo": 8` no `posicoes-voz.json` do `mixar.py`; o padrão do RF, 18, deixou a lo-fi inaudível na V1: −32,6 LUFS na tela final. Paulo comparou 12 e 8 em 25/11 e escolheu 8). **Termos
  conferidos em 25/11** ([Music Terms](https://elevenlabs.io/eleven-music-model-specific-terms), atualizados
  em 09/10/2026), linha do plano Starter: *"All online and offline commercial use permitted, except film,
  TV, radio, and Studio Games"*, *"No Attribution Required"*, 17 min de geração por mês e "For Individual
  Use Only". O que é proibido é distribuir a faixa em serviço de streaming de música (Spotify etc.) ou
  numa biblioteca de músicas, e nada disso entra no plano. Fundo de vídeo no YouTube e nos Reels é uso
  online. **Diferente da faixa do RF** (synthpop anos 80), para os dois canais não soarem iguais. Gerar
  pela API (a chave já está em `~/.config/recibofacil/elevenlabs.env`), só com o ok do Paulo, e
  guardar fora do repositório (`~/Vídeos/calculosonline-musica/`).
  **Geradas em 25/11** (a chave ganhou a permissão `music_generation` pelo Paulo no mesmo dia): `opcao-a.mp3`
  (pop eletrônico, 100 BPM, piano e arpejos; −16 LUFS) e `opcao-b.mp3` (lo-fi, 96 BPM, piano elétrico e
  marimba; −15 LUFS), 2:45 cada, com o pedido de estilo num `.txt` ao lado. **Custo medido: 4.124 créditos
  pelas duas** (contador 6.390 → 10.514 de 40.000), ~750 por minuto de música, bem mais caro que a voz.
  **Escolhida: opção B** (Paulo, 25/11: *"a opção B me parece mais fluida"*). Copiar como `~/Vídeos/calculosonline-musica/calculosonline-trilha.mp3` e usar em todos os vídeos.

## Regras do conteúdo (as do site, aplicadas ao vídeo)

1. **Todo número sai do motor do site**, na mesma data de referência da página (Selic/CDI de
   `referencias.ts`, tabelas do ano). O roteiro cita a página e o valor; a tela mostra a calculadora dando
   esse valor.
2. **Taxa e tabela fora da fala, como o preço no Recibo Fácil.** O vídeo fica no ar por anos e a Selic
   muda a cada Copom; INSS, IR e salário mínimo mudam todo ano. Na fala, o mecanismo e a conta
   ("com a Selic de hoje", "pela tabela deste ano"); o número aparece na tela; **na descrição, a taxa ou a
   tabela com a data** ("Selic de 13,75% ao ano em 25/11/2026 — o simulador usa a taxa atual"). Mudou →
   editar a descrição; a fala continua certa.
3. **Nenhum nome de banco, corretora ou fintech** na fala, na tela, no título, na descrição ou na
   thumbnail (regra do site). Educativo: não recomenda produto; compara e mostra a conta.
4. **Fonte de cada regra na descrição** (Planalto, Receita, BCB, Tesouro Nacional, B3), como na página.
5. **Sem dado pessoal legível** (regra do RF que custou a 1ª V4: o filtro do YouTube não distingue dado
   fictício). As calculadoras não pedem CPF; mesmo assim, nada de nome, e-mail ou endereço em cena.
6. **Fala sem rima nem trocadilho**, lida em voz alta antes de gerar (regra do RF de 08/11).
7. **Links com UTM, um por rede:** `<página>?utm_source=youtube&utm_medium=video&utm_campaign=vN-<tema>`
   (e `facebook`/`instagram` com `utm_medium=social`, se houver as contas). Só mede onde é clicável: a
   descrição do vídeo normal. Conferir que a página com UTM responde 200 com o `canonical` limpo.
8. **Gravação em produção conta como uso:** anotar dia e hora no `MEMORY.md` para descontar nas leituras.

## Publicação

O vídeo normal sobe primeiro (título, descrição com capítulos tirados do corte final, link com UTM, fontes,
tags, thumbnail, tela final a partir do fim da fala, "Uso de IA: Não", público sem Estreia). Depois o Short,
com o normal no campo "Vídeo relacionado" do Studio (link em Short não é clicável) e o endereço no
comentário fixado. **Leitura em 28 dias:** visualizações no Studio e sessões da campanha no GA4
(`Campanha da sessão` = `vN-…`), na origem `youtube` do boletim (`dados/semana.mjs`).

**Ferramentas:** portar de `../recibofacil/docs/roteiros/ferramentas/` (`narrar.py`, `mixar.py`,
`short-voz.py`, `shorts/`) para `docs/roteiros/ferramentas/` na V1; os `gravar-*.cjs` são por vídeo e nascem
do da V6 do RF. Vídeos, WAV e quadros ficam fora do repositório (`~/Vídeos/calculosonline-vN/`).

## Pauta (pesquisa de 25/11/2026)

**O que os concorrentes fazem** (busca de vídeos do Google Brasil pelo Serper, 12 temas que batem com as
calculadoras do site):

- **Investimentos:** vídeos longos de opinião (11–34 min: Geração Dividendos, De Matos Ensina, Me Poupe!
  "Tesouro Reserva ou Selic? Testei com R$ 9.000", 10/09/2026) e Shorts de ~1 min "quanto rende R$ X"
  (Livia Benassi, Economia em Casal, iHUB Conteúdos). Os do Tesouro Reserva são de maio a julho, do
  lançamento; **nenhum dos 10 do topo mostra o IOF dia a dia nem a custódia acima de R$ 10 mil**, que é o
  que o simulador do site faz.
- **Trabalhista (13º, férias, rescisão, hora extra):** Shorts de advogados (André Ab, Rodrigo Rezende, Anna
  Carollina; 0:45–2:15) explicando a regra de boca, e aulas de DP (Metadados, INICIO RH). **Quase ninguém
  mostra a conta sendo feita numa calculadora.** O 13º tem vídeo novo toda semana (pico de novembro).
- **Juros compostos:** dominado por tutoriais de Excel (Flávio Moita, Excelente João). Ninguém usa
  calculadora pronta.
- **Price ou SAC:** Me Poupe! (1:28), Bext, corretores.
- **O formato do site já existiu:** "Calculadoras Mobills" (2022, ~2 min por calculadora: rescisão, juros
  compostos), parado desde então. É a vaga: **a conta na tela, em 2 minutos, com a fonte da regra.**

**Ritmo (decisão do Paulo, 25/11/2026):** *"Foco nesse momento é lançar um video a cada 2 dias. Depois diminuir paras um
a cada 3 dias, até um por semana"*. Calendário da pauta aprovada, a cada 2 dias a partir da V1:

| V1 | V2 | V3 | V4 | V5 | V6 | V7 | V8 | V9 | V10 |
|---|---|---|---|---|---|---|---|---|---|
| 25/11 ✅ | 27/11 ✅ | 29/11 | 01/12 | 03/12 | 05/12 | 07/12 | 09/12 | 11/12 | 13/12 |

- **A V10 (IRPF 2027) sai cedo demais em 13/12** (a declaração começa em março): proposta de trocá-la por outro tema e
  levar o IRPF para fevereiro, já no ritmo semanal. **A pauta V11+** (para o ritmo de 3 dias, a partir de ~16/12) precisa
  estar pronta até ~10/12.
- **Créditos:** ~700 por vídeo + Short (voz da V1: 690) → ~10.500 por mês a cada 2 dias, dentro dos 40 mil do Starter,
  que o RF também usa (~600 por vídeo semanal). A música não se repete.
- **Para caber no ritmo**, cada vídeo precisa de três toques do Paulo: aprovar o texto, ouvir a voz e publicar.

**Proposta** (cada vídeo ligado a uma calculadora que já existe; ordem pela época do ano):

| # | Tema e gancho | Calculadora | Quando | Por quê |
|---|---|---|---|---|
| V1 | **Tesouro Reserva:** "Resgatou em 15 dias? Metade do rendimento foi para o IOF." Quanto rendem R$ 1.000 em 15 dias, 30 dias e 1 ano, e a poupança no mesmo prazo | `tesouro-reserva` | esta semana | Piloto decidido em 23/11; 49.500 buscas/mês; o IOF e a poupança que não rende antes do mês são o que os vídeos do topo não mostram |
| V2 | **2ª parcela do 13º:** "Por que a segunda parcela vem menor?" INSS e IR saem só nela | `decimo-terceiro` | até ~05/12 | A 2ª parcela sai até 18/12 (20/12 cai no domingo); é a dúvida da época e a página está no pico |
| V3 | **Férias e 13º juntos em dezembro:** quanto cai na conta | `ferias-e-decimo-terceiro` | até ~12/12 | A página mais visitada do site em novembro |
| V4 | **CDB ou Tesouro Selic:** "Acima de R$ 10 mil, o CDB de 100% do CDI passa na frente", por causa da custódia | `cdb`, `tesouro-direto` | dezembro | Tema muito disputado, com um ângulo de conta que ninguém mostra |
| V5 | **R$ 10 mil parados na poupança:** quanto se deixa de ganhar em 1 ano | `poupanca` | janeiro | Busca constante; Shorts de opinião, sem conta |
| V6 | **R$ 500 por mês:** quanto vira em 5, 10 e 20 anos (a pergunta do 40+ de 23/11) | `juros-compostos` | janeiro | Vaga clara: só há tutorial de Excel |
| V7 | **Pedir demissão, acordo ou ser demitido:** quanto muda na rescisão | `rescisao-trabalhista` | janeiro | Maior cluster trabalhista do site; demissões pós-festas |
| V8 | **Price ou SAC:** a parcela e o total pago, lado a lado | `financiamento` | fevereiro | Busca perene |
| V9 | **Salário líquido em 2026:** o redutor do IR (Lei 15.270/2025) na prática | `salario-liquido`, `irrf` | fevereiro | Regra nova, pouca conta mostrada |
| V10 | **Declaração do IR 2027:** simplificada ou completa | `irpf` | março | Temporada da declaração |

**Fora por enquanto:** dívidas (o site não tem calculadora de dívidas; o vídeo pediria uma ferramenta nova).
