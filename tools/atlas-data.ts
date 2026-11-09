import { readFileSync, realpathSync, lstatSync } from "node:fs";
import { dirname, isAbsolute, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv, { type AnySchema, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { parse } from "yaml";

export const root = fileURLToPath(new URL("../", import.meta.url));
const ajv = addFormats(new Ajv({ allErrors: true }));
const schema = (name: string): AnySchema =>
  JSON.parse(readFileSync(new URL(`../schemas/${name}.schema.json`, import.meta.url), "utf8"));

const metadataSchema = schema("metadata");
const tripsSchema = schema("cesty");
const legacyId = { type: "string", pattern: "^tmp-[a-f0-9]{16}$" };
const legacyMetadata = structuredClone(metadataSchema) as { properties: Record<string, unknown> };
legacyMetadata.properties.id = legacyId;
const legacyTrips = structuredClone(tripsSchema) as {
  properties: { cesty: { items: { properties: Record<string, unknown> } } };
};
legacyTrips.properties.cesty.items.properties.id = legacyId;

export type Precision = "den" | "mesic" | "rok" | "neznamy";
export type Focus = "kolo" | "turistika" | "more" | "hory" | "mesto" | "chata" | "kemp" | "akce";
export interface Term {
  zacatek: string | null;
  konec: string | null;
  rok: number | null;
  mesic: number | null;
  presnostTerminu: Precision;
}
export interface Metadata {
  typ: "cesta";
  id: string;
  nazev: string;
  stav: "probehla" | "planovana" | "neoverena" | "zrusena";
  zverejnit: boolean;
  zeme: string;
  zacatek: string | null;
  konec: string | null;
  presnost_terminu: Precision;
  pocet_noci: number | null;
  rok?: number | null;
  mesic?: number | null;
  dalsi_zeme?: string[];
  mista?: string[];
  zamereni?: Focus[];
  verejny_popis?: string | null;
  strava_pocet_aktivit?: number;
  strava_celkem_km?: number;
  strava_prevyseni_m?: number;
}
export interface Trip extends Term {
  id: string;
  nazev: string;
  zeme: string;
  dalsiZeme: string[];
  pocetNoci: number | null;
  mista: string[];
  zamereni: Focus[];
  popis: string | null;
  sport: { aktivit: number; km: number; prevyseniM: number; zdroj: "strava-vyber-2023-2026" } | null;
}
export interface Place {
  id: string;
  nazev: string;
  zeme: string;
  oblast: string | null;
  lat: number;
  lon: number;
  presnost: "obec" | "oblast";
}
interface Candidate extends Place { aliasy: string[]; overeno: boolean; wikidata?: string }
interface Country { nazev: string; iso: string; vlajka: string }
interface Envelope { schemaVersion: 1; generated: true; dataAsOf: string }
export interface TripsFile extends Envelope { cesty: Trip[] }
export interface PlacesFile extends Envelope { mista: Place[] }

const validateMetadata = ajv.compile<Metadata>(metadataSchema);
const validateLegacyMetadata = ajv.compile<Metadata>(legacyMetadata);
const validateTrips = ajv.compile<TripsFile>(tripsSchema);
const validateLegacyTrips = ajv.compile<TripsFile>(legacyTrips);
const validatePlaces = ajv.compile<PlacesFile>(schema("mista"));
const validateCountries = ajv.compile<Country[]>(schema("zeme"));
const validateCandidates = ajv.compile<Candidate[]>(schema("katalog-mist"));
const validateDate = ajv.compile<string>({ type: "string", format: "date" });

export function checked<T>(validate: ValidateFunction<T>, value: unknown, label: string): T {
  if (validate(value)) return value;
  const errors = validate.errors?.map(({ instancePath, message }) => `${instancePath || "/"} ${message}`);
  throw new Error(`${label}: ${errors?.join(", ")}`);
}

export const date = (value: unknown): value is string => validateDate(value);
export const asOfToday = () => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());

export function readJson(path: string | URL): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error("Soubor JSON nelze přečíst nebo nemá platný formát.");
  }
}

