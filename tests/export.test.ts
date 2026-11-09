import { mkdtempSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkPublic, loadCatalog, readJson } from "../tools/atlas-data";
import { assertSafe, securityFindings } from "../tools/content-security";
import { buildExport, readTripHeader } from "../tools/trip-export";

const catalog = loadCatalog();
const options = { asOf: "2026-11-08", legacy: false, hasFlag: () => true };
const fixture = readJson(new URL("./fixtures/cesty-2026-11-08.json", import.meta.url));
const placesFixture = readJson(new URL("./fixtures/mista-2026-11-08.json", import.meta.url));
const sample = (id: string, overrides: Record<string, unknown> = {}) => ({
  file: `${id}.md`,
  fields: {
    id, typ: "cesta", nazev: "Zkušební cesta", zeme: "Česko", stav: "probehla", zverejnit: true,
    zacatek: null, konec: null, rok: 2025, mesic: 5, presnost_terminu: "mesic", pocet_noci: null,
    ...overrides
  }
});

describe("Kontrolní export z 8. 11. 2026", () => {
  it("má 96 cest a odpovídá kontrolním hodnotám", () => {
    const { trips, places } = checkPublic(fixture, placesFixture, catalog);
    const cz = trips.cesty.filter((trip) => trip.zeme === "CZ").length;
    const known = trips.cesty.flatMap((trip) => trip.pocetNoci === null ? [] : [trip.pocetNoci]);
    expect(trips.cesty).toHaveLength(96);
    expect([cz, trips.cesty.length - cz]).toEqual([49, 47]);
    expect(new Set(trips.cesty.flatMap((trip) => [trip.zeme, ...trip.dalsiZeme])).size).toBe(15);
    expect(known.reduce((sum, nights) => sum + nights, 0)).toBe(349);
    expect([known.length, trips.cesty.length - known.length]).toEqual([79, 17]);
    expect(trips.cesty.filter((trip) => trip.rok === null)).toHaveLength(4);
    expect(places.mista).toEqual([]);
    expect(trips.cesty.find((trip) => trip.zeme === "GR" && trip.rok === 2009)).toMatchObject({
      zacatek: "2009-07-20", konec: "2009-07-30", pocetNoci: 10
    });
    expect(() => assertSafe(trips, [])).not.toThrow();
  });

  it("odmítne dočasná ID v přísném veřejném schématu", () => {
    const { trips, places } = checkPublic(fixture, placesFixture, catalog);
    const legacy = { ...trips, cesty: [{ ...trips.cesty[0], id: "tmp-0000000000000000" }] };
    expect(() => checkPublic(legacy, places, catalog)).toThrow(/id.*pattern/u);
  });
});

