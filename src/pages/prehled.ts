// Přehled: mapa států, řada vlajek, fakta, karta vybraného státu a poslední cesty. Grafy po letech jsou ve Statistikách.
import "../generated/vlajky.css";
import "../styles/prehled.css";
import { stats as s, visits } from "../lib/data";
import { $, flag, param, tripName, tripUrl } from "../lib/dom";
import { cesty, esc, noci, num, pct, plural, termin, zN } from "../lib/format";
import { cropFor, MAP_ASPECT, renderMap, toMapPlace, type MapPlace } from "../lib/map";
import { icon } from "../lib/icons";
import type { CountryStat } from "../lib/stats";
import { initTripDialog } from "../lib/tripDialog";
import { emptyArchive, focusChips, nightsCoverage, tripListItem, yearsSpan } from "../lib/ui";
import { registerServiceWorker } from "../lib/pwa";

registerServiceWorker();

initTripDialog();

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
    : (s.recent[0] && byCode.has(s.recent[0].zeme) ? s.recent[0].zeme : visited[0]!.code);
  let layer: "countries" | "places" = "countries";
  // Přiblížený stát: klik na stát v mapě nebo na vlajku. Odkaz ?stat=XX otevře rovnou přiblížení.
  let zoom: string | null = requested && byCode.has(requested) ? requested : null;

  const countryTip = (c: CountryStat) =>
    `${flag(c.code)} <b>${esc(c.name)}</b><br>${cesty(c.count)} · ${c.first !== null ? `poprvé ${c.first}` : "rok první cesty neznámý"}<br>` +
    (c.nightsKnown ? `${noci(c.nights)} (známo u ${c.nightsKnown} ${zN(c.count)})` : "noci neznámé") +
    (c.also.length ? `<br>další stát na ${cesty(c.also.length)}` : "");

  $("span").textContent = s.minYear !== null ? `${s.minYear}–${s.maxYear}` : "";
  $("headline").innerHTML = `<em>${s.countryCount}</em> ${plural(s.countryCount, "stát", "státy", "států")},<br>${cesty(s.total)}`;
  const abroadStates = `${s.abroadCountryCount} zahr. ${plural(s.abroadCountryCount, "stát", "státy", "států")}`;
  $("facts").innerHTML = [
    ["Do zahraničí", cesty(s.abroad), abroadStates],
    ["Po Česku", cesty(s.cz), `${pct(s.cz, s.total)} všech cest`],
    [`${icon("noc")}Nocí celkem`, num(s.nightsSum), `známo u ${s.nightsKnown} ${zN(s.total)} cest`]
  ].map(([dt, dd, small]) => `<div><dt>${dt}</dt><dd>${dd}<small>${small}</small></dd></div>`).join("");

  const select = (code: string) => {
    selected = code;
    zoom = code;
    drawMap();
    drawCountry();
    drawFlags();
    history.replaceState(null, "", `?stat=${encodeURIComponent(code)}`);
  };

  const zoomOut = (fromKeyboard: boolean) => {
    if (!zoom) return;
    zoom = null;
    drawMap();
    history.replaceState(null, "", location.pathname);
    if (fromKeyboard) $("map").querySelector<SVGElement>(`[data-code="${selected}"]`)?.focus({ preventScroll: true });
  };
  // detail === 0: tlačítko aktivované klávesou Enter nebo mezerníkem
  $("zoomOut").addEventListener("click", (e) => zoomOut(e.detail === 0));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && zoom && !document.querySelector("dialog[open]")) zoomOut(true);
  });

  function drawMap(): void {
    const mapEl = $("map");
    const zoomed = zoom !== null;
    const onPlaces = zoomed || layer === "places";
    const inCountry = zoomed ? places.filter((p) => p.place.zeme === zoom) : [];
    const crop = zoomed ? cropFor([zoom!], inCountry, MAP_ASPECT, 150) : undefined;
    // V přiblížení mají body stálou velikost na obrazovce (v pixelech), v celé Evropě velikost podle mapy.
    const unitsPerPx = crop ? crop[2] / Math.max(1, mapEl.clientWidth || 600) : 1;
    renderMap(mapEl, {
      label: zoomed ? `Mapa: ${byCode.get(zoom!)!.name} a ověřená místa` : onPlaces ? "Mapa ověřených míst" : "Mapa Evropy s navštívenými státy",
      selected: zoomed ? zoom : onPlaces ? null : selected,
      fill: (code) => {
        const c = byCode.get(code);
        if (!c || (!c.count && !c.also.length)) return null;
        if (zoomed) return code === zoom ? "--q2" : "--q1";
        return qvar(c.count);
      },
      countryLabel: (code) => `${byCode.get(code)!.name}, ${cesty(byCode.get(code)!.count)}`,
      countryTip: (code) => countryTip(byCode.get(code)!),
      places: onPlaces ? places : [],
      crop,
      labels: zoomed,
      animate: true,
      placeR: (p) => (zoomed ? (3.5 + Math.sqrt(p.trips.length) * 1.5) * unitsPerPx : 4 + Math.sqrt(p.trips.length) * 2.2),
      placeTip: (p) => {
        const ys = p.trips.map((t) => (t.rok === null ? "?" : String(t.rok)));
        return `<b>${esc(p.place.nazev)}</b>${p.place.presnost === "oblast" ? " <i>(oblast)</i>" : ""}<br>${cesty(p.trips.length)}: ${ys.slice(0, 4).join(", ")}${ys.length > 4 ? " …" : ""}`;
      },
      onCountry: select
    });
    $("layers").hidden = zoomed || !places.length;
    $("zoomOut").hidden = !zoomed;
    $("legend").innerHTML = zoomed
      ? `<span><i style="background:var(--q2)"></i>${esc(byCode.get(zoom!)!.name)}</span><span><i class="pin"></i>místo (velikost = počet cest)</span><span><i class="ring"></i>jen oblast</span>`
      : "<span>Počet cest:</span>" + Q.slice().reverse().map(([, label, v]) => `<span><i style="background:var(${v})"></i>${label}</span>`).join("") +
        '<span><i style="background:var(--land)"></i>nenavštíveno</span>' +
        (onPlaces ? '<span><i class="pin"></i>místo (velikost = počet cest)</span><span><i class="ring"></i>jen oblast</span>' : "");
    $("mapNote").textContent = zoomed
      ? (inCountry.length ? `Ověřená místa: ${inCountry.length}` : "Ve státě zatím nejsou ověřená místa")
      : onPlaces ? `Ověřená místa: ${places.length}` : "";
  }

  // Přepínač vrstev má smysl až s ověřenými místy (fáze E).
  if (places.length) {
    const layers = $("layers");
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
      `<header><h2>${flag(c.code)}${esc(c.name)}</h2></header>` +
      `<p class="meta">${cesty(c.count)} · ${yearsSpan(c)} · ${nightsCoverage(c)}</p>` +
      `<ul>${c.trips.map((t) => tripListItem(t)).join("")}${c.also.map((t) => tripListItem(t, "další stát")).join("")}</ul>` +
      `<p class="more"><a class="link" href="kronika.html?stat=${c.code}">V kronice</a> · <a class="link" href="statistiky.html#stat-${c.code}">Ve statistikách</a></p>`;
  }

  // Vlajky podle počtu cest, při shodě podle první návštěvy.
  function drawFlags(): void {
    const order = visited.slice().sort((a, b) => b.count - a.count ||
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
    `<a class="card" href="${tripUrl(t)}">${flag(t.zeme)}` +
    `<span class="cty">${esc(byCode.get(t.zeme)?.name ?? t.zeme)}</span><h3>${esc(tripName(t))}</h3>` +
    `<div class="card-foot"><span class="when">${termin(t)}</span><span class="chip">${icon("noc")}${noci(t.pocetNoci)}</span>` +
    (t.sport ? ` <span class="chip">${icon("trasa")}${num(t.sport.km)} km aktivit</span>` : "") +
    (t.zamereni.length ? ` ${focusChips(t)}` : "") + "</div></a>").join("");


  drawMap();
  drawCountry();
  drawFlags();
}
