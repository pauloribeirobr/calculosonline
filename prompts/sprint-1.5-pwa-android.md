# Prompt de IA — Sprint 1.5: PWA e Android (TWA)
**calculosonline.com.br | Fase 1 — MVP | Semanas 5–6**

---

## PRÉ-REQUISITO

- Sprint 1.3 concluída: site publicado em produção no domínio `calculosonline.com.br` via Vercel
- Sprint 1.4.1 concluída: memória de cálculo, tipografia numérica, logo e favicons prontos
- Domínio com HTTPS ativo (obrigatório para Service Worker e TWA)

---

## OBJETIVO DA SPRINT 1.5

1. **PWA completo** — manifest, Service Worker com Workbox, offline, score Lighthouse > 90
2. **TWA Android** — empacotar o PWA para a Google Play Store via bubblewrap
3. **Link de verificação Digital Asset Links** — conectar PWA e TWA

---

## PARTE 1 — PWA

### TAREFA 1: Web App Manifest

```json
// apps/web/public/manifest.json
{
  "name": "CalculosOnline.com.br",
  "short_name": "CalculosOnline",
  "description": "Calculadoras online precisas e gratuitas. INSS, IRRF, rescisão e muito mais.",
  "start_url": "/?utm_source=pwa",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "lang": "pt-BR",
  "dir": "ltr",
  "scope": "/",
  "categories": ["finance", "productivity", "utilities"],
  "screenshots": [
    {
      "src": "/screenshots/desktop-home.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Homepage com calculadoras em destaque"
    },
    {
      "src": "/screenshots/mobile-rescisao.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Calculadora de rescisão no celular"
    }
  ],
  "icons": [
    { "src": "/icons/icon-72x72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96x96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    {
      "name": "Rescisão Trabalhista",
      "short_name": "Rescisão",
      "url": "/calculadora/rescisao-trabalhista?utm_source=shortcut",
      "icons": [{ "src": "/icons/shortcut-rescisao.png", "sizes": "96x96" }]
    },
    {
      "name": "Salário Líquido",
      "short_name": "Salário",
      "url": "/calculadora/salario-liquido?utm_source=shortcut",
      "icons": [{ "src": "/icons/shortcut-salario.png", "sizes": "96x96" }]
    },
    {
      "name": "IRPF 2026",
      "short_name": "IRPF",
      "url": "/calculadora/irpf?utm_source=shortcut",
      "icons": [{ "src": "/icons/shortcut-irpf.png", "sizes": "96x96" }]
    }
  ],
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=br.com.calculosonline",
      "id": "br.com.calculosonline"
    }
  ],
  "prefer_related_applications": false
}
```

### Link para o manifest no layout

```typescript
// apps/web/src/app/layout.tsx — adicionar no <head>
export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CalculosOnline",
  },
  formatDetection: { telephone: false },
}
```

---

### TAREFA 2: Service Worker com next-pwa

```bash
pnpm --filter web add next-pwa
```

```typescript
// apps/web/next.config.ts — integrar next-pwa
import withPWAInit from "next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Cache de runtime configurado manualmente abaixo
  runtimeCaching: [
    // 1. Páginas de calculadoras — network first, fallback para cache
    {
      urlPattern: /^https:\/\/calculosonline\.com\.br\/calculadora\/.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "calculadoras-pages",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 dias
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // 2. Assets estáticos (JS, CSS, fontes) — cache first
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // 3. Fontes Google — stale while revalidate
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // 4. Imagens — cache first
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
})

export default withPWA(nextConfig)
```

---

### TAREFA 3: Offline Fallback Page

```typescript
// apps/web/src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="text-6xl" aria-hidden>📴</div>
      <h1 className="text-2xl font-bold text-gray-900">Você está offline</h1>
      <p className="text-gray-600">
        Sem conexão com a internet. As calculadoras que você usou recentemente
        ainda funcionam — abra-as pela lista abaixo.
      </p>
      {/* Client component que lê do localStorage as últimas calculadoras */}
      <RecentCalculators />
      <p className="text-sm text-gray-400">
        Os cálculos são feitos localmente no seu dispositivo — funciona sem internet!
      </p>
    </main>
  )
}
```

```typescript
// apps/web/src/components/RecentCalculators.tsx
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const STORAGE_KEY = "recent_calculadoras"
const MAX_RECENTES = 5

export function RecentCalculators() {
  const [recentes, setRecentes] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setRecentes(JSON.parse(stored) as string[])
  }, [])

  if (recentes.length === 0) return null

  return (
    <div className="space-y-2 text-left">
      <h2 className="text-sm font-medium text-gray-700">Calculadoras recentes:</h2>
      <ul className="space-y-1">
        {recentes.map((slug) => (
          <li key={slug}>
            <Link href={`/calculadora/${slug}`} className="text-brand-600 hover:underline text-sm">
              /calculadora/{slug}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Hook para registrar visitas — importar nas páginas de calculadora
export function useRegistrarVisita(slug: string) {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const recentes: string[] = stored ? JSON.parse(stored) : []
    const atualizados = [slug, ...recentes.filter((s) => s !== slug)].slice(0, MAX_RECENTES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizados))
  }, [slug])
}
```

