// Detail cesty: obsah sdílený samostatnou stránkou cesta.html a plovoucím oknem (tripDialog.ts).
// Jen to podstatné o cestě: stát, název, termín, popis, fakta, sport a mapa.
import { countryName, placeById, stats as s } from "./data";
import { flag, tripName } from "./dom";
import { cesty, esc, noci, num, presnost, termin } from "./format";
import { cropFor, hasMapShape, renderMap, toMapPlace, type MapPlace } from "./map";
import type { Trip } from "./model";
import { icon } from "./icons";
import { popisHtml } from "./text";
import { focusChips, yearsSpan } from "./ui";

const tripPlaces = (t: Trip): MapPlace[] => t.mista.flatMap((pid) => {
  const place = placeById.get(pid);
  return place ? [toMapPlace({ place, trips: [t] })] : [];
});

/** HTML detailu cesty. Mapu doplní drawTripMap po vložení do stránky. */
export function tripDetailHtml(t: Trip): string {
  const name = tripName(t);
  const c = s.countries.find((x) => x.code === t.zeme)!;
  const places = tripPlaces(t);
  const firstFor = s.firstTripOfCountry.get(t.id) ?? [];
  const states = [t.zeme, ...t.dalsiZeme];
  const precisionChip = t.presnostTerminu === "den" ? "" : ` <span class="chip">${presnost(t.presnostTerminu)}</span>`;
  const statesFact = states.map((code) => `${flag(code)}<a href="./?stat=${code}">${esc(countryName(code))}</a>`).join(", ");
  const placeFact = places.length
    ? `<span class="td-places">${places.map((p) => `<span class="chip">${esc(p.place.nazev)}${p.place.presnost === "oblast" ? " (oblast)" : ""}</span>`).join("")}</span>`
    : "—<small>místo zatím nemá ověřenou polohu</small>";

  return `<header class="td-head"><div><p class="kicker">${flag(t.zeme)}${esc(countryName(t.zeme))}` +
      `${firstFor.includes(t.zeme) ? " · první známá cesta do státu" : ""}</p>` +
      `<h1 id="td-title">${esc(name)}</h1><div class="td-when">${termin(t)}${precisionChip}${t.zamereni.length ? ` ${focusChips(t)}` : ""}</div></div>` +
      `<span class="td-flag">${flag(t.zeme)}</span></header>` +
    '<div class="td-body">' +
      (t.popis ? `<section class="panel td-popis"><h2 class="sec">O cestě</h2>${popisHtml(t.popis)}</section>` : "") +
      '<section class="panel"><dl class="td-facts">' +
        `<div><dt>${icon("termin")}Termín</dt><dd>${termin(t)}<small>${presnost(t.presnostTerminu)}</small></dd></div>` +
        `<div><dt>${icon("noc")}Nocí</dt><dd>${t.pocetNoci === null ? "neznámo" : t.pocetNoci}<small>${t.pocetNoci === null ? "délka pobytu není doložená" : noci(t.pocetNoci)}</small></dd></div>` +
        `<div><dt>${states.length > 1 ? "Státy" : "Stát"}</dt><dd>${statesFact}<small>${esc(countryName(t.zeme))}: ${cesty(c.count)} celkem · ${yearsSpan(c)}</small></dd></div>` +
        `<div><dt>${icon("misto")}Místa</dt><dd>${placeFact}</dd></div>` +
      "</dl></section>" +
      (states.some(hasMapShape)
        ? '<section class="panel"><div class="map td-map" data-trip-map></div><p class="legend">' +
          `<span><i style="background:var(--q3)"></i>${esc(countryName(t.zeme))}</span>` +
          (t.dalsiZeme.length ? '<span><i style="background:var(--q1)"></i>další stát pobytu</span>' : "") +
          (places.length ? '<span><i class="pin"></i>místa cesty</span>' : "") + "</p></section>"
        : "") +
      (t.sport
        ? '<section class="panel"><h2 class="sec">Sport na cestě</h2><p class="note">Zaznamenané aktivity Strava (výběr 2023–2026). Nejde o všechny pohyby během cesty.</p>' +
          `<div class="td-sport"><div><b>${t.sport.aktivit}</b><span>${icon("aktivita")}aktivit</span></div><div><b>${num(t.sport.km)}</b><span>${icon("trasa")}km</span></div>` +
          `<div><b>${num(t.sport.prevyseniM)}</b><span>${icon("hora")}m převýšení</span></div></div></section>`
        : "") +
    "</div>";
}

export const tripNotFoundHtml = () =>
  '<header class="td-head"><div><h1 id="td-title">Cesta nenalezena</h1>' +
  '<p class="td-when">Odkaz neodpovídá žádné zveřejněné cestě. Cestu najdete v <a class="link" href="kronika.html">Kronice</a>.</p></div></header>';

/** Vykreslí výřez mapy do detailu, který už je ve stránce (potřebuje znát šířku). */
export function drawTripMap(root: HTMLElement, t: Trip): void {
  const el = root.querySelector<HTMLElement>("[data-trip-map]");
  if (!el) return;
  const states = [t.zeme, ...t.dalsiZeme];
  const places = tripPlaces(t);
  // Výřez má poměr stran podle šířky okna a výšky 340 px (mobil 260 px). Mapa pak vyplní celou šířku
  // a popisky míst i body mají na obrazovce správnou velikost.
  const width = el.clientWidth || 600;
  const height = width < 600 ? 260 : 340;
  const crop = cropFor(states, places, width / height);
  const unitsPerPx = crop[2] / width;
  renderMap(el, {
    label: `Mapa: ${states.map(countryName).join(", ")}`,
    crop,
    fill: (code) => (code === t.zeme ? "--q3" : t.dalsiZeme.includes(code) ? "--q1" : null),
    countryLabel: (code) => countryName(code),
    countryTip: (code) => `${flag(code)} <b>${esc(countryName(code))}</b>`,
    places,
    labels: true,
    placeR: () => 5 * unitsPerPx,
    placeTip: (p) => `<b>${esc(p.place.nazev)}</b>${p.place.presnost === "oblast" ? " <i>(oblast)</i>" : ""}`
  });
}
