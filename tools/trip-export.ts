import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import {
  type Catalog, type Metadata, type Place, type PlacesFile, type Trip, type TripsFile,
  date, finished, isRecord, metadata, normalizeName, parseYaml, termFromMetadata
} from "./atlas-data";

interface SourceEntry { file: string; fields: Record<string, unknown> }
interface Message { file: string; text: string }
interface Options { legacy: boolean; asOf: string; hasFlag: (flag: string) => boolean }

export async function readTripHeader(path: string): Promise<Record<string, unknown> | null> {
  const stream = createReadStream(path, { encoding: "utf8" });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  const header: string[] = [];
  let first = true;
  let size = 0;
  try {
    for await (const line of lines) {
      if (first) {
        first = false;
        if (line.replace(/^\uFEFF/u, "").trimEnd() !== "---") return null;
      } else if (line.trimEnd() === "---") {
        const value = parseYaml(header.join("\n"));
        return isRecord(value) && value.typ === "cesta" ? value : null;
      } else {
        size += line.length + 1;
        if (size > 65_536) throw new Error("YAML hlavička překročila limit nebo jí chybí oddělovač.");
        header.push(line);
      }
    }
    if (!first) throw new Error("YAML hlavička nemá koncový oddělovač.");
    return null;
  } finally {
    lines.close();
    stream.destroy();
  }
}

function fromLegacy(entry: SourceEntry, warn: (message: string) => void): Record<string, unknown> {
  const fields = entry.fields;
  const dateStart = fields.zacatek ?? null;
  const dateEnd = fields.konec ?? null;
  const monthCode = fields.mesic_konani;
  const knownMonth = fields.mesic_jisty;
  let year = fields.rok ?? null;
  let month: number | null = null;
  if (knownMonth !== undefined && typeof knownMonth !== "boolean") throw new Error("Neplatná jistota měsíce.");
  if (monthCode != null) {
    if (typeof monthCode !== "string" || !/^\d{4}-(?:00|0[1-9]|1[0-2])$/u.test(monthCode)) {
      throw new Error("Neplatné mesic_konani.");
    }
    const sourceYear = Number(monthCode.slice(0, 4));
    if (year !== null && year !== sourceYear) throw new Error("Rok nesouhlasí s mesic_konani.");
    year = sourceYear;
    const sourceMonth = Number(monthCode.slice(5));
    if (sourceMonth && knownMonth === true) month = sourceMonth;
    if (sourceMonth && knownMonth === false) warn("Měsíc je nejistý. Zachován pouze rok.");
  }
  if (date(dateStart)) {
    year ??= Number(dateStart.slice(0, 4));
    month ??= Number(dateStart.slice(5, 7));
  }
  const legacyStatus = fields.stav_zaznamu;
  let status: Metadata["stav"] = "neoverena";
  if (typeof legacyStatus === "string" && legacyStatus.trim()) {
    status = /nepotvrzeno/iu.test(legacyStatus) ? "neoverena"
      : /^\s*plán(?:ovan[áéý]|\b)/iu.test(legacyStatus) ? "planovana" : "probehla";
  } else if (fields.stav === undefined && date(dateStart) && date(dateEnd)) {
    warn("Chybí stav ve starém formátu. Záznam má vyplněný začátek a konec.");
    status = "probehla";
  }
  const hash = createHash("sha256").update(entry.file.normalize("NFC")).digest("hex").slice(0, 16);
  return {
    ...fields,
    id: `tmp-${hash}`,
    stav: fields.stav ?? status,
    zverejnit: fields.zverejnit ?? ((fields.stav ?? status) === "probehla"),
    zacatek: dateStart,
    konec: dateEnd,
    rok: fields.presnost_terminu === undefined ? year : fields.rok,
    mesic: fields.presnost_terminu === undefined ? month : fields.mesic,
    presnost_terminu: fields.presnost_terminu ?? (
      dateStart !== null || dateEnd !== null ? "den" : month !== null ? "mesic" : year !== null ? "rok" : "neznamy"
    )
  };
}

function projectPlace(place: Place): Place {
  const { id, nazev, zeme, oblast, lat, lon, presnost } = place;
  return { id, nazev, zeme, oblast, lat, lon, presnost };
}

