import { randomUUID } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { containsPath, root } from "./atlas-data";
import { digest, type PlanEntry } from "./metadata-migration";
import { replaceFile } from "./source-files";
import { compare } from "./trip-export";

interface BackupEntry { path: string; hash: string | null }

function walk(source: string, target?: string, path = ""): BackupEntry[] {
  const input = join(source, path);
  const entries = readdirSync(input, { withFileTypes: true }).sort((a, b) => compare(a.name, b.name));
  const result: BackupEntry[] = [];
  for (const entry of entries) {
    const name = join(path, entry.name);
    const file = join(source, name);
    const info = lstatSync(file);
    if (info.isDirectory()) {
      if (target) mkdirSync(join(target, name));
      result.push({ path: name, hash: null }, ...walk(source, target, name));
    } else if (info.isFile()) {
      const bytes = readFileSync(file);
      if (target) writeFileSync(join(target, name), bytes, { flag: "wx" });
      result.push({ path: name, hash: digest(bytes) });
    } else {
      throw new Error("Zdroj zálohy obsahuje odkaz nebo speciální soubor.");
    }
  }
  return result;
}

function backupPath(source: string, requested: string): string {
  const path = resolve(requested);
  let ancestor = path;
  while (!lstatSync(ancestor, { throwIfNoEntry: false })) ancestor = dirname(ancestor);
  const canonical = resolve(realpathSync(ancestor), path.slice(ancestor.length).replace(/^[/\\]+/u, ""));
  if (containsPath(source, canonical) || containsPath(realpathSync(root), canonical)) {
    throw new Error("Záloha musí být mimo zdrojovou složku a mimo repozitář.");
  }
  return canonical;
}

export function createBackup(source: string, requested: string, reviewed: PlanEntry[]): string {
  const parent = backupPath(source, requested);
  mkdirSync(parent, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/gu, "-");
  const target = join(parent, `TravelAtlas-${timestamp}-${randomUUID().slice(0, 8)}`);
  mkdirSync(target);
  try {
    const copied = walk(source, target);
    if (!isDeepStrictEqual(copied, walk(target)) || !isDeepStrictEqual(copied, walk(source))) {
      throw new Error("Kopie nesouhlasí se zdrojem nebo se zdroj během zálohy změnil.");
    }
    const hashes = new Map(copied.map(({ path, hash }) => [path, hash]));
    if (reviewed.some(({ file, hash }) => hashes.get(file) !== hash)) {
      throw new Error("Záloha neodpovídá schválenému plánu.");
    }
    return target;
  } catch (error) {
    throw new Error(`Záloha se nepodařila. Neúplná nebo neověřená kopie může být v ${target}. ${error instanceof Error ? error.message : ""}`);
  }
}

export function applyMigration(source: string, entries: PlanEntry[], updates: Map<string, Buffer>): number {
  const matches = ({ file, hash }: PlanEntry) => {
    const path = join(source, file);
    if (!lstatSync(path).isFile() || digest(readFileSync(path)) !== hash) {
      throw new Error(`Soubor ${file} se od zkoušky změnil.`);
    }
  };
  let applied = 0;
  try {
    for (const entry of entries) matches(entry);
    for (const entry of entries) {
      const next = updates.get(entry.file);
      if (!next) continue;
      matches(entry);
      const path = join(source, entry.file);
      replaceFile(path, next);
      applied += 1;
      if (!readFileSync(path).equals(next)) throw new Error(`Zápis souboru ${entry.file} se nepodařilo ověřit.`);
    }
    return applied;
  } catch (error) {
    throw new Error(`Zápis se zastavil po ${applied} změnách. ${error instanceof Error ? error.message : ""}`);
  }
}
