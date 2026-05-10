# apps/desktop — Tauri

Placeholder. Implementação na **Sprint 2.2** (Desktop com Tauri).

Stack prevista:
- Tauri CLI + Rust toolchain
- `tauri.conf.json` apontando para o build estático de `apps/web`
- Builds: Windows (.exe/.msi), Linux (.AppImage/.deb), macOS (.dmg)
- CI/CD via GitHub Actions com tag-based release

Tamanho esperado do binário: ~5-10 MB (vs ~150 MB do Electron).