function makeTrip(
  source: SourceEntry, m: Metadata, catalog: Catalog, options: Options, warn: (message: string) => void
): { trip: Trip; places: Place[] } {
  const term = termFromMetadata(m);
  const country = (name: string): string => {
    const known = catalog.countriesByName.get(normalizeName(name));
    if (!known) throw new Error("Neznámý název státu.");
    if (!options.hasFlag(known.vlajka)) warn(`Stát ${known.iso} nemá soubor vlajky.`);
    return known.iso;
  };
  const zeme = country(m.zeme);
  const dalsiZeme = [...new Set((m.dalsi_zeme ?? []).map(country))].filter((iso) => iso !== zeme).sort();
  if (!m.mista?.length) warn("Chybí místa v YAML hlavičce.");
  const places = new Map<string, Place>();
  for (const name of m.mista ?? []) {
    const place = catalog.placesByName.get(normalizeName(name));
    if (!place) warn("Místo není v číselníku.");
    else if (!place.overeno) warn("Místo čeká na ověření.");
    else if (place.zeme !== zeme && !dalsiZeme.includes(place.zeme)) warn("Místo leží mimo uvedené státy cesty.");
    else places.set(place.id, projectPlace(place));
  }
  if (term.zacatek && term.konec && m.pocet_noci !== null) {
    const nights = (Date.parse(term.konec) - Date.parse(term.zacatek)) / 86_400_000;
    if (nights !== m.pocet_noci) warn(`Termín odpovídá ${nights} nocím, v metadatech je ${m.pocet_noci}.`);
  }
  if (term.presnostTerminu === "mesic") warn("V YAML chybí přesné dny pobytu.");
  const sport = m.strava_pocet_aktivit === undefined ? null : {
    aktivit: m.strava_pocet_aktivit,
    km: m.strava_celkem_km!,
    prevyseniM: m.strava_prevyseni_m!,
    zdroj: "strava-vyber-2023-2026" as const
  };
  if (sport) {
    const activityDates = [source.fields.strava_prvni_aktivita, source.fields.strava_posledni_aktivita].filter(date);
    if (term.zacatek && term.konec) {
      const start = term.zacatek;
      const end = term.konec;
      if (activityDates.some((day) => day < start || day > end)) warn("Datum aktivity je mimo termín pobytu.");
    } else if (term.rok !== null && term.mesic !== null) {
      const prefix = `${String(term.rok).padStart(4, "0")}-${String(term.mesic).padStart(2, "0")}`;
      if (activityDates.some((day) => !day.startsWith(prefix))) warn("Souhrn Stravy zahrnuje aktivitu v jiném měsíci.");
      else warn("Cesta má souhrn Stravy bez přesného termínu pobytu. Přiřazení je potřeba ověřit.");
    }
  }
  return {
    trip: {
      id: m.id, nazev: m.nazev, zeme, dalsiZeme, ...term, pocetNoci: m.pocet_noci,
      mista: [...places.keys()].sort(), zamereni: [...m.zamereni ?? []].sort(),
      popis: m.verejny_popis ?? null, sport
    },
    places: [...places.values()]
  };
}

export function buildExport(sources: SourceEntry[], catalog: Catalog, options: Options) {
  const errors: Message[] = [];
  const warnings: Message[] = [];
  const skipped: Message[] = [];
  const ids = new Set<string>();
  const rows: { file: string; trip: Trip }[] = [];
  const usedPlaces = new Map<string, Place>();
  const warn = (file: string, text: string) => warnings.push({ file, text });

  for (const source of sources) {
    const note = (text: string) => warn(source.file, text);
    try {
      const m = metadata(options.legacy ? fromLegacy(source, note) : source.fields, options.legacy);
      if (ids.has(m.id)) throw new Error("Duplicitní ID cesty.");
      ids.add(m.id);
      const { trip, places } = makeTrip(source, m, catalog, options, note);
      if (m.stav !== "probehla" || !m.zverejnit || !finished(trip, options.asOf)) {
        const text = m.stav !== "probehla" ? `stav ${m.stav}` : !m.zverejnit ? "nezveřejnit" : "termín ještě neskončil";
        skipped.push({ file: source.file, text });
        continue;
      }
      rows.push({ file: source.file, trip });
      for (const place of places) usedPlaces.set(place.id, place);
    } catch (error) {
      errors.push({ file: source.file, text: error instanceof Error ? error.message : "Neplatný záznam." });
    }
  }

  const dates = rows.flatMap(({ file, trip }) =>
    trip.zacatek && trip.konec ? [{ file, start: trip.zacatek, end: trip.konec }] : []);
  dates.sort((a, b) => compare(a.start, b.start) || compare(a.file, b.file));
  for (const [i, current] of dates.entries()) {
    for (let j = i + 1; j < dates.length; j += 1) {
      const next = dates[j]!;
      if (next.start > current.end) break;
      warn(current.file, `Termín se překrývá s cestou „${next.file}“.`);
    }
  }

  const envelope = { schemaVersion: 1, generated: true, dataAsOf: options.asOf } as const;
  const trips: TripsFile = {
    ...envelope,
    cesty: rows.map(({ trip }) => trip).sort((a, b) => compare(a.id, b.id))
  };
  const places: PlacesFile = { ...envelope, mista: [...usedPlaces.values()].sort((a, b) => compare(a.id, b.id)) };
  return { trips, places, errors, warnings, skipped };
}

export const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
