import { describe, expect, it } from "vitest";
import { readJson } from "../tools/atlas-data";
import { yearLines } from "../src/lib/charts";
import type { Country, Trip, TripsFile } from "../src/lib/model";
import { computeStats, longestRun, placeVisits } from "../src/lib/stats";

const fixture = readJson(new URL("./fixtures/cesty-2026-11-08.json", import.meta.url)) as TripsFile;
const countries = readJson(new URL("../data/zeme.json", import.meta.url)) as Country[];
const names = new Map(countries.map((c) => [c.iso, c.nazev]));
const name = (code: string) => names.get(code) ?? code;
const s = computeStats(fixture.cesty, name, fixture.dataAsOf);

const trip = (id: string, over: Partial<Trip> = {}): Trip => ({
  id, nazev: `Cesta ${id}`, zeme: "CZ", dalsiZeme: [], zacatek: null, konec: null, rok: 2025, mesic: 5,
  presnostTerminu: "mesic", pocetNoci: null, mista: [], zamereni: [], popis: null, sport: null, ...over
});

describe("Statistiky nad kontrolním exportem z 8. 11. 2026", () => {
  it("odpovídají kontrolním hodnotám", () => {
    expect([s.total, s.cz, s.abroad]).toEqual([96, 49, 47]);
    expect([s.countryCount, s.abroadCountryCount]).toEqual([15, 14]);
    expect([s.nightsSum, s.nightsKnown, s.nightsUnknown]).toEqual([349, 79, 17]);
    expect([s.undated, s.dayKnown, s.monthsKnown]).toEqual([4, 28, 81]);
    expect([s.minYear, s.maxYear, s.years.length]).toEqual([1996, 2026, 31]);
    expect(s.countries.find((c) => c.code === "HR")).toMatchObject({ count: 11, nights: 65, nightsKnown: 8, first: 1997, last: 2026 });
  });

  it("nepočítá neznámé hodnoty jako nulu", () => {
    expect(s.median).toBe(3);
    expect(s.mean).toBeCloseTo(349 / 79, 6);
    expect(s.buckets.map((b) => [b.label, b.count])).toEqual([["1", 7], ["2", 31], ["3–4", 12], ["5–7", 16], ["8–10", 8], ["11+", 5]]);
    expect(s.buckets.reduce((a, b) => a + b.count, 0)).toBe(s.nightsKnown);
    expect(s.months.reduce((a, b) => a + b, 0)).toBe(s.monthsKnown);
    expect(s.countries.find((c) => c.code === "DE")).toMatchObject({ nightsKnown: 0, first: null });
  });

  it("dává cesty bez roku do států, ale ne do let", () => {
    const inYears = new Set(s.years.flatMap((y) => y.trips.map((t) => t.id)));
    expect(s.undatedTrips.some((t) => inYears.has(t.id))).toBe(false);
    expect(s.years.reduce((a, y) => a + y.total, 0)).toBe(s.total - s.undated);
    expect(s.years.filter((y) => !y.total).map((y) => y.year)).toEqual([2008, 2011]);
    expect(s.countries.reduce((a, c) => a + c.count, 0)).toBe(s.total);
  });

  it("počítá rekordy a první cesty do států", () => {
    expect(s.longest).toMatchObject({ noci: 13 });
    expect(s.longest?.trips).toHaveLength(4);
    expect(s.busiest).toEqual({ count: 9, years: [2022, 2023, 2025, 2026] });
    expect(s.busiestAbroad).toEqual({ count: 5, years: [2025, 2026] });
    expect(longestRun(s.years)).toEqual({ len: 15, from: 2012, to: 2026 });
    expect(s.thisYear).toBe(9);
    expect(s.sport.trips).toBe(23);
    // Německo má jen cestu bez roku, proto nemá „první známou cestu“.
    expect([...s.firstTripOfCountry.values()].flat().sort()).toHaveLength(14);
  });

  it("rozloží Celé roky na přesné termíny, měsíce a jen roky", () => {
    const lines = yearLines(s.years, s.undatedTrips);
    const items = lines.flatMap((l) => l.items);
    expect(items.filter((i) => i.kind === "den")).toHaveLength(28);
    expect(items.filter((i) => i.kind === "mesic")).toHaveLength(53);
    expect(lines.reduce((a, l) => a + l.qs.length, 0)).toBe(15);
    expect(lines.at(-1)).toMatchObject({ label: "rok ?" });
  });
});

describe("Statistiky – další státy a místa", () => {
  it("počítá cesty podle hlavního státu a navštívené státy i s dalším státem", () => {
    const t = computeStats([trip("a", { dalsiZeme: ["AT"] }), trip("b", { zeme: "SK", rok: null, mesic: null, presnostTerminu: "neznamy" })], name, "2026-11-08");
    expect(t.countryCount).toBe(3);
    expect(t.abroadCountryCount).toBe(2);
    expect(t.countries.find((c) => c.code === "AT")).toMatchObject({ count: 0, first: 2025 });
    expect(t.countries.find((c) => c.code === "AT")?.also.map((x) => x.id)).toEqual(["a"]);
    expect(t.firstTripOfCountry.get("a")?.sort()).toEqual(["AT", "CZ"]);
    expect(t.minYear).toBe(2025);
  });

  it("přiřadí cesty jen k ověřeným místům z veřejného výstupu", () => {
    const place = { id: "brno", nazev: "Brno", zeme: "CZ", oblast: null, lat: 49.19, lon: 16.61, presnost: "obec" as const };
    const v = placeVisits([trip("a", { mista: ["brno"] }), trip("b"), trip("c", { mista: ["brno"], rok: 2024 })], [place]);
    expect(v).toHaveLength(1);
    expect(v[0]!.trips.map((x) => x.id)).toEqual(["a", "c"]);
  });

  it("zvládne prázdný archiv", () => {
    const e = computeStats([], name, "2026-11-08");
    expect([e.total, e.countryCount, e.minYear, e.years.length, e.median, e.longest, e.busiest]).toEqual([0, 0, null, 0, null, null, null]);
  });
});
