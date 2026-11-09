import { createHash, randomInt } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { parseDocument, isMap } from "yaml";
import { type Catalog, type Focus, date, isRecord, normalizeName, parseYaml } from "./atlas-data";
import { compare, normalizeLegacy } from "./trip-export";

const idPattern = /^t-[a-z0-9]{6}$/u;
const fields = ["id", "stav", "zverejnit", "presnost_terminu", "rok", "mesic", "pocet_noci", "mista", "zamereni", "dalsi_zeme", "zacatek", "konec", "verejny_popis"] as const;
const coarseTermKeys = ["rok", "mesic", "presnost_terminu", "pocet_noci"];
const focusTags: Focus[] = ["kolo", "turistika", "more", "hory", "mesto", "chata", "kemp", "akce"];
type Fields = Record<string, unknown>;

export const digest = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");

export interface Proposal {
  nazev: string;
  rok: number | null;
  potvrzeno: boolean;
  zmeny: Fields;
  /** Jen u veřejného popisu: dříve schválený text, který smí návrh nahradit. */
  nahrazuje?: string;
}

interface Header {
  opening: Buffer;
  yaml: string;
  closing: Buffer;
  body: Buffer;
  eol: "\n" | "\r\n";
}

export function splitHeader(bytes: Buffer): Header | null {
  const firstEnd = bytes.indexOf(10);
  const first = bytes.subarray(0, firstEnd < 0 ? bytes.length : firstEnd).toString("utf8");
  if (first.replace(/^\uFEFF/u, "").trimEnd() !== "---") return null;
  if (firstEnd < 0) throw new Error("YAML hlavičce chybí koncový oddělovač.");
  const start = firstEnd + 1;
  let offset = start;
  while (offset < bytes.length && offset - start <= 65_536) {
    const newline = bytes.indexOf(10, offset);
    const end = newline < 0 ? bytes.length : newline + 1;
    if (end - start > 65_540) break;
    if (bytes.subarray(offset, end).toString("utf8").trimEnd() === "---") {
      const yaml = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(start, offset));
      return {
        opening: bytes.subarray(0, start), yaml, closing: bytes.subarray(offset, end),
        body: bytes.subarray(end), eol: first.endsWith("\r") ? "\r\n" : "\n"
      };
    }
    offset = end;
  }
  throw new Error("YAML hlavička je příliš dlouhá nebo jí chybí koncový oddělovač.");
}

function rewriteHeader(header: Header, changes: Fields, original: Fields): Buffer {
  const doc = parseDocument(header.yaml, { prettyErrors: false });
  if (doc.errors.length || !isMap(doc.contents)) throw new Error("YAML hlavička není platná mapa.");
  for (const [key, value] of Object.entries(changes)) doc.set(key, value);
  const yaml = doc.toString({ lineWidth: 0 }).replace(/\n/gu, header.eol);
  if (!isDeepStrictEqual(parseYaml(yaml), { ...original, ...changes })) {
    throw new Error("Přepis YAML by změnil další metadata.");
  }
  return Buffer.concat([header.opening, Buffer.from(yaml), header.closing, header.body]);
}

function stringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim())
    && new Set(value).size === value.length;
}

const isCoarseTerm = (zmeny: Fields) => Object.hasOwn(zmeny, "presnost_terminu");
const category = ({ zmeny }: Proposal) =>
  Object.hasOwn(zmeny, "zacatek") || isCoarseTerm(zmeny) ? "termin" : Object.keys(zmeny)[0]!;
/** Veřejný popis: neprázdný text do 1500 znaků, bez HTML (formátování jen **tučně**, *kurzíva*, odrážky). */
const validPublicText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 1500 && !/[<>]/u.test(value);
const year = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 9999;

// Termín bez přesných dnů: rok a měsíc (přesnost mesic), nebo jen rok (přesnost rok), volitelně počet nocí.
function validCoarseTerm(zmeny: Fields): boolean {
  const keys = Object.keys(zmeny);
  if (!isCoarseTerm(zmeny) || !keys.every((key) => coarseTermKeys.includes(key)) || !year(zmeny.rok)) return false;
  const nights = zmeny.pocet_noci;
  if (nights !== undefined && !(typeof nights === "number" && Number.isInteger(nights) && nights >= 0)) return false;
  const month = zmeny.mesic;
  if (zmeny.presnost_terminu === "mesic") return typeof month === "number" && Number.isInteger(month) && month >= 1 && month <= 12;
  return zmeny.presnost_terminu === "rok" && (month === undefined || month === null);
}
const tripKey = (name: unknown, year: unknown) => JSON.stringify([name, year ?? null]);

