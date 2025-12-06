# csctm — ChatGPT Shared Conversation to Markdown

Single-file Bun-native CLI that downloads a ChatGPT share link and saves a clean Markdown transcript with code fences preserved.

## Quick start

```bash
bun install
bun run build   # produces dist/csctm
./dist/csctm https://chatgpt.com/share/69343092-91ac-800b-996c-7552461b9b70
```

The tool will:
1. Launch headless Chromium (playwright-chromium)
2. Load the shared conversation
3. Extract all turns (user/assistant)
4. Convert to Markdown (with fenced code blocks)
5. Save `<conversation_title>.md` into the current directory (lowercased, spaces → underscores). If a file exists, `_2`, `_3`, … are appended.

## Install as a global-ish command

From this folder:
```bash
bun run build
sudo cp dist/csctm /usr/local/bin/csctm   # or any directory on your $PATH
```

## Usage
```
csctm <chatgpt-share-url>
csctm https://chatgpt.com/share/69343092-91ac-800b-996c-7552461b9b70
```

## Notes
- Tested with Bun 1.3.x, macOS arm64. The build target is a Bun-native single binary; it should also run on Linux x64/arm64 with Bun available.
- Uses `playwright-chromium`, so the first run will download a headless Chromium bundle into the Playwright cache.
- Terminal output is colored and step-based for clarity.

## License
MIT
