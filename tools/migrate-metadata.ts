import { existsSync, mkdirSync, openSync, closeSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { asOfToday, checkPublic, isRecord, loadCatalog, localPath, parseYaml, readJson, root } from "./atlas-data";
import { assertSafe, localNames } from "./content-security";
import { flagSource } from "./flags";
import { prepareMigration, readProposals, type Proposal, type SavedPlan } from "./metadata-migration";
import { applyMigration, createBackup } from "./migration-backup";
import { sourceDirectory, writeLocal } from "./source-files";
import { buildExport } from "./trip-export";

const report = join(root, "out", "migrace-report.md");
const saved = join(root, "out", "migrace-plan.local.json");
const receipt = join(root, "out", "migrace-zapis.md");
const lock = join(root, "out", "migrace.lock");
const proposalFile = join(root, "data", "migrace", "2026-11-navrhy.yaml");

function previousPlan(): SavedPlan | undefined {
  localPath(saved);
  if (!existsSync(saved)) return undefined;
  const value = readJson(saved);
  if (!isRecord(value) || typeof value.source !== "string" || typeof value.proposalsHash !== "string"
    || !Array.isArray(value.entries) || value.entries.some((entry) =>
      !isRecord(entry) || typeof entry.file !== "string" || typeof entry.hash !== "string"
      || typeof entry.id !== "string" || !isRecord(entry.before) || !isRecord(entry.changes))) {
    throw new Error("Uložený místní plán má neplatný formát.");
  }
  return { source: value.source, proposalsHash: value.proposalsHash, entries: value.entries };
}

type Draft = ReturnType<typeof prepareMigration>;
type Preview = ReturnType<typeof buildExport>;
function reportText(draft: Draft, preview: Preview, proposals: Proposal[], mode: string): string {
  const known = preview.trips.cesty.filter((trip) => trip.pocetNoci !== null);
  const domestic = preview.trips.cesty.filter((trip) => trip.zeme === "CZ").length;
  const countries = new Set(preview.trips.cesty.flatMap((trip) => [trip.zeme, ...trip.dalsiZeme])).size;
  const nights = known.reduce((total, trip) => total + (trip.pocetNoci ?? 0), 0);
  const block = [
    "# Report migrace metadat", "", mode, "",
    `Záznamy: ${draft.plan.entries.length}. Navržené přepisy: ${draft.updates.size}.`,
    `Návrhy: ${proposals.filter((p) => p.potvrzeno).length} schválených a ${proposals.filter((p) => !p.potvrzeno).length} čekajících.`,
    `Přísný náhled: ${preview.trips.cesty.length} cest (${domestic} Česko, ${preview.trips.cesty.length - domestic} zahraničí), ${countries} států, ${nights} nocí u ${known.length} cest.`,
    `Neznámý počet nocí: ${preview.trips.cesty.length - known.length}. Neznámý rok: ${preview.trips.cesty.filter((trip) => trip.rok === null).length}.`,
    "", "## Změny podle souborů", ""
  ];
  const display = (value: unknown) => value === undefined ? "(chybí)" : `\`${JSON.stringify(value)}\``;
  for (const { file, before, changes } of draft.plan.entries) {
    block.push(`### ${file}`, "");
    const keys = Object.keys(changes);
    if (!keys.length) block.push("Beze změny.");
    for (const key of keys) block.push(`- \`${key}\`: ${display(before[key])} → ${display(changes[key])}`);
    block.push("");
  }
  block.push("## Rozhodnutí k potvrzení", "",
    "Návrhy s `potvrzeno: false` se do náhledu ani zápisu nezahrnují. Nevyřešené rozpory zůstávají k rozhodnutí podle kapitoly 6 zadání.", "",
    "## Varování", "",
    ...[...draft.warnings, ...preview.warnings].map(({ file, text }) => `- ${file ? `**${file}** – ` : ""}${text}`),
    "");
  return block.join("\n");
}

function main(args: string[]): void {
  const apply = args.length === 3 && args[0] === "--apply" && args[1] === "--backup" && !!args[2]?.trim();
  if (args.length && !apply) throw new Error("Použití: npm run migrate [-- --apply --backup <složka>]");
  for (const path of [report, saved, receipt, lock]) localPath(path);
  mkdirSync(dirname(lock), { recursive: true });
  let lockFd: number;
  try {
    lockFd = openSync(lock, "wx");
  } catch {
    throw new Error("Migrace už běží nebo zůstal zámek out/migrace.lock po přerušení.");
  }
  try {
    runMigration(apply ? args[2] : undefined);
  } finally {
    closeSync(lockFd);
    rmSync(lock, { force: true });
  }
}

function runMigration(backupDir?: string): void {
  const source = sourceDirectory();
  const catalog = loadCatalog();
  const proposals = readProposals(parseYaml(readFileSync(proposalFile, "utf8")), catalog);
  const prior = previousPlan();
  const draft = prepareMigration(source, proposals, prior);
  const preview = buildExport(draft.records, catalog, {
    legacy: false, asOf: asOfToday(),
    hasFlag: (flag) => existsSync(flagSource(flag))
  });
  const writeReport = (mode: string) => writeLocal(report, reportText(draft, preview, proposals, mode));
  if (preview.errors.length) {
    writeReport("Přísný náhled selhal.\n\n" + preview.errors.map(({ file, text }) => `- ${file}: ${text}`).join("\n"));
    throw new Error("Migrace zastavena kvůli neplatným metadatům. Viz out/migrace-report.md.");
  }
  try {
    checkPublic(preview.trips, preview.places, catalog);
    assertSafe([preview.trips, preview.places], localNames());
  } catch (error) {
    writeReport(`Přísný náhled selhal. ${error instanceof Error ? error.message : ""}`);
    throw new Error("Migrace zastavena při kontrole přísného výstupu. Viz out/migrace-report.md.");
  }
  if (!backupDir) {
    writeReport("Zkouška nanečisto. Zdroj byl otevřen pouze pro čtení.");
    writeLocal(saved, JSON.stringify(draft.plan, null, 2) + "\n");
    console.log(`Zkouška: ${draft.updates.size} navržených změn, přísný náhled ${preview.trips.cesty.length} cest. Viz out/migrace-report.md.`);
    return;
  }
  if (!draft.updates.size) {
    writeReport("Ověření po migraci. Ve zdroji nejsou potřeba žádné změny.");
    console.log("Beze změny. Další záloha se nevytváří.");
    return;
  }
  if (!isDeepStrictEqual(prior, draft.plan)) {
    throw new Error("Zdroj nebo návrhy se liší od uloženého plánu. Spusť zkoušku nanečisto a znovu zkontroluj report.");
  }
  const backup = createBackup(source, backupDir, draft.plan.entries);
  console.log(`Ověřená záloha: ${backup}`);
  const writeApplyStatus = (status: string) => {
    const text = `Ověřená záloha: ${backup}. ${status}`;
    writeLocal(receipt, `# Záznam zápisu migrace\n\n${text}\n`);
    writeReport(text);
  };
  writeApplyStatus("Probíhá zápis.");
  try {
    const applied = applyMigration(source, draft.plan.entries, draft.updates);
    writeApplyStatus(`Zapsáno ${applied} souborů.`);
    console.log(`Zapsáno ${applied} souborů. Spusť zkoušku nanečisto a přísný export.`);
  } catch (error) {
    writeApplyStatus(error instanceof Error ? error.message : "Zápis selhal.");
    throw error;
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Migrace selhala.");
  process.exitCode = 1;
}
