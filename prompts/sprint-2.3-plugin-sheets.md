# Prompt de IA — Sprint 2.3: Plugin Google Sheets
**calculosonline.com.br | Fase 2 — Expansao | Semanas 16–20**

---

## PRE-REQUISITO

- `packages/core` com todas as funcoes de calculo TypeScript compiladas
- `clasp` CLI instalado (`npm install -g @google/clasp`)
- Conta Google com Google Workspace (ou Drive pessoal)
- Node.js >= 20, webpack ou esbuild para bundling

---

## OBJETIVO DA SPRINT 2.3

1. Compilar o `packages/core` para **Google Apps Script** (ambiente V8 sem Node.js)
2. Expor **6 formulas customizadas** usaveis direto nas celulas do Sheets
3. Criar **sidebar HTML** com UI completa de calculadoras
4. Publicar no **Google Workspace Marketplace** (gratuito)
5. Criar pagina `/plugin-google-sheets` no site

---

## PARTE 1 — SETUP DO PROJETO APPS SCRIPT

### TAREFA 1: Estrutura do apps/sheets-plugin

```
apps/sheets-plugin/
├── src/
│   ├── formulas.ts          ← funcoes expostas como =CALC...()
│   ├── sidebar.ts           ← logica do menu e sidebar
│   ├── ui/
│   │   ├── sidebar.html     ← HTML da sidebar
│   │   └── styles.html      ← CSS injetado
│   └── appsscript.json      ← manifest do Apps Script
├── dist/                    ← codigo compilado (gerado pelo build)
├── webpack.config.js
├── package.json
└── .clasp.json              ← configuracao do clasp (nao commitar — tem scriptId)
```

---

### TAREFA 2: Configurar webpack para compilar TS → GAS

O Google Apps Script usa V8, mas nao suporta modulos ES (import/export) nem APIs do Node.js. O webpack transforma tudo num arquivo `.js` unico.

```javascript
// apps/sheets-plugin/webpack.config.js
const path = require("path")
const GasPlugin = require("gas-webpack-plugin")

module.exports = {
  mode: "production",
  entry: {
    Code: "./src/formulas.ts",
    Sidebar: "./src/sidebar.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "this",   // necessario para GAS
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@calculosonline/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new GasPlugin(),  // trata @customfunction, @OnlyCurrentDoc, etc.
  ],
  optimization: {
    minimize: false,  // manter legivel para debug no Apps Script editor
  },
}
```

```json
// apps/sheets-plugin/package.json
{
  "name": "@calculosonline/sheets-plugin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "webpack",
    "push": "pnpm build && clasp push",
    "open": "clasp open",
    "deploy": "pnpm build && clasp push && clasp deploy --description 'Release'"
  },
  "devDependencies": {
    "@google/clasp": "^2.4.2",
    "gas-webpack-plugin": "^2.1.0",
    "ts-loader": "^9.5.0",
    "typescript": "^5.4.0",
    "webpack": "^5.91.0",
    "webpack-cli": "^5.1.4"
  }
}
```

---

### TAREFA 3: Manifest do Apps Script

```json
// apps/sheets-plugin/src/appsscript.json
{
  "timeZone": "America/Sao_Paulo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.container.ui"
  ],
  "addOns": {
    "common": {
      "name": "CalculosOnline",
      "logoUrl": "https://calculosonline.com.br/icons/icon-128x128.png",
      "homepageTrigger": {
        "runFunction": "onHomepage"
      }
    },
    "sheets": {
      "homepageTrigger": {
        "runFunction": "onHomepage"
      },
      "onFileScopeGrantedTrigger": {
        "runFunction": "onFileScopeGranted"
      }
    }
  }
}
```

---

## PARTE 2 — FORMULAS CUSTOMIZADAS

### TAREFA 4: Implementar as 6 formulas principais

