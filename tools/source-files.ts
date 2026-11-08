import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { containsPath, isRecord, localPath, readJson, root } from "./atlas-data";

export function sourceDirectory(): string {
  let path = process.env.CESTY_ZDROJ;
  const configPath = join(root, "config.local.json");
  if (!path && existsSync(configPath)) {
    const config = readJson(configPath);
    if (!isRecord(config) || typeof config.CESTY_ZDROJ !== "string") {
      throw new Error("config.local.json musí mít řetězec CESTY_ZDROJ.");
    }
    path = config.CESTY_ZDROJ;
  }
  if (!path?.trim()) throw new Error("Nastav CESTY_ZDROJ na složku zdrojových Markdownů mimo Git.");
  const source = realpathSync(resolve(root, path));
  const repo = realpathSync(root);
  if (containsPath(repo, source) || containsPath(source, repo)) throw new Error("Zdroj musí ležet mimo repozitář.");
  return source;
}

export function replaceFile(path: string, contents: string | Buffer): void {
  const temp = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temp, contents, { encoding: "utf8", flag: "wx" });
    renameSync(temp, path);
  } finally {
    rmSync(temp, { force: true });
  }
}

export function writeLocal(path: string, text: string): void {
  localPath(path);
  mkdirSync(dirname(path), { recursive: true });
  replaceFile(path, text);
}
