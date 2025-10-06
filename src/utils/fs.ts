import path from "path";
import fs from "fs-extra";

const IGNORE_PATTERNS: string[] = [
  "node_modules/",
  ".git/",
  ".cursor/",
  "dist/",
  "build/",
  "/coverage/",
  "/.nyc_output/",
  ".DS_Store",
  "Thumbs.db",
  ".env",
  ".env.",
];

export function shouldIgnore(fileAbs: string, workspacePath: string): boolean {
  const rel = path.relative(workspacePath, fileAbs).replace(/\\/g, "/");
  return IGNORE_PATTERNS.some((p) => (p.endsWith("/") ? rel.startsWith(p) : rel.includes(p)));
}

export async function listFiles(workspacePath: string, limit = 1000): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (shouldIgnore(full, workspacePath)) continue;
      if (e.isDirectory()) {
        await walk(full);
        if (out.length >= limit) return;
      } else if (e.isFile()) {
        out.push(full);
        if (out.length >= limit) return;
      }
    }
  }
  await walk(workspacePath);
  return out;
}

export async function readEmbeddableFilesList(root: string, listPath: string): Promise<string[]> {
  const p = path.isAbsolute(listPath) ? listPath : path.join(root, listPath);
  try {
    const content = await fs.readFile(p, "utf8");
    const lines = content.split(/\r?\n/);
    const out: string[] = [];
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      out.push(path.isAbsolute(t) ? t : path.join(root, t));
    }
    return out;
  } catch {
    return [];
  }
}