---

### TAREFA 4: Banner "Instalar App" (BeforeInstallPrompt)

```typescript
// apps/web/src/components/InstallBanner.tsx
"use client"
import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    // Checar se já foi dispensado antes
    setDismissed(localStorage.getItem("pwa_banner_dismissed") === "1")
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!prompt || dismissed) return null

  const instalar = async () => {
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      // GA4 event
      ;(window as any).gtag?.("event", "pwa_install", { method: "banner" })
    }
    setPrompt(null)
  }

  const dispensar = () => {
    localStorage.setItem("pwa_banner_dismissed", "1")
    setDismissed(true)
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4"
      role="complementary"
      aria-label="Instalar aplicativo"
    >
      <div className="flex items-start gap-3">
        <img src="/icons/icon-72x72.png" alt="" className="w-12 h-12 rounded-xl" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">Instalar CalculosOnline</p>
          <p className="text-xs text-gray-500 mt-0.5">Acesso rápido, funciona offline, sem anúncios no app</p>
        </div>
        <button onClick={dispensar} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Fechar">×</button>
      </div>
      <button
        onClick={instalar}
        className="mt-3 w-full rounded-lg bg-brand-600 text-white text-sm font-medium py-2 hover:bg-brand-700 transition-colors"
      >
        Instalar gratuitamente
      </button>
    </div>
  )
}
```

---

## PARTE 2 — ANDROID TWA (Trusted Web Activity)

### TAREFA 5: Configurar Digital Asset Links

Este arquivo é obrigatório para que o Chrome valide o TWA e exiba a barra de URL native.

```json
// apps/web/public/.well-known/assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "br.com.calculosonline",
      "sha256_cert_fingerprints": [
        "SUBSTITUIR_COM_SHA256_DO_KEYSTORE_GERADO_ABAIXO"
      ]
    }
  }
]
```

**Importante:** O SHA256 fingerprint é gerado quando você cria o keystore (Tarefa 6).

---

### TAREFA 6: Configurar o TWA com Bubblewrap

```bash
# Instalar bubblewrap globalmente
npm install -g @bubblewrap/cli

# Criar diretório do projeto Android
mkdir -p apps/android && cd apps/android

# Inicializar TWA (responder as perguntas com os valores abaixo)
bubblewrap init --manifest=https://calculosonline.com.br/manifest.json
```

**Respostas para o wizard do bubblewrap:**

```
Domain:                    calculosonline.com.br
URL to open:               https://calculosonline.com.br/
App name:                  CalculosOnline
Short name:                CalculosOnline
Application ID:            br.com.calculosonline
Display mode:              standalone
Status bar color:          #2563eb
Splash screen color:       #ffffff
Splash screen fade-out:    300
Icon URL:                  https://calculosonline.com.br/icons/icon-512x512.png
Maskable icon URL:         https://calculosonline.com.br/icons/icon-512x512.png
Signing key path:          ./android.keystore
Signing key alias:         calculosonline
Minimum Android version:   5 (API level 21)
```

### `apps/android/twa-manifest.json` resultante

```json
{
  "packageId": "br.com.calculosonline",
  "host": "calculosonline.com.br",
  "name": "CalculosOnline.com.br",
  "launcherName": "CalculosOnline",
  "display": "standalone",
  "themeColor": "#2563eb",
  "navigationColor": "#2563eb",
  "navigationColorDark": "#1d4ed8",
  "navigationDividerColor": "#ffffff",
  "backgroundColor": "#ffffff",
  "enableNotifications": false,
  "startUrl": "/?utm_source=twa",
  "iconUrl": "https://calculosonline.com.br/icons/icon-512x512.png",
  "maskableIconUrl": "https://calculosonline.com.br/icons/icon-512x512.png",
  "monochromeIconUrl": "https://calculosonline.com.br/icons/icon-monochrome.png",
  "shortcuts": [
    {
      "name": "Rescisão",
      "short_name": "Rescisão",
      "url": "/calculadora/rescisao-trabalhista?utm_source=shortcut",
      "icons": [{ "src": "https://calculosonline.com.br/icons/shortcut-rescisao.png", "sizes": "96x96" }]
    }
  ],
  "webManifestUrl": "https://calculosonline.com.br/manifest.json",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "./android.keystore",
    "alias": "calculosonline"
  },
  "appVersion": "1",
  "appVersionName": "1.0.0",
  "minSdkVersion": 21,
  "targetSdkVersion": 34,
  "generatorApp": "bubblewrap-cli",
  "features": {
    "locationDelegation": { "enabled": false },
    "playBilling": { "enabled": false }
  },
  "alphaDependencies": { "enabled": false }
}
```

