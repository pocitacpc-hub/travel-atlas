// Statistiky archivu. Čisté funkce bez DOM, vše se počítá z jednotlivých cest.
// Neznámé hodnoty se nepočítají jako nula, součty nesou pokrytí (kolik cest údaj má).
import type { Place, Trip } from "./model";

export const HOME = "CZ";

export interface CountryStat {
  code: string;
  name: string;
  /** Cesty s tímto hlavním státem (rozhodnutí 0002). */
  trips: Trip[];
  count: number;
  /** Cesty, kde je stát uvedený jako další stát pobytu. */
  also: Trip[];
  nights: number;
  nightsKnown: number;
  /** Rok první a poslední datované cesty (hlavní i další stát). */
  first: number | null;
  last: number | null;
}

export interface YearStat {
  year: number;
  total: number;
  cz: number;
  abroad: number;
  nights: number;
  nightsKnown: number;
  trips: Trip[];
}

export interface Bucket { label: string; count: number }

export interface Stats {
  total: number;
  cz: number;
  abroad: number;
  nightsSum: number;
  nightsKnown: number;
  nightsUnknown: number;
  undated: number;
  undatedTrips: Trip[];
  dayKnown: number;
  monthsKnown: number;
  /** Počet cest podle měsíce začátku (jen cesty se známým měsícem). */
  months: number[];
  countries: CountryStat[];
  /** Navštívené státy: hlavní i další státy pobytu. */
  countryCount: number;
  abroadCountryCount: number;
  minYear: number | null;
  maxYear: number | null;
  /** Roky od prvního do posledního datovaného, včetně let bez cesty. */
  years: YearStat[];
  median: number | null;
  mean: number | null;
  buckets: Bucket[];
  longest: { noci: number; trips: Trip[] } | null;
  busiest: { count: number; years: number[] } | null;
  busiestAbroad: { count: number; years: number[] } | null;
  /** Datované cesty od nejnovější. */
  recent: Trip[];
  currentYear: number;
  thisYear: number;
  sport: { trips: number; aktivit: number; km: number; prevyseniM: number };
  /** ID cesty → státy, do kterých je to první známá datovaná cesta. */
  firstTripOfCountry: Map<string, string[]>;
}

export function sortKey(t: Trip): string {
  if (t.zacatek) return t.zacatek;
  if (t.rok !== null) return `${String(t.rok).padStart(4, "0")}-${String(t.mesic ?? 0).padStart(2, "0")}-00`;
  return "0000";
}

const tieBreak = (a: Trip, b: Trip) => a.nazev.localeCompare(b.nazev, "cs") || a.id.localeCompare(b.id);
export const byDateAsc = (a: Trip, b: Trip) => sortKey(a).localeCompare(sortKey(b)) || tieBreak(a, b);
export const byDateDesc = (a: Trip, b: Trip) => sortKey(b).localeCompare(sortKey(a)) || tieBreak(a, b);

const isHome = (t: Trip) => t.zeme === HOME;

