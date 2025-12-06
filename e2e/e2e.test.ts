import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

const RUN_E2E = process.env.CSCTM_E2E === "1";
const SHARE_URL =
  process.env.CSCTM_E2E_URL ?? "https://chatgpt.com/share/69343092-91ac-800b-996c-7552461b9b70";
const ROOT = path.resolve(path.join(import.meta.dir, ".."));
const BINARY = process.platform === "win32" ? "csctm.exe" : "csctm";
const BIN_PATH = path.join(ROOT, "dist", BINARY);

const describeFn = RUN_E2E ? describe : describe.skip;

describeFn("csctm end-to-end", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), "csctm-e2e-"));
    const build = spawnSync("bun", ["run", "build"], {
      cwd: ROOT,
      stdio: "inherit"
    });
    if (build.status !== 0) {
      throw new Error("Build failed");
    }
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("scrapes the shared conversation into a valid markdown file", () => {
    const run = spawnSync(BIN_PATH, [SHARE_URL], {
      cwd: tmpDir,
      stdio: "inherit"
    });
    expect(run.status).toBe(0);

    const mdFiles = readdirSync(tmpDir).filter(f => f.endsWith(".md"));
    expect(mdFiles.length).toBeGreaterThan(0);

    const outfile = path.join(tmpDir, mdFiles[0]);
    const content = readFileSync(outfile, "utf8");
    const normalized = content.replace(/\r\n/g, "\n");

    expect(content.length).toBeGreaterThan(5000); // ensure reasonably large output
    expect(normalized.split("\n").length).toBeGreaterThan(200); // ensure many lines
    expect(normalized).toContain("# ChatGPT Conversation:");
    expect(normalized).toContain(`Source: ${SHARE_URL}`);
    expect(normalized).not.toMatch(/[\u2028\u2029\0]/); // no problematic unicode or nulls
    expect(normalized).not.toMatch(/\r(?!\n)/); // no stray CRs
  });
});

