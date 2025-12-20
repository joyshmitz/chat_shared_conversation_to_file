# AGENTS.md — csctf Project

## RULE 1 – ABSOLUTE (DO NOT EVER VIOLATE THIS)

You may NOT delete any file or directory unless I explicitly give the exact command **in this session**.

- This includes files you just created (tests, tmp files, scripts, etc.).
- You do not get to decide that something is "safe" to remove.
- If you think something should be removed, stop and ask. You must receive clear written approval **before** any deletion command is even proposed.

Treat "never delete files without permission" as a hard invariant.

---

## IRREVERSIBLE GIT & FILESYSTEM ACTIONS

Absolutely forbidden unless I give the **exact command and explicit approval** in the same message:

- `git reset --hard`
- `git clean -fd`
- `rm -rf`
- Any command that can delete or overwrite code/data

Rules:

1. If you are not 100% sure what a command will delete, do not propose or run it. Ask first.
2. Prefer safe tools: `git status`, `git diff`, `git stash`, copying to backups, etc.
3. After approval, restate the command verbatim, list what it will affect, and wait for confirmation.
4. When a destructive command is run, record in your response:
   - The exact user text authorizing it
   - The command run
   - When you ran it

If that audit trail is missing, then you must act as if the operation never happened.

---

## Node / JS Toolchain

- Use **bun** for everything JS/TS.
- ❌ Never use `npm`, `yarn`, or `pnpm`.
- Lockfiles: only `bun.lock`. Do not introduce any other lockfile.
- Target **latest Node.js**. No need to support old Node versions.

---

## Project Architecture

This is a **single-file CLI tool** (`src/index.ts`, ~3000 lines). The architecture is intentionally monolithic for simplicity and to produce a single compiled executable.

Key patterns:
- **Provider detection**: URL patterns → `Provider` type (`chatgpt`, `gemini`, `grok`, `claude`)
- **Selector discovery**: Provider-specific CSS selector arrays with fallback chains
- **Browser automation**: Playwright with stealth measures and CDP fallback for Cloudflare-protected sites
- **Output formatting**: Markdown with optional HTML (syntax-highlighted via highlight.js)

Build targets:
```bash
bun run build              # Local binary → dist/csctf
bun run build:all          # Cross-platform builds
bun run check              # Lint + typecheck
```

When adding features:
- Add to `src/index.ts` directly; do not split into modules unless absolutely necessary.
- Follow existing patterns for provider support, selector fallbacks, and error handling.
- Test with `bun run src/index.ts <url>` before compiling.

---

## Code Editing Discipline

- Do **not** run scripts that bulk-modify code (codemods, invented one-off scripts, giant `sed`/regex refactors).
- Large mechanical changes: break into smaller, explicit edits and review diffs.
- Subtle/complex changes: edit by hand, file-by-file, with careful reasoning.

---

## Backwards Compatibility & File Sprawl

We optimize for a clean architecture now, not backwards compatibility.

- No "compat shims" or "v2" file clones.
- When changing behavior, migrate callers and remove old code **inside the same file**.
- New files are only for genuinely new domains that don't fit existing modules.
- The bar for adding files is very high.

---

## Console Output

This CLI uses `chalk` for colored console output. Patterns to follow:

```typescript
console.error(chalk.blue('[1/8] Step description'))     // Progress steps
console.error(chalk.gray('    Details...'))             // Indented details
console.error(chalk.yellow('\n⚠️  Warning message'))    // Warnings
console.error(chalk.red('✖ Error message'))             // Errors
console.error(chalk.green('✔ Success message'))         // Success
```

Rules:
- All progress/status goes to `stderr` (so stdout remains clean for piping)
- Main output (markdown/HTML) goes to `stdout`
- Quiet mode (`--quiet`) suppresses progress messages but not errors

---

## Third-Party Libraries

When unsure of an API, look up current docs (late-2025) rather than guessing.

Key dependencies:
- **playwright-chromium**: Browser automation with stealth measures
- **chalk**: Terminal coloring
- **markdown-it**: Markdown rendering
- **highlight.js**: Syntax highlighting for code blocks
- **turndown**: HTML-to-Markdown conversion

---

## Provider-Specific Patterns

When adding a new provider:

1. Add to `Provider` type union
2. Add URL patterns to `PROVIDER_PATTERNS`
3. Add CSS selector fallback chains to `SELECTOR_FALLBACKS`
4. Update `sharePattern` regex for URL validation
5. Test in both headless and headful modes
6. Handle Cloudflare/bot-detection if present (may need CDP mode)

CDP Mode (for Cloudflare-protected sites):
- Connects to user's real Chrome via `--remote-debugging-port=9222`
- Saves/restores user's open tabs (macOS only via AppleScript)
- Prompts user to solve Cloudflare challenges manually

---

## MCP Agent Mail — Multi-Agent Coordination

Agent Mail is available as an MCP server for coordinating work across agents.

What Agent Mail gives:
- Identities, inbox/outbox, searchable threads.
- Advisory file reservations (leases) to avoid agents clobbering each other.
- Persistent artifacts in git (human-auditable).

Core patterns:

1. **Same repo**
   - Register identity:
     - `ensure_project` then `register_agent` with the repo's absolute path as `project_key`.
   - Reserve files before editing:
     - `file_reservation_paths(project_key, agent_name, ["src/**"], ttl_seconds=3600, exclusive=true)`.
   - Communicate:
     - `send_message(..., thread_id="FEAT-123")`.
     - `fetch_inbox`, then `acknowledge_message`.
   - Fast reads:
     - `resource://inbox/{Agent}?project=<abs-path>&limit=20`.
     - `resource://thread/{id}?project=<abs-path>&include_bodies=true`.

2. **Macros vs granular:**
   - Prefer macros when speed is more important than fine-grained control:
     - `macro_start_session`, `macro_prepare_thread`, `macro_file_reservation_cycle`, `macro_contact_handshake`.
   - Use granular tools when you need explicit behavior.

Common pitfalls:
- "from_agent not registered" → call `register_agent` with correct `project_key`.
- `FILE_RESERVATION_CONFLICT` → adjust patterns, wait for expiry, or use non-exclusive reservation.

---

## Testing

```bash
bun test                   # Unit tests
bun run test:e2e           # E2E tests (requires CSCTF_E2E=1)
```

For manual testing:
```bash
# Test a provider
bun run src/index.ts https://chatgpt.com/share/<id>
bun run src/index.ts https://gemini.google.com/share/<id>
bun run src/index.ts https://x.com/i/grok/share/<id>
bun run src/index.ts https://claude.ai/share/<id>  # Requires CDP mode

# Test output formats
bun run src/index.ts <url> --html        # Markdown + HTML
bun run src/index.ts <url> --json        # JSON output
bun run src/index.ts <url> -o output.md  # Write to file
```

---

## Contribution Policy

Remove any mention of contributing/contributors from README and don't reinsert it.
