// Generuje podklady webu do src/generated/ (mimo Git):
// - mapa.json: hranice států z Natural Earth 1:50m (balíček world-atlas) v projekci webu,
// - vlajky.css a flags/*.svg: podmnožina flag-icons pro státy z číselníku.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { FRAME, project } from "../src/lib/projection";
import { loadCatalog, localPath, readJson, root } from "./atlas-data";
import { flagPackage, flagSource } from "./flags";

export const generatedDirectory = join(root, "src", "generated");

// ISO 3166-1 číselný kód → alfa-2 pro státy ve výřezu mapy a kolem něj.
// Nový stát v číselníku mimo tuto tabulku se na mapě neobarví a build to ohlásí.
const NUMERIC: Record<string, string> = {
  "008": "AL", "012": "DZ", "020": "AD", "031": "AZ", "040": "AT", "051": "AM", "056": "BE", "070": "BA",
  "100": "BG", "112": "BY", "191": "HR", "196": "CY", "203": "CZ", "208": "DK", "233": "EE", "234": "FO",
  "246": "FI", "248": "AX", "250": "FR", "268": "GE", "276": "DE", "292": "GI", "300": "GR", "336": "VA",
  "348": "HU", "352": "IS", "372": "IE", "376": "IL", "380": "IT", "400": "JO", "422": "LB", "428": "LV",
  "434": "LY", "438": "LI", "440": "LT", "442": "LU", "470": "MT", "492": "MC", "498": "MD", "499": "ME",
  "504": "MA", "528": "NL", "578": "NO", "616": "PL", "620": "PT", "642": "RO", "643": "RU", "674": "SM",
  "688": "RS", "703": "SK", "705": "SI", "724": "ES", "752": "SE", "756": "CH", "760": "SY", "788": "TN",
  "792": "TR", "804": "UA", "807": "MK", "818": "EG", "826": "GB", "831": "GG", "832": "JE", "833": "IM"
};

export interface MapAsset {
  zdroj: string;
  width: number;
  height: number;
  /** Ostatní pevnina (nenavštívitelné státy mimo číselník) jako jedna cesta SVG. */
  land: string;
  /** Státy z číselníku podle ISO alfa-2. */
  countries: Record<string, string>;
  /** Obdélník státu v rámci mapy [x1, y1, x2, y2] pro výřez v detailu cesty. */
  bbox: Record<string, [number, number, number, number]>;
}

export function buildMap(topology: Topology, catalogCodes: Iterable<string>, source: string) {
  const wanted = new Set(catalogCodes);
  const { width: W, height: H } = FRAME;
  const margin = 40;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const countries: Record<string, string> = {};
  const bbox: Record<string, [number, number, number, number]> = {};
  let land = "";
  const collection = topology.objects.countries as GeometryCollection<{ name: string }>;
  const geo = feature(topology, collection);

  for (const f of geo.features) {
    const g = f.geometry;
    if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon")) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    const code = typeof f.id === "string" ? NUMERIC[f.id] : undefined;
    const key = code && wanted.has(code) ? code : null;
    let d = "";
    for (const poly of polys) {
      for (const ring of poly) {
        const pts = ring.map(([lon, lat]) => project(lon as number, lat as number));
        if (!pts.some(([x, y]) => x > -5 && x < W + 5 && y > -5 && y < H + 5)) continue;
        const seg: [number, number][] = [];
        let last: [number, number] | null = null;
        for (const [px, py] of pts) {
          const x = clamp(px, -margin, W + margin);
          const y = clamp(py, -margin, H + margin);
          if (last && Math.hypot(x - last[0], y - last[1]) < 1.1) continue;
          seg.push([x, y]);
          last = [x, y];
          if (key && x >= 0 && x <= W && y >= 0 && y <= H) {
            const b = bbox[key] ?? (bbox[key] = [x, y, x, y]);
            b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y);
            b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y);
          }
        }
        if (seg.length < 3) continue;
        d += "M" + seg.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
      }
    }
    if (!d) continue;
    if (key) countries[key] = (countries[key] ?? "") + d;
    else land += d;
  }
  for (const b of Object.values(bbox)) for (let i = 0; i < 4; i++) b[i] = Math.round(b[i]! * 10) / 10;
  const missing = [...wanted].filter((code) => !countries[code]).sort();
  const map: MapAsset = { zdroj: source, width: W, height: H, land, countries, bbox };
  return { map, missing };
}

export function flagCss(codes: string[], license: string, version: string): string {
  const notice = license.trim().replace(/\*\//gu, "* /");
  const rules = codes.map((code) => `.fi-${code} { background-image: url("./flags/${code}.svg"); }`);
  return `/*! flag-icons ${version} – podmnožina pro Cestovní atlas. https://github.com/lipis/flag-icons\n${notice}\n*/\n` +
    `.fi { position: relative; display: inline-block; flex: none; width: 1.333333em; height: 1em; line-height: 1em;\n` +
    `  background-size: cover; background-position: 50%; background-repeat: no-repeat;\n` +
    `  border-radius: 2px; box-shadow: 0 0 0 1px rgba(30, 43, 51, .18); vertical-align: -.12em; }\n` +
    `.fi::before { content: " "; }\n${rules.join("\n")}\n`;
}

function main() {
  localPath(generatedDirectory);
  const catalog = loadCatalog();
  const countries = [...catalog.countriesByCode.values()].sort((a, b) => a.iso.localeCompare(b.iso));

  const atlasPackage = readJson(join(root, "node_modules", "world-atlas", "package.json")) as { version: string };
  const topology = readJson(join(root, "node_modules", "world-atlas", "countries-50m.json")) as Topology;
  const { map, missing } = buildMap(topology, countries.map((c) => c.iso),
    `Natural Earth 1:50m (public domain) přes world-atlas ${atlasPackage.version}`);

  const flagsPackage = readJson(join(flagPackage, "package.json")) as { version: string };
  const missingFlags = countries.filter((c) => !existsSync(flagSource(c.vlajka))).map((c) => c.iso);
  if (missingFlags.length) throw new Error(`Chybí SVG vlajky v balíčku flag-icons: ${missingFlags.join(", ")}.`);

  rmSync(generatedDirectory, { recursive: true, force: true });
  mkdirSync(join(generatedDirectory, "flags"), { recursive: true });
  writeFileSync(join(generatedDirectory, "mapa.json"), JSON.stringify(map));
  const codes = countries.map((c) => c.iso.toLowerCase());
  for (const c of countries) copyFileSync(flagSource(c.vlajka), join(generatedDirectory, "flags", `${c.iso.toLowerCase()}.svg`));
  const license = readFileSync(join(flagPackage, "LICENSE"), "utf8");
  writeFileSync(join(generatedDirectory, "vlajky.css"), flagCss(codes, license, flagsPackage.version));

  console.log(`Mapa ${map.width} × ${map.height}, ${Object.keys(map.countries).length} států z číselníku, vlajek ${codes.length}.`);
  if (missing.length) console.warn(`Varování: státy z číselníku mimo výřez mapy nebo bez kódu: ${missing.join(", ")}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Generování podkladů selhalo.");
    process.exitCode = 1;
  }
}
