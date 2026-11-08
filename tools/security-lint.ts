import { execFileSync, spawnSync } from "node:child_process";
import { root } from "./atlas-data";
import { assertSafe, localNames } from "./content-security";
import { readPublicData } from "./public-data";

const git = (args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" });

const privateExamples = [
  "out/export-report.md",
  "out/migrace-report.md",
  "config.local.json",
  ".env",
  ".env.production",
  "jmena.local.txt"
];

const result = spawnSync("git", ["check-ignore", "--no-index", "-z", "--stdin"], {
  cwd: root,
  encoding: "utf8",
  input: `${privateExamples.join("\0")}\0`
});
const ignored = new Set(result.stdout?.split("\0"));
if (result.status !== 0 || privateExamples.some((path) => !ignored.has(path))) {
  console.error("Některé soukromé pracovní soubory nejsou v Git ignore.");
  process.exitCode = 1;
}

const trackedLocalFiles = git(["ls-files", "-ci", "-z", "--exclude-from=.gitignore"]);
if (trackedLocalFiles.length > 0) {
  console.error("Git sleduje soubory, které jsou podle .gitignore určené jen pro místní použití.");
  process.exitCode = 1;
}

try {
  const publicData = readPublicData();
  if (publicData) assertSafe(publicData, localNames());
} catch (error) {
  console.error(error instanceof Error ? error.message : "Kontrola veřejných dat selhala.");
  process.exitCode = 1;
}

if (!process.exitCode) console.log("Kontrola veřejných dat a soukromých souborů prošla.");