```typescript
// apps/sheets-plugin/src/formulas.ts
// Importar funcoes do core — webpack resolve o alias
import { calcularINSS } from "@calculosonline/core"
import { calcularIRRF } from "@calculosonline/core"
import { calcularRescisao } from "@calculosonline/core"
import { calcularFerias } from "@calculosonline/core"
import { calcularDecimoTerceiro } from "@calculosonline/core"
import { calcularJurosCompostos } from "@calculosonline/core"

/**
 * Calcula o INSS devido sobre um salario bruto.
 * @param {number} salario Salario bruto em R$
 * @param {string} [competencia] Competencia no formato AAAA-MM (padrao: mes atual)
 * @return {number} Valor do INSS em R$
 * @customfunction
 */
function CALCINSS(salario: number, competencia?: string): number {
  if (!salario || isNaN(salario)) return 0
  const resultado = calcularINSS({ salarioBruto: salario })
  return resultado.resultado.valorINSS
}

/**
 * Calcula o IRRF retido na fonte.
 * @param {number} salario Salario bruto em R$
 * @param {number} [dependentes] Numero de dependentes (padrao: 0)
 * @param {number} [inss] INSS ja calculado em R$ (se omitido, calcula automaticamente)
 * @return {number} Valor do IRRF em R$
 * @customfunction
 */
function CALCIRRF(salario: number, dependentes = 0, inss?: number): number {
  if (!salario || isNaN(salario)) return 0
  const inssCalculado = inss ?? calcularINSS({ salarioBruto: salario }).resultado.valorINSS
  const resultado = calcularIRRF({
    salarioBruto: salario,
    inss: inssCalculado,
    dependentes,
  })
  return resultado.resultado.valorIRRF
}

/**
 * Calcula as ferias de um funcionario CLT.
 * @param {number} salario Salario bruto em R$
 * @param {number} [diasGozados] Dias de ferias gozados (padrao: 30)
 * @param {number} [diasVendidos] Dias vendidos (abono pecuniario, padrao: 0)
 * @return {number} Valor bruto das ferias em R$
 * @customfunction
 */
function CALCFERIAS(salario: number, diasGozados = 30, diasVendidos = 0): number {
  if (!salario || isNaN(salario)) return 0
  const resultado = calcularFerias({
    salarioBruto: salario,
    diasGozados,
    diasVendidos,
  })
  return resultado.resultado.totalBruto
}

/**
 * Calcula o 13o salario (gratificacao natalina).
 * @param {number} salario Salario bruto em R$
 * @param {number} [mesesTrabalhados] Meses trabalhados no ano (padrao: 12)
 * @param {string} [parcela] "PRIMEIRA" ou "SEGUNDA" (padrao: "SEGUNDA")
 * @return {number} Valor da parcela em R$
 * @customfunction
 */
function CALCDECIMOTERCEIRO(
  salario: number,
  mesesTrabalhados = 12,
  parcela: "PRIMEIRA" | "SEGUNDA" = "SEGUNDA"
): number {
  if (!salario || isNaN(salario)) return 0
  const resultado = calcularDecimoTerceiro({ salarioBruto: salario, mesesTrabalhados })
  return parcela === "PRIMEIRA"
    ? resultado.resultado.primeiraParcela
    : resultado.resultado.segundaParcela
}

/**
 * Calcula a rescisao trabalhista (valores brutos).
 * @param {number} salario Salario bruto em R$
 * @param {number} mesesTrabalhados Total de meses no emprego
 * @param {string} motivo "SEM_JUSTA_CAUSA" | "PEDIDO_DEMISSAO" | "ACORDO_MUTUO"
 * @param {number} [saldoFGTS] Saldo atual do FGTS em R$ (para calcular multa)
 * @return {number} Total bruto da rescisao em R$
 * @customfunction
 */
function CALCRESCISAO(
  salario: number,
  mesesTrabalhados: number,
  motivo: string,
  saldoFGTS = 0
): number {
  if (!salario || isNaN(salario)) return 0
  const motivoTipado = (["SEM_JUSTA_CAUSA", "PEDIDO_DEMISSAO", "ACORDO_MUTUO", "JUSTA_CAUSA"].includes(motivo)
    ? motivo
    : "SEM_JUSTA_CAUSA") as "SEM_JUSTA_CAUSA" | "PEDIDO_DEMISSAO" | "ACORDO_MUTUO" | "JUSTA_CAUSA"

  const resultado = calcularRescisao({
    salarioBruto: salario,
    mesesTrabalhados,
    motivo: motivoTipado,
    saldoFGTS,
  })
  return resultado.resultado.totalBruto
}

/**
 * Calcula montante final com juros compostos.
 * @param {number} principal Capital inicial em R$
 * @param {number} taxa Taxa de juros em % (mensal ou anual)
 * @param {number} periodo Numero de periodos
 * @param {string} [tipo] "MENSAL" ou "ANUAL" (padrao: "MENSAL")
 * @param {number} [aporte] Aporte mensal adicional em R$ (padrao: 0)
 * @return {number} Montante final em R$
 * @customfunction
 */
function CALCJUROS(
  principal: number,
  taxa: number,
  periodo: number,
  tipo: "MENSAL" | "ANUAL" = "MENSAL",
  aporte = 0
): number {
  if (!principal || isNaN(principal)) return 0
  const resultado = calcularJurosCompostos({
    principal,
    taxa,
    periodo,
    tipoTaxa: tipo,
    aporteMensal: aporte,
  })
  return resultado.resultado.montanteFinal
}

// ─── Menu e triggers ──────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Calculadoras Online")
    .addItem("Abrir Painel", "abrirSidebar")
    .addSeparator()
    .addItem("Inserir formula CALCINSS", "inserirFormulaINSS")
    .addItem("Inserir formula CALCIRRF", "inserirFormulaIRRF")
    .addItem("Inserir formula CALCRESCISAO", "inserirFormulaRescisao")
    .addSeparator()
    .addItem("Documentacao", "abrirDocumentacao")
    .addToUi()
}

function abrirDocumentacao() {
  const url = "https://calculosonline.com.br/plugin-google-sheets"
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(`<script>window.open('${url}');</script><p>Abrindo documentacao...</p>`).setHeight(50),
    "Documentacao"
  )
}

function inserirFormulaINSS() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const cell = sheet.getActiveCell()
  cell.setFormula("=CALCINSS(A1)")
  SpreadsheetApp.getUi().alert("Formula inserida! Substitua A1 pelo endereco do celula com o salario.")
}

function inserirFormulaIRRF() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const cell = sheet.getActiveCell()
  cell.setFormula("=CALCIRRF(A1, 0)")
}

function inserirFormulaRescisao() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const cell = sheet.getActiveCell()
  cell.setFormula('=CALCRESCISAO(A1, B1, "SEM_JUSTA_CAUSA")')
}
```

