import { lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { localPath, readJson, root } from "./atlas-data";

export const publicDirectory = join(root, "public", "data");

export function readPublicData(): [unknown, unknown] | null {
  localPath(publicDirectory);
  if (!lstatSync(publicDirectory, { throwIfNoEntry: false })) return null;
  const entries = readdirSync(publicDirectory, { withFileTypes: true });
  if (!entries.length) return null;
  const expected = ["cesty.json", "mista.json"];
  if (entries.length !== expected.length || entries.some((entry) => !entry.isFile() || !expected.includes(entry.name))) {
    throw new Error("public/data smí obsahovat pouze dvojici cesty.json a mista.json.");
  }
  return [readJson(join(publicDirectory, "cesty.json")), readJson(join(publicDirectory, "mista.json"))];
}
