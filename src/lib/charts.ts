// Grafy: cesty po letech, heatmapa rok × měsíc, Celé roky a délka pobytu.
// Barvy jsou CSS role (is-cz / is-abroad / q1–q5), ne přímé hodnoty.
import { bindTips, flag, mountChart, sideClass, tripUrl } from "./dom";
import { cesty, esc, MONTHS, MONTHS_SHORT, noci, presnost, termin, zN } from "./format";
import type { Trip } from "./model";
import type { Stats, YearStat } from "./stats";

const niceMax = (v: number) => (v <= 5 ? 5 : v <= 10 ? 10 : Math.ceil(v / 5) * 5);

/** Sloupec se zaobleným horním koncem a rovnou základnou. */
function roundTop(x: number, y: number, w: number, h: number, r: number): string {
  const q = Math.min(r, w / 2, h);
  const f = (n: number) => +n.toFixed(2);
  return `M${f(x)} ${f(y + h)}V${f(y + q)}Q${f(x)} ${f(y)} ${f(x + q)} ${f(y)}H${f(x + w - q)}Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + q)}V${f(y + h)}Z`;
}

export function tripTip(t: Trip, countryName: (code: string) => string): string {
  return `${flag(t.zeme)} <b>${esc(t.nazev)}</b><br>${esc(countryName(t.zeme))} · ${termin(t)} · ${noci(t.pocetNoci)}` +
    (t.presnostTerminu !== "den" ? `<br><i>${presnost(t.presnostTerminu)}</i>` : "");
}

// ---------- Cesty po letech (Česko / zahraničí, skládané) ----------
interface YearRow { year: number | null; total: number; cz: number; abroad: number; nights: number; nightsKnown: number }

export function yearsChart(el: HTMLElement, s: Stats, height = 210): void {
  const rows: YearRow[] = s.years.slice();
  if (s.undated) {
    const cz = s.undatedTrips.filter((t) => t.zeme === "CZ").length;
    rows.push({ year: null, total: s.undated, cz, abroad: s.undated - cz, nights: 0, nightsKnown: 0 });
  }
  const draw = () => {
    const W = Math.max(280, el.clientWidth);
    const H = height;
    const m = { l: 26, r: 6, t: 10, b: 22 };
    const slots = rows.length + (s.undated ? 1 : 0);
    const slot = (W - m.l - m.r) / Math.max(1, slots);
    const bw = Math.max(3, Math.min(18, slot * 0.68));
    const max = niceMax(Math.max(1, ...rows.map((r) => r.total)));
    const y0 = H - m.b;
    const scale = (H - m.t - m.b) / max;
    const out = [`<svg class="vz-chart" width="${W}" height="${H}" role="img" aria-label="Počet cest po letech, Česko a zahraničí">`];
    for (const v of [0, max / 2, max]) {
      const y = y0 - v * scale;
      out.push(`<line class="vz-grid${v === 0 ? " is-base" : ""}" x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}"/>`,
        `<text class="vz-tick" x="${m.l - 6}" y="${y + 4}" text-anchor="end">${v}</text>`);
    }
    rows.forEach((r, i) => {
      // Cesty bez roku stojí za mezerou na konci osy.
      const idx = r.year === null ? i + 1 : i;
      const x = m.l + idx * slot + (slot - bw) / 2;
      const hc = r.cz * scale;
      const ha = r.abroad * scale;
      if (r.cz) {
        out.push(r.abroad
          ? `<rect class="vz-bar is-cz" x="${x}" y="${y0 - hc}" width="${bw}" height="${hc}"/>`
          : `<path class="vz-bar is-cz" d="${roundTop(x, y0 - hc, bw, hc, 4)}"/>`);
      }
      // 2px mezera v barvě povrchu mezi segmenty.
      if (r.abroad) out.push(`<path class="vz-bar is-abroad" d="${roundTop(x, y0 - hc - ha - (r.cz ? 2 : 0), bw, ha, 4)}"/>`);
      out.push(`<rect class="vz-hit" x="${m.l + idx * slot}" y="${m.t}" width="${slot}" height="${H - m.t - m.b}" data-tip data-i="${i}"/>`);
      const label = r.year === null ? "?" : r.year % 5 === 0 || r.year === s.minYear ? String(r.year) : "";
      if (label) out.push(`<text class="vz-tick" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${label}</text>`);
    });
    out.push("</svg>");
    el.innerHTML = out.join("");
  };
  mountChart(el, draw);
  bindTips(el, (t) => {
    const r = rows[Number(t.dataset.i)]!;
    const head = r.year === null ? "Rok neznámý" : String(r.year);
    if (!r.total) return `<b>${head}</b><br>bez záznamu`;
    return `<b>${head}</b> · ${cesty(r.total)}<br>Česko ${r.cz} · zahraničí ${r.abroad}` +
      (r.year === null ? "" : `<br>${r.nightsKnown ? `${noci(r.nights)} (známo u ${r.nightsKnown} ${zN(r.total)})` : "noci neznámé"}`);
  });
}

