import { readFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./atlas-data";

const rules: [string, RegExp][] = [
  ["Google Drive nebo Dokumenty", /(?:drive|docs)\.google\.com/iu],
  ["Strava URL", /strava\.com/iu],
  ["měna", /(?<!\p{L})(?:CZK|Kč)(?!\p{L})/iu],
  ["adresa", /\bCalle\s/iu],
  ["číslo letu", /\b[A-Z]{2}\d{3,4}\b/u],
  ["účastníci", /pocet_ucastniku/iu]
];

export function localNames(): string[] {
  try {
    return readFileSync(join(root, "jmena.local.txt"), "utf8").replace(/^\uFEFF/, "")
      .split(/\r?\n/u).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw new Error("Místní seznam jmen nelze přečíst.");
  }
}

export function securityFindings(value: unknown, names: string[] = []): string[] {
  const normalize = (input: string) => input.normalize("NFC").toLocaleLowerCase("cs-CZ");
  const escape = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const nameRules = names.map((name) =>
    new RegExp(`(?<![\\p{L}\\p{N}])${escape(normalize(name))}(?![\\p{L}\\p{N}])`, "u"));
  const found = new Set<string>();

  const scan = (entry: unknown): void => {
    if (typeof entry === "string") {
      const text = entry.normalize("NFC");
      for (const [label, pattern] of rules) if (pattern.test(text)) found.add(label);
      if (nameRules.some((pattern) => pattern.test(normalize(text)))) found.add("jméno z místního seznamu");
    } else if (Array.isArray(entry)) {
      for (const item of entry) scan(item);
    } else if (entry !== null && typeof entry === "object") {
      for (const [key, field] of Object.entries(entry)) {
        scan(key);
        scan(field);
      }
    }
  };

  scan(value);
  return [...found].sort();
}

export function assertSafe(value: unknown, names: string[]): void {
  const findings = securityFindings(value, names);
  if (findings.length) throw new Error(`Podezřelý obsah ve veřejných polích: ${findings.join(", ")}.`);
}
