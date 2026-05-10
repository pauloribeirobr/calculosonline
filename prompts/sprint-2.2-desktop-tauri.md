# Prompt de IA — Sprint 2.2: Desktop com Tauri
**calculosonline.com.br | Fase 2 — Expansao | Semanas 13–15**

---

## PRE-REQUISITO

- Sprint 2.1 concluida: 50 calculadoras no core e no site
- `apps/web` buildando para export estatico (SSG)
- Node.js >= 20, Rust toolchain instalado (`rustup`)
- Ambiente Linux/Windows/macOS para build nativo

---

## OBJETIVO DA SPRINT 2.2

1. Configurar **Tauri 2** no monorepo encapsulando o front-end Next.js
2. Builds para Windows (`.exe`/`.msi`), Linux (`.AppImage`/`.deb`) e macOS (`.dmg`)
3. CI/CD via **GitHub Actions** com release automatico em tag
4. Pagina de download no site com deteccao de OS

---

## PARTE 1 — SETUP DO TAURI

### TAREFA 1: Instalar dependencias e criar o app Tauri

```bash
# Instalar Rust (se nao tiver)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Instalar Tauri CLI no monorepo
pnpm --filter desktop add -D @tauri-apps/cli @tauri-apps/api

# Inicializar projeto Tauri dentro de apps/desktop
cd apps/desktop
pnpm tauri init
```

**Respostas para o wizard `tauri init`:**

```
What is your app name?               CalculosOnline
What should the window title be?     CalculosOnline — Calculadoras Gratuitas
Where are your web assets located?   ../../apps/web/out
What is the URL of your dev server?  http://localhost:3000
What is your frontend dev command?   pnpm --filter web dev
What is your frontend build command? pnpm --filter web build:static
```

---

### TAREFA 2: Configurar Next.js para export estatico

O Tauri precisa de arquivos HTML estaticos, nao de um servidor Node.js.

```typescript
// apps/web/next.config.ts — adicionar export estatico
const nextConfig: NextConfig = {
  output: "export",          // gera pasta /out com HTML/JS/CSS estaticos
  trailingSlash: true,       // /calculadora/rescisao/ em vez de /calculadora/rescisao
  images: {
    unoptimized: true,       // next/image nao funciona em export estatico sem servidor
  },
  // Desabilitar funcionalidades que exigem servidor
  // ISR e API Routes nao funcionam em export — usar apenas SSG
}
```

```json
// apps/web/package.json — adicionar script de build estatico
{
  "scripts": {
    "build": "next build",
    "build:static": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

---

### TAREFA 3: Configurar tauri.conf.json

```json
// apps/desktop/src-tauri/tauri.conf.json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "CalculosOnline",
  "version": "1.0.0",
  "identifier": "br.com.calculosonline.desktop",
  "build": {
    "frontendDist": "../../apps/web/out",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "pnpm --filter web dev",
    "beforeBuildCommand": "pnpm --filter web build:static"
  },
  "app": {
    "windows": [
      {
        "title": "CalculosOnline — Calculadoras Gratuitas",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true,
        "decorations": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://olinda.bcb.gov.br https://www.google-analytics.com;"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "publisher": "CalculosOnline",
    "copyright": "Copyright 2026 CalculosOnline.com.br",
    "category": "Finance",
    "shortDescription": "Calculadoras financeiras e trabalhistas gratuitas",
    "longDescription": "Suite completa de calculadoras: rescisao trabalhista, INSS, IRRF, financiamento imobiliario, investimentos e muito mais. Funciona offline, sem anuncios.",
    "windows": {
      "digestAlgorithm": "sha256",
      "webviewInstallMode": {
        "type": "downloadBootstrapper"
      }
    },
    "linux": {
      "appimage": {
        "bundleMediaFramework": false
      },
      "deb": {
        "depends": ["libwebkit2gtk-4.1-0", "libayatana-appindicator3-1", "librsvg2-dev"]
      }
    },
    "macOS": {
      "minimumSystemVersion": "10.13",
      "signingIdentity": null,
      "entitlements": null
    }
  }
}
```

---

### TAREFA 4: Icones do app

```bash
# Gerar todos os tamanhos de icone a partir de um PNG 1024x1024
cd apps/desktop/src-tauri
pnpm tauri icon ../../public/icons/icon-1024x1024.png

# Estrutura gerada:
# src-tauri/icons/
# ├── 32x32.png
# ├── 128x128.png
# ├── 128x128@2x.png
# ├── icon.icns      (macOS)
# └── icon.ico       (Windows — multiplos tamanhos embutidos)
```

---

### TAREFA 5: Recursos especificos do Desktop

Aproveitar o contexto nativo do Tauri para melhorar a UX no desktop:

```rust
// apps/desktop/src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Atalho global: Ctrl+Shift+C abre o app
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
                let shortcut = Shortcut::new(Some(Modifiers::CTRL | Modifiers::SHIFT), Code::KeyC);
                app.global_shortcut().on_shortcut(shortcut, |_app, _shortcut, _event| {
                    // Traz janela para frente
                })?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            obter_versao_app,
            abrir_no_browser,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar CalculosOnline");
}