// ---------- Rok × měsíc (heatmapa) ----------
export function heatmap(el: HTMLElement, s: Stats): void {
  const groups = new Map<string, Trip[]>();
  const level = (n: number) => (n >= 4 ? "q5" : `q${n}`);
  const cell = (trips: Trip[], key: string) => {
    groups.set(key, trips);
    const n = trips.length;
    if (!n) return "<td></td>";
    return `<td class="v ${level(n)}" data-tip data-k="${key}" tabindex="0" aria-label="${esc(heatLabel(key))}: ${cesty(n)}">${n > 1 ? n : ""}</td>`;
  };
  const heatLabel = (key: string) => {
    const [y, m] = key.split("-");
    return y === "?" ? "Rok neznámý" : m === "?" ? `${y}, měsíc neznámý` : `${MONTHS[Number(m) - 1]} ${y}`;
  };
  const head = `<thead><tr><th class="y" scope="col"><span class="sr">Rok</span></th>${MONTHS_SHORT.map((m, i) => `<th scope="col" title="${MONTHS[i]}">${m}</th>`).join("")}` +
    `<th class="sep"></th><th class="q" scope="col" title="měsíc neznámý">?</th></tr></thead>`;
  let body = s.years.slice().reverse().map((y) => {
    let tds = "";
    for (let m = 1; m <= 12; m++) tds += cell(y.trips.filter((t) => t.mesic === m), `${y.year}-${m}`);
    return `<tr><th class="y" scope="row">${y.year}</th>${tds}<td class="sep"></td>${cell(y.trips.filter((t) => t.mesic === null), `${y.year}-?`)}</tr>`;
  }).join("");
  if (s.undated) body += `<tr class="unk"><th class="y" scope="row">rok ?</th>${"<td></td>".repeat(12)}<td class="sep"></td>${cell(s.undatedTrips, "?-?")}</tr>`;
  el.innerHTML = `<div class="heat-scroll"><table class="heat"><caption class="sr">Počet cest podle roku a měsíce začátku</caption>${head}<tbody>${body}</tbody></table></div>`;
  bindTips(el, (t) => {
    const key = t.dataset.k!;
    const trips = groups.get(key) ?? [];
    return `<b>${heatLabel(key)}</b> · ${cesty(trips.length)}<br>` +
      trips.map((x) => `${flag(x.zeme)} ${esc(x.nazev)}`).join("<br>");
  });
}

// ---------- Celé roky: každý rok jeden řádek leden–prosinec ----------
interface RowItem { t: Trip; a: number; b: number; kind: "den" | "mesic"; lane: number }
interface YearLine { label: string; days: number; items: RowItem[]; qs: Trip[]; lanes: number; empty: boolean }