export function parseYaml(text: string): unknown {
  try {
    return parse(text, { maxAliasCount: 0, prettyErrors: false });
  } catch {
    throw new Error("Neplatná hlavička nebo soubor YAML.");
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function metadata(value: Record<string, unknown>, legacy: boolean): Metadata {
  // Zdroj může obsahovat soukromá pole. Validujeme jen pole datového kontraktu.
  const keys = Object.keys((metadataSchema as { properties: object }).properties);
  const projected = Object.fromEntries(keys.filter((key) => Object.hasOwn(value, key)).map((key) => [key, value[key]]));
  return checked(legacy ? validateLegacyMetadata : validateMetadata, projected, "Metadata");
}

export function containsPath(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

// Výstupní cesta nesmí přes symlink nebo junction vést na zdrojový disk.
export function localPath(path: string): void {
  let current = path;
  while (lstatSync(current, { throwIfNoEntry: false }) === undefined) current = dirname(current);
  if (!containsPath(realpathSync(root), realpathSync(current))) {
    throw new Error("Pracovní cesta směřuje mimo repozitář.");
  }
}

export function termFromMetadata(m: Metadata): Term {
  const rok = m.zacatek ? Number(m.zacatek.slice(0, 4)) : m.rok ?? null;
  const mesic = m.zacatek ? Number(m.zacatek.slice(5, 7)) : m.mesic ?? null;
  if ((m.rok !== undefined && m.rok !== rok) || (m.mesic !== undefined && m.mesic !== mesic)) {
    throw new Error("Rok nebo měsíc nesouhlasí se začátkem cesty.");
  }
  const term = { zacatek: m.zacatek, konec: m.konec, rok, mesic, presnostTerminu: m.presnost_terminu };
  checkTerm(term);
  return term;
}

function checkTerm(t: Term): void {
  if (t.presnostTerminu === "den") {
    if (!t.zacatek || !t.konec) throw new Error("Přesnost den vyžaduje oba mezní dny.");
    if (t.konec < t.zacatek) throw new Error("Konec cesty je před začátkem.");
    if (t.rok !== Number(t.zacatek.slice(0, 4)) || t.mesic !== Number(t.zacatek.slice(5, 7))) {
      throw new Error("Rok nebo měsíc nesouhlasí se začátkem cesty.");
    }
    return;
  }
  if (t.zacatek !== null || t.konec !== null) throw new Error("Přesné dny nesouhlasí s uvedenou přesností.");
  if (t.presnostTerminu === "mesic" && t.rok !== null && t.mesic !== null) return;
  if (t.presnostTerminu === "rok" && t.rok !== null && t.mesic === null) return;
  if (t.presnostTerminu === "neznamy" && t.rok === null && t.mesic === null) return;
  throw new Error("Rok nebo měsíc nesouhlasí s přesností termínu.");
}

export function finished(t: Term, asOf: string): boolean {
  // U nedatovaného archivu je potvrzení uskutečnění součástí stavu zdroje.
  if (t.presnostTerminu === "neznamy") return true;
  if (t.presnostTerminu === "den") return t.konec !== null && t.konec < asOf;
  if (t.presnostTerminu === "rok") return t.rok !== null && t.rok < Number(asOf.slice(0, 4));
  const month = `${String(t.rok).padStart(4, "0")}-${String(t.mesic).padStart(2, "0")}`;
  return month < asOf.slice(0, 7);
}

function unique<T>(values: T[], key: (value: T) => string, label: string): Map<string, T> {
  const entries = new Map<string, T>();
  for (const value of values) {
    const id = key(value);
    if (entries.has(id)) throw new Error(`Duplicitní identifikátor: ${label}.`);
    entries.set(id, value);
  }
  return entries;
}

export const normalizeName = (name: string) => name.normalize("NFC").trim().toLocaleLowerCase("cs-CZ");

export function loadCatalog() {
  const countries = checked(validateCountries, readJson(new URL("../data/zeme.json", import.meta.url)), "Číselník států");
  const places = checked(validateCandidates,
    parseYaml(readFileSync(new URL("../data/mista.yaml", import.meta.url), "utf8")), "Číselník míst");
  const countriesByCode = unique(countries, (c) => c.iso, "kód státu");
  const countriesByName = unique(countries, (c) => normalizeName(c.nazev), "název státu");
  const placesById = unique(places, (p) => p.id, "místo");
  const placesByName = new Map<string, Candidate>();
  for (const place of places) {
    if (!countriesByCode.has(place.zeme)) throw new Error("Číselník míst obsahuje neznámý stát.");
    for (const name of [place.nazev, ...place.aliasy]) {
      const key = normalizeName(name);
      if (placesByName.has(key)) throw new Error("Číselník míst obsahuje nejednoznačný název nebo alias.");
      placesByName.set(key, place);
    }
  }
  return { countriesByCode, countriesByName, placesById, placesByName };
}
export type Catalog = ReturnType<typeof loadCatalog>;

export function checkPublic(tripsValue: unknown, placesValue: unknown, catalog: Catalog, legacy = false) {
  const trips = checked(legacy ? validateLegacyTrips : validateTrips, tripsValue, "cesty.json");
  const places = checked(validatePlaces, placesValue, "mista.json");
  if (trips.dataAsOf !== places.dataAsOf) throw new Error("Výstupy mají různé dataAsOf.");
  if (!legacy && trips.dataAsOf > asOfToday()) throw new Error("Veřejný výstup má dataAsOf v budoucnosti.");
  unique(trips.cesty, (trip) => trip.id, "cesta");
  const publishedPlaces = unique(places.mista, (place) => place.id, "veřejné místo");
  for (const place of places.mista) {
    const known = catalog.placesById.get(place.id);
    if (!known?.overeno) throw new Error("Veřejné místo není ověřené v číselníku.");
    const keys = ["nazev", "zeme", "oblast", "lat", "lon", "presnost"] as const;
    if (keys.some((key) => place[key] !== known[key])) throw new Error("Veřejné místo nesouhlasí s číselníkem.");
  }
  for (const trip of trips.cesty) {
    checkTerm(trip);
    if (!finished(trip, trips.dataAsOf)) throw new Error("Veřejný výstup obsahuje neukončenou cestu.");
    if (trip.dalsiZeme.includes(trip.zeme) || [trip.zeme, ...trip.dalsiZeme].some((iso) => !catalog.countriesByCode.has(iso))) {
      throw new Error("Veřejný výstup má neplatný seznam států cesty.");
    }
    for (const id of trip.mista) {
      const place = publishedPlaces.get(id);
      if (!place || (place.zeme !== trip.zeme && !trip.dalsiZeme.includes(place.zeme))) {
        throw new Error("Cesta odkazuje na chybějící místo nebo místo mimo státy cesty.");
      }
    }
  }
  return { trips, places };
}