#[tauri::command]
fn obter_versao_app() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn abrir_no_browser(url: String) -> Result<(), String> {
    open::that(url).map_err(|e| e.to_string())
}
```

```toml
# apps/desktop/src-tauri/Cargo.toml
[package]
name = "calculosonline"
version = "1.0.0"
description = "CalculosOnline — Calculadoras Gratuitas"
authors = ["CalculosOnline"]
edition = "2021"

[dependencies]
tauri = { version = "2", features = ["protocol-asset"] }
tauri-plugin-shell = "2"
open = "5"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[profile.dev]
incremental = true

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

---

## PARTE 2 — CI/CD COM GITHUB ACTIONS

### TAREFA 6: Workflow de Build Multiplataforma

```yaml
# .github/workflows/release-desktop.yml
name: Release Desktop

on:
  push:
    tags:
      - 'desktop-v*'    # ex: desktop-v1.0.0

permissions:
  contents: write   # necessario para criar GitHub Release

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: ubuntu-22.04
            args: '--target x86_64-unknown-linux-gnu'
          - platform: windows-latest
            args: '--target x86_64-pc-windows-msvc'
          # macOS requer assinatura Apple (descomentar quando disponivel)
          # - platform: macos-latest
          #   args: '--target aarch64-apple-darwin --target x86_64-apple-darwin'

    runs-on: ${{ matrix.platform }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: './apps/desktop/src-tauri -> target'

      - name: Install Linux dependencies
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libwebkit2gtk-4.1-dev \
            libappindicator3-dev \
            librsvg2-dev \
            patchelf

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build frontend (static export)
        run: pnpm --filter web build:static

      - name: Build Tauri
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Para assinar no Windows (configurar secrets futuramente):
          # TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          # TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          projectPath: apps/desktop
          tagName: ${{ github.ref_name }}
          releaseName: "CalculosOnline Desktop ${{ github.ref_name }}"
          releaseBody: |
            ## CalculosOnline Desktop

            Calculadoras financeiras e trabalhistas para usar offline no seu computador.

            ### Downloads
            - **Windows**: baixe o `.msi` (instalador) ou `.exe` (portavel)
            - **Linux**: baixe o `.AppImage` (nao requer instalacao) ou `.deb`

            ### O que ha de novo
            Ver [CHANGELOG.md](https://github.com/SEU_USUARIO/calculosonline/blob/main/CHANGELOG.md)
          releaseDraft: false
          prerelease: false
          args: ${{ matrix.args }}
```

---

### TAREFA 7: Script para gerar tag e release

```bash
# scripts/release-desktop.sh
#!/bin/bash

VERSION=${1:-"1.0.0"}
TAG="desktop-v${VERSION}"

echo "Gerando release desktop versao ${VERSION}..."

# Atualizar versao no tauri.conf.json
jq ".version = \"${VERSION}\"" apps/desktop/src-tauri/tauri.conf.json > tmp.json
mv tmp.json apps/desktop/src-tauri/tauri.conf.json

# Commit e tag
git add apps/desktop/src-tauri/tauri.conf.json
git commit -m "chore(desktop): bump version to ${VERSION}"
git tag -a "${TAG}" -m "Release desktop ${VERSION}"
git push origin main "${TAG}"

echo "Tag ${TAG} criada e enviada. GitHub Actions ira buildar e criar o release."
```