const dayOfYear = (y: number, m: number, d: number) => (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5;
const daysIn = (y: number) => (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5;

export function yearLines(years: readonly YearStat[], undated: readonly Trip[]): YearLine[] {
  const lines: YearLine[] = years.slice().reverse().map((r) => {
    const days = daysIn(r.year);
    const items: RowItem[] = [];
    const qs: Trip[] = [];
    for (const t of r.trips) {
      if (t.presnostTerminu === "den" && t.zacatek && t.konec) {
        const [y1, m1, d1] = t.zacatek.split("-").map(Number) as [number, number, number];
        const [y2, m2, d2] = t.konec.split("-").map(Number) as [number, number, number];
        const a = dayOfYear(y1, m1, d1);
        // Cesta přes Silvestra se v roce začátku kreslí do konce roku.
        const b = y2 === r.year ? dayOfYear(y2, m2, d2) : days;
        items.push({ t, a, b: Math.max(b, a + 1), kind: "den", lane: 0 });
      } else if (t.presnostTerminu === "mesic" && t.mesic !== null) {
        items.push({ t, a: dayOfYear(r.year, t.mesic, 1), b: t.mesic === 12 ? days : dayOfYear(r.year, t.mesic + 1, 1), kind: "mesic", lane: 0 });
      } else qs.push(t);
    }
    items.sort((x, y) => x.a - y.a || (x.kind === "den" ? -1 : 1));
    const lanes: number[] = [];
    for (const it of items) {
      const free = lanes.findIndex((end) => end <= it.a);
      it.lane = free >= 0 ? free : lanes.length;
      lanes[it.lane] = it.b;
    }
    return { label: String(r.year), days, items, qs, lanes: Math.max(1, lanes.length), empty: !r.trips.length };
  });
  if (undated.length) lines.push({ label: "rok ?", days: 365, items: [], qs: undated.slice(), lanes: 1, empty: false });
  return lines;
}

export function yearRows(el: HTMLElement, s: Stats, countryName: (code: string) => string): void {
  const lines = yearLines(s.years, s.undatedTrips);
  const byId = new Map<string, Trip>();
  for (const l of lines) for (const t of [...l.items.map((i) => i.t), ...l.qs]) byId.set(t.id, t);

  const draw = () => {
    const W = Math.max(300, el.clientWidth);
    const narrow = W < 560;
    const L = 44, G = 10, RQ = 46, T = W - L - RQ - G * 2, x0 = L + G;
    const BH = 9, LG = 3, PAD = 7, HEAD = 22, DOT = 11;
    const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    const grid: string[] = [], marks: string[] = [], labels: string[] = [];
    let y = HEAD;
    lines.forEach((r, ri) => {
      const qLines = Math.ceil(r.qs.length / 3);
      const h = r.empty ? 18 : Math.max(r.lanes * BH + (r.lanes - 1) * LG, qLines * DOT - 2) + PAD * 2;
      if (ri % 2 === 0) grid.push(`<rect class="yr-stripe" x="${x0}" y="${y}" width="${T}" height="${h}"/>`);
      labels.push(`<text class="yr-label${r.empty ? " is-empty" : ""}" x="${L}" y="${y + h / 2 + 4}" text-anchor="end">${r.label}</text>`);
      for (const it of r.items) {
        const x = x0 + (it.a / r.days) * T;
        const w = Math.max(3, ((it.b - it.a) / r.days) * T);
        const yy = y + PAD + it.lane * (BH + LG);
        marks.push(it.kind === "den"
          ? `<rect class="yr-bar ${sideClass(it.t)}" x="${x.toFixed(1)}" y="${yy}" width="${w.toFixed(1)}" height="${BH}" rx="2" data-tip data-id="${it.t.id}"/>`
          : `<rect class="yr-band ${sideClass(it.t)}" x="${(x + 0.5).toFixed(1)}" y="${yy + 0.5}" width="${(w - 1).toFixed(1)}" height="${BH - 1}" rx="2" data-tip data-id="${it.t.id}"/>`);
      }
      r.qs.forEach((t, i) => {
        const cx = x0 + T + G + 8 + (i % 3) * DOT;
        const cy = y + PAD + BH / 2 + Math.floor(i / 3) * DOT;
        marks.push(`<circle class="yr-dot ${sideClass(t)}" cx="${cx}" cy="${cy}" r="4" data-tip data-id="${t.id}"/>`);
      });
      y += h;
    });
    const H = y + 2;
    for (let m = 0; m < 12; m++) {
      const gx = x0 + (cum[m]! / 365) * T;
      const mid = x0 + ((cum[m]! + cum[m + 1]!) / 2 / 365) * T;
      if (m) grid.push(`<line class="yr-month" x1="${gx}" x2="${gx}" y1="${HEAD - 4}" y2="${H}"/>`);
      labels.push(`<text class="vz-tick" x="${mid}" y="14" text-anchor="middle">${narrow ? m + 1 : MONTHS_SHORT[m]}</text>`);
    }
    labels.push(`<text class="vz-tick" x="${x0 + T + G + RQ / 2}" y="14" text-anchor="middle">?</text>`);
    grid.push(`<line class="yr-month" x1="${x0 + T + G / 2}" x2="${x0 + T + G / 2}" y1="${HEAD - 4}" y2="${H}"/>`);
    el.innerHTML = `<svg class="vz-chart yr" width="${W}" height="${H}" role="img" aria-label="Cesty v jednotlivých letech podle data. Seznam cest je v Kronice.">` +
      grid.join("") + marks.join("") + labels.join("") + "</svg>";
  };
  mountChart(el, draw);
  bindTips(el, (t) => tripTip(byId.get(t.dataset.id!)!, countryName));
  el.addEventListener("click", (e) => {
    const t = (e.target as Element).closest<SVGElement>("[data-id]");
    const trip = t?.dataset.id ? byId.get(t.dataset.id) : undefined;
    if (trip) location.href = tripUrl(trip);
  });
}

// ---------- Délka pobytu ----------
export function lengthHist(el: HTMLElement, s: Stats): void {
  const cols = [...s.buckets.map((b) => ({ ...b, unknown: false })), { label: "neznámá", count: s.nightsUnknown, unknown: true }];
  const max = Math.max(1, ...cols.map((c) => c.count));
  el.innerHTML = `<div class="hist" style="grid-template-columns:repeat(${cols.length},minmax(0,1fr))" role="img" aria-label="${esc(
    cols.map((c) => `${c.unknown ? "délka neznámá" : `${c.label} ${c.label === "1" ? "noc" : "nocí"}`}: ${cesty(c.count)}`).join(", "))}">` +
    cols.map((c) => `<div><b>${c.count}</b><span class="b${c.unknown ? " unk" : ""}" style="height:${((c.count / max) * 100).toFixed(1)}%"></span><small>${c.label}</small></div>`).join("") +
    "</div>";
}