---

### TAREFA 7: Gerar Keystore e SHA256

```bash
cd apps/android

# Gerar keystore (manter o arquivo android.keystore em local seguro — nunca no Git!)
keytool -genkeypair \
  -alias calculosonline \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -keystore android.keystore \
  -dname "CN=CalculosOnline, OU=Mobile, O=CalculosOnline, L=Brasil, C=BR"

# Obter SHA256 fingerprint para o assetlinks.json
keytool -list -v \
  -alias calculosonline \
  -keystore android.keystore \
  | grep "SHA256" | awk '{print $3}'
```

**Após obter o SHA256**, atualizar `apps/web/public/.well-known/assetlinks.json` com o valor real.

---

### TAREFA 8: Build do APK/AAB

```bash
cd apps/android

# Build AAB (recomendado para Play Store)
bubblewrap build --skipPwaValidation

# Verificar que o arquivo foi gerado
ls app-release-bundle.aab
```

**Validar TWA localmente antes de enviar:**

```bash
# Instalar no dispositivo conectado (debug)
bubblewrap install

# Verificar que a barra de URL do Chrome NÃO aparece (sinal de TWA bem configurado)
```

---

### TAREFA 9: Criar Listing na Google Play Store

**Itens necessários para o listing:**

```
Título da app:         CalculosOnline — Calculadoras Grátis
Descrição curta:       Calcule rescisão, INSS, IRRF, juros e muito mais. Tabelas 2026.
Descrição longa:       (500 palavras sobre funcionalidades, precisão, multiplataforma)

Categoria:             Finanças
Classificação:         Livre (sem conteúdo inapropriado)
Email de contato:      contato@calculosonline.com.br
Política de privacidade: https://calculosonline.com.br/privacidade

Screenshots necessárias (mínimo 2):
  - 1 telefone (1080x1920): tela de calculadora de rescisão com resultado
  - 1 telefone (1080x1920): tela da homepage com categorias
  - 1 tablet 7" (1200x1920): opcional mas recomendado

Ícone da app (512x512 PNG):
  /apps/web/public/icons/icon-512x512.png

Feature graphic (1024x500 PNG):
  Criar com texto "Calculadoras Online Precisas — Gratuito"
```

---

### TAREFA 10: Script de Build Android no Monorepo

```json
// apps/android/package.json
{
  "name": "@calculosonline/android",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "bubblewrap build --skipPwaValidation",
    "install-device": "bubblewrap install",
    "validate": "bubblewrap validate"
  }
}
```

```json
// turbo.json — adicionar task android
{
  "tasks": {
    "build:android": {
      "dependsOn": ["^build"],
      "outputs": ["apps/android/*.aab", "apps/android/*.apk"]
    }
  }
}
```

---

## CHECKLIST DE VERIFICAÇÃO

### PWA (testar em Chrome DevTools → Application)

- [ ] Manifest.json carregado sem erros
- [ ] Service Worker registrado e ativo
- [ ] `start_url` correto
- [ ] Ícone 192px e 512px existem e são acessíveis
- [ ] `display: standalone` funciona (barra de URL some)
- [ ] Lighthouse PWA score ≥ 90
- [ ] Banner "Adicionar à tela inicial" aparece após visitar 2x
- [ ] Página offline (`/offline`) exibe lista de calculadoras recentes
- [ ] Calculadora de rescisão funciona offline (após primeira visita)

### Digital Asset Links (verificar antes de enviar para a Play Store)

```bash
# Verificar que o arquivo está acessível e correto
curl https://calculosonline.com.br/.well-known/assetlinks.json

# Validar com a ferramenta oficial do Google
# https://developers.google.com/digital-asset-links/tools/generator
```

### TWA / Play Store

- [ ] `assetlinks.json` publicado com SHA256 correto
- [ ] APK/AAB gerado sem erros
- [ ] App instalado em dispositivo físico: barra URL do Chrome NÃO aparece
- [ ] Shortcuts funcionam (rescisão, salário líquido)
- [ ] Listagem Play Store criada com todos os campos obrigatórios
- [ ] App submetido para revisão (aguardar 1–3 dias úteis)

### .gitignore — proteger o keystore

```gitignore
# apps/android/.gitignore
android.keystore
*.keystore
*.jks
```

> **ATENÇÃO:** O arquivo `android.keystore` é sua chave de assinatura. Se perdê-lo, não poderá atualizar o app na Play Store. Faça backup em local seguro (gerenciador de senhas, Google Drive criptografado).

---

## CRITÉRIOS DE ACEITE

```bash
# PWA
# Lighthouse → aba PWA → score ≥ 90

# TWA
cd apps/android && bubblewrap validate
# Deve exibir: "Validation passed"

# Service Worker
# Chrome DevTools → Application → Service Workers → Status: "activated and running"
```

> **Próximo passo:** Sprint 1.6 — ativar Google AdSense e otimizar posicionamento de anúncios.
