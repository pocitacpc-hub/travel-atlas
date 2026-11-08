// Sdílené textové a HTML fragmenty stránek.
import { flag, tripName, tripUrl } from "./dom";
import { esc, noci, plural, termin, zamereni, zN } from "./format";
import type { Trip } from "./model";
import type { CountryStat } from "./stats";

export const staty = (n: number) => `${n} ${plural(n, "stát", "státy", "států")}`;

export function yearsSpan(c: Pick<CountryStat, "first" | "last">): string {
  if (c.first === null || c.last === null) return "rok neznámý";
  return c.first === c.last ? String(c.first) : `${c.first}–${c.last}`;
}

export function nightsCoverage(c: Pick<CountryStat, "count" | "nights" | "nightsKnown">): string {
  if (!c.nightsKnown) return "noci neznámé";
  return noci(c.nights) + (c.nightsKnown < c.count ? ` (známo u ${c.nightsKnown} ${zN(c.count)})` : "");
}

/** Noci v tabulce a seznamu: neznámá délka je pomlčka, nikdy nula. */
export const nightsCell = (t: Trip) => (t.pocetNoci === null ? "—" : noci(t.pocetNoci));

export const focusChips = (t: Trip) => t.zamereni.map((f) => `<span class="chip">${zamereni(f)}</span>`).join(" ");

export function emptyArchive(main: HTMLElement): void {
  main.innerHTML = '<section class="page-head"><div><h1>Archiv je zatím prázdný</h1><p>Po exportu prvních cest se tu zobrazí přehled.</p></div></section>';
}

/** Řádek seznamu cest (karta státu, další cesty): název, noci, termín. */
export function tripListItem(t: Trip, note = ""): string {
  return `<li><a href="${tripUrl(t)}"><b>${esc(tripName(t))}</b><span class="n">${nightsCell(t)}</span>` +
    `<span>${note ? `${flag(t.zeme)}${note} · ` : ""}${termin(t)}</span></a></li>`;
}

