# Roteiro de gravação — V1 Tesouro Reserva

**Página:** https://calculosonline.com.br/calculadora/tesouro-reserva (F83, no ar desde 25/11/2026)
**Feature:** F91 (piloto do canal). Pauta V1–V10 aprovada pelo Paulo em 25/11.
**Escrito em:** 25/11/2026, no molde da V6 do Recibo Fácil | **Status:** ✅ **texto aprovado pelo Paulo em 25/11** (*"aprovado"*), sem ajustes

Duas versões: **vídeo normal** (horizontal, ~1:42 + 10 s de tela final) e **Short** (vertical, ~32 s, celular
emulado), que também vira Reel no Instagram e no Facebook. O público é quem guarda a reserva de emergência e
ouviu que o Tesouro Reserva "resgata na hora". O gancho é o que os 10 vídeos do topo não mostram (pesquisa de
25/11, `README.md`): **o resgate é imediato, mas, antes de 30 dias, o IOF leva parte do rendimento**, e a
poupança, no mesmo prazo, não rende nada.

---

## Fatos do produto que o roteiro respeita

Conferidos no código e na página em 25/11/2026. Conferir em produção antes de gravar:

| Fato | Onde |
|---|---|
| H1 da página: "Simulador do Tesouro Reserva" | `calculators.ts` (`tituloLongo`) |
| Campos: **Valor aplicado** (R$, com atalhos de valor), **Prazo até o resgate** (botões − e +, com atalhos), **O prazo está em** (Meses · Dias, botões de opção; dica "Use dias para ver o IOF dos resgates feitos antes de 30 dias."). Botão **Simular Tesouro Reserva** | `TesouroReservaForm.tsx` |
| Resultado com o passo a passo: Valor aplicado; Rendimento bruto (100% da Selic de X% a.a.); (-) IOF (X% do rendimento, resgate com N dias), **só antes de 30 dias**; IR; Custódia; Valor líquido no resgate; Rendimento líquido; Poupança no mesmo prazo; CDB de 100% do CDI no mesmo prazo | `packages/core/src/investimentos/tesouro-reserva.ts` |
| Tabela de evolução **dia a dia** quando o prazo é de até 60 dias (com a coluna IOF antes de 30), mês a mês nos outros casos | idem |
| Regras: 100% da Selic; a partir de R$ 1; resgate a qualquer hora, por Pix, pausa só entre 0h e 1h; IOF regressivo nos primeiros 30 dias (96% no 1º dia, 50% no 15º, zero no 30º); IR regressivo; custódia da B3 só sobre o que passa de R$ 10 mil | página, com as fontes (Tesouro Nacional, B3, Planalto) |

**Números do motor** (Selic 13,75% e CDI 13,65% a.a., Banco Central em 26/10/2026; aparecem **só na tela e
na descrição**, nunca na fala; `README.md`, regra 2). Os mesmos dos testes de `tesouro-reserva.test.ts`:

| Cenário | Bruto | IOF | IR | Líquido | Poupança |
|---|---|---|---|---|---|
| R$ 1.000, 15 dias | R$ 5,31 | R$ 2,66 (50%) | R$ 0,60 | **R$ 1.002,05** | R$ 1.000,00 (não rende antes do mês) |
| R$ 1.000, 30 dias | R$ 10,65 | — | R$ 2,40 | **R$ 1.008,25** | R$ 1.005,00 |
| R$ 1.000, 12 meses | R$ 137,50 | — | R$ 24,06 | **R$ 1.113,44** | R$ 1.061,68 · CDB 100% CDI R$ 1.112,61 |

**Não fale no vídeo:**
- Nenhum valor em reais que dependa da Selic, nenhuma taxa (a fala diz "metade do rendimento", "nada", "bem à frente").
- Nome de banco, corretora ou do distribuidor do título (a notícia do Tesouro cita um banco; o vídeo não).
- "Vale a pena", "o melhor investimento" ou qualquer recomendação: o vídeo mostra a conta.
- Rima e sons que se juntam: lido em voz alta em 25/11.

**Dados em cena:** nenhum dado pessoal (a calculadora não pede nenhum).

---

# 1. VÍDEO NORMAL (~1:42 + tela final)

