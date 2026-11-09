// Mapa států a ověřených míst ze statických hranic (src/generated/mapa.json, bez dlaždic).
import mapJson from "../generated/mapa.json";
import { bindTips } from "./dom";
import { esc } from "./format";
import type { Place, Trip } from "./model";
import { project } from "./projection";

interface MapAsset {
  width: number;
  height: number;
  land: string;
  countries: Record<string, string>;
  bbox: Record<string, number[]>;
}
const MAP = mapJson as MapAsset;

export interface MapPlace {
  place: Place;
  trips: Trip[];
  x: number;
  y: number;
}

export const toMapPlace = (v: { place: Place; trips: Trip[] }): MapPlace => {
  const [x, y] = project(v.place.lon, v.place.lat);
  return { ...v, x, y };
};

export interface MapOptions {
  label: string;
  /** CSS proměnná výplně navštíveného státu (např. „--q3“), null = nenavštíveno. */
  fill: (code: string) => string | null;
  /** Popis státu pro čtečky a tooltip (HTML). */
  countryLabel: (code: string) => string;
  countryTip: (code: string) => string;
  selected?: string | null;
  places?: MapPlace[];
  placeR?: (p: MapPlace) => number;
  placeTip?: (p: MapPlace) => string;
  crop?: [number, number, number, number];
  onCountry?: (code: string) => void;
  /** Popisky míst (jen v přiblížení, kde je na ně místo). */
  labels?: boolean;
  /** Plynulý přechod z předchozího výřezu. */
  animate?: boolean;
}

const state = new WeakMap<HTMLElement, MapOptions>();

export interface LabelInput { x: number; y: number; r: number; text: string }
export interface Label { x: number; y: number; anchor: "start" | "end"; text: string }

type Box = [number, number, number, number];
const overlaps = (a: Box, b: Box) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/**
 * Rozmístí popisky vedle bodů tak, aby se nepřekrývaly s jinými popisky ani body.
 * Pořadí vstupu je priorita (důležitější místa první). Popisek se zkusí vpravo, pak vlevo, jinak se vynechá.
 */
export function layoutLabels(items: LabelInput[], font: number, crop: [number, number, number, number]): Label[] {
  const placed: Box[] = [];
  const dots: Box[] = items.map((p) => [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r]);
  const inside = (b: Box) => b[0] >= crop[0] && b[2] <= crop[0] + crop[2] && b[1] >= crop[1] && b[3] <= crop[1] + crop[3];
  const labels: Label[] = [];
  items.forEach((p, i) => {
    const width = p.text.length * font * 0.58;
    const gap = font * 0.35;
    const top = p.y - font * 0.75;
    const bottom = p.y + font * 0.3;
    for (const anchor of ["start", "end"] as const) {
      const x = anchor === "start" ? p.x + p.r + gap : p.x - p.r - gap;
      const box: Box = anchor === "start" ? [x, top, x + width, bottom] : [x - width, top, x, bottom];
      if (!inside(box) || placed.some((b) => overlaps(b, box)) || dots.some((d, j) => j !== i && overlaps(d, box))) continue;
      placed.push(box);
      labels.push({ x, y: p.y + font * 0.32, anchor, text: p.text });
      return;
    }
  });
  return labels;
}

const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateViewBox(svg: SVGSVGElement, from: number[], to: number[], ms = 450): void {
  const start = performance.now();
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    svg.setAttribute("viewBox", to.join(" "));
    svg.classList.remove("is-zooming");
  };
  svg.classList.add("is-zooming");
  svg.setAttribute("viewBox", from.join(" "));
  const step = (now: number) => {
    if (finished) return;
    const t = Math.min(1, (now - start) / ms);
    const k = ease(t);
    svg.setAttribute("viewBox", from.map((v, i) => (v + (to[i]! - v) * k).toFixed(2)).join(" "));
    if (t < 1) requestAnimationFrame(step);
    else finish();
  };
  requestAnimationFrame(step);
  // Na stránce na pozadí prohlížeč snímky nespouští. Výřez se po uplynutí času nastaví vždy.
  setTimeout(finish, ms + 150);
}

