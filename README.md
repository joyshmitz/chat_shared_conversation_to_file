# csctm — ChatGPT Shared Conversation → Markdown

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)
![Runtime](https://img.shields.io/badge/runtime-Bun%201.3+-purple)
![Status](https://img.shields.io/badge/status-alpha-orange)
![License](https://img.shields.io/badge/license-MIT-green)

Single-file Bun-native CLI that downloads a ChatGPT share link and saves a clean Markdown transcript with fenced code blocks, stable filenames, and rich terminal output.

<div align="center">

```bash
curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/chatgpt_shared_conversation_to_markdown_file/main/install.sh \
  | bash
```

</div>

---

## ✨ What it does
- Launches headless Chromium (playwright-chromium) to load a ChatGPT share link.
- Extracts every turn (user/assistant) and converts HTML → Markdown with fenced code blocks and detected languages.
- Cleans citation pills/metadata, normalizes line terminators, trims extra blank lines.
- Saves `<conversation_title>.md` in the working directory (slugified; auto-appends `_2`, `_3`, … if the name exists).
- Prints clear, colorized progress (`[1/6] Launching headless Chromium`, etc.).

## 🚀 Quick install (curl | bash)
- Default install to `~/.local/bin` (or `/usr/local/bin` with `DEST`/`--system`).
- Prefers the latest release binary for your platform; falls back to Bun source build if needed.
- Adds PATH hints when `--easy-mode` is used.

Examples:
```bash
# Standard (latest release binary)
curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/chatgpt_shared_conversation_to_markdown_file/main/install.sh | bash

# Force source build
curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/chatgpt_shared_conversation_to_markdown_file/main/install.sh | bash -s -- --from-source

# Install to /usr/local/bin
curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/chatgpt_shared_conversation_to_markdown_file/main/install.sh | bash -s -- --system
```

> Windows: use Git Bash or WSL for the installer; otherwise build locally with Bun and use the Windows binary produced in `dist/`.

## 🧭 Usage
```bash
csctm <chatgpt-share-url>
csctm https://chatgpt.com/share/69343092-91ac-800b-996c-7552461b9b70
```

What you’ll see:
- `✔ Saved <file>.md` and the full path.
- First run downloads the Playwright Chromium bundle into the Playwright cache.

## 🗂️ Output shape
- Title line: `# ChatGPT Conversation: <title>`
- Source + Retrieved timestamps
- Sections per message: `## User` / `## Assistant`
- Code blocks preserved with language hints when present: ```` ```python ... ``` ````
- Line endings normalized to `\n`; Unicode LS/PS stripped.

## 🛠️ Local build & dev
```bash
bun install
bun run build                 # dist/csctm for current platform

# Dev helpers
bun run lint                  # eslint
bun run typecheck             # tsc --noEmit
bun run check                 # lint + typecheck

# Cross-platform binaries (emit into dist/)
bun run build:mac-arm64
bun run build:mac-x64
bun run build:linux-x64
bun run build:linux-arm64
bun run build:windows-x64     # dist/csctm-windows-x64.exe
bun run build:all
```

## 🧪 End-to-end smoke (optional, networked)
Uses the public share link above to verify a full scrape → Markdown. Requires network + headless Chromium download.
```bash
CSCTM_E2E=1 bun run test:e2e   # builds binary, runs against the shared URL
```

Checks performed:
- Binary exits 0
- Produces a `.md` file
- File is non-trivially large (length and line-count thresholds)
- Contains expected headers/source URL
- No stray CR-only line endings or disallowed Unicode separators

## ⚙️ CI & releases
- GitHub Actions: lint → typecheck → test on Ubuntu; then native builds on macOS, Linux, Windows; artifacts uploaded per-OS.
- Tagged pushes (`v*`) create a GitHub release via `gh release create` and attach built binaries.

## 📦 Artifacts & install destinations
- `dist/csctm` (macOS/Linux), `dist/csctm.exe` (Windows).
- Installer defaults to `~/.local/bin`; use `--system` for `/usr/local/bin` or `DEST=/custom/path`.

## 🧰 Troubleshooting
- **Playwright download slow?** Pre-populate the Playwright cache (`PLAYWRIGHT_BROWSERS_PATH`) or re-run after the first download completes.
- **Binary not on PATH?** Add `~/.local/bin` (or your `DEST`) to PATH; re-open the shell.
- **Share page layout changes?** Open an issue with the share URL; the scraper waits for `article [data-message-author-role]` and may need selectors updated.
- **Need to force source build?** `--from-source` (requires Bun + git).

## 📜 License
MIT

