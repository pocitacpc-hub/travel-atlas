// Kronika: cesty po letech s filtrem rozsahu, státu a hledáním. Lišta let skáče na rok.
import "../generated/vlajky.css";
import "../styles/kronika.css";
import { countryName, dataAsOf, stats as base, trips as all } from "../lib/data";
import { $, flag, param, shell, sideClass, tripName, tripUrl } from "../lib/dom";
import { cesty, esc, MONTHS, MONTHS_SHORT, noci, num, plural, searchable, termin, zN } from "../lib/format";
import type { Trip } from "../lib/model";
import { computeStats, type YearStat } from "../lib/stats";
import { emptyArchive, focusChips } from "../lib/ui";

shell();

const STAR = '<svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z"/></svg>';
const MAX_UNITS = 13;

if (!base.total) {
  emptyArchive($("main"));
} else {
  const requested = param("stat");
  const st = {
    scope: "all" as "all" | "cz" | "abroad",
    stat: requested && base.countries.some((c) => c.code === requested) ? requested : "",
    q: ""
  };
  const index = new Map(all.map((t) => [t.id, searchable(`${t.nazev} ${countryName(t.zeme)}`)]));

  $("span").textContent = base.minYear !== null ? `${base.minYear}–${base.maxYear}` : "";
  const select = $<HTMLSelectElement>("stat");
  select.innerHTML = '<option value="">všechny</option>' +
    base.countries.map((c) => `<option value="${c.code}">${esc(c.name)} (${c.count})</option>`).join("");
  select.value = st.stat;

  const tripLi = (t: Trip) => {
    const isNew = base.firstTripOfCountry.get(t.id);
    const units = t.pocetNoci === null ? 0 : Math.min(t.pocetNoci, MAX_UNITS);
    const bar = t.pocetNoci === null ? " unk" : t.presnostTerminu !== "den" ? " month" : "";
    const month = t.mesic !== null ? MONTHS_SHORT[t.mesic - 1] : "?";
    return `<li class="trip"><a href="${tripUrl(t)}"><span class="m" title="${t.mesic !== null ? MONTHS[t.mesic - 1] : "měsíc neznámý"}">${month}</span>` +
      `<span class="bar ${sideClass(t)}${bar}" style="--n:${units}" aria-hidden="true"></span>` +
      `<span class="txt"><span class="t">${esc(tripName(t))}</span>` +
      `<span class="meta">${flag(t.zeme)}${esc(countryName(t.zeme))} · ${t.presnostTerminu === "den" ? `${termin(t)} · ` : ""}${noci(t.pocetNoci)}` +
      `${t.sport ? ` · ${num(t.sport.km)} km aktivit` : ""}</span>` +
      (t.zamereni.length ? `<span class="focus">${focusChips(t)}</span>` : "") +
      (isNew ? isNew.map((code) => `<span class="new">${STAR}nová země: ${esc(countryName(code))}</span>`).join("") : "") +
      "</span></a></li>";
  };

  const yearSection = (y: YearStat) => {
    if (!y.total) {
      return `<section class="year empty" id="y${y.year}"><div><span class="yy">${y.year}</span></div><div><span class="ysum">bez záznamu v archivu</span></div></section>`;
    }
    const nights = y.nightsKnown ? noci(y.nights) + (y.nightsKnown < y.total ? ` (známo u ${y.nightsKnown})` : "") : "noci neznámé";
    return `<section class="year" id="y${y.year}"><div><span class="yy">${y.year}</span><span class="ysum">${cesty(y.total)}` +
      `${y.abroad && y.cz ? ` · ${y.abroad} do zahraničí` : ""}<br>${nights}</span></div>` +
      `<ol class="trips">${y.trips.map(tripLi).join("")}</ol></section>`;
  };

  let observer: IntersectionObserver | null = null;

  const render = () => {
    const q = searchable(st.q);
    const trips = all.filter((t) =>
      (st.scope !== "cz" || t.zeme === "CZ") &&
      (st.scope !== "abroad" || t.zeme !== "CZ") &&
      (!st.stat || t.zeme === st.stat || t.dalsiZeme.includes(st.stat)) &&
      (!q || index.get(t.id)!.includes(q)));
    const filtered = st.scope !== "all" || Boolean(st.stat) || Boolean(q);
    $("count").textContent = filtered
      ? `${plural(trips.length, "Zobrazena", "Zobrazeny", "Zobrazeno")} ${cesty(trips.length)} ${zN(base.total)}`
      : `${cesty(base.total)} v archivu`;
    if (!trips.length) {
      $("timeline").innerHTML = '<p class="empty-note">Filtrům neodpovídá žádná cesta.</p>';
      $("rail").innerHTML = "";
      $("lead").textContent = "";
      return;
    }
    const s = computeStats(trips, countryName, dataAsOf);
    $("lead").textContent = `${cesty(s.total)}${st.stat ? ` (${countryName(st.stat)})` : ""}, ${num(s.nightsSum)} známých nocí (u ${s.nightsKnown} ${zN(s.total)} cest).` +
      (s.undated ? ` Cesty bez známého roku (${s.undated}) jsou na konci.` : "");

    // Bez filtru i prázdné roky celého archivu, s filtrem jen roky s cestou.
    const byYear = new Map(s.years.map((y) => [y.year, y]));
    const years: YearStat[] = [];
    if (base.minYear !== null && base.maxYear !== null) {
      for (let y = base.maxYear; y >= base.minYear; y--) {
        const row = byYear.get(y) ?? { year: y, total: 0, cz: 0, abroad: 0, nights: 0, nightsKnown: 0, trips: [] };
        if (row.total || !filtered) years.push(row);
      }
    }
    let html = years.map(yearSection).join("");
    if (s.undated) {
      html += `<section class="year" id="yunk"><div><span class="yy">?</span><span class="ysum">rok neznámý<br>${cesty(s.undated)}</span></div>` +
        `<div><ol class="trips">${s.undatedTrips.map(tripLi).join("")}</ol><p class="note">Cesty jsou doložené, ale rok neznáme. Počítají se do států, ne do let.</p></div></section>`;
    }
    $("timeline").innerHTML = html;

    $("rail").innerHTML = years.map((y) => {
      const b = `<span class="b" aria-hidden="true">${y.cz ? `<i class="sw-cz" style="width:${y.cz * 6}px"></i>` : ""}${y.abroad ? `<i class="sw-abroad" style="width:${y.abroad * 6}px"></i>` : ""}</span>`;
      return `<li${y.year % 10 === 9 ? ' class="dec"' : ""}><a href="#y${y.year}" aria-label="${y.year}, ${cesty(y.total)}">${y.year}${b}</a></li>`;
    }).join("") + (s.undated ? `<li class="dec"><a href="#yunk" aria-label="Rok neznámý, ${cesty(s.undated)}">?</a></li>` : "");

    const links = new Map<string, HTMLAnchorElement>();
    for (const a of document.querySelectorAll<HTMLAnchorElement>(".rail a")) links.set(a.getAttribute("href")!.slice(1), a);
    observer?.disconnect();
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        for (const a of document.querySelectorAll(".rail a.is-active")) a.classList.remove("is-active");
        const a = links.get(e.target.id);
        if (!a) continue;
        a.classList.add("is-active");
        if (window.innerWidth <= 820) a.scrollIntoView({ block: "nearest", inline: "center" });
      }
    }, { rootMargin: "-10% 0px -80% 0px" });
    for (const sec of document.querySelectorAll(".year")) observer.observe(sec);
  };

  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-scope]")) {
    b.addEventListener("click", () => {
      st.scope = b.dataset.scope === "cz" ? "cz" : b.dataset.scope === "abroad" ? "abroad" : "all";
      for (const x of document.querySelectorAll("[data-scope]")) x.setAttribute("aria-pressed", String(x === b));
      render();
    });
  }
  select.addEventListener("change", () => {
    st.stat = select.value;
    history.replaceState(null, "", st.stat ? `?stat=${encodeURIComponent(st.stat)}` : location.pathname);
    render();
  });
  $<HTMLInputElement>("q").addEventListener("input", (e) => {
    st.q = (e.target as HTMLInputElement).value;
    render();
  });
  render();
  // Kotva na rok (#y2023) se po vykreslení posune na správné místo.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