export function readProposals(value: unknown, catalog: Catalog): Proposal[] {
  if (!Array.isArray(value)) throw new Error("Soubor návrhů musí obsahovat seznam.");
  const keys = new Set<string>();
  return value.map((row: unknown, index) => {
    const invalid = () => new Error(`Neplatný nebo duplicitní návrh č. ${index + 1}.`);
    const replaces = isRecord(row) && Object.hasOwn(row, "nahrazuje");
    if (!isRecord(row) || Object.keys(row).length !== (replaces ? 5 : 4) || typeof row.nazev !== "string" || !row.nazev.trim()
      || !(row.rok === null || (typeof row.rok === "number" && Number.isInteger(row.rok) && row.rok >= 1 && row.rok <= 9999))
      || typeof row.potvrzeno !== "boolean" || !isRecord(row.zmeny)) throw invalid();
    const { zmeny } = row;
    const keysOfChanges = Object.keys(zmeny);
    const kind = keysOfChanges[0] ?? "";
    const values = zmeny[kind];
    const validDates = keysOfChanges.length === 2 && date(zmeny.zacatek) && date(zmeny.konec)
      && zmeny.zacatek <= zmeny.konec && Number(zmeny.zacatek.slice(0, 4)) === row.rok;
    const validList = keysOfChanges.length === 1 && stringList(values) && (
      (kind === "mista" && values.every((name) => catalog.placesByName.has(normalizeName(name))))
      || (kind === "dalsi_zeme" && values.every((name) => catalog.countriesByName.has(normalizeName(name))))
      || (kind === "zamereni" && values.every((tag) => focusTags.includes(tag as Focus)))
    );
    const validPopis = keysOfChanges.length === 1 && kind === "verejny_popis" && validPublicText(values);
    if (!validDates && !validList && !validCoarseTerm(zmeny) && !validPopis) throw invalid();
    if (replaces && (!validPopis || !validPublicText(row.nahrazuje) || row.nahrazuje === values)) throw invalid();
    const proposal: Proposal = { nazev: row.nazev, rok: row.rok, potvrzeno: row.potvrzeno, zmeny };
    if (replaces) proposal.nahrazuje = row.nahrazuje as string;
    const key = `${tripKey(row.nazev, row.rok)}:${category(proposal)}`;
    if (keys.has(key)) throw invalid();
    keys.add(key);
    return proposal;
  });
}

interface SourceTrip {
  file: string;
  hash: string;
  original: Fields;
  header: Header;
}
export interface PlanEntry {
  file: string;
  hash: string;
  id: string;
  before: Fields;
  changes: Fields;
}
export interface SavedPlan {
  source: string;
  proposalsHash: string;
  entries: PlanEntry[];
}

export function readSourceTrips(source: string): SourceTrip[] {
  const trips: SourceTrip[] = [];
  const entries = readdirSync(source, { withFileTypes: true }).sort((a, b) => compare(a.name, b.name));
  for (const entry of entries) {
    if (!/\.md$/iu.test(entry.name)) continue;
    const path = join(source, entry.name);
    try {
      if (!lstatSync(path).isFile()) throw new Error("Zdrojový Markdown musí být běžný soubor.");
      const bytes = readFileSync(path);
      const header = splitHeader(bytes);
      if (!header) continue;
      const original = parseYaml(header.yaml);
      if (isRecord(original) && original.typ === "cesta") {
        trips.push({ file: entry.name, hash: digest(bytes), original, header });
      }
    } catch (error) {
      throw new Error(`${entry.name}: ${error instanceof Error ? error.message : "Čtení selhalo."}`);
    }
  }
  if (!trips.length) throw new Error("Zdroj neobsahuje žádný záznam typu cesta.");
  return trips;
}

function initialFields(original: Fields, warn: (message: string) => void): Fields {
  // Po migraci mají nové hodnoty přednost před starými pomocnými poli.
  const hasNewTerm = original.presnost_terminu !== undefined;
  const normalized = hasNewTerm && original.stav !== undefined && original.zverejnit !== undefined
    ? original : normalizeLegacy(original, warn);
  const start = normalized.zacatek;
  return {
    stav: Object.hasOwn(original, "stav") ? original.stav : normalized.stav,
    zverejnit: Object.hasOwn(original, "zverejnit") ? original.zverejnit : normalized.zverejnit,
    presnost_terminu: Object.hasOwn(original, "presnost_terminu") ? original.presnost_terminu : normalized.presnost_terminu,
    rok: normalized.rok === undefined && date(start) ? Number(start.slice(0, 4)) : normalized.rok ?? null,
    mesic: normalized.mesic === undefined && date(start) ? Number(start.slice(5, 7)) : normalized.mesic ?? null,
    zacatek: normalized.zacatek ?? null, konec: normalized.konec ?? null,
    mista: original.mista === undefined ? [] : original.mista,
    zamereni: original.zamereni === undefined ? [] : original.zamereni
  };
}