---

## PARTE 3 — SIDEBAR HTML

### TAREFA 5: Sidebar com UI completa

```typescript
// apps/sheets-plugin/src/sidebar.ts

function abrirSidebar() {
  const html = HtmlService.createTemplateFromFile("sidebar")
    .evaluate()
    .setTitle("CalculosOnline")
    .setWidth(320)

  SpreadsheetApp.getUi().showSidebar(html)
}

function onHomepage() {
  return CardService.newCardBuilder()
    .setName("CalculosOnline")
    .setHeader(
      CardService.newCardHeader()
        .setTitle("CalculosOnline")
        .setSubtitle("Calculadoras financeiras e trabalhistas")
        .setImageUrl("https://calculosonline.com.br/icons/icon-96x96.png")
    )
    .addSection(
      CardService.newCardSection()
        .setHeader("Acoes rapidas")
        .addWidget(
          CardService.newButtonSet()
            .addButton(
              CardService.newTextButton()
                .setText("Abrir Painel Completo")
                .setOnClickAction(
                  CardService.newAction().setFunctionName("abrirSidebar")
                )
            )
        )
    )
    .build()
}

// Funcao chamada pela sidebar via google.script.run
function calcularNoServidor(tipo: string, params: Record<string, unknown>) {
  switch (tipo) {
    case "INSS":
      return calcularINSS(params as Parameters<typeof calcularINSS>[0])
    case "IRRF":
      return calcularIRRF(params as Parameters<typeof calcularIRRF>[0])
    case "RESCISAO":
      return calcularRescisao(params as Parameters<typeof calcularRescisao>[0])
    default:
      throw new Error(`Tipo desconhecido: ${tipo}`)
  }
}

// Inserir resultado na celula selecionada
function inserirNaCelula(valor: number, label: string) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const cell = sheet.getActiveCell()
  cell.setValue(valor)
  cell.setComment(`Calculado por CalculosOnline — ${label}`)
}
```