---

## PARTE 3 — PAGINA DE DOWNLOAD NO SITE

### TAREFA 8: Pagina /download com deteccao de OS

```typescript
// apps/web/src/app/download/page.tsx
import { Metadata } from "next"
import { DownloadButtons } from "@/components/DownloadButtons"

export const metadata: Metadata = {
  title: "Download — CalculosOnline Desktop Gratuito",
  description: "Baixe o CalculosOnline para Windows e Linux. Funciona offline, sem ads, calculadoras financeiras e trabalhistas na sua area de trabalho.",
}

// Versao atual — atualizar a cada release
const DESKTOP_VERSION = "1.0.0"
const GITHUB_RELEASE_BASE = `https://github.com/SEU_USUARIO/calculosonline/releases/download/desktop-v${DESKTOP_VERSION}`

export const DOWNLOADS = {
  windows: {
    msi: `${GITHUB_RELEASE_BASE}/CalculosOnline_${DESKTOP_VERSION}_x64_en-US.msi`,
    exe: `${GITHUB_RELEASE_BASE}/CalculosOnline_${DESKTOP_VERSION}_x64-setup.exe`,
    tamanho: "~8 MB",
  },
  linux: {
    appimage: `${GITHUB_RELEASE_BASE}/calculosonline_${DESKTOP_VERSION}_amd64.AppImage`,
    deb: `${GITHUB_RELEASE_BASE}/calculosonline_${DESKTOP_VERSION}_amd64.deb`,
    tamanho: "~12 MB",
  },
} as const