export function renderMap(el: HTMLElement, opts: MapOptions): void {
  const crop = opts.crop ?? [0, 0, MAP.width, MAP.height];
  const previous = el.querySelector("svg")?.getAttribute("viewBox");
  const out = [`<svg class="vz-map" viewBox="${crop.join(" ")}" role="group" aria-label="${esc(opts.label)}">`, `<path class="vz-land" d="${MAP.land}"/>`];
  const visited: string[] = [];
  for (const [code, d] of Object.entries(MAP.countries)) {
    if (opts.fill(code)) visited.push(code);
    else out.push(`<path class="vz-land" d="${d}"/>`);
  }
  for (const code of visited) {
    const interactive = opts.onCountry
      ? ` tabindex="0" role="button" aria-label="${esc(opts.countryLabel(code))}"`
      : ` aria-label="${esc(opts.countryLabel(code))}"`;
    out.push(`<path class="vz-visited${opts.selected === code ? " is-selected" : ""}" d="${MAP.countries[code]}" style="fill:var(${opts.fill(code)})" data-tip data-code="${esc(code)}"${interactive}/>`);
  }
  const places = opts.places ?? [];
  const radius = places.map((p) => (opts.placeR ? opts.placeR(p) : 4));
  places.forEach((p, i) => {
    out.push(`<circle class="vz-place${p.place.presnost === "oblast" ? " is-region" : ""}" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${radius[i]!.toFixed(2)}" data-tip data-place="${i}"/>`);
  });
  if (opts.labels && places.length) {
    // Velikost písma v jednotkách mapy, aby na obrazovce vyšlo asi 12 px.
    const unitsPerPx = crop[2] / Math.max(1, el.clientWidth || 600);
    const font = 12 * unitsPerPx;
    const order = places.map((p, i) => ({ p, i })).sort((a, b) =>
      b.p.trips.length - a.p.trips.length || a.p.place.nazev.localeCompare(b.p.place.nazev, "cs"));
    const labels = layoutLabels(order.map(({ p, i }) => ({ x: p.x, y: p.y, r: radius[i]!, text: p.place.nazev })), font, crop);
    out.push(`<g class="vz-labels" font-size="${font.toFixed(2)}" stroke-width="${(3 * unitsPerPx).toFixed(2)}" aria-hidden="true">` +
      labels.map((l) => `<text x="${l.x.toFixed(2)}" y="${l.y.toFixed(2)}" text-anchor="${l.anchor}">${esc(l.text)}</text>`).join("") + "</g>");
  }
  out.push("</svg>");
  el.innerHTML = out.join("");
  const svg = el.querySelector("svg")!;
  if (opts.animate && previous && previous !== crop.join(" ") && !reducedMotion() && !document.hidden) {
    animateViewBox(svg, previous.split(/\s+/u).map(Number), crop);
  }

  const bound = state.has(el);
  state.set(el, opts);
  if (bound) return;
  bindTips(el, (t) => {
    const o = state.get(el)!;
    if (t.dataset.code) return o.countryTip(t.dataset.code);
    const p = o.places?.[Number(t.dataset.place)];
    return p && o.placeTip ? o.placeTip(p) : "";
  });
  el.addEventListener("click", (e) => {
    const o = state.get(el)!;
    const t = (e.target as Element).closest<SVGElement>("[data-code]");
    if (t?.dataset.code && o.onCountry) o.onCountry(t.dataset.code);
  });
  el.addEventListener("keydown", (e) => {
    const o = state.get(el)!;
    const t = (e.target as Element).closest<SVGElement>("[data-code]");
    if (t?.dataset.code && o.onCountry && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      o.onCountry(t.dataset.code);
    }
  });
}

/** Poměr stran celé mapy. Přehled ho drží i v přiblížení, aby mapa neměnila výšku. */
export const MAP_ASPECT = MAP.width / MAP.height;

/** Výřez mapy kolem států a bodů v daném poměru stran (výchozí 4 : 3) a s nejmenší šířkou (výchozí 240 jednotek). */
export function cropFor(codes: string[], points: { x: number; y: number }[] = [], aspect = 4 / 3, minWidth = 240): [number, number, number, number] {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  for (const code of codes) {
    const b = MAP.bbox[code];
    if (b) xs.push(b[0]!, b[2]!), ys.push(b[1]!, b[3]!);
  }
  if (!xs.length) return [0, 0, MAP.width, MAP.height];
  const x1 = Math.min(...xs), x2 = Math.max(...xs), y1 = Math.min(...ys), y2 = Math.max(...ys);
  let w = Math.max(minWidth, (x2 - x1) * 1.25);
  let h = Math.max(minWidth / aspect, (y2 - y1) * 1.25);
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  // Výřez se drží uvnitř mapy, pokud se do ní vejde (bez prázdného okraje u Portugalska nebo Norska).
  const fit = (start: number, size: number, max: number) => (size >= max ? (max - size) / 2 : Math.min(Math.max(start, 0), max - size));
  const x = fit((x1 + x2) / 2 - w / 2, w, MAP.width);
  const y = fit((y1 + y2) / 2 - h / 2, h, MAP.height);
  return [Math.round(x), Math.round(y), Math.round(w), Math.round(h)];
}

export const hasMapShape = (code: string) => code in MAP.countries;