```html
<!-- apps/sheets-plugin/src/ui/sidebar.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_top">
  <?!= HtmlService.createHtmlOutputFromFile("styles").getContent() ?>
</head>
<body>
  <div id="app">
    <header class="header">
      <img src="https://calculosonline.com.br/icons/icon-48x48.png" alt="CalculosOnline" width="32" height="32">
      <h1>CalculosOnline</h1>
    </header>

    <!-- Tabs de navegacao -->
    <nav class="tabs">
      <button class="tab active" data-tab="salario">Salario</button>
      <button class="tab" data-tab="rescisao">Rescisao</button>
      <button class="tab" data-tab="juros">Juros</button>
      <button class="tab" data-tab="formulas">Formulas</button>
    </nav>

    <!-- Tab: Salario Liquido -->
    <section id="tab-salario" class="tab-content active">
      <div class="form-group">
        <label for="salario-bruto">Salario Bruto (R$)</label>
        <input type="number" id="salario-bruto" placeholder="Ex: 5000" min="0" step="0.01">
      </div>
      <div class="form-group">
        <label for="dependentes">Dependentes</label>
        <input type="number" id="dependentes" value="0" min="0" max="20">
      </div>
      <button class="btn-primary" onclick="calcularSalario()">Calcular</button>

      <div id="resultado-salario" class="resultado hidden">
        <h3>Resultado</h3>
        <div class="linha"><span>Salario Bruto</span><span id="r-bruto"></span></div>
        <div class="linha destaque"><span>(-) INSS</span><span id="r-inss"></span></div>
        <div class="linha destaque"><span>(-) IRRF</span><span id="r-irrf"></span></div>
        <div class="linha total"><span>Salario Liquido</span><span id="r-liquido"></span></div>
        <div class="acoes">
          <button class="btn-secondary" onclick="inserirResultado('r-inss-val', 'INSS')">Inserir INSS na celula</button>
          <button class="btn-secondary" onclick="inserirResultado('r-irrf-val', 'IRRF')">Inserir IRRF na celula</button>
          <button class="btn-primary" onclick="inserirResultado('r-liquido-val', 'Salario Liquido')">Inserir Liquido</button>
        </div>
      </div>
    </section>

    <!-- Tab: Rescisao -->
    <section id="tab-rescisao" class="tab-content">
      <div class="form-group">
        <label for="r-salario">Salario Bruto (R$)</label>
        <input type="number" id="r-salario" placeholder="Ex: 3500" min="0" step="0.01">
      </div>
      <div class="form-group">
        <label for="r-meses">Meses Trabalhados</label>
        <input type="number" id="r-meses" placeholder="Ex: 24" min="1">
      </div>
      <div class="form-group">
        <label for="r-motivo">Motivo</label>
        <select id="r-motivo">
          <option value="SEM_JUSTA_CAUSA">Demissao Sem Justa Causa</option>
          <option value="PEDIDO_DEMISSAO">Pedido de Demissao</option>
          <option value="ACORDO_MUTUO">Acordo Mutuo (Art. 484-A)</option>
          <option value="JUSTA_CAUSA">Justa Causa</option>
        </select>
      </div>
      <div class="form-group">
        <label for="r-fgts">Saldo FGTS (R$)</label>
        <input type="number" id="r-fgts" value="0" min="0" step="0.01">
      </div>
      <button class="btn-primary" onclick="calcularRescisao()">Calcular Rescisao</button>

      <div id="resultado-rescisao" class="resultado hidden">
        <h3>Total da Rescisao</h3>
        <div id="itens-rescisao"></div>
        <div class="linha total"><span>Total Bruto</span><span id="r-total-rescisao"></span></div>
        <button class="btn-primary" onclick="inserirResultado('r-total-rescisao-val', 'Rescisao Total')">
          Inserir Total na Celula
        </button>
      </div>
    </section>

    <!-- Tab: Juros Compostos -->
    <section id="tab-juros" class="tab-content">
      <div class="form-group">
        <label for="j-principal">Capital Inicial (R$)</label>
        <input type="number" id="j-principal" placeholder="Ex: 10000" min="0" step="0.01">
      </div>
      <div class="form-group">
        <label for="j-taxa">Taxa (%)</label>
        <input type="number" id="j-taxa" placeholder="Ex: 1" min="0" step="0.001">
      </div>
      <div class="form-group">
        <label for="j-tipo">Tipo da Taxa</label>
        <select id="j-tipo">
          <option value="MENSAL">Mensal (% a.m.)</option>
          <option value="ANUAL">Anual (% a.a.)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="j-periodo">Periodo (meses)</label>
        <input type="number" id="j-periodo" placeholder="Ex: 12" min="1">
      </div>
      <div class="form-group">
        <label for="j-aporte">Aporte Mensal (R$)</label>
        <input type="number" id="j-aporte" value="0" min="0" step="0.01">
      </div>
      <button class="btn-primary" onclick="calcularJuros()">Calcular</button>

      <div id="resultado-juros" class="resultado hidden">
        <div class="linha"><span>Capital Inicial</span><span id="j-r-principal"></span></div>
        <div class="linha"><span>Total Investido</span><span id="j-r-investido"></span></div>
        <div class="linha destaque"><span>Juros Ganhos</span><span id="j-r-juros"></span></div>
        <div class="linha total"><span>Montante Final</span><span id="j-r-montante"></span></div>
        <button class="btn-primary" onclick="inserirResultado('j-r-montante-val', 'Montante Final')">
          Inserir Montante na Celula
        </button>
      </div>
    </section>

    <!-- Tab: Referencia de Formulas -->
    <section id="tab-formulas" class="tab-content">
      <p class="descricao">Use estas formulas diretamente nas celulas:</p>
      <div class="formula-ref">
        <code>=CALCINSS(salario)</code>
        <p>INSS sobre salario bruto</p>
      </div>
      <div class="formula-ref">
        <code>=CALCIRRF(salario, dependentes)</code>
        <p>IRRF retido na fonte</p>
      </div>
      <div class="formula-ref">
        <code>=CALCFERIAS(salario, dias_gozados)</code>
        <p>Ferias CLT (com 1/3)</p>
      </div>
      <div class="formula-ref">
        <code>=CALCDECIMOTERCEIRO(salario, meses)</code>
        <p>13o salario proporcional</p>
      </div>
      <div class="formula-ref">
        <code>=CALCRESCISAO(salario, meses, motivo)</code>
        <p>Total bruto de rescisao</p>
      </div>
      <div class="formula-ref">
        <code>=CALCJUROS(capital, taxa, meses)</code>
        <p>Montante com juros compostos</p>
      </div>
      <a href="https://calculosonline.com.br/plugin-google-sheets" target="_blank" class="link-docs">
        Ver documentacao completa
      </a>
    </section>

    <div id="status" class="status hidden"></div>
  </div>

  <script>
    // Navegacao entre tabs
    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab, .tab-content").forEach(el => el.classList.remove("active"))
        tab.classList.add("active")
        document.getElementById("tab-" + tab.dataset.tab).classList.add("active")
      })
    })

    function fmt(valor) {
      return "R$ " + Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    function mostrarStatus(msg, tipo) {
      const el = document.getElementById("status")
      el.textContent = msg
      el.className = "status " + tipo
      setTimeout(() => el.classList.add("hidden"), 3000)
    }

    function calcularSalario() {
      const salario = parseFloat(document.getElementById("salario-bruto").value)
      const dependentes = parseInt(document.getElementById("dependentes").value) || 0
      if (!salario || isNaN(salario)) { mostrarStatus("Informe o salario bruto", "erro"); return }

      mostrarStatus("Calculando...", "info")
      google.script.run
        .withSuccessHandler(res => {
          const inss = res.resultado.valorINSS
          const irrf = res.resultado.valorIRRF
          const liquido = salario - inss - irrf
          document.getElementById("r-bruto").textContent = fmt(salario)
          document.getElementById("r-inss").textContent = fmt(inss)
          document.getElementById("r-irrf").textContent = fmt(irrf)
          document.getElementById("r-liquido").textContent = fmt(liquido)
          // Guardar valores numericos para insercao
          document.getElementById("r-inss-val") && (document.getElementById("r-inss-val").value = inss)
          document.getElementById("resultado-salario").classList.remove("hidden")
          mostrarStatus("Calculado com sucesso!", "sucesso")
        })
        .withFailureHandler(err => mostrarStatus("Erro: " + err.message, "erro"))
        .calcularNoServidor("INSS_IRRF_COMPLETO", { salarioBruto: salario, dependentes })
    }

    function calcularRescisao() {
      const params = {
        salarioBruto: parseFloat(document.getElementById("r-salario").value),
        mesesTrabalhados: parseInt(document.getElementById("r-meses").value),
        motivo: document.getElementById("r-motivo").value,
        saldoFGTS: parseFloat(document.getElementById("r-fgts").value) || 0,
      }
      if (!params.salarioBruto || !params.mesesTrabalhados) {
        mostrarStatus("Preencha salario e meses trabalhados", "erro"); return
      }
      mostrarStatus("Calculando...", "info")
      google.script.run
        .withSuccessHandler(res => {
          const itens = document.getElementById("itens-rescisao")
          itens.innerHTML = res.detalhamento.map(d => `<div class="linha"><span>${d}</span></div>`).join("")
          document.getElementById("r-total-rescisao").textContent = fmt(res.resultado.totalBruto)
          document.getElementById("resultado-rescisao").classList.remove("hidden")
          mostrarStatus("Calculado!", "sucesso")
        })
        .withFailureHandler(err => mostrarStatus("Erro: " + err.message, "erro"))
        .calcularNoServidor("RESCISAO", params)
    }

    function calcularJuros() {
      const params = {
        principal: parseFloat(document.getElementById("j-principal").value),
        taxa: parseFloat(document.getElementById("j-taxa").value),
        tipoTaxa: document.getElementById("j-tipo").value,
        periodo: parseInt(document.getElementById("j-periodo").value),
        aporteMensal: parseFloat(document.getElementById("j-aporte").value) || 0,
      }
      if (!params.principal || !params.taxa || !params.periodo) {
        mostrarStatus("Preencha todos os campos obrigatorios", "erro"); return
      }
      mostrarStatus("Calculando...", "info")
      google.script.run
        .withSuccessHandler(res => {
          document.getElementById("j-r-principal").textContent = fmt(params.principal)
          document.getElementById("j-r-investido").textContent = fmt(res.resultado.totalInvestido)
          document.getElementById("j-r-juros").textContent = fmt(res.resultado.jurosGanhos)
          document.getElementById("j-r-montante").textContent = fmt(res.resultado.montanteFinal)
          document.getElementById("resultado-juros").classList.remove("hidden")
          mostrarStatus("Calculado!", "sucesso")
        })
        .withFailureHandler(err => mostrarStatus("Erro: " + err.message, "erro"))
        .calcularNoServidor("JUROS_COMPOSTOS", params)
    }

    function inserirResultado(elementId, label) {
      // Pegar valor do elemento oculto ou calcular do textContent
      const el = document.getElementById(elementId)
      const valor = el ? parseFloat(el.value || el.textContent.replace(/[^0-9,.]/g, "").replace(",", ".")) : 0
      google.script.run
        .withSuccessHandler(() => mostrarStatus("Valor inserido na celula!", "sucesso"))
        .withFailureHandler(err => mostrarStatus("Erro ao inserir: " + err.message, "erro"))
        .inserirNaCelula(valor, label)
    }
  </script>
</body>
</html>
```

