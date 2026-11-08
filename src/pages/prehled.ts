// Přehled: mapa států, řada vlajek, fakta, karta vybraného státu, poslední cesty, graf po letech a Návraty.
import "../generated/vlajky.css";
import "../styles/prehled.css";
import { yearsChart } from "../lib/charts";
import { dataAsOf, stats as s, visits } from "../lib/data";
import { $, flag, param, shell, tripName, tripUrl } from "../lib/dom";
import { cesty, dateCz, esc, noci, num, pct, plural, termin, zN } from "../lib/format";
import { renderMap, toMapPlace, type MapPlace } from "../lib/map";
import type { CountryStat } from "../lib/stats";
import { emptyArchive, focusChips, nightsCoverage, tripListItem, yearsSpan } from "../lib/ui";

shell();

if (!s.total) {
  emptyArchive($("main"));
} else {
  const byCode = new Map(s.countries.map((c) => [c.code, c]));
  const visited = s.countries.filter((c) => c.count > 0 || c.also.length > 0);
  // Choropleth: 1 / 2–5 / 6–10 / 11–20 / 21+ cest (docs/design/system.md, kap. 2.2).
  const Q: [number, string, string][] = [[21, "21+", "--q5"], [11, "11–20", "--q4"], [6, "6–10", "--q3"], [2, "2–5", "--q2"], [1, "1", "--q1"]];
  const qvar = (n: number) => (Q.find(([min]) => n >= min) ?? Q[Q.length - 1]!)[2];
  const places: MapPlace[] = visits.map(toMapPlace);
  const requested = param("stat");
  let selected: string = requested && byCode.has(requested)
    ? requested
    : (visited.find((c) => c.code !== "CZ") ?? visited[0]!).code;
  let layer: "countries" | "places" = "countries";

  const countryTip = (c: CountryStat) =>
    `${flag(c.code)} <b>${esc(c.name)}</b><br>${cesty(c.count)} · ${c.first !== null ? `poprvé ${c.first}` : "rok první cesty neznámý"}<br>` +
    (c.nightsKnown ? `${noci(c.nights)} (známo u ${c.nightsKnown} ${zN(c.count)})` : "noci neznámé") +
    (c.also.length ? `<br>další stát na ${cesty(c.also.length)}` : "");

  $("span").textContent = s.minYear !== null ? `${s.minYear}–${s.maxYear}` : "";
  $("headline").innerHTML = `<em>${s.countryCount}</em> ${plural(s.countryCount, "stát", "státy", "států")},<br>${cesty(s.total)}`;
  const abroadStates = `${s.abroadCountryCount} ${plural(s.abroadCountryCount, "zahraniční stát", "zahraniční státy", "zahraničních států")}`;
  $("facts").innerHTML = [
    ["Do zahraničí", cesty(s.abroad), abroadStates],
    ["Po Česku", cesty(s.cz), `${pct(s.cz, s.total)} všech cest`],
    ["Nocí celkem", num(s.nightsSum), `známo u ${s.nightsKnown} ${zN(s.total)} cest`],
    [`Rok ${s.currentYear}`, cesty(s.thisYear), `data k ${dateCz(dataAsOf)}`]
  ].map(([dt, dd, small]) => `<div><dt>${dt}</dt><dd>${dd}<small>${small}</small></dd></div>`).join("");

  const select = (code: string) => {
    selected = code;
    drawMap();
    drawCountry();
    drawFlags();
    history.replaceState(null, "", `?stat=${encodeURIComponent(code)}`);
  };

  function drawMap(): void {
    const onPlaces = layer === "places";
    renderMap($("map"), {
      label: onPlaces ? "Mapa ověřených míst" : "Mapa Evropy s navštívenými státy",
      selected: onPlaces ? null : selected,
      fill: (code) => {
        const c = byCode.get(code);
        if (!c || (!c.count && !c.also.length)) return null;
        return onPlaces ? "--q1" : qvar(c.count);
      },
      countryLabel: (code) => `${byCode.get(code)!.name}, ${cesty(byCode.get(code)!.count)}`,
      countryTip: (code) => countryTip(byCode.get(code)!),
      places: onPlaces ? places : [],
      placeR: (p) => 4 + Math.sqrt(p.trips.length) * 2.2,
      placeTip: (p) => {
        const ys = p.trips.map((t) => (t.rok === null ? "?" : String(t.rok)));
        return `<b>${esc(p.place.nazev)}</b>${p.place.presnost === "oblast" ? " <i>(oblast)</i>" : ""}<br>${cesty(p.trips.length)}: ${ys.slice(0, 4).join(", ")}${ys.length > 4 ? " …" : ""}`;
      },
      onCountry: select
    });
    $("legend").innerHTML = onPlaces
      ? '<span><i class="pin"></i>místo (velikost = počet cest)</span><span><i class="ring"></i>jen oblast</span><span>Na mapě jsou jen místa s ověřenou polohou.</span>'
      : "<span>Počet cest:</span>" + Q.slice().reverse().map(([, label, v]) => `<span><i style="background:var(${v})"></i>${label}</span>`).join("") +
        '<span><i style="background:var(--land)"></i>nenavštíveno</span>';
    $("mapNote").textContent = onPlaces ? `Ověřená místa: ${places.length}` : "Klikněte na stát";
  }

  // Přepínač vrstev má smysl až s ověřenými místy (fáze E).
  if (places.length) {
    const layers = $("layers");
    layers.hidden = false;
    for (const b of layers.querySelectorAll<HTMLButtonElement>("button")) {
      b.addEventListener("click", () => {
        layer = b.dataset.layer === "places" ? "places" : "countries";
        for (const x of layers.querySelectorAll("button")) x.setAttribute("aria-pressed", String(x === b));
        drawMap();
      });
    }
  }

  function drawCountry(): void {
    const c = byCode.get(selected)!;
    $("country").innerHTML =
      `<header><h2>${flag(c.code)}${esc(c.name)}</h2><span class="code">${esc(c.code)}</span></header>` +
      `<p class="meta">${cesty(c.count)} · ${yearsSpan(c)} · ${nightsCoverage(c)}</p>` +
      `<ul>${c.trips.map((t) => tripListItem(t)).join("")}${c.also.map((t) => tripListItem(t, "další stát")).join("")}</ul>` +
      `<p class="more"><a class="link" href="kronika.html?stat=${c.code}">V kronice</a> · <a class="link" href="statistiky.html#stat-${c.code}">Ve statistikách</a></p>`;
  }

  function drawFlags(): void {
    const order = visited.slice().sort((a, b) =>
      (a.first === null ? 1 : 0) - (b.first === null ? 1 : 0) || (a.first ?? 0) - (b.first ?? 0) || a.name.localeCompare(b.name, "cs"));
    $("flagrow").innerHTML = order.map((c) =>
      `<button type="button" data-code="${c.code}" aria-pressed="${c.code === selected}" aria-label="${esc(`${c.name}, ${cesty(c.count)}`)}" ` +
      `title="${esc(`${c.name} · ${cesty(c.count)} · ${c.first === null ? "rok neznámý" : `poprvé ${c.first}`}`)}">${flag(c.code)}</button>`).join("");
  }
  $("flagrow").addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-code]");
    if (b?.dataset.code) select(b.dataset.code);
  });

  $("recent").innerHTML = s.recent.slice(0, 4).map((t) =>
    `<a class="card" href="${tripUrl(t)}"><span class="stamp" aria-hidden="true">${esc(t.zeme)}</span>` +
    `<span class="cty">${flag(t.zeme)}${esc(byCode.get(t.zeme)?.name ?? t.zeme)}</span><h3>${esc(tripName(t))}</h3>` +
    `<div class="when">${termin(t)}</div><span class="chip">${noci(t.pocetNoci)}</span>` +
    (t.sport ? ` <span class="chip">${num(t.sport.km)} km aktivit</span>` : "") +
    (t.zamereni.length ? ` ${focusChips(t)}` : "") + "</a>").join("");

  yearsChart($("years"), s);
  $("yearsNote").textContent = s.undated
    ? `Cesty bez známého roku (${s.undated}) jsou vpravo zvlášť a do let se nezařazují.`
    : "Všechny cesty mají známý rok.";

  const returns = visits.filter((v) => v.trips.length >= 3);
  if (returns.length) {
    const max = returns[0]!.trips.length;
    $("returns").innerHTML = `<ol class="returns">${returns.map((v) => {
      const ys = v.trips.flatMap((t) => (t.rok === null ? [] : [t.rok]));
      const span = ys.length ? ` · ${Math.min(...ys)}–${Math.max(...ys)}` : "";
      return `<li><b>${esc(v.place.nazev)}${v.place.presnost === "oblast" ? " <small>(oblast)</small>" : ""}</b><small>${cesty(v.trips.length)}${span}</small>` +
        `<div class="bar" aria-hidden="true"><span style="width:${((v.trips.length / max) * 100).toFixed(1)}%"></span></div></li>`;
    }).join("")}</ol>`;
  } else {
    $("returns").innerHTML = `<p class="empty-note">${visits.length
      ? "Žádné ověřené místo zatím nemá tři a více cest."
      : "Místa se ukážou po ověření jejich polohy v číselníku míst. Do té doby cesty na mapě nemají body."}</p>`;
  }

  drawMap();
  drawCountry();
  drawFlags();
}
