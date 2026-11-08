import { existsSync, readFileSync } from "node:fs";
import type { Topology } from "topojson-specification";
import { describe, expect, it } from "vitest";
import { buildMap, flagCss } from "../tools/build-assets";
import { loadCatalog, readJson } from "../tools/atlas-data";
import { flagSource } from "../tools/flags";
import { FRAME, project } from "../src/lib/projection";

const catalog = [...loadCatalog().countriesByCode.values()];

describe("Podklady webu", () => {
  it("projekce a výřez odpovídají prototypu", () => {
    expect([FRAME.width, FRAME.height]).toEqual([1000, 823]);
    const [x, y] = project(10, 49);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
    expect(x).toBeLessThan(FRAME.width);
    expect(y).toBeLessThan(FRAME.height);
  });

  it("mapa obsahuje všechny státy z číselníku", () => {
    const topology = readJson(new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url)) as Topology;
    const { map, missing } = buildMap(topology, catalog.map((c) => c.iso), "test");
    expect(missing).toEqual([]);
    expect(Object.keys(map.countries).sort()).toEqual(catalog.map((c) => c.iso).sort());
    expect(map.land.length).toBeGreaterThan(10_000);
    // Praha leží ve výřezu Česka.
    const [px, py] = project(14.42, 50.09);
    const [x1, y1, x2, y2] = map.bbox.CZ!;
    expect(px > x1 && px < x2 && py > y1 && py < y2).toBe(true);
  });

  it("vlajky jsou lokální podmnožina s licencí", () => {
    for (const c of catalog) expect(existsSync(flagSource(c.vlajka)), c.iso).toBe(true);
    const license = readFileSync(new URL("../node_modules/flag-icons/LICENSE", import.meta.url), "utf8");
    const css = flagCss(["cz", "hr"], license, "7.6.0");
    expect(css.startsWith("/*! flag-icons 7.6.0")).toBe(true);
    expect(css).toContain("Panayiotis Lipiridis");
    expect(css).toContain('.fi-cz { background-image: url("./flags/cz.svg"); }');
    expect(css).not.toMatch(/https?:\/\/(?!github\.com\/lipis)/u);
  });
});