---

```html
<!-- apps/sheets-plugin/src/ui/styles.html -->
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Google Sans', Roboto, Arial, sans-serif; font-size: 13px; color: #202124; background: #fff; }
  .header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #e0e0e0; background: #1a73e8; color: white; }
  .header h1 { font-size: 14px; font-weight: 600; }
  .tabs { display: flex; border-bottom: 1px solid #e0e0e0; overflow-x: auto; }
  .tab { flex: 1; padding: 10px 4px; border: none; background: none; cursor: pointer; font-size: 12px; color: #5f6368; white-space: nowrap; }
  .tab.active { color: #1a73e8; border-bottom: 2px solid #1a73e8; font-weight: 500; }
  .tab-content { display: none; padding: 16px; }
  .tab-content.active { display: block; }
  .form-group { margin-bottom: 12px; }
  label { display: block; font-size: 12px; color: #5f6368; margin-bottom: 4px; }
  input, select { width: 100%; border: 1px solid #dadce0; border-radius: 4px; padding: 8px 10px; font-size: 13px; outline: none; }
  input:focus, select:focus { border-color: #1a73e8; box-shadow: 0 0 0 2px rgba(26,115,232,0.2); }
  .btn-primary { width: 100%; padding: 10px; background: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 13px; font-weight: 500; cursor: pointer; margin-top: 4px; }
  .btn-primary:hover { background: #1557b0; }
  .btn-secondary { flex: 1; padding: 8px; background: #f1f3f4; color: #1a73e8; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; }
  .resultado { margin-top: 16px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
  .resultado h3 { padding: 10px 12px; background: #f8f9fa; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #5f6368; }
  .linha { display: flex; justify-content: space-between; padding: 8px 12px; border-top: 1px solid #f1f3f4; font-size: 13px; }
  .linha.destaque { color: #d93025; }
  .linha.total { font-weight: 700; background: #e8f0fe; color: #1557b0; }
  .acoes { padding: 10px 12px; display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid #e0e0e0; }
  .hidden { display: none !important; }
  .status { padding: 10px 16px; margin: 8px; border-radius: 4px; font-size: 12px; text-align: center; }
  .status.info { background: #e8f0fe; color: #1557b0; }
  .status.sucesso { background: #e6f4ea; color: #137333; }
  .status.erro { background: #fce8e6; color: #c5221f; }
  .formula-ref { background: #f8f9fa; border-radius: 6px; padding: 10px; margin-bottom: 8px; }
  .formula-ref code { display: block; font-size: 12px; color: #1a73e8; margin-bottom: 4px; font-family: monospace; }
  .formula-ref p { font-size: 11px; color: #5f6368; }
  .link-docs { display: block; text-align: center; color: #1a73e8; font-size: 12px; margin-top: 12px; text-decoration: none; }
  .descricao { font-size: 12px; color: #5f6368; margin-bottom: 12px; }
</style>
```