export default function DownloadPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          CalculosOnline para Desktop
        </h1>
        <p className="text-lg text-gray-600">
          Todas as calculadoras no seu computador. Funciona offline, abre em segundos,
          sem anuncios.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Versao {DESKTOP_VERSION}</span>
          <span>•</span>
          <span>Gratuito</span>
          <span>•</span>
          <span>Codigo aberto</span>
        </div>
      </header>

      {/* Botoes com deteccao automatica de OS via client component */}
      <DownloadButtons downloads={DOWNLOADS} version={DESKTOP_VERSION} />

      {/* Requisitos do sistema */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
            </svg>
            Windows
          </h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Windows 10 ou superior (64-bit)</li>
            <li>WebView2 Runtime (instalado automaticamente)</li>
            <li>~8 MB de espaco em disco</li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.354 1.611-.166 2.4.265 1.113 1.281 1.807 2.449 1.735 1.42-.086 2.608-.816 3.666-1.551 1.395-.977 2.638-2.073 3.887-3.107 1.174-.978 2.418-1.822 3.853-2.359.88-.335 1.898-.43 2.8-.06.816.34 1.49.982 1.762 1.85.24.765.12 1.57-.226 2.318-.684 1.497-2.054 2.596-3.492 3.34-1.454.75-2.964 1.133-4.38 1.663-1.4.525-2.762 1.232-3.824 2.336-.515.537-.925 1.176-1.135 1.894-.21.718-.228 1.494.075 2.198.322.734.93 1.313 1.65 1.647.803.37 1.695.464 2.57.43 1.47-.056 2.945-.36 4.38-.752 1.39-.384 2.755-.862 4.083-1.387 2.658-1.047 5.21-2.253 7.77-3.386.07-.033.148-.065.218-.11.185-.121.39-.238.59-.36 1.83-1.073 3.584-2.313 4.975-3.908.702-.802 1.293-1.713 1.615-2.716.336-1.042.38-2.145.03-3.19-.345-1.044-1.073-1.94-1.972-2.618-1.82-1.365-4.083-1.785-6.22-1.61-2.14.177-4.152.784-6.104 1.54-1.955.757-3.845 1.665-5.73 2.567a37.94 37.94 0 0 1-1.648.763 15.45 15.45 0 0 1-1.697.553c-.596.143-1.194.237-1.787.253-.592.018-1.186-.04-1.748-.23-.566-.19-1.098-.518-1.48-1.001a2.95 2.95 0 0 1-.574-1.673c-.03-.596.075-1.195.284-1.759"/>
            </svg>
            Linux
          </h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Ubuntu 22.04+ / Debian 12+ / Fedora 38+</li>
            <li>libwebkit2gtk-4.1 (instalado com .deb)</li>
            <li>~12 MB (AppImage portavel)</li>
          </ul>
        </div>
      </section>

      {/* Comparativo Web vs Desktop */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Por que usar o desktop?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200 font-medium">Recurso</th>
                <th className="text-center p-3 border border-gray-200 font-medium">Site Web</th>
                <th className="text-center p-3 border border-gray-200 font-medium text-brand-700">App Desktop</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Funciona offline", "Parcial (PWA)", "Sim, completo"],
                ["Anuncios", "Sim", "Nao"],
                ["Velocidade de abertura", "Depende da net", "Instantaneo"],
                ["50 calculadoras", "Sim", "Sim"],
                ["Atualizacoes automaticas", "Sempre", "Notificacao"],
                ["Instalacao necessaria", "Nao", "Sim (~8 MB)"],
              ].map(([recurso, web, desktop]) => (
                <tr key={recurso} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">{recurso}</td>
                  <td className="p-3 border border-gray-200 text-center text-gray-500">{web}</td>
                  <td className="p-3 border border-gray-200 text-center font-medium text-brand-700">{desktop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
```

---

### TAREFA 9: Client component DownloadButtons (deteccao de OS)

```typescript
// apps/web/src/components/DownloadButtons.tsx
"use client"
import { useEffect, useState } from "react"

type OS = "windows" | "linux" | "mac" | "unknown"

function detectarOS(): OS {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes("win")) return "windows"
  if (ua.includes("linux") && !ua.includes("android")) return "linux"
  if (ua.includes("mac")) return "mac"
  return "unknown"
}

interface DownloadButtonsProps {
  downloads: {
    windows: { msi: string; exe: string; tamanho: string }
    linux: { appimage: string; deb: string; tamanho: string }
  }
  version: string
}

export function DownloadButtons({ downloads, version }: DownloadButtonsProps) {
  const [os, setOs] = useState<OS>("unknown")
  const [expandido, setExpandido] = useState(false)

  useEffect(() => {
    setOs(detectarOS())
  }, [])

  const trackDownload = (plataforma: string, formato: string) => {
    ;(window as any).gtag?.("event", "desktop_download", {
      plataforma,
      formato,
      versao: version,
    })
  }

  return (
    <div className="space-y-6">
      {/* Botao principal baseado no OS detectado */}
      {os === "windows" && (
        <div className="text-center space-y-3">
          <a
            href={downloads.windows.msi}
            onClick={() => trackDownload("windows", "msi")}
            className="inline-flex items-center gap-3 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Baixar para Windows
            <span className="text-sm font-normal opacity-80">{downloads.windows.tamanho}</span>
          </a>
          <p className="text-sm text-gray-500">
            Instalador .msi recomendado •{" "}
            <a href={downloads.windows.exe} onClick={() => trackDownload("windows", "exe")} className="underline">
              versao portavel .exe
            </a>
          </p>
        </div>
      )}

      {os === "linux" && (
        <div className="text-center space-y-3">
          <a
            href={downloads.linux.appimage}
            onClick={() => trackDownload("linux", "appimage")}
            className="inline-flex items-center gap-3 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Baixar para Linux (.AppImage)
            <span className="text-sm font-normal opacity-80">{downloads.linux.tamanho}</span>
          </a>
          <p className="text-sm text-gray-500">
            Portavel, nao requer instalacao •{" "}
            <a href={downloads.linux.deb} onClick={() => trackDownload("linux", "deb")} className="underline">
              pacote .deb (Ubuntu/Debian)
            </a>
          </p>
        </div>
      )}

      {(os === "mac" || os === "unknown") && (
        <div className="text-center rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-2">
          <p className="font-medium text-amber-800">
            {os === "mac" ? "macOS em breve" : "Selecione seu sistema operacional"}
          </p>
          <p className="text-sm text-amber-700">
            {os === "mac"
              ? "A versao para macOS requer assinatura Apple Developer ($99/ano). Aguarde a proxima versao ou use o site."
              : "Nao detectamos seu sistema. Escolha abaixo:"}
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <a href={downloads.windows.msi} className="text-sm underline text-amber-800" onClick={() => trackDownload("windows", "msi")}>Windows</a>
            <a href={downloads.linux.appimage} className="text-sm underline text-amber-800" onClick={() => trackDownload("linux", "appimage")}>Linux</a>
          </div>
        </div>
      )}

      {/* Todos os downloads */}
      <div className="text-center">
        <button onClick={() => setExpandido(!expandido)} className="text-sm text-gray-500 underline">
          {expandido ? "Ocultar todos os downloads" : "Ver todos os downloads"}
        </button>
      </div>

      {expandido && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Windows Installer (.msi)", href: downloads.windows.msi, plataforma: "windows", formato: "msi" },
            { label: "Windows Portavel (.exe)", href: downloads.windows.exe, plataforma: "windows", formato: "exe" },
            { label: "Linux AppImage (portavel)", href: downloads.linux.appimage, plataforma: "linux", formato: "appimage" },
            { label: "Linux Pacote .deb", href: downloads.linux.deb, plataforma: "linux", formato: "deb" },
          ].map(({ label, href, plataforma, formato }) => (
            <a
              key={formato}
              href={href}
              onClick={() => trackDownload(plataforma, formato)}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
            >
              <span>{label}</span>
              <span className="text-gray-400">Baixar</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## PARTE 4 — ESTRUTURA DO MONOREPO

### TAREFA 10: package.json e turbo.json para o desktop

```json
// apps/desktop/package.json
{
  "name": "@calculosonline/desktop",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "build:debug": "tauri build --debug",
    "icon": "tauri icon ../../apps/web/public/icons/icon-1024x1024.png"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0"
  }
}
```

```json
// turbo.json — adicionar tasks do desktop
{
  "tasks": {
    "build:static": {
      "dependsOn": ["^build"],
      "outputs": ["out/**"],
      "inputs": ["src/**", "public/**", "next.config.ts"]
    },
    "build:desktop": {
      "dependsOn": ["build:static"],
      "outputs": ["src-tauri/target/release/bundle/**"],
      "cache": false
    }
  }
}
```

---

## CHECKLIST DE VERIFICACAO

### Desenvolvimento local

```bash
# Testar em modo dev (abre janela nativa com hot reload)
cd apps/desktop
pnpm dev
# Deve abrir janela nativa com o site funcionando

# Build de producao
pnpm build
# Deve gerar em: apps/desktop/src-tauri/target/release/bundle/
ls apps/desktop/src-tauri/target/release/bundle/
# Linux: appimage/ deb/
# Windows: msi/ nsis/
```

### Verificacoes pos-build

- [ ] Janela abre com titulo correto e icone no taskbar
- [ ] Dimensoes minimas respeitadas (800x600)
- [ ] Todas as 50 calculadoras funcionam offline (sem internet)
- [ ] Fontes e imagens carregam corretamente no bundle estatico
- [ ] Console de devtools sem erros criticos
- [ ] Tamanho do bundle: Windows < 15 MB, Linux AppImage < 20 MB
- [ ] Pagina `/download` no site mostra botao correto para cada OS

### CI/CD

```bash
# Criar e enviar tag para disparar o workflow
bash scripts/release-desktop.sh 1.0.0

# Verificar no GitHub Actions:
# https://github.com/SEU_USUARIO/calculosonline/actions

# Verificar GitHub Release criado:
# https://github.com/SEU_USUARIO/calculosonline/releases
```

---

## CRITERIOS DE ACEITE

| Criterio | Meta |
|----------|------|
| Build Windows (.msi) | Sem erros, instalavel |
| Build Linux (.AppImage) | Sem erros, executavel sem instalacao |
| Tamanho total do bundle | Windows < 15 MB, Linux < 20 MB |
| Funcionalidade offline | 50 calculadoras funcionando sem internet |
| GitHub Actions | Build automatico em tag `desktop-v*` |
| Pagina /download | Deteccao automatica de OS + botao principal |
| Downloads registrados | Evento GA4 `desktop_download` disparando |

> **Proximo passo:** Sprint 2.3 — implementar o Plugin Google Sheets com as funcoes do core engine.
