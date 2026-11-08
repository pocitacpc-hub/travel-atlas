import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { asOfToday, checkPublic, date, loadCatalog, localPath, root } from "./atlas-data";
import { assertSafe, localNames } from "./content-security";
import { publicDirectory } from "./public-data";
import { buildExport, compare, readTripHeader } from "./trip-export";
import { sourceDirectory, writeLocal } from "./source-files";

const reportPath = join(root, "out", "export-report.md");
type Export = ReturnType<typeof buildExport>;

function options(args: string[]) {
  let legacy = false;
  let asOf: string | undefined;
  for (const arg of args) {
    if (arg === "--legacy" && !legacy) legacy = true;
    else if (arg.startsWith("--as-of=") && asOf === undefined) asOf = arg.slice("--as-of=".length);
    else throw new Error("Použití: npm run export -- [--legacy] [--as-of=RRRR-MM-DD]");
  }
  const today = asOfToday();
  asOf ??= today;
  if (!date(asOf) || asOf > today) throw new Error("Datum --as-of musí být platné a nejpozději dnešní.");
  return { legacy, asOf };
}

const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

function writeReport(result: Export, readErrors: Export["errors"], legacy: boolean, fatal?: string): void {
  const errors = [...readErrors, ...result.errors];
  if (fatal) errors.push({ file: "", text: fatal });
  const section = (label: string, entries: Export["errors"]) => [
    `## ${label} (${entries.length})`, "",
    ...entries.map(({ file, text }) => `- ${file ? `**${file}** – ` : ""}${text}`), ""
  ];
  writeLocal(reportPath, [
    "# Report exportu cest", "",
    `Datum dat: ${result.trips.dataAsOf}. Režim: ${legacy ? "legacy" : "přísný"}.`,
    errors.length ? "Export selhal. Vygenerovaná data z předchozího běhu mohou být stále na disku."
      : `Exportováno ${result.trips.cesty.length} cest a ${result.places.mista.length} ověřených míst.`, "",
    ...section("Chyby", errors),
    ...section("Varování", result.warnings),
    ...section("Vynechané záznamy", result.skipped),
    "Rozpory doložené mimo YAML hlavičky jsou popsané v [zadání, kapitola 6](../docs/changes/2026-11-08-zadani-codex-dalsi-faze.md#6-známé-rozpory-a-mezery-v-datech).",
    ""
  ].join("\n"));
}

async function main() {
  const { legacy, asOf } = options(process.argv.slice(2));
  const source = sourceDirectory();
  const catalog = loadCatalog();
  const output = legacy ? join(root, "out", "legacy") : publicDirectory;
  localPath(output);
  localPath(reportPath);
  const files = readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.md$/iu.test(entry.name)).map((entry) => entry.name).sort(compare);
  console.log(`Kontroluji YAML hlavičky v ${files.length} souborech Markdown.`);
  const readErrors: Export["errors"] = [];
  const records: Parameters<typeof buildExport>[0] = [];
  for (const file of files) {
    try {
      const fields = await readTripHeader(join(source, file));
      if (fields) records.push({ file, fields });
    } catch (error) {
      readErrors.push({ file, text: error instanceof Error ? error.message : "Hlavičku nelze přečíst." });
    }
  }
  const result = buildExport(records, catalog, {
    legacy, asOf,
    hasFlag: (flag) => existsSync(join(root, "docs", "design", "v2", "assets", "flag-icons", flag))
  });
  if (!records.length) readErrors.push({ file: "", text: "Zdroj neobsahuje žádný záznam typu cesta." });
  if (readErrors.length || result.errors.length) {
    writeReport(result, readErrors, legacy);
    throw new Error("Export zastaven. Chyby jsou v out/export-report.md.");
  }
  try {
    checkPublic(result.trips, result.places, catalog, legacy);
    assertSafe([result.trips, result.places], localNames());
    writeLocal(join(output, "cesty.json"), json(result.trips));
    writeLocal(join(output, "mista.json"), json(result.places));
  } catch (error) {
    writeReport(result, readErrors, legacy, error instanceof Error ? error.message : "Výstup nelze uložit.");
    throw new Error("Export zastaven. Chyby jsou v out/export-report.md.");
  }
  writeReport(result, readErrors, legacy);
  console.log(`Exportováno ${result.trips.cesty.length} cest a ${result.places.mista.length} míst do ${legacy ? "out/legacy/" : "public/data/"}. Report: out/export-report.md.`);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Export selhal.");
  process.exitCode = 1;
}
