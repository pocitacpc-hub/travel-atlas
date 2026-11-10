// Detail cesty: cesta.html?id=t-xxxxxx (stabilní ID ze zdroje).
import "../generated/vlajky.css";
import "../styles/cesta.css";
import { countryName, placeById, stats as s, tripById } from "../lib/data";
import { $, flag, param, tripName, tripUrl } from "../lib/dom";
import { cesty, esc, noci, num, presnost, termin } from "../lib/format";
import { cropFor, hasMapShape, renderMap, toMapPlace } from "../lib/map";
import type { Trip } from "../lib/model";
import { popisHtml } from "../lib/text";
import { focusChips, tripListItem, yearsSpan } from "../lib/ui";


const id = param("id");
const t = id ? tripById.get(id) : undefined;

if (!t) {
  document.title = "Cesta nenalezena · Cestovní atlas";
  $("crumbs").innerHTML = '<a href="kronika.html">Kronika</a> › cesta nenalezena';
  $("trip").innerHTML = '<section class="head"><div><h1>Cesta nenalezena</h1>' +
    '<p class="when">Odkaz neodpovídá žádné zveřejněné cestě. Cestu najdete v <a class="link" href="kronika.html">Kronice</a>.</p></div></section>';
} else {
  renderTrip(t);
}

function renderTrip(t: Trip): void {
  const name = tripName(t);
  document.title = `${name} · Cestovní atlas`;
  const c = s.countries.find((x) => x.code === t.zeme)!;
  // Datované cesty se procházejí chronologicky, cesty bez roku jen mezi sebou.
  const order = t.rok === null ? s.undatedTrips : s.recent.slice().reverse();
  const i = order.indexOf(t);
  const prev = order[i - 1];
  const next = order[i + 1];
  const places = t.mista.flatMap((pid) => {
    const place = placeById.get(pid);
    return place ? [toMapPlace({ place, trips: [t] })] : [];
  });
  const firstFor = s.firstTripOfCountry.get(t.id) ?? [];
  const states = [t.zeme, ...t.dalsiZeme];

  $("crumbs").innerHTML = `<a href="kronika.html">Kronika</a> › ` +
    (t.rok !== null ? `<a href="kronika.html#y${t.rok}">${t.rok}</a>` : '<a href="kronika.html#yunk">rok neznámý</a>') + ` › ${esc(name)}`;

  const precisionChip = t.presnostTerminu === "den" ? "" : ` <span class="chip">${presnost(t.presnostTerminu)}</span>`;
  const statesFact = states.map((code) => `${flag(code)}<a href="./?stat=${code}">${esc(countryName(code))}</a>`).join(", ");
  const others = c.trips.filter((x) => x !== t);
  const placeFact = places.length
    ? `<span class="places">${places.map((p) => `<span class="chip">${esc(p.place.nazev)}${p.place.presnost === "oblast" ? " (oblast)" : ""}</span>`).join("")}</span>`
    : "—<small>místo zatím nemá ověřenou polohu</small>";

  const html =
    `<section class="head"><div><p class="kicker">${flag(t.zeme)}${esc(countryName(t.zeme))}` +
    `${firstFor.includes(t.zeme) ? " · první známá cesta do státu" : ""}</p>` +
    `<h1>${esc(name)}</h1><div class="when">${termin(t)}${precisionChip}${t.zamereni.length ? ` ${focusChips(t)}` : ""}</div></div>` +
    `<div class="stamp" aria-hidden="true"><div><b>${esc(t.zeme)}</b><small>${t.rok ?? "????"}</small></div></div></section>` +
    '<div class="layout"><div class="stack">' +
      (t.popis ? `<section class="panel popis"><h2 class="sec">O cestě</h2>${popisHtml(t.popis)}</section>` : "") +
      '<section class="panel"><dl class="facts">' +
        `<div><dt>Termín</dt><dd>${termin(t)}<small>${presnost(t.presnostTerminu)}</small></dd></div>` +
        `<div><dt>Nocí</dt><dd>${t.pocetNoci === null ? "neznámo" : t.pocetNoci}<small>${t.pocetNoci === null ? "délka pobytu není doložená" : noci(t.pocetNoci)}</small></dd></div>` +
        `<div><dt>${states.length > 1 ? "Státy" : "Stát"}</dt><dd>${statesFact}<small>${esc(countryName(t.zeme))}: ${cesty(c.count)} celkem · ${yearsSpan(c)}</small></dd></div>` +
        `<div><dt>Místa</dt><dd>${placeFact}</dd></div>` +
      "</dl></section>" +
      (t.sport
        ? '<section class="panel"><h2 class="sec">Sport na cestě</h2><p class="note">Zaznamenané aktivity Strava (výběr 2023–2026). Nejde o všechny pohyby během cesty.</p>' +
          `<div class="sport"><div><b>${t.sport.aktivit}</b><span>aktivit</span></div><div><b>${num(t.sport.km)}</b><span>km</span></div>` +
          `<div><b>${num(t.sport.prevyseniM)}</b><span>m převýšení</span></div></div></section>`
        : "") +
    '</div><div class="stack">' +
      (states.some(hasMapShape)
        ? '<section class="panel"><div class="map" id="mini"></div><p class="legend">' +
          `<span><i style="background:var(--q3)"></i>${esc(countryName(t.zeme))}</span>` +
          (t.dalsiZeme.length ? `<span><i style="background:var(--q1)"></i>další stát pobytu</span>` : "") +
          (places.length ? '<span><i class="pin"></i>místa cesty</span>' : "") + "</p></section>"
        : "") +
      `<section class="panel"><h2 class="sec">${flag(t.zeme)}Další cesty – ${esc(countryName(t.zeme))}</h2>` +
        (others.length ? `<ul class="list">${others.slice(0, 8).map((x) => tripListItem(x)).join("")}</ul>` : "") +
        (c.count === 1 ? '<p class="note">Do tohoto státu je v archivu zatím jen tato cesta.</p>' : "") +
        (others.length > 8 ? `<p class="note"><a class="link" href="kronika.html?stat=${t.zeme}">Všech ${c.count} v kronice →</a></p>` : "") +
      "</section>" +
    "</div></div>" +
    '<nav class="pager" aria-label="Sousední cesty">' +
      (prev ? `<a class="panel" href="${tripUrl(prev)}"><small>← Předchozí</small><b>${esc(tripName(prev))}</b></a>` : "<span></span>") +
      (next ? `<a class="panel next" href="${tripUrl(next)}"><small>Další →</small><b>${esc(tripName(next))}</b></a>` : "<span></span>") +
    "</nav>";
  $("trip").innerHTML = html;

  const mini = document.getElementById("mini");
  if (mini) {
    renderMap(mini, {
      label: `Mapa: ${states.map(countryName).join(", ")}`,
      crop: cropFor(states, places),
      fill: (code) => (code === t.zeme ? "--q3" : t.dalsiZeme.includes(code) ? "--q1" : null),
      countryLabel: (code) => countryName(code),
      countryTip: (code) => `${flag(code)} <b>${esc(countryName(code))}</b>`,
      places,
      placeR: () => 3.5,
      placeTip: (p) => `<b>${esc(p.place.nazev)}</b>${p.place.presnost === "oblast" ? " <i>(oblast)</i>" : ""}`
    });
  }
}