function applyProposal(next: Fields, proposal: Proposal): void {
  const kind = category(proposal);
  if (kind === "termin" && isCoarseTerm(proposal.zmeny)) {
    const { rok, mesic = null, presnost_terminu, pocet_noci } = proposal.zmeny;
    if (next.zacatek !== null || next.konec !== null) throw new Error("Návrh termínu bez dnů nesmí přepsat přesné dny.");
    if ((next.rok !== null && next.rok !== rok) || (next.mesic !== null && next.mesic !== mesic)) {
      throw new Error("Návrh termínu se liší od již vyplněného roku nebo měsíce.");
    }
    if (pocet_noci !== undefined && next.pocet_noci !== null && next.pocet_noci !== undefined && next.pocet_noci !== pocet_noci) {
      throw new Error("Návrh počtu nocí se liší od již vyplněného.");
    }
    Object.assign(next, { rok, mesic, presnost_terminu });
    if (pocet_noci !== undefined) next.pocet_noci = pocet_noci;
  } else if (kind === "verejny_popis") {
    const text = proposal.zmeny.verejny_popis;
    if (!validPublicText(text)) throw new Error("Návrh popisu není platný text.");
    const current = next.verejny_popis;
    // Jiný existující popis lze nahradit jen návrhem, který přesně uvádí nahrazovaný text.
    if (current !== undefined && current !== null && current !== text && current !== proposal.nahrazuje) {
      throw new Error("Návrh popisu se liší od již vyplněného popisu.");
    }
    next.verejny_popis = text;
  } else if (kind === "termin") {
    const { zacatek, konec } = proposal.zmeny;
    if (!date(zacatek) || !date(konec)) throw new Error("Návrh termínu musí obsahovat platná data.");
    if ((next.zacatek !== null && next.zacatek !== zacatek) || (next.konec !== null && next.konec !== konec)) {
      throw new Error("Návrh termínu se liší od již vyplněného termínu.");
    }
    Object.assign(next, {
      zacatek, konec, presnost_terminu: "den", rok: Number(zacatek.slice(0, 4)), mesic: Number(zacatek.slice(5, 7))
    });
  } else {
    const current = next[kind] ?? [];
    const proposed = proposal.zmeny[kind];
    if (!Array.isArray(current) || !stringList(proposed)) throw new Error("Návrh očekává seznam.");
    next[kind] = [...new Set([...current, ...proposed])];
  }
}

export function prepareMigration(source: string, proposals: Proposal[], prior?: SavedPlan) {
  const trips = readSourceTrips(source);
  const used = new Set<string>();
  for (const { original, file } of trips) {
    if (!Object.hasOwn(original, "id")) continue;
    const { id } = original;
    if (typeof id !== "string" || !idPattern.test(id)) throw new Error(`Neplatné existující ID v ${file}.`);
    if (used.has(id)) throw new Error(`Duplicitní existující ID v ${file}.`);
    used.add(id);
  }
  const previous = new Map((prior?.source === source ? prior.entries : []).map((entry) => [entry.file, entry]));
  const warnings: { file: string; text: string }[] = [];
  const byTrip = new Map<string, typeof trips>();
  const bases = trips.map((trip) => {
    const next = initialFields(trip.original, (text) => warnings.push({ file: trip.file, text }));
    const key = tripKey(trip.original.nazev, next.rok);
    const matches = byTrip.get(key) ?? [];
    matches.push(trip);
    byTrip.set(key, matches);
    return next;
  });
  const approved = new Map<string, Proposal[]>();
  for (const proposal of proposals) {
    const matches = byTrip.get(tripKey(proposal.nazev, proposal.rok)) ?? [];
    if (matches.length !== 1) {
      if (proposal.potvrzeno) throw new Error(`Schválený návrh pro „${proposal.nazev}“ nemá jediný odpovídající záznam.`);
      warnings.push({ file: "", text: `Návrh pro „${proposal.nazev}“ nemá jediný odpovídající záznam.` });
      continue;
    }
    if (proposal.potvrzeno) {
      const key = matches[0]!.file;
      const existing = approved.get(key) ?? [];
      existing.push(proposal);
      approved.set(key, existing);
    }
  }
  const entries: PlanEntry[] = [];
  const records: { file: string; fields: Fields }[] = [];
  const updates = new Map<string, Buffer>();
  for (const [i, trip] of trips.entries()) {
    const { file, hash, original, header } = trip;
    let id = original.id as string | undefined;
    if (id === undefined) {
      const old = previous.get(file);
      if (old?.hash === hash && idPattern.test(old.id) && !used.has(old.id)) id = old.id;
      while (!id || used.has(id)) id = `t-${randomInt(36 ** 6).toString(36).padStart(6, "0")}`;
      used.add(id);
    }
    const next: Fields = { ...original, ...bases[i]!, id };
    for (const proposal of approved.get(file) ?? []) applyProposal(next, proposal);
    const changes = Object.fromEntries(fields
      .filter((key) => Object.hasOwn(next, key) && !isDeepStrictEqual(next[key], original[key]))
      .map((key) => [key, next[key]]));
    const before = Object.fromEntries(Object.keys(changes).filter((key) => Object.hasOwn(original, key))
      .map((key) => [key, original[key]]));
    if (Object.keys(changes).length) updates.set(file, rewriteHeader(header, changes, original));
    entries.push({ file, hash, id, before, changes });
    records.push({ file, fields: next });
  }
  const plan: SavedPlan = { source, proposalsHash: digest(JSON.stringify(proposals)), entries };
  return { plan, records, updates, warnings };
}