---

## PARTE 4 — PUBLICACAO NO MARKETPLACE

### TAREFA 6: Deploy com clasp

```bash
# 1. Login no Google
clasp login

# 2. Criar projeto Apps Script vinculado a uma planilha
cd apps/sheets-plugin
clasp create --type sheets --title "CalculosOnline"
# Isso cria .clasp.json com o scriptId — nao commitar!

# 3. Build e push
pnpm push
# Deve exibir: "Pushed X files."

# 4. Abrir no editor online para verificar
pnpm open

# 5. Criar deployment para o Marketplace
pnpm deploy
```

```json
// apps/sheets-plugin/.clasp.json (adicionar ao .gitignore)
{
  "scriptId": "SCRIPT_ID_AQUI",
  "rootDir": "./dist"
}
```

```gitignore
# apps/sheets-plugin/.gitignore
.clasp.json
dist/
node_modules/
```

---

### TAREFA 7: Publicar no Google Workspace Marketplace

Acessar: [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → OAuth Consent Screen

**Configuracoes necessarias:**

```
App name:             CalculosOnline — Calculadoras para Sheets
User support email:   contato@calculosonline.com.br
App domain:           calculosonline.com.br
Privacy policy URL:   https://calculosonline.com.br/privacidade
Terms of service URL: https://calculosonline.com.br/termos

Scopes solicitados:
  - spreadsheets.currentonly (leitura/escrita na planilha atual)
  - script.container.ui (mostrar sidebar e menu)

Listing details:
  Short description: Calcule INSS, IRRF, rescisao, ferias e juros direto no Sheets.
  Full description:  (300 palavras sobre funcionalidades, precisao legislativa, gratuito)
  Category:          Finance
  Screenshots:       (2 screenshots da sidebar e das formulas em uso)
  Icon (128x128):    https://calculosonline.com.br/icons/icon-128x128.png
```

---

## PARTE 5 — PAGINA NO SITE

### TAREFA 8: /plugin-google-sheets

```typescript
// apps/web/src/app/plugin-google-sheets/page.tsx
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Plugin Google Sheets — Calculadoras para Planilhas | CalculosOnline",
  description: "Instale o add-on gratuito do CalculosOnline no Google Sheets. Calcule INSS, IRRF, rescisao e juros compostos com formulas simples como =CALCINSS(A1).",
}

export default function PluginSheetsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          {/* Icone Google Sheets */}
          <img src="/images/google-sheets-icon.svg" alt="Google Sheets" width={40} height={40} />
          <h1 className="text-3xl font-bold text-gray-900">
            CalculosOnline para Google Sheets
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Use as mesmas calculadoras precisas direto nas suas planilhas. Formulas customizadas
          com tabelas 2026 atualizadas.
        </p>
        <a
          href="https://workspace.google.com/marketplace/app/calculosonline/ID_DO_APP"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#0F9D58] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0b7a44] transition-colors"
        >
          Instalar gratuitamente no Google Sheets
        </a>
      </header>

      {/* Referencia de formulas */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Formulas disponíveis</h2>

        {[
          {
            formula: "=CALCINSS(salario)",
            exemplo: "=CALCINSS(5000)",
            resultado: "R$ 550,17",
            descricao: "Calcula o INSS progressivo (tabela 2026). Retorna o valor a descontar do salario.",
            args: [{ nome: "salario", tipo: "numero", desc: "Salario bruto em R$" }],
          },
          {
            formula: "=CALCIRRF(salario, dependentes)",
            exemplo: "=CALCIRRF(5000, 2)",
            resultado: "R$ 0,00",
            descricao: "Calcula o IRRF (Imposto de Renda Retido na Fonte) apos deducao do INSS e dependentes.",
            args: [
              { nome: "salario", tipo: "numero", desc: "Salario bruto em R$" },
              { nome: "dependentes", tipo: "numero", desc: "Numero de dependentes (opcional, padrao: 0)" },
            ],
          },
          {
            formula: "=CALCRESCISAO(salario, meses, motivo)",
            exemplo: '=CALCRESCISAO(B2, C2, "SEM_JUSTA_CAUSA")',
            resultado: "Varia",
            descricao: 'Total bruto da rescisao. Motivos aceitos: "SEM_JUSTA_CAUSA", "PEDIDO_DEMISSAO", "ACORDO_MUTUO", "JUSTA_CAUSA"',
            args: [
              { nome: "salario", tipo: "numero", desc: "Ultimo salario bruto em R$" },
              { nome: "meses", tipo: "numero", desc: "Total de meses trabalhados" },
              { nome: "motivo", tipo: "texto", desc: "Motivo da rescisao (ver opcoes acima)" },
            ],
          },
          {
            formula: "=CALCFERIAS(salario, dias_gozados)",
            exemplo: "=CALCFERIAS(4000, 30)",
            resultado: "R$ 5.333,33",
            descricao: "Calcula o valor bruto das ferias incluindo o terco constitucional (1/3). Dias vendidos opcionais.",
            args: [
              { nome: "salario", tipo: "numero", desc: "Salario bruto em R$" },
              { nome: "dias_gozados", tipo: "numero", desc: "Dias de ferias (padrao: 30)" },
            ],
          },
          {
            formula: "=CALCDECIMOTERCEIRO(salario, meses)",
            exemplo: "=CALCDECIMOTERCEIRO(3000, 8)",
            resultado: "R$ 2.000,00",
            descricao: "Calcula o 13o salario proporcional ao periodo trabalhado.",
            args: [
              { nome: "salario", tipo: "numero", desc: "Salario bruto em R$" },
              { nome: "meses", tipo: "numero", desc: "Meses trabalhados no ano (padrao: 12)" },
            ],
          },
          {
            formula: "=CALCJUROS(capital, taxa, meses, tipo, aporte)",
            exemplo: "=CALCJUROS(10000, 1, 12, \"MENSAL\", 500)",
            resultado: "R$ 17.615,28",
            descricao: "Montante final com juros compostos e aportes mensais opcionais.",
            args: [
              { nome: "capital", tipo: "numero", desc: "Capital inicial em R$" },
              { nome: "taxa", tipo: "numero", desc: "Taxa em % (mensal ou anual)" },
              { nome: "meses", tipo: "numero", desc: "Numero de meses" },
              { nome: "tipo", tipo: "texto", desc: '"MENSAL" ou "ANUAL" (padrao: "MENSAL")' },
              { nome: "aporte", tipo: "numero", desc: "Aporte mensal adicional em R$ (opcional)" },
            ],
          },
        ].map(({ formula, exemplo, resultado, descricao, args }) => (
          <div key={formula} className="rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <code className="text-brand-700 font-mono text-sm bg-brand-50 px-2 py-1 rounded">{formula}</code>
              <span className="text-sm text-gray-500 whitespace-nowrap">Ex: {resultado}</span>
            </div>
            <p className="text-sm text-gray-600">{descricao}</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Exemplo:</p>
              <code className="text-xs font-mono text-gray-800">{exemplo}</code>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
```

---

## CHECKLIST DE VERIFICACAO

```bash
# Build do plugin
cd apps/sheets-plugin
pnpm build
ls dist/
# Deve mostrar: Code.js  Sidebar.js  appsscript.json  ui/

# Push para o Apps Script
pnpm push
# Deve exibir: "Pushed 4 files."

# Testar formulas manualmente no Sheets
# Abrir planilha → digitar =CALCINSS(5000) na celula A1
# Resultado esperado: 550.17 (aproximado — varia com tabela 2026)
```

### Verificacoes pos-publicacao

- [ ] Add-on aparece em "Extensoes > Complementos" no Sheets
- [ ] Menu "Calculadoras Online" aparece na barra de menus
- [ ] Sidebar abre corretamente com as tabs
- [ ] Formula `=CALCINSS(5000)` retorna valor correto
- [ ] Formula `=CALCIRRF(5000, 0)` retorna valor correto
- [ ] Formula `=CALCRESCISAO(3000, 24, "SEM_JUSTA_CAUSA")` retorna valor plausivel
- [ ] Inserir resultado na celula ativa funciona
- [ ] Pagina `/plugin-google-sheets` no site com instrucoes e exemplos
- [ ] Link para o Marketplace correto

---

## CRITERIOS DE ACEITE

| Criterio | Meta |
|----------|------|
| Formulas publicadas | 6 funcoes (CALCINSS, CALCIRRF, CALCRESCISAO, CALCFERIAS, CALCDECIMOTERCEIRO, CALCJUROS) |
| Precisao | Resultados identicos ao site para os mesmos parametros |
| Sidebar | Abre e calcula sem erros nas 3 tabs |
| Marketplace | Add-on publicado e instalavel |
| Usuarios ativos | 100 no mes 3 apos publicacao |
| Pagina no site | `/plugin-google-sheets` publicada com SEO |

> **Proximo passo:** Sprint 2.4 — Header Bidding, afiliados e diversificacao de receita.