> Tempos a 2,8 palavras/s (a média do clone no RF); a janela final de cada cena sai da voz gerada, e a tela é
> gravada nela. Horizontal 1920×1080, janela anônima, zoom 100%, em produção.

### [0:00 – 0:09] Gancho  ·  26 palavras ≈ 9,3 s
**Tela:** topo da página, H1 "Simulador do Tesouro Reserva" visível.
> "O Tesouro Reserva deixa você resgatar a qualquer hora. Mas, se o dinheiro sair antes de trinta dias, uma parte do rendimento fica pelo caminho."

> **Abertura de 1 s** (`identidade/abertura-1s.mp4`), corte seco.

### [0:10 – 0:22] O que é  ·  33 palavras ≈ 11,8 s
**Tela:** rolagem até "O que é o Tesouro Reserva", com a lista das regras em quadro; volta ao formulário.
> "É o título do Tesouro feito para a reserva de emergência: rende cem por cento da Selic, começa com um real, e o resgate cai no Pix, até no fim de semana."

### [0:22 – 0:33] Preencher  ·  30 palavras ≈ 10,7 s (a tela pede ~11 s)
**Tela:** o valor `1000` digitado; o prazo `15`; o toque em **Dias** (a dica do IOF aparece); **Simular Tesouro Reserva**.
> "Aqui no Calculos Online, o simulador pede três coisas: quanto você vai aplicar, por quanto tempo, e se o prazo está em meses ou em dias. Mil reais, quinze dias."

### [0:33 – 0:46] O IOF  ·  35 palavras ≈ 12,5 s
**Tela:** o resultado; destaque (zoom leve) na linha "(-) IOF (50% do rendimento, resgate com 15 dias)", depois no IR e na linha da poupança ("não rende antes de completar 1 mês").
> "Olha o IOF: com quinze dias, ele leva metade do rendimento. Depois ainda sai o imposto de renda. E a poupança, no mesmo prazo, não rendeu nada, porque ela só paga quando completa o mês."

### [0:46 – 0:54] A tabela dia a dia  ·  22 palavras ≈ 7,9 s (a tela pede ~9 s)
**Tela:** abre a tabela de evolução; rolagem lenta da linha 1 à 15 com a coluna IOF.
> "Na tabela, dia por dia, dá para ver o IOF diminuindo: ele cai um pouco a cada dia, e zera no trigésimo."

### [0:54 – 1:02] Trinta dias  ·  16 palavras ≈ 5,7 s (a tela pede ~8 s)
**Tela:** o prazo vai para `30` (botão +, ou digitado), Simular; o resultado sem a linha do IOF.
> "Com trinta dias, não tem mais IOF. Sai só o imposto de renda, sobre o que rendeu."

### [1:02 – 1:15] Doze meses  ·  31 palavras ≈ 11,1 s (a tela pede ~13 s)
**Tela:** toque em **Meses**, prazo `12`, Simular; zoom no "Valor líquido no resgate", depois nas linhas da poupança e do CDB.
> "E em doze meses, o Tesouro Reserva termina bem à frente da poupança, e praticamente empatado com um CDB que paga cem por cento do CDI."

### [1:15 – 1:23] Custódia  ·  20 palavras ≈ 7,1 s
**Tela:** rolagem até a linha "(-) Custódia B3 (isenta até R$ 10.000)".
> "Acima de dez mil reais, entra a taxa de custódia da B3, só sobre o que passar disso. O simulador já desconta."

