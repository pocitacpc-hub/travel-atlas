// Pomocné funkce pro DOM: prvky, URL, vlajky, tooltip a překreslení grafů při změně šířky.
import { esc, shortName } from "./format";
import { countryName } from "./data";
import type { Trip } from "./model";

export function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Na stránce chybí prvek #${id}.`);
  return el as T;
}

export const param = (name: string) => new URLSearchParams(location.search).get(name);
export const tripUrl = (t: Trip) => `cesta.html?id=${encodeURIComponent(t.id)}`;
export const tripName = (t: Trip) => shortName(t.nazev, countryName(t.zeme));
export const sideClass = (t: Trip) => (t.zeme === "CZ" ? "is-cz" : "is-abroad");

/** Vlajka je dekorace vedle názvu státu, proto aria-hidden. Kód je ověřené ISO alfa-2. */
export const flag = (code: string) => `<span class="fi fi-${esc(code.toLowerCase())}" aria-hidden="true"></span>`;


// ---------- tooltip ----------
let tipEl: HTMLDivElement | null = null;

function showTip(html: string, x: number, y: number): void {
  if (!tipEl) {
    tipEl = document.createElement("div");
    tipEl.className = "vz-tip";
    tipEl.setAttribute("role", "status");
    document.body.appendChild(tipEl);
  }
  tipEl.innerHTML = html;
  tipEl.style.display = "block";
  const r = tipEl.getBoundingClientRect();
  let left = x + 14;
  let top = y + 14;
  if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
  if (top + r.height > window.innerHeight - 8) top = y - r.height - 14;
  tipEl.style.left = `${Math.max(8, left)}px`;
  tipEl.style.top = `${Math.max(8, top)}px`;
}

export function hideTip(): void {
  if (tipEl) tipEl.style.display = "none";
}

/** Tooltip pro prvky s atributem data-tip uvnitř root: při najetí myší i při fokusu. */
export function bindTips(root: HTMLElement, html: (target: HTMLElement) => string): void {
  const target = (e: Event) => {
    const t = (e.target as Element | null)?.closest<HTMLElement>("[data-tip]");
    return t && root.contains(t) ? t : null;
  };
  root.addEventListener("pointermove", (e) => {
    const t = target(e);
    if (t) showTip(html(t), e.clientX, e.clientY);
    else hideTip();
  });
  root.addEventListener("pointerleave", hideTip);
  root.addEventListener("focusin", (e) => {
    const t = target(e);
    if (!t) return;
    const r = t.getBoundingClientRect();
    showTip(html(t), r.left + r.width / 2, r.top + r.height / 2);
  });
  root.addEventListener("focusout", hideTip);
  window.addEventListener("scroll", hideTip, { passive: true });
}

/** Vykreslí graf a při změně šířky prvku ho překreslí. */
export function mountChart(el: HTMLElement, draw: () => void): void {
  draw();
  let width = el.clientWidth;
  new ResizeObserver(() => {
    if (el.clientWidth !== width) {
      width = el.clientWidth;
      draw();
    }
  }).observe(el);
}
