// Statistiky: Cesty a noci po letech, Kdy cestuji (Měsíce / Celé roky), Státy, Délka pobytu, Rekordy.
import "../generated/vlajky.css";
import "../styles/statistiky.css";
import { heatmap, lengthHist, yearRows, yearsChart } from "../lib/charts";
import { countryName, stats as s } from "../lib/data";
import { $, flag, param, tripName, tripUrl } from "../lib/dom";
import { cesty, esc, noci, num, plural, termin, zN } from "../lib/format";
import { longestRun } from "../lib/stats";
import { initTripDialog } from "../lib/tripDialog";
import { emptyArchive, nightsCell, nightsCoverage, staty, yearsSpan } from "../lib/ui";
import { registerServiceWorker } from "../lib/pwa";

registerServiceWorker();


initTripDialog();

if (!s.total) {
  emptyArchive($("main"));
} else {
  $("span").textContent = s.minYear !== null ? `${s.minYear}–${s.maxYear}` : "";
  $("lead").textContent = `${cesty(s.total)}, ${staty(s.countryCount)}, ${num(s.nightsSum)} známých nocí. Všechna čísla se počítají z jednotlivých cest.`;

  // ---------- Cesty a noci po letech ----------
  yearsChart($("years"), s, "trips");
  $("yearsNote").textContent = s.undated
    ? `Cesty bez známého roku (${s.undated}) jsou vpravo zvlášť a do let se nezařazují.`
    : "Všechny cesty mají známý rok.";
  yearsChart($("nights"), s, "nights");
  $("nightsNote").textContent = s.nightsUnknown
    ? `Počet nocí je známý u ${s.nightsKnown} ${zN(s.total)} cest, ostatní se nesčítají.`
    : "Počet nocí je známý u všech cest.";

  // ---------- Kdy cestuji ----------
  heatmap($("heat"), s);
  $("cov").innerHTML = [
    `Přesný termín: ${s.dayKnown} ${zN(s.total)}`,
    `Známý měsíc: ${s.monthsKnown} ${zN(s.total)}`,
    `Známý rok: ${s.total - s.undated} ${zN(s.total)}`
  ].map((x) => `<span>${x}</span>`).join("");
  let rowsDrawn = false;
  const setView = (view: "mesice" | "roky") => {
    for (const b of document.querySelectorAll<HTMLElement>("[data-view]")) b.setAttribute("aria-pressed", String(b.dataset.view === view));
    $("v-mesice").hidden = view !== "mesice";
    $("v-roky").hidden = view !== "roky";
    $("kdyNote").textContent = view === "mesice"
      ? "Každý řádek je jeden rok. Najetím myší nebo fokusem zobrazíte cesty."
      : "Každý řádek je jeden rok od ledna do prosince. Najetím zobrazíte cestu, kliknutím její detail.";
    if (view === "roky" && !rowsDrawn) {
      yearRows($("yrows"), s, countryName);
      rowsDrawn = true;
    }
  };
  for (const b of document.querySelectorAll<HTMLElement>("[data-view]")) {
    b.addEventListener("click", () => {
      const view = b.dataset.view === "roky" ? "roky" : "mesice";
      setView(view);
      history.replaceState(null, "", `?pohled=${view}${location.hash}`);
    });
  }
  setView(param("pohled") === "roky" ? "roky" : "mesice");

  // ---------- Státy ----------
  const max = Math.max(1, ...s.countries.map((c) => c.count));
  $("states").innerHTML = `<ul class="states">${s.countries.map((c) => {
    const rows = [...c.trips.map((t) => ({ t, also: false })), ...c.also.map((t) => ({ t, also: true }))];
    return `<li id="stat-${c.code}"><details><summary>${flag(c.code)}<span class="nm">${esc(c.name)}</span>` +
      `<span class="sbar" aria-hidden="true"><i class="${c.code === "CZ" ? "sw-cz" : "sw-abroad"}" style="width:${((c.count / max) * 100).toFixed(1)}%"></i></span>` +
      `<span class="cnt">${c.count}<span class="sr"> ${plural(c.count, "cesta", "cesty", "cest")}</span></span>` +
      `<span class="sub">${nightsCoverage(c)} · ${yearsSpan(c)}${c.also.length ? ` · další stát na ${cesty(c.also.length)}` : ""}</span></summary>` +
      `<ol class="strips">${rows.map(({ t, also }) =>
        `<li><a href="${tripUrl(t)}"><span class="w">${termin(t)}</span><b>${esc(tripName(t))}${also ? ` <small>(další stát, hlavní ${esc(countryName(t.zeme))})</small>` : ""}</b>` +
        `<span class="n">${nightsCell(t)}</span></a></li>`).join("")}</ol>` +
      `<p class="more"><a class="link" href="./?stat=${c.code}">Na mapě</a> · <a class="link" href="kronika.html?stat=${c.code}">V kronice</a></p>` +
      "</details></li>";
  }).join("")}</ul>`;
  const openFromHash = () => {
    if (!location.hash.startsWith("#stat-")) return;
    const li = document.getElementById(location.hash.slice(1));
    const details = li?.querySelector("details");
    if (details) {
      details.open = true;
      li!.scrollIntoView();
    }
  };
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  // ---------- Délka pobytu ----------
  $("lenNote").textContent = s.median === null || s.mean === null
    ? "Délka pobytu zatím není známá u žádné cesty."
    : `Počet nocí · medián ${noci(s.median)}, průměr ${num(s.mean, 1)} noci (z délek známých u ${s.nightsKnown} ${zN(s.total)} cest)`;
  lengthHist($("hist"), s);

  // ---------- Rekordy ----------
  interface Rec { value: string; label: string; sub: string; href?: string }
  const recs: Rec[] = [];
  if (s.longest) {
    const [first] = s.longest.trips;
    const one = s.longest.trips.length === 1 && first;
    recs.push({
      value: noci(s.longest.noci), label: "nejdelší pobyt",
      sub: one ? `${tripName(first)} ${first.rok ?? ""}`.trim() : `${s.longest.trips.length}× · naposledy ${first?.rok ?? "rok neznámý"}`,
      href: one ? tripUrl(first) : undefined
    });
  }
  if (s.busiest) recs.push({ value: String(s.busiest.count), label: "nejvíc cest za rok", sub: s.busiest.years.join(", ") });
  if (s.busiestAbroad) recs.push({ value: String(s.busiestAbroad.count), label: "nejvíc zahraničních cest za rok", sub: s.busiestAbroad.years.join(", ") });
  const abroad = s.countries.filter((c) => c.code !== "CZ" && c.count > 0);
  if (abroad.length) {
    const top = abroad[0]!.count;
    const names = abroad.filter((c) => c.count === top).map((c) => c.name);
    const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} a ${names[names.length - 1]}` : names[0]!;
    recs.push({ value: `${top}×`, label: "nejčastější zahraniční stát", sub: list });
  }
  const run = longestRun(s.years);
  if (run) recs.push({ value: `${run.len} ${plural(run.len, "rok", "roky", "let")}`, label: "nepřerušená řada let s cestou", sub: run.from === run.to ? String(run.from) : `${run.from}–${run.to}` });
  const sport = s.recent.concat(s.undatedTrips).filter((t) => t.sport).sort((a, b) => b.sport!.km - a.sport!.km)[0];
  if (sport?.sport) {
    recs.push({
      value: `${num(sport.sport.km)} km`, label: "nejvíc nahraných km na cestě",
      sub: `${tripName(sport)}${sport.rok ? ` ${sport.rok}` : ""} (Strava, výběr)`, href: tripUrl(sport)
    });
  }
  $("records").innerHTML = recs.map((r) => {
    const inner = `<b>${r.value}</b><span>${r.label}</span><small>${esc(r.sub)}</small>`;
    return r.href ? `<a class="rec" href="${r.href}">${inner}</a>` : `<div class="rec">${inner}</div>`;
  }).join("");
}