### [1:23 – 1:32] Compartilhar  ·  24 palavras ≈ 8,6 s
Cena acrescentada a pedido do Paulo em 25/11 (*"pensando se não faz sentido no vídeo mostrar como compartilhar o
cálculo"*; fala aprovada: *"sim"*). Só no vídeo normal; o Short fica sem, para não tirar tempo do IOF.
**Tela:** zoom no botão "Compartilhar via WhatsApp" embaixo do resultado (**sem clicar**: abriria o WhatsApp Web
com a conta de quem grava); em seguida, o link do cálculo (`shareUrl`, com o `?d=`) aberto numa aba nova, já no
resultado (F59), com os mesmos números.
> "Quer mandar essa conta para alguém? O botão do WhatsApp envia um link, e quem abre já vê o cálculo pronto, com os mesmos números."

### [1:32 – 1:42] Fechamento  ·  27 palavras ≈ 9,6 s
**Tela:** volta ao topo da página; a URL grande.
> "Ou seja: o resgate é imediato, mas, nos primeiros trinta dias, ele custa parte do rendimento. O simulador é grátis, sem cadastro. O link está na descrição."

> **Depois do fechamento: tela final de 10 s** (`identidade/tela-final-10s.mp4`).

---

# 2. SHORT (~32 s)

Celular emulado (360 × 640, escala 3), em produção. Sem abertura nem tela final; o gancho é o primeiro quadro.
Legenda queimada no alto, logo abaixo da pílula do passo. O mesmo arquivo vira Reel.

### [0:00 – 0:04] Gancho  ·  9 palavras ≈ 3,2 s
**Tela:** a página no celular. **Texto grande:** `RESGATOU ANTES DE 30 DIAS?`
> "Tirou do Tesouro Reserva antes de trinta dias?"

### [0:04 – 0:08] A conta  ·  9 palavras ≈ 3,2 s
> "Uma parte do rendimento ficou com o IOF."

### [0:08 – 0:22] Demo, um passo por vez  ·  27 palavras ≈ 9,6 s (a tela pede ~14 s)
**Pílulas:** `MIL REAIS, 15 DIAS` → `IOF` → `POUPANÇA` → `30 DIAS`
> "Mil reais, quinze dias." · "O IOF leva metade do rendimento." · "A poupança, no mesmo prazo, não rende nada." · "Com trinta dias, o IOF zera."

### [0:22 – 0:27] Fecho do conteúdo  ·  9 palavras ≈ 3,2 s
**Tela:** o resultado de 30 dias, sem a linha do IOF.
> "Simule o seu prazo antes de resgatar."

### [0:27 – 0:32] CTA
**Tela:** cartão final: logo, `calculosonline.com.br`, `/calculadora/tesouro-reserva` e "Link fixado nos comentários".
> "Calculos Online ponto com ponto bê-érre. Link fixado nos comentários." — gerado nesta V1 e reaproveitado em
> todos os Shorts seguintes (como o fecho da V2 no RF).

---

## Metadados

### Vídeo normal
- **Título:** `Tesouro Reserva: quanto rende e quanto o IOF leva se você resgatar antes de 30 dias`
- **Descrição:**
  ```
  Simulador do Tesouro Reserva, grátis e sem cadastro:
  https://calculosonline.com.br/calculadora/tesouro-reserva?utm_source=youtube&utm_medium=video&utm_campaign=v1-tesouro-reserva

  O Tesouro Reserva rende 100% da Selic e tem resgate a qualquer hora, por Pix. Mas, nos primeiros
  30 dias, o IOF leva parte do rendimento: 50% num resgate com 15 dias, e zero a partir do 30º dia.
  Depois vem o Imposto de Renda, e acima de R$ 10 mil, a custódia da B3.

  Números do vídeo: Selic de 13,75% e CDI de 13,65% ao ano (Banco Central, 26/10/2026).
  O simulador do site usa sempre a taxa mais recente.

  0:00 O que é o Tesouro Reserva
  0:21 Simulando R$ 1.000 por 15 dias
  0:34 O IOF, a poupança e o resgate com 30 dias
  1:00 Em 12 meses: poupança, CDB e custódia
  1:18 Compartilhar o cálculo

  Fontes:
  Tesouro Nacional (lançamento): https://www.gov.br/tesouronacional/pt-br/noticias/tesouro-nacional-b3-e-bb-lancam-tesouro-reserva-com-operacao-24h-nos-7-dias-da-semana
  B3 Educação: https://edu.b3.com.br/w/tesouro-reserva
  Tabela do IOF (Decreto 6.306/2007): https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm
  IR regressivo (Lei 11.033/2004): https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm

  Conteúdo educativo, sem recomendação de investimento.
  ```
  Capítulos tirados do corte final de 25/11 (`cenas-voz.json`), todos com 10 s ou mais: "Com 30 dias" (6 s) e "Custódia" (8 s) entraram no capítulo anterior. O link do Tesouro Nacional tem as letras
  de um banco no endereço; é a fonte oficial e fica (o texto da descrição não nomeia ninguém).
- **Links com UTM, um por rede**, `utm_campaign=v1-tesouro-reserva`:
  - YouTube: `https://calculosonline.com.br/calculadora/tesouro-reserva?utm_source=youtube&utm_medium=video&utm_campaign=v1-tesouro-reserva`
  - Facebook: `https://calculosonline.com.br/calculadora/tesouro-reserva?utm_source=facebook&utm_medium=social&utm_campaign=v1-tesouro-reserva`
  - Instagram: `https://calculosonline.com.br/calculadora/tesouro-reserva?utm_source=instagram&utm_medium=social&utm_campaign=v1-tesouro-reserva`
  - Conferir antes de publicar: os três respondem 200 com o `canonical` limpo.
- **Tags:** `tesouro reserva`, `quanto rende tesouro reserva`, `tesouro reserva iof`, `simulador tesouro reserva`, `tesouro reserva ou poupança`, `reserva de emergência`, `tesouro direto`
- **Thumbnail:** fundo escuro, `RESGATOU ANTES DE 30 DIAS?` em caixa alta ocupando 2/3, o recorte do resultado com a linha do IOF de canto; `logo-horizontal-escuro.png` pequeno num canto.
- **Uso de IA:** "Não" (clone da própria voz). **Público:** não é para crianças.

### Short (e Reels)
Um vídeo e um texto só nas três redes; o link, um por rede.
- **Título:** `Tesouro Reserva: o IOF antes de 30 dias #tesouroreserva #investimentos`
- **Descrição:** `Quanto o IOF leva do Tesouro Reserva num resgate antes de 30 dias.` + `<link da rede>`
- **Comentário fixado:** `Simule o seu em <link da rede>`
- **Só no YouTube Studio:** "Vídeo relacionado" = a V1 normal.

---

## Ordem de gravação

1. **Texto aprovado pelo Paulo** (este roteiro).
2. **Portar as ferramentas do RF** para `docs/roteiros/ferramentas/` (`narrar.py`, `mixar.py`, `short-voz.py`,
   `shorts/`), apontando para `~/Vídeos/calculosonline-v1/`; a música é `~/Vídeos/calculosonline-musica/calculosonline-trilha.mp3`.
3. **Voz, só com o ok:** falas em `docs/roteiros/voz/v1.json` e `v1-short.json`, com a pronúncia escrita onde a
   grafia engana ("Calculos Online ponto com ponto bê-érre", "cem por cento", "B3" → "bê três"). `narrar.py --contar`
   e o saldo antes; estimativa pelo RF: ~1.550 caracteres → ~620 créditos.
4. **Tela em produção** (Playwright, janela anônima, GA4 e Clarity bloqueados), sobre a voz. **Dia e hora no `MEMORY.md`.**
5. **Montar e mixar** (voz −14 LUFS, trilha 18 LU abaixo com *ducking*); o Paulo ouve e publica o normal; o Short
   depois, com o normal no "Vídeo relacionado", e os Reels com o link de cada rede.
6. **Leitura em 28 dias:** visualizações no Studio e sessões da campanha `v1-tesouro-reserva` no GA4.

---

## Voz (25/11/2026)

Gerada com o ok do Paulo (*"sim"*), `narrar.py` com o clone "RF narração" no `eleven_v4`: normal **1.387 caracteres,
10 falas, 88,6 s de fala** (`~/Vídeos/calculosonline-v1/voz/`) e Short **337 caracteres, 8 falas, 20,8 s** com o CTA
reaproveitável `10-cta` (`~/Vídeos/calculosonline-v1-short/voz/`). **Gasto real: 690 créditos** (contador 10.514 →
11.204 de 40.000). Ritmo de 2,6 a 3,7 palavras/s; a tela é gravada na janela de cada fala (`falas.json`).
**Próximo:** o Paulo ouve `completa.mp3` das duas pastas (pronúncia de "Cálculos", "í ó éfe", "cê dê bê", "bê três");
fala ruim → `--so <id>`.

## Vídeo normal montado (25/11/2026)

- **Tela em produção:** 1ª tomada 20:42:14 → 20:43:53 (descartada: a tabela dia a dia rolava a página e não a caixa da
  tabela, e parava no dia 11); **2ª tomada 20:51:21 → 20:53:00**, a usada (`ferramentas/v1/gravar-v1.cjs`). GA4, Clarity,
  AdSense e Vercel Analytics bloqueados nas duas; nada salvo, nada compartilhado de verdade (o WhatsApp não foi aberto; o
  link do cálculo foi aberto direto).
- **Montagem e mixagem:** `ferramentas/v1/montar-v1.py` + `mixar.py` → **`~/Vídeos/calculosonline-v1/v1-final-voz.mp4`**
  (1920×1080, **1:47,5** com a tela final; voz −14 LUFS, trilha opção B **8 LU abaixo da voz** (escolha do Paulo; a 1ª mixagem, a 18, ficou sem música audível), final −15,8 LUFS, pico −4,0 dBTP).
- **Conferido nos quadros:** 1.002,05 / IOF 50% / poupança parada (15 dias), tabela até o dia 15, 1.008,25 sem IOF (30
  dias), 1.113,44 com poupança e CDB destacados (12 meses), custódia isenta, botão do WhatsApp e o link aberto no resultado
  ("Valores de um cálculo compartilhado").
- **Desvio do roteiro:** sem zoom; no lugar, uma caixa âmbar desenhada por cima da linha que a voz cita (só no vídeo).
- **Achado no site (não é do vídeo):** na tabela de evolução, o cabeçalho fixo deixa aparecer o número da linha que rola
  por baixo na coluna "Dia" (a célula "Dia" do cabeçalho fica sem fundo). Visível em 0:52–0:54.
- **Tela final no Studio a partir de 1:38.** Capítulos já corrigidos na descrição (Metadados).

## Short e thumbnail (25/11/2026)

- **Short:** tela em produção num celular emulado, 1ª tomada 21:24:47 → 21:25:11 (descartada: a legenda e a pílula cobriam o
  valor do resultado), **2ª tomada 21:34:28 → 21:35:05** (`ferramentas/v1-short/gravar-v1-short.cjs`, `short.json`,
  `sobreposicoes.json`), montado com `shorts/montar-short.py` e `short-voz.py` → **`~/Vídeos/calculosonline-v1-short/v1-short-final-voz.mp4`**
  (1080 × 1920, **0:25,8**, 10 legendas queimadas; trilha a 8 LU abaixo). A legenda mostra "IOF" onde a voz diz "í ó éfe"
  (`GRAFIA` no `short-voz.py`). Ficou mais curto que os ~32 s previstos: a voz gerada é mais rápida que a estimativa.
- **Thumbnail:** `ferramentas/v1/thumbnail-v1.cjs` → **`~/Vídeos/calculosonline-v1/v1-thumbnail.png`** (1280 × 720):
  "RESGATOU ANTES DE 30 DIAS?", o resultado de 15 dias recortado da gravação com a linha do IOF destacada e o selo "IOF LEVA 50%".
- **Ordem de publicação:** o normal primeiro (título, descrição com capítulos e link do YouTube, tags, thumbnail, tela final a
  partir de 1:38, "Uso de IA: Não"); depois o Short, com a V1 normal no "Vídeo relacionado" e o endereço no comentário fixado.
  Reels quando o Instagram e o Facebook existirem.

## Publicado (25/11/2026)

- **Normal:** ✅ **https://youtu.be/kSFT8qBrfqA**, público desde 25/11 às **22:09** (`publishDate` 17:09:10-08:00), 1:48.
  Conferido na página no mesmo dia: título, descrição (link com UTM, taxas datadas, 5 capítulos, fontes), as 7 tags e a
  thumbnail (`maxresdefault` igual à `v1-thumbnail.png`: o canal foi verificado com outro número, já que o do Paulo tinha
  atingido o limite de duas contas por ano). **Categoria saiu "Pessoas e blogs"**, não "Educação": trocar no Studio (e
  acertar o padrão de envio do canal).
- **Short:** ✅ **https://youtube.com/shorts/MDrxj1Vdkaw**, público desde 25/11 às **22:13**, 0:26, mesmo título e descrição do
  roteiro; a página do Short cita a V1 normal (o "Vídeo relacionado" parece configurado). Mesma categoria a trocar.
- **Link da descrição:** responde 200 com o `canonical` limpo (conferido em 25/11).
- **Não conferido de fora:** o comentário fixado e a tela final (não aparecem no HTML da página).
- **Leitura em 23/12** (28 dias): visualizações no Studio e sessões da campanha `v1-tesouro-reserva` no GA4.