export function computeStats(trips: readonly Trip[], countryName: (code: string) => string, asOf: string): Stats {
  const byCountry = new Map<string, CountryStat>();
  const country = (code: string) => {
    let c = byCountry.get(code);
    if (!c) {
      c = { code, name: countryName(code), trips: [], count: 0, also: [], nights: 0, nightsKnown: 0, first: null, last: null };
      byCountry.set(code, c);
    }
    return c;
  };
  const byYear = new Map<number, YearStat>();
  const months = Array.from({ length: 12 }, () => 0);
  const nights: number[] = [];
  let cz = 0;
  let monthsKnown = 0;
  let dayKnown = 0;

  for (const t of trips) {
    if (isHome(t)) cz++;
    if (t.pocetNoci !== null) nights.push(t.pocetNoci);
    if (t.presnostTerminu === "den") dayKnown++;
    if (t.rok !== null && t.mesic !== null) {
      months[t.mesic - 1]!++;
      monthsKnown++;
    }
    const main = country(t.zeme);
    main.trips.push(t);
    main.count++;
    if (t.pocetNoci !== null) {
      main.nights += t.pocetNoci;
      main.nightsKnown++;
    }
    for (const code of t.dalsiZeme) country(code).also.push(t);
    if (t.rok !== null) {
      for (const code of [t.zeme, ...t.dalsiZeme]) {
        const c = country(code);
        c.first = c.first === null ? t.rok : Math.min(c.first, t.rok);
        c.last = c.last === null ? t.rok : Math.max(c.last, t.rok);
      }
      let y = byYear.get(t.rok);
      if (!y) {
        y = { year: t.rok, total: 0, cz: 0, abroad: 0, nights: 0, nightsKnown: 0, trips: [] };
        byYear.set(t.rok, y);
      }
      y.total++;
      y.trips.push(t);
      if (isHome(t)) y.cz++;
      else y.abroad++;
      if (t.pocetNoci !== null) {
        y.nights += t.pocetNoci;
        y.nightsKnown++;
      }
    }
  }

  const countries = [...byCountry.values()].sort((a, b) =>
    b.count - a.count || b.nights - a.nights || a.name.localeCompare(b.name, "cs"));
  for (const c of countries) {
    c.trips.sort(byDateDesc);
    c.also.sort(byDateDesc);
  }

  const dated = [...byYear.keys()];
  const minYear = dated.length ? Math.min(...dated) : null;
  const maxYear = dated.length ? Math.max(...dated) : null;
  const years: YearStat[] = [];
  if (minYear !== null && maxYear !== null) {
    for (let year = minYear; year <= maxYear; year++) {
      const row = byYear.get(year) ?? { year, total: 0, cz: 0, abroad: 0, nights: 0, nightsKnown: 0, trips: [] };
      row.trips.sort(byDateAsc);
      years.push(row);
    }
  }

  nights.sort((a, b) => a - b);
  const n = nights.length;
  const nightsSum = nights.reduce((a, b) => a + b, 0);
  const median = n ? (n % 2 ? nights[(n - 1) / 2]! : (nights[n / 2 - 1]! + nights[n / 2]!) / 2) : null;
  const ranges: [string, number, number][] = [["0", 0, 0], ["1", 1, 1], ["2", 2, 2], ["3–4", 3, 4], ["5–7", 5, 7], ["8–10", 8, 10], ["11+", 11, Infinity]];
  const buckets = ranges
    .map(([label, lo, hi]) => ({ label, count: nights.filter((v) => v >= lo && v <= hi).length }))
    // Sloupec „0“ (prokazatelně bez noclehu) jen tehdy, když taková cesta existuje.
    .filter((b) => b.label !== "0" || b.count > 0);

  const maxNights = n ? nights[n - 1]! : null;
  const peak = (value: (y: YearStat) => number) => {
    if (!years.length) return null;
    const count = Math.max(...years.map(value));
    return count > 0 ? { count, years: years.filter((y) => value(y) === count).map((y) => y.year) } : null;
  };

  const firstTripOfCountry = new Map<string, string[]>();
  for (const c of countries) {
    const first = [...c.trips, ...c.also].filter((t) => t.rok !== null).sort(byDateAsc)[0];
    if (first) firstTripOfCountry.set(first.id, [...(firstTripOfCountry.get(first.id) ?? []), c.code]);
  }

  const withSport = trips.filter((t) => t.sport);
  const currentYear = Number(asOf.slice(0, 4));
  const visited = countries.filter((c) => c.count > 0 || c.also.length > 0);

  return {
    total: trips.length,
    cz,
    abroad: trips.length - cz,
    nightsSum,
    nightsKnown: n,
    nightsUnknown: trips.length - n,
    undated: trips.filter((t) => t.rok === null).length,
    undatedTrips: trips.filter((t) => t.rok === null).sort(tieBreak),
    dayKnown,
    monthsKnown,
    months,
    countries,
    countryCount: visited.length,
    abroadCountryCount: visited.filter((c) => c.code !== HOME).length,
    minYear,
    maxYear,
    years,
    median,
    mean: n ? nightsSum / n : null,
    buckets,
    longest: maxNights === null ? null : { noci: maxNights, trips: trips.filter((t) => t.pocetNoci === maxNights).sort(byDateDesc) },
    busiest: peak((y) => y.total),
    busiestAbroad: peak((y) => y.abroad),
    recent: trips.filter((t) => t.rok !== null).sort(byDateDesc),
    currentYear,
    thisYear: trips.filter((t) => t.rok === currentYear).length,
    sport: {
      trips: withSport.length,
      aktivit: withSport.reduce((a, t) => a + t.sport!.aktivit, 0),
      km: withSport.reduce((a, t) => a + t.sport!.km, 0),
      prevyseniM: withSport.reduce((a, t) => a + t.sport!.prevyseniM, 0)
    },
    firstTripOfCountry
  };
}

/** Nejdelší nepřerušená řada let, ve kterých je aspoň jedna datovaná cesta. */
export function longestRun(years: readonly YearStat[]): { len: number; from: number; to: number } | null {
  let run = 0;
  let best: { len: number; from: number; to: number } | null = null;
  for (const y of years) {
    run = y.total ? run + 1 : 0;
    if (run && (!best || run > best.len)) best = { len: run, from: y.year - run + 1, to: y.year };
  }
  return best;
}

export interface PlaceVisit {
  place: Place;
  trips: Trip[];
}

/** Ověřená místa s cestami, které na ně odkazují. Seřazeno od nejčastěji navštíveného. */
export function placeVisits(trips: readonly Trip[], places: readonly Place[]): PlaceVisit[] {
  return places
    .map((place) => ({ place, trips: trips.filter((t) => t.mista.includes(place.id)).sort(byDateDesc) }))
    .filter((v) => v.trips.length > 0)
    .sort((a, b) => b.trips.length - a.trips.length || a.place.nazev.localeCompare(b.place.nazev, "cs"));
}
