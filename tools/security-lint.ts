import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
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

if (!process.exitCode) {
  console.log("Místní konfigurace a reporty jsou mimo index Gitu.");
}
