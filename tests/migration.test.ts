import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog, parseYaml } from "../tools/atlas-data";
import { applyMigration, createBackup } from "../tools/migration-backup";
import { prepareMigration, readProposals, splitHeader, type Proposal } from "../tools/metadata-migration";
import { buildExport } from "../tools/trip-export";

const catalog = loadCatalog();
const body = Buffer.concat([Buffer.from("## Poznámka\r\n---\r\n  konec"), Buffer.from([255, 0, 13, 10])]);
const oldHeader = "\uFEFF---\r\n"
  + "typ: cesta\r\nnazev: Španělsko – Alcossebre\r\nzeme: Španělsko\r\nrok: 2025\r\n"
  + "mesic_konani: 2025-05\r\nmesic_jisty: true\r\nstav_zaznamu: Uskutečnění doloženo\r\n"
  + "zacatek: null\r\nkonec: null\r\npocet_noci: 2\r\nfinance: # soukromá poznámka\r\n  mena: CZK\r\n---\r\n";
const original = Buffer.concat([Buffer.from(oldHeader), body]);
const pending: Proposal = {
  nazev: "Španělsko – Alcossebre", rok: 2025, potvrzeno: false,
  zmeny: { zacatek: "2025-05-03", konec: "2025-05-05" }
};

function withSource(run: (source: string, backups: string) => void): void {
  const parent = realpathSync(tmpdir());
  const area = mkdtempSync(join(parent, "travel-atlas-migration-"));
  const source = join(area, "source");
  mkdirSync(source);
  writeFileSync(join(source, "cesta.md"), original);
  try {
    run(source, join(area, "backup"));
  } finally {
    if (dirname(realpathSync(area)) !== parent) throw new Error("Testovací složka je mimo určenou cestu.");
    rmSync(area, { recursive: true, force: true });
  }
}

describe("Migrace metadat", () => {
  it("ve zkoušce zachová zdroj, naplánuje stejné ID a vynechá neschválené změny", () => {
    withSource((source) => {
      const first = prepareMigration(source, readProposals([pending], catalog));
      const repeat = prepareMigration(source, [pending], first.plan);
      expect(repeat.plan).toEqual(first.plan);
      expect(readFileSync(join(source, "cesta.md")).equals(original)).toBe(true);
      expect(first.plan.entries[0]?.id).toMatch(/^t-[a-z0-9]{6}$/u);
      expect(first.plan.entries[0]?.changes).toMatchObject({
        stav: "probehla", zverejnit: true, presnost_terminu: "mesic", mesic: 5, mista: [], zamereni: []
      });
      expect(first.plan.entries[0]?.changes).not.toHaveProperty("zacatek");
    });
  });

  it("ověří úplnou zálohu, zachová tělo a druhý běh má nula změn", () => {
    withSource((source, backups) => {
      mkdirSync(join(source, "přílohy"));
      writeFileSync(join(source, "přílohy", "soubor.bin"), body);
      writeFileSync(join(source, ".poznamka"), "Mimo záznamy cest.");
      const proposals = readProposals([
        { ...pending, potvrzeno: true },
        { ...pending, potvrzeno: true, zmeny: { mista: ["Alcossebre"] } }
      ], catalog);
      const draft = prepareMigration(source, proposals);
      const preview = buildExport(draft.records, catalog, { legacy: false, asOf: "2026-11-08", hasFlag: () => true });
      expect(preview.errors).toEqual([]);
      expect(preview.trips.cesty[0]).toMatchObject({
        zacatek: "2025-05-03", konec: "2025-05-05", presnostTerminu: "den", pocetNoci: 2, mista: []
      });

      const backup = createBackup(source, backups, draft.plan.entries);
      expect(readFileSync(join(backup, "cesta.md")).equals(original)).toBe(true);
      expect(readFileSync(join(backup, "přílohy", "soubor.bin")).equals(body)).toBe(true);
      expect(readFileSync(join(backup, ".poznamka"), "utf8")).toBe("Mimo záznamy cest.");
      expect(applyMigration(source, draft.plan.entries, draft.updates)).toBe(1);

      const migrated = splitHeader(readFileSync(join(source, "cesta.md")))!;
      expect(migrated.opening.equals(Buffer.from("\uFEFF---\r\n"))).toBe(true);
      expect(migrated.closing.equals(Buffer.from("---\r\n"))).toBe(true);
      expect(migrated.body.equals(body)).toBe(true);
      expect(parseYaml(migrated.yaml)).toMatchObject({
        id: draft.plan.entries[0]?.id, zacatek: "2025-05-03", mista: ["Alcossebre"], finance: { mena: "CZK" }
      });
      expect(migrated.yaml).toContain("# soukromá poznámka");
      expect(prepareMigration(source, proposals).updates.size).toBe(0);
    });
  });

  it("zastaví zápis při změně zdroje a odmítne zálohu uvnitř zdroje", () => {
    withSource((source, backups) => {
      const draft = prepareMigration(source, []);
      expect(() => createBackup(source, join(source, "backup"), draft.plan.entries)).toThrow(/mimo zdrojovou/u);
      const changed = Buffer.concat([original, Buffer.from("Nová poznámka")]);
      writeFileSync(join(source, "cesta.md"), changed);
      expect(() => createBackup(source, backups, draft.plan.entries)).toThrow(/schválenému plánu/u);
      expect(() => applyMigration(source, draft.plan.entries, draft.updates)).toThrow(/po 0 změnách/u);
      expect(readFileSync(join(source, "cesta.md")).equals(changed)).toBe(true);
    });
  });

  it("zachová existující ID a odmítne duplikát, nejednoznačný nebo neplatný návrh", () => {
    withSource((source) => {
      const withId = Buffer.from(oldHeader.replace("typ: cesta", "typ: cesta\r\nid: t-abc123"));
      writeFileSync(join(source, "cesta.md"), withId);
      expect(prepareMigration(source, []).plan.entries[0]?.id).toBe("t-abc123");
      const approved = { ...pending, potvrzeno: true };
      expect(() => prepareMigration(source, [{ ...approved, nazev: "Jiný název" }])).toThrow(/jediný odpovídající/u);
      expect(() => readProposals([{ ...approved, zmeny: { finance: ["CZK"] } }], catalog)).toThrow(/Neplatný/u);
      expect(() => readProposals([{ ...approved, rok: 2024 }], catalog)).toThrow(/Neplatný/u);
      expect(() => readProposals([approved, approved], catalog)).toThrow(/duplicitní/u);
      writeFileSync(join(source, "druha.md"), withId);
      expect(() => prepareMigration(source, [])).toThrow(/Duplicitní existující ID/u);
    });
  });
});