describe("Export cest", () => {
  it("převádí přesnost a vyřadí nepotvrzený rozpočet Itálie", () => {
    const legacy = (file: string, fields: Record<string, unknown>) => ({
      file, fields: {
        typ: "cesta", nazev: "Zkušební cesta", zeme: "Itálie", zacatek: null, konec: null, rok: 2020,
        pocet_noci: null, stav_zaznamu: "Uskutečnění doloženo", ...fields
      }
    });
    const sources = [
      legacy("nepotvrzena.md", { mesic_konani: "2020-06", mesic_jisty: true, stav_zaznamu: "Uskutečnění nepotvrzeno" }),
      legacy("jen-rok.md", { mesic_konani: "2020-00", mesic_jisty: false }),
      legacy("nejisty-mesic.md", { mesic_konani: "2020-07", mesic_jisty: false }),
      legacy("mesic.md", { mesic_konani: "2020-08", mesic_jisty: true, pocet_noci: 0 }),
      legacy("bez-roku.md", { rok: null, mesic_konani: null, mesic_jisty: false }),
      legacy("den.md", { zacatek: "2020-08-01", konec: "2020-08-01", pocet_noci: 0 })
    ];
    const result = buildExport(sources, catalog, { ...options, legacy: true });
    expect(result.errors).toEqual([]);
    expect(result.skipped).toEqual([{ file: "nepotvrzena.md", text: "stav neoverena" }]);
    expect(result.trips.cesty.map((trip) => trip.presnostTerminu).sort()).toEqual(["den", "mesic", "neznamy", "rok", "rok"]);
    expect(result.trips.cesty.find((trip) => trip.presnostTerminu === "mesic")?.pocetNoci).toBe(0);
    expect(result.trips.cesty.find((trip) => trip.presnostTerminu === "rok")?.pocetNoci).toBeNull();
    expect(buildExport([...sources].reverse(), catalog, { ...options, legacy: true }).trips).toEqual(result.trips);
  });

  it("zveřejní jen potvrzené, povolené a ukončené cesty", () => {
    const day = (end: string) => ({
      zacatek: "2026-11-06", konec: end, rok: 2026, mesic: 11, presnost_terminu: "den"
    });
    const sources = [
      sample("t-000001", day("2026-11-07")),
      sample("t-000002", day("2026-11-08")),
      sample("t-000003", { rok: 2026, mesic: 10 }),
      sample("t-000004", { rok: 2026, mesic: 11 }),
      sample("t-000005", { rok: 2026, mesic: null, presnost_terminu: "rok" }),
      sample("t-000006", { rok: 2025, mesic: null, presnost_terminu: "rok" }),
      sample("t-000007", { stav: "planovana" }),
      sample("t-000008", { zverejnit: false }),
      sample("t-000009", { rok: null, mesic: null, presnost_terminu: "neznamy" }),
      sample("t-000010", { stav: "zrusena", zverejnit: false })
    ];
    const result = buildExport(sources, catalog, options);
    expect(result.errors).toEqual([]);
    expect(result.trips.cesty.map((trip) => trip.id)).toEqual(["t-000001", "t-000003", "t-000006", "t-000009"]);
    expect(result.skipped).toContainEqual({ file: "t-000010.md", text: "stav zrusena" });
  });

  it("čte pouze hlavičku, povolené součty a ověřená místa podle aliasů", async () => {
    const dir = mkdtempSync(join(tmpdir(), "travel-atlas-"));
    const file = join(dir, "test.md");
    try {
      const fields = sample("t-000010", {
        zeme: "Španělsko", mista: ["Alcoceber"], finance: "CZK",
        strava_pocet_aktivit: 0, strava_celkem_km: 0, strava_prevyseni_m: 0,
        strava_nazev_aktivity: "Soukromý název"
      }).fields;
      // JSON je podmnožina YAML. BOM, CRLF a oddělovač navíc ověří čtení hlavičky.
      writeFileSync(file, `\uFEFF---\r\n${JSON.stringify(fields)}\r\n---\r\nverejny_popis: https://strava.com/\r\n---\r\n`);
      const parsed = await readTripHeader(file);
      expect(parsed).not.toBeNull();
      const source = { file: "test.md", fields: parsed! };
      // Test nezávisí na tom, zda je Alcossebre v číselníku už ověřené.
      const candidate = catalog.placesById.get("alcossebre")!;
      const unverified = { ...candidate, overeno: false };
      const unverifiedCatalog = {
        ...catalog,
        placesById: new Map(catalog.placesById).set(unverified.id, unverified),
        placesByName: new Map(catalog.placesByName).set("alcoceber", unverified)
      };
      const first = buildExport([source], unverifiedCatalog, options);
      expect(first.warnings.some(({ text }) => text.includes("čeká na ověření"))).toBe(true);
      expect(first.places.mista).toEqual([]);

      const verified = { ...candidate, overeno: true };
      const adjustedCatalog = {
        ...catalog,
        placesById: new Map(catalog.placesById).set(verified.id, verified),
        placesByName: new Map(catalog.placesByName).set("alcoceber", verified)
      };
      const result = buildExport([source], adjustedCatalog, options);
      const { trips, places } = checkPublic(result.trips, result.places, adjustedCatalog);
      expect(trips.cesty[0]).toMatchObject({ mista: [verified.id], popis: null, sport: { aktivit: 0, km: 0, prevyseniM: 0 } });
      expect(places.mista[0]).not.toHaveProperty("aliasy");
      expect(() => assertSafe(trips, [])).not.toThrow();
    } finally {
      rmSync(file, { force: true });
      rmdirSync(dir);
    }
  });

  it("hlásí neplatná metadata a zakazuje pole mimo veřejné schéma", () => {
    const result = buildExport([
      sample("t-000001"), sample("t-000001"), sample("t-000002", { zeme: "Neznámý stát" }),
      sample("t-000003", { presnost_terminu: "tyden" }), sample("t-000004", { id: undefined }),
      sample("t-000005", { zacatek: "2025-02-30", konec: "2025-03-02", presnost_terminu: "den" }),
      sample("t-000006", { zacatek: "2025-05-03", konec: "2025-05-02", presnost_terminu: "den" })
    ], catalog, options);
    expect(result.errors).toHaveLength(6);
    const extra = { ...result.trips, cesty: [{ ...result.trips.cesty[0], finance: {} }] };
    expect(() => checkPublic(extra, result.places, catalog)).toThrow(/additional properties/u);
  });
});

it("security lint zachytí citlivé řetězce a klíče i po dekódování JSON", () => {
  const sample = JSON.parse(String.raw`{"pocet_ucastniku":2,"nazev":"Zkušební Jméno","popis":"docs.google.com drive.google.com strava.com CZK K\u010d Calle X AB1234"}`);
  expect(securityFindings(sample, ["jméno"])).toEqual(expect.arrayContaining([
    "Google Drive nebo Dokumenty", "Strava URL", "měna", "adresa", "číslo letu", "účastníci", "jméno z místního seznamu"
  ]));
  expect(() => assertSafe(sample, [])).toThrow(/Podezřelý obsah/u);
});
