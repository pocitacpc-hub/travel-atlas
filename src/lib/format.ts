// Formátování čísel, termínů a tvarů slov podle docs/design/system.md, kap. 8.
import type { Focus, Precision, Trip } from "./model";

/** Pevná mezera mezi číslem a slovem, aby se údaj nezalomil. */
export const NB = " ";

export const MONTHS = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
export const MONTHS_SHORT = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];

export function plural(n: number, one: string, few: string, many: string): string {
  if (!Number.isInteger(n)) return few;
  const x = Math.abs(n);
  return x === 1 ? one : x >= 2 && x <= 4 ? few : many;
}

export function num(n: number, digits = 0): string {
  return n.toLocaleString("cs-CZ", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Předložka před číslem: „ze 7“, „ze 17“, „ze 70“–„ze 79“, „ze 100“–„ze 199“, „ze 700“–„ze 799“, jinak „z“. */
export function zN(n: number): string {
  const x = Math.abs(Math.trunc(n));
  const ze = x === 7 || x === 17 || (x >= 70 && x <= 79) || (x >= 100 && x <= 199) || (x >= 700 && x <= 799);
  return `${ze ? "ze" : "z"}${NB}${n}`;
}

export const cesty = (n: number) => `${n}${NB}${plural(n, "cesta", "cesty", "cest")}`;
export const noci = (n: number | null) => (n === null ? "nocí neznámo" : `${num(n)}${NB}${plural(n, "noc", "noci", "nocí")}`);
export const pct = (part: number, total: number) => `${Math.round((part / total) * 100)}${NB}%`;

export function esc(value: unknown): string {
  return String(value).replace(/[&<>"']/gu, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** „2026-11-08“ → „8. 11. 2026“ */
export function dateCz(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${NB}${m}.${NB}${y}`;
}

type Term = Pick<Trip, "zacatek" | "konec" | "rok" | "mesic" | "presnostTerminu">;

export function termin(t: Term): string {
  if (t.presnostTerminu === "den" && t.zacatek && t.konec) {
    const [y1, m1, d1] = t.zacatek.split("-").map(Number);
    const [y2, m2, d2] = t.konec.split("-").map(Number);
    if (y1 === y2 && m1 === m2) return d1 === d2 ? `${d1}.${NB}${m1}.${NB}${y1}` : `${d1}.–${d2}.${NB}${m1}.${NB}${y1}`;
    if (y1 === y2) return `${d1}.${NB}${m1}. – ${d2}.${NB}${m2}.${NB}${y1}`;
    return `${d1}.${NB}${m1}.${NB}${y1} – ${d2}.${NB}${m2}.${NB}${y2}`;
  }
  if (t.presnostTerminu === "mesic" && t.rok !== null && t.mesic !== null) return `${MONTHS[t.mesic - 1]}${NB}${t.rok}`;
  if (t.presnostTerminu === "rok" && t.rok !== null) return String(t.rok);
  return "rok neznámý";
}

const PRECISION: Record<Precision, string> = { den: "přesný termín", mesic: "známý měsíc", rok: "jen rok", neznamy: "bez data" };
export const presnost = (p: Precision) => PRECISION[p];

const FOCUS: Record<Focus, string> = {
  kolo: "kolo", turistika: "turistika", more: "moře", hory: "hory", mesto: "město", chata: "chata", kemp: "kemp", akce: "akce"
};
export const zamereni = (f: Focus) => FOCUS[f];

/** „Itálie – Řím“ → „Řím“, jen když předpona je název hlavního státu. „Pasohlávky – Apalucha“ zůstane. */
export function shortName(nazev: string, countryName: string): string {
  const prefix = `${countryName} – `;
  return nazev.startsWith(prefix) && nazev.length > prefix.length ? nazev.slice(prefix.length) : nazev;
}

/** Text pro hledání bez ohledu na velikost písmen a diakritiku. */
export function searchable(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("cs-CZ").trim();
}
