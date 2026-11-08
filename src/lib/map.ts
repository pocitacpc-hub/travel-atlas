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
}

const state = new WeakMap<HTMLElement, MapOptions>();

export function renderMap(el: HTMLElement, opts: MapOptions): void {
  const crop = opts.crop ?? [0, 0, MAP.width, MAP.height];
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
  (opts.places ?? []).forEach((p, i) => {
    const r = opts.placeR ? opts.placeR(p) : 4;
    out.push(`<circle class="vz-place${p.place.presnost === "oblast" ? " is-region" : ""}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" data-tip data-place="${i}"/>`);
  });
  out.push("</svg>");
  el.innerHTML = out.join("");

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

/** Výřez mapy kolem států a bodů v poměru 4 : 3, nejméně 240 × 180 jednotek. */
export function cropFor(codes: string[], points: { x: number; y: number }[] = []): [number, number, number, number] {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  for (const code of codes) {
    const b = MAP.bbox[code];
    if (b) xs.push(b[0]!, b[2]!), ys.push(b[1]!, b[3]!);
  }
  if (!xs.length) return [0, 0, MAP.width, MAP.height];
  const x1 = Math.min(...xs), x2 = Math.max(...xs), y1 = Math.min(...ys), y2 = Math.max(...ys);
  let w = Math.max(240, (x2 - x1) * 1.35);
  let h = Math.max(180, (y2 - y1) * 1.35);
  if (w / h > 4 / 3) h = (w * 3) / 4;
  else w = (h * 4) / 3;
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  return [Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h)];
}

export const hasMapShape = (code: string) => code in MAP.countries;
