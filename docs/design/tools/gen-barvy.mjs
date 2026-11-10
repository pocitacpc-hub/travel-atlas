// Barevné návrhy úvodní stránky: 10 vzhledů nad stejným obsahem (docs/design/barvy/).
// Použití: node docs/design/tools/gen-barvy.mjs <prehled-dom.html> [--jen-kontrola]
//   <prehled-dom.html> = outerHTML prvku .wrap z vykresleného Přehledu (viz dump-dom.mjs).
// Skript ověří kontrasty a čitelnost páru Česko / zahraničí pro barvoslepé a zapíše stránky.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'barvy');
const [domPath, flag] = process.argv.slice(2);
const onlyCheck = flag === '--jen-kontrola';

// ---------------------------------------------------------------- návrhy
const SANS = '"Segoe UI", system-ui, -apple-system, sans-serif';
const SANS_VAR = '"Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif';

const NAVRHY = [
  {
    file: '00-soucasny.html', name: 'Současný stav', idea: 'Dnešní vzhled Atlas pro srovnání: teplý papír, tyrkys a okr, Georgia.',
    fonts: 'Georgia + Segoe UI', foto: null, t: {},
  },
  {
    file: '01-atlantik.html', name: 'Atlantik', idea: 'Barvy z fotky útesů: hluboká oceánská modrá, pískovec a světlý písek.',
    fonts: 'Sitka + Segoe UI Variable', foto: 'pruh', obr: 1,
    t: {
      paper: '#F5F2EA', card: '#FCFBF7', ink: '#0F2A3A', 'ink-2': '#34505E', muted: '#556A75', line: '#D8D3C6', 'line-2': '#E7E3D9', land: '#E5E0D4',
      cz: '#1D6E9E', 'cz-text': '#185F8A', abroad: '#C2703A', q1: '#C2DAE7', q2: '#8DBBD5', q3: '#4D93BD', q4: '#1D6E9E', q5: '#0D4466', 'q-ink': '#08263A',
      hover: 'rgba(15, 42, 58, .06)', track: '#E9E4D8', grid: '#E3DED2', 'grid-base': '#B9B2A2', kicker: 'var(--cz-text)',
      serif: '"Sitka Display", "Sitka Text", Georgia, serif', sans: SANS_VAR,
      'brand-font': '"Sitka Banner", "Sitka Display", Georgia, serif', 'brand-style': 'normal', 'brand-weight': '600', 'foto-h': '220px',
    },
    css: `.intro h1 { font-size: 56px; }`,
  },
  {
    file: '02-stezka.html', name: 'Pobřežní stezka', idea: 'Šalvějová zeleň porostu nad útesy, písek a mořská modrá pro zahraničí.',
    fonts: 'Constantia + Corbel', foto: 'uvod', obr: 2,
    t: {
      paper: '#F1F1E8', card: '#FAFAF4', ink: '#1E2A21', 'ink-2': '#3E4C41', muted: '#58655A', line: '#D4D6C6', 'line-2': '#E3E5D8', land: '#E1E1D3',
      cz: '#4A7B3B', 'cz-text': '#3F6B32', abroad: '#2D78A8', q1: '#D0E1C3', q2: '#A7C793', q3: '#76A564', q4: '#4A7B3B', q5: '#2B4F22', 'q-ink': '#142410',
      hover: 'rgba(30, 42, 33, .06)', track: '#E7E8DA', grid: '#E0E1D2', 'grid-base': '#B5B8A2',
      serif: 'Constantia, "Sitka Text", Georgia, serif', sans: 'Corbel, "Segoe UI", system-ui, sans-serif',
      'r-panel': '14px', 'r-card': '14px',
    },
    css: `body { font-size: 16px; }
.card .stamp { border-style: solid; border-color: var(--cz); color: var(--cz-text); }`,
  },
  {
    file: '03-terakota.html', name: 'Terakota', idea: 'Teplý západ slunce: pálená hlína, krémový papír a tmavý petrolej.',
    fonts: 'Palatino + Segoe UI', foto: 'kruh', obr: 2,
    t: {
      paper: '#F7EFE5', card: '#FFF9F2', ink: '#2B1E18', 'ink-2': '#4F3E35', muted: '#6B594F', line: '#E4D3C2', 'line-2': '#EFE3D5', land: '#EBE0D3',
      cz: '#2E7A72', 'cz-text': '#286A63', abroad: '#B8502C', q1: '#F3CDB6', q2: '#E5A07D', q3: '#D07550', q4: '#B8502C', q5: '#7C3118', 'q-ink': '#3A160A',
      hover: 'rgba(43, 30, 24, .06)', track: '#EFE3D4', grid: '#EADBCB', 'grid-base': '#C4AF9C',
      accent: '#B8502C', 'nav-on-bg': '#9E4426', 'nav-on-fg': '#FFF8F2', stamp: '#9E4426', kicker: '#9E4426',
      serif: '"Palatino Linotype", "Book Antiqua", Palatino, serif', sans: SANS,
    },
    css: `.intro h1 { font-size: 56px; }
.vz-visited { stroke: var(--card); }`,
  },
  {
    file: '04-namorni-mapa.html', name: 'Námořní mapa', idea: 'Navigační mapa: modrobílé moře, okrová pevnina, signální oranžová a technické písmo.',
    fonts: 'Bahnschrift + Segoe UI Variable', foto: 'pruh', obr: 1,
    t: {
      paper: '#EDF2F3', card: '#F6FAFB', ink: '#13263A', 'ink-2': '#34495C', muted: '#526678', line: '#C9D6DC', 'line-2': '#DCE6EA', land: '#EBE3C9',
      cz: '#2A6CA3', 'cz-text': '#245F90', abroad: '#D2611C', q1: '#C3D9EA', q2: '#8FBBDB', q3: '#5594C4', q4: '#2A6CA3', q5: '#163F66', 'q-ink': '#0B2236',
      hover: 'rgba(19, 38, 58, .06)', track: '#DFE8EC', grid: '#D7E2E7', 'grid-base': '#A9BBC5', accent: '#C2561A', kicker: 'var(--cz-text)',
      serif: 'Bahnschrift, "DIN Alternate", "Segoe UI", sans-serif', sans: SANS_VAR,
      'brand-font': 'Bahnschrift, "Segoe UI", sans-serif', 'brand-style': 'normal', 'brand-weight': '600', 'h-track': '0px',
      'r-panel': '6px', 'r-card': '6px', 'r-pill': '6px', 'r-code': '3px', 'foto-h': '160px',
    },
    css: `.intro h1, h2.sec, .facts dd, .card h3, .country h2 { font-stretch: semi-condensed; }
.facts dd { font-variant-numeric: tabular-nums; }
.brand b { font-size: 19px; letter-spacing: .16em; text-transform: uppercase; }
.intro h1 em { font-style: normal; }
.map { background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px); background-size: 50px 50px; background-position: -1px -1px; }
.card .stamp { border-style: solid; border-radius: 3px; transform: none; width: 40px; height: 26px; }`,
  },
  {
    file: '05-nocni-ocean.html', name: 'Noční oceán', idea: 'Tmavý vzhled: noční moře, tyrkysové světlo a teplý písek. Může být i základem tmavého režimu.',
    fonts: 'Cambria + Segoe UI', foto: 'zahlavi', obr: 2,
    t: {
      paper: '#0D1A24', card: '#13232F', ink: '#E6EDF1', 'ink-2': '#B8C7D1', muted: '#8FA2AF', line: '#253A4A', 'line-2': '#1C3040', land: '#1F3443',
      cz: '#3CBFAE', 'cz-text': '#5ED3C3', abroad: '#E9A55B', q1: '#1F4E56', q2: '#237370', q3: '#2D9A8E', q4: '#3CBFAE', q5: '#8FE5D8', 'q-ink': '#08201C',
      hover: 'rgba(255, 255, 255, .06)', track: '#1E3241', grid: '#20374A', 'grid-base': '#3B566B',
      'mark-ring': 'rgba(255, 255, 255, .14)', 'flag-ring': 'rgba(255, 255, 255, .22)', 'tip-shadow': '0 6px 20px rgba(0, 0, 0, .5)',
      accent: 'var(--cz-text)', serif: 'Cambria, "Sitka Text", Georgia, serif', sans: SANS,
    },
    css: `html { color-scheme: dark; }
[data-foto="zahlavi"] .top .foto::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13, 26, 36, .78) 0%, rgba(13, 26, 36, .2) 45%, rgba(13, 26, 36, .55) 80%, var(--paper) 100%); }
[data-foto="zahlavi"] .top .foto figcaption { z-index: 1; }
.top .brand b, .top nav a { color: #fff; }
.top .brand span { color: rgba(255, 255, 255, .8); }`,
  },
  {
    file: '06-denik.html', name: 'Cestovní deník', idea: 'Zápisník z cest: krémový papír, inkoustová modrá, rezavé akcenty, ručně psaný nadtitulek a fotka jako polaroid.',
    fonts: 'Palatino + Segoe UI + Ink Free', foto: 'polaroid', obr: 1,
    t: {
      paper: '#F2EADB', card: '#FBF6EB', ink: '#2E2419', 'ink-2': '#4E4133', muted: '#6B5D4C', line: '#DCCDB4', 'line-2': '#E9DFCB', land: '#E7DCC6',
      cz: '#2D5C88', 'cz-text': '#2A5781', abroad: '#B5613A', q1: '#C9D5E2', q2: '#9AB2CB', q3: '#6288AE', q4: '#2D5C88', q5: '#1B3A57', 'q-ink': '#08182A',
      hover: 'rgba(46, 36, 25, .06)', track: '#E8DECB', grid: '#E2D6C1', 'grid-base': '#BBAA8E',
      accent: '#A5532F', kicker: '#9A4A28',
      serif: '"Palatino Linotype", "Book Antiqua", Palatino, serif', sans: SANS,
    },
    css: `.intro h1 { font-size: 56px; }
.kicker { font: 19px/1.3 "Ink Free", "Segoe Print", cursive; letter-spacing: 0; text-transform: none; }
/* fotka bez popisku */
.foto figcaption { display: none; }
[data-foto="polaroid"] .foto { padding-bottom: 24px; }
/* vlajky pod fotkou přes celou šířku sloupce */
.flagrow { clear: both; display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px; }
.flagrow button { display: grid; place-items: center; }
/* karty posledních cest: vlajka vpravo nahoře místo razítka s kódem */
.card .stamp { display: none; }
.card .cty .fi { position: absolute; top: 18px; right: 18px; margin: 0; font-size: 26px; }`,
  },
  {
    file: '07-plakat.html', name: 'Cestovní plakát', idea: 'Retro plakát: syté barvy, tlustá kontura, verzálky a výrazné slunečné žluté akcenty.',
    fonts: 'Gill Sans MT', foto: 'pruh', obr: 2,
    t: {
      paper: '#F5EEDF', card: '#FFFAF0', ink: '#1A2238', 'ink-2': '#39415A', muted: '#565D70', line: '#DCCFB6', 'line-2': '#EAE1CF', land: '#E9E0CC',
      cz: '#1E5FA8', 'cz-text': '#1B5596', abroad: '#D45A22', q1: '#C5D7EE', q2: '#8FB3E0', q3: '#4F86C6', q4: '#1E5FA8', q5: '#123D70', 'q-ink': '#0A2242',
      hover: 'rgba(26, 34, 56, .07)', track: '#EAE1CF', grid: '#E3D8C2', 'grid-base': '#B3A588',
      accent: '#D45A22', 'nav-on-bg': '#F2B33D', 'nav-on-fg': '#1A2238', 'nav-fg': '#EDE6D6', stamp: 'var(--ink)',
      serif: '"Gill Sans MT", "Gill Sans", "Segoe UI", sans-serif', sans: '"Gill Sans MT", "Gill Sans", "Segoe UI", sans-serif',
      'brand-font': '"Gill Sans MT", "Gill Sans", sans-serif', 'brand-style': 'normal', 'brand-weight': '700',
      'h-weight': '700', 'h-case': 'uppercase', 'h-track': '.01em', bw: '2px',
      'r-panel': '4px', 'r-card': '4px', 'r-pill': '4px', 'r-code': '2px',
      shadow: '5px 5px 0 var(--ink)', 'shadow-hover': '7px 7px 0 var(--ink)', 'foto-r': '4px', 'foto-filter': 'saturate(1.15) contrast(1.05)', 'foto-pos': '50% 28%', 'foto-h': '240px',
    },
    css: `body { font-size: 16px; }
.top { margin: 0 -28px; padding: 18px 28px; background: var(--ink); border-bottom: 0; }
.brand b { color: #F2B33D; font-size: 24px; letter-spacing: .12em; text-transform: uppercase; }
.brand span { color: #C9C3B5; }
.panel, .card { border-color: var(--ink); }
.facts, .facts div { border-color: var(--ink); }
.intro h1 { font-size: 54px; line-height: 1; }
.intro h1 em { font-style: normal; }
.card h3 { font-size: 19px; line-height: 1.15; }
.card .stamp { border: 0; background: #F2B33D; color: var(--ink); transform: rotate(-8deg); }
[data-foto="pruh"] .foto { border: 2px solid var(--ink); box-shadow: 5px 5px 0 var(--ink); margin-right: 5px; }
@media (max-width: 760px) { .top { margin: 0 -16px; padding: 14px 16px; } }`,
  },
  {
    file: '08-minimal.html', name: 'Čistý minimal', idea: 'Bílé plochy, jedno písmo bez patek, kobaltová a oranžová, jemné stíny místo papíru.',
    fonts: 'Segoe UI Variable', foto: 'uvod', obr: 1,
    t: {
      paper: '#F3F4F6', card: '#FFFFFF', ink: '#111418', 'ink-2': '#3B4249', muted: '#5E6670', line: '#E0E3E7', 'line-2': '#ECEEF1', land: '#E5E8EC',
      cz: '#2A58C2', 'cz-text': '#2450B3', abroad: '#DE6410', q1: '#D2DDF6', q2: '#A3BAEC', q3: '#6A8EDC', q4: '#2A58C2', q5: '#183888', 'q-ink': '#0B1D4D',
      hover: 'rgba(17, 20, 24, .05)', track: '#ECEEF1', grid: '#ECEEF1', 'grid-base': '#C5CAD1',
      serif: '"Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif', sans: SANS_VAR,
      'brand-font': '"Segoe UI Variable Display", "Segoe UI", sans-serif', 'brand-style': 'normal', 'brand-weight': '700',
      'h-weight': '600', 'h-track': '-1.2px', 'r-panel': '12px', 'r-card': '12px', 'r-pill': '10px', 'foto-r': '12px',
      shadow: '0 1px 2px rgba(17, 20, 24, .05)', 'shadow-hover': '0 4px 14px rgba(17, 20, 24, .08)',
    },
    css: `.brand b { font-size: 22px; letter-spacing: -.3px; }
.intro h1 em { font-style: normal; }
.facts dd { font-weight: 600; letter-spacing: -.5px; }
.card .stamp { width: auto; height: auto; padding: 2px 8px; border: 0; border-radius: 6px; background: var(--line-2); color: var(--ink-2); font-size: 12px; transform: none; }`,
  },
  {
    file: '09-azulejo.html', name: 'Azulejo', idea: 'Portugalské kachličky: kobaltová na bílé, citronově žlutý detail a dlaždicový vzor.',
    fonts: 'Century + Candara', foto: 'pruh', obr: 2,
    t: {
      paper: '#F5F7FB', card: '#FFFFFF', ink: '#142240', 'ink-2': '#33436A', muted: '#55617E', line: '#D2DAEA', 'line-2': '#E3E8F2', land: '#E4E8F0',
      cz: '#1F4FA0', 'cz-text': '#1F4FA0', abroad: '#C27310', q1: '#CAD8F0', q2: '#95B1E0', q3: '#5682C8', q4: '#1F4FA0', q5: '#12326B', 'q-ink': '#0A1E44',
      hover: 'rgba(20, 34, 64, .05)', track: '#E6EBF4', grid: '#E3E8F2', 'grid-base': '#B3BFD6',
      'nav-on-bg': '#1F4FA0', 'nav-on-fg': '#FFFFFF', stamp: '#1F4FA0', kicker: 'var(--cz-text)',
      serif: 'Century, "Century Schoolbook", "Bookman Old Style", Georgia, serif', sans: 'Candara, "Segoe UI", system-ui, sans-serif',
      'brand-weight': '400', 'r-panel': '10px', 'r-card': '10px', 'foto-r': '10px', 'foto-h': '210px', 'foto-pos': '50% 30%',
    },
    css: `:root { --tile: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23fff'/%3E%3Cpath d='M16 3 29 16 16 29 3 16Z' fill='none' stroke='%231f4fa0' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='5.5' fill='%231f4fa0'/%3E%3Ccircle cx='16' cy='16' r='2' fill='%23e2b13c'/%3E%3Cpath d='M0 0h7v2H2v5H0zM32 0h-7v2h5v5h2zM0 32h7v-2H2v-5H0zM32 32h-7v-2h5v-5h2z' fill='%231f4fa0'/%3E%3C/svg%3E"); }
body { font-size: 16px; }
.top { position: relative; border-bottom: 0; padding-bottom: 30px; }
.top::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 16px; background: var(--tile) 0 0 / 16px 16px; opacity: .9; }
.brand b { font-size: 28px; }
.card .stamp { border: 2px solid var(--stamp); box-shadow: inset 0 0 0 3px var(--card), inset 0 0 0 4px #E2B13C; }
[data-foto="pruh"] .foto { padding: 8px; background: var(--tile) 0 0 / 16px 16px; }
[data-foto="pruh"] .foto img { border-radius: 4px; }
[data-foto="pruh"] .foto figcaption { left: 22px; bottom: 18px; }`,
  },
  {
    file: '10-mlha.html', name: 'Mlha nad útesy', idea: 'Tlumené ranní barvy: šedomodrá, mořská zeleň a prašná hlína, lehké písmo a měkké stíny.',
    fonts: 'Candara Light + Segoe UI Variable', foto: 'uvod', obr: 2,
    t: {
      paper: '#ECEFEF', card: '#F8F9F9', ink: '#23303A', 'ink-2': '#44525C', muted: '#5A6770', line: '#D2D9DB', 'line-2': '#E1E6E7', land: '#DEE3E2',
      cz: '#40858A', 'cz-text': '#33706F', abroad: '#B26D4E', q1: '#C6DCDC', q2: '#9AC1C2', q3: '#69A1A4', q4: '#40858A', q5: '#275658', 'q-ink': '#0F2A2B',
      hover: 'rgba(35, 48, 58, .05)', track: '#E1E6E7', grid: '#E0E5E6', 'grid-base': '#B6C0C3',
      serif: '"Candara Light", Candara, "Segoe UI", sans-serif', sans: SANS_VAR,
      'brand-font': 'Candara, "Segoe UI", sans-serif', 'brand-style': 'normal', 'brand-weight': '400', 'h-weight': '300', 'h-track': '-.5px',
      'r-panel': '22px', 'r-card': '20px', 'foto-r': '22px', 'foto-filter': 'saturate(.8) brightness(1.04)',
      shadow: '0 1px 3px rgba(35, 48, 58, .06), 0 8px 24px rgba(35, 48, 58, .05)', 'shadow-hover': '0 2px 6px rgba(35, 48, 58, .08), 0 12px 30px rgba(35, 48, 58, .08)',
    },
    css: `.panel, .card { border-color: transparent; }
.card:hover { border-color: transparent; }
.brand b { font-size: 26px; letter-spacing: .02em; }
.intro h1 { font-size: 60px; }
.intro h1 em { font-style: normal; font-weight: 400; }
.facts dd { font-size: 30px; }
[data-foto="uvod"] .foto { -webkit-mask-image: linear-gradient(#000 55%, transparent); mask-image: linear-gradient(#000 55%, transparent); background: none; }
[data-foto="uvod"] .foto figcaption { top: 10px; bottom: auto; }`,
  },
];

// ---------------------------------------------------------------- kontrola barev
const BASE = {
  paper: '#F4EFE4', card: '#FBF8F2', ink: '#1E2B33', 'ink-2': '#44515A', muted: '#5B666E', line: '#DCD3C1', land: '#E6DFD2',
  cz: '#00897B', 'cz-text': '#00766A', abroad: '#C0682A', q1: '#A8D5CB', q5: '#0A5A51',
};
const hex = h => { const m = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16) / 255); };
const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = h => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
const lab = rgbLin => {
  const [r, g, b] = rgbLin.map(v => Math.min(1, Math.max(0, v)));
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
const dE = (a, b, m) => {
  const sim = h => { const c = hex(h).map(lin); return m ? m.map(row => row[0] * c[0] + row[1] * c[1] + row[2] * c[2]) : c; };
  const [p, q] = [lab(sim(a)), lab(sim(b))];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};
const resolve = (t, k) => { let v = t[k] ?? BASE[k]; while (typeof v === 'string' && v.startsWith('var(--')) v = t[v.slice(6, -1)] ?? BASE[v.slice(6, -1)]; return v; };

let failures = 0;
console.log('návrh'.padEnd(18), 'ink  ink2 muted/k odkaz ČR/k  zahr/k akcent nav  q1/zem | ΔE ČR×zahr: běžně prot deut trit');
for (const n of NAVRHY) {
  const t = n.t, g = k => resolve(t, k);
  const accent = g('accent') ?? g('cz'), navBg = g('nav-on-bg') ?? g('ink'), navFg = g('nav-on-fg') ?? g('paper'), link = g('cz-text');
  const checks = [
    [ratio(g('ink'), g('paper')), 7], [ratio(g('ink-2'), g('paper')), 4.5], [Math.min(ratio(g('muted'), g('card')), ratio(g('muted'), g('paper'))), 4.5],
    [ratio(link, g('card')), 4.5], [ratio(g('cz'), g('card')), 3], [ratio(g('abroad'), g('card')), 3], [ratio(accent, g('paper')), 3], [ratio(navFg, navBg), 4.5],
    [ratio(g('q1'), g('land')), 0],
  ];
  const de = [null, CVD.protan, CVD.deutan, CVD.tritan].map(m => dE(g('cz'), g('abroad'), m));
  const bad = checks.filter(([v, min]) => v < min).length + de.slice(1, 3).filter(v => v < 10).length;
  failures += bad;
  console.log(n.name.padEnd(18), checks.map(([v, min]) => (v.toFixed(1) + (v < min ? '!' : ' ')).padEnd(5)).join(' '), '|', de.map(v => v.toFixed(1).padStart(5)).join(' '), bad ? '  ← ZKONTROLOVAT' : '');
}
if (onlyCheck) process.exit(failures ? 1 : 0);

// ---------------------------------------------------------------- stránky
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
let dom = readFileSync(domPath, 'utf8')
  .replace(/<noscript>[\s\S]*?<\/noscript>\s*/, '')
  .replace(/<svg class="vz-chart" width="(\d+)" height="(\d+)"/, '<svg class="vz-chart" viewBox="0 0 $1 $2"');
mkdirSync(join(out, 'assets'), { recursive: true });
const list = NAVRHY.map(n => [n.file, n.name]);
writeFileSync(join(out, 'assets', 'prehled.js'), `// Vygenerováno skriptem docs/design/tools/gen-barvy.mjs – neupravovat ručně.
// Obsah = vykreslený Přehled webu (stejná data, mapa a texty). Návrh mění jen CSS proměnné.
(function () {
  var NAVRHY = ${JSON.stringify(list)};
  var HTML = ${JSON.stringify(dom)};
  var b = document.body, d = b.dataset;
  b.insertAdjacentHTML('afterbegin', HTML);
  if (d.foto) {
    var n = d.obr || '1';
    var fig = '<figure class="foto"><img src="img/pobrezi-' + n + '-1600.jpg" srcset="img/pobrezi-' + n + '-800.jpg 800w, img/pobrezi-' + n + '-1600.jpg 1600w" sizes="(max-width: 760px) 100vw, 1320px" alt="Skalnaté útesy nad oceánem s malou písečnou pláží"><figcaption>Portugalsko · Atlantské pobřeží</figcaption></figure>';
    var top = document.querySelector('.top');
    if (d.foto === 'pruh') top.insertAdjacentHTML('afterend', fig);
    else if (d.foto === 'zahlavi') top.insertAdjacentHTML('afterbegin', fig);
    else document.querySelector('.intro').insertAdjacentHTML('afterbegin', fig);
  }
  document.querySelector('.wrap').addEventListener('click', function (e) { if (e.target.closest('a, button')) e.preventDefault(); });
  if (window.self !== window.top) return;
  var file = location.pathname.split('/').pop(), i = NAVRHY.findIndex(function (x) { return x[0] === file; });
  var prev = NAVRHY[(i - 1 + NAVRHY.length) % NAVRHY.length], next = NAVRHY[(i + 1) % NAVRHY.length];
  b.insertAdjacentHTML('afterbegin', '<div class="navrh-lista"><b>' + (i ? 'Návrh ' + i + ' / ' + (NAVRHY.length - 1) : 'Výchozí stav') + ' · ' + NAVRHY[i][1] + '</b><span>' + (d.pismo || '') + '</span>' +
    '<nav aria-label="Návrhy"><a href="' + prev[0] + '">← ' + prev[1] + '</a><a href="index.html">Všechny návrhy</a><a href="' + next[0] + '">' + next[1] + ' →</a></nav></div>');
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') location.href = prev[0];
    if (e.key === 'ArrowRight') location.href = next[0];
  });
})();
`);

const tokens = t => Object.entries(t).map(([k, v]) => `  --${k}: ${v};`).join('\n');
for (const n of NAVRHY) {
  writeFileSync(join(out, n.file), `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${n.name} · barevný návrh · Cestovní atlas</title>
  <meta name="description" content="${esc(n.idea)}">
  <link rel="stylesheet" href="../v2/assets/flag-icons/flag-icons.css">
  <link rel="stylesheet" href="assets/zaklad.css">
  <style>
/* ${n.name}: ${n.idea}
   Písmo: ${n.fonts}. */
${Object.keys(n.t).length ? `:root {\n${tokens(n.t)}\n}` : '/* bez změn – výchozí hodnoty ze zaklad.css */'}
${n.css || ''}
  </style>
</head>
<body${n.foto ? ` data-foto="${n.foto}" data-obr="${n.obr}"` : ''} data-pismo="${esc(n.fonts)}">
  <script src="assets/prehled.js"></script>
</body>
</html>
`);
}

// rozcestník
const sw = n => ['paper', 'card', 'ink', 'cz', 'abroad', 'q1', 'q2', 'q3', 'q4', 'q5', 'land'].map(k => `<i style="background:${resolve(n.t, k) ?? (k.startsWith('q') ? { q2: '#79BFB2', q3: '#3FA393', q4: '#00897B' }[k] : BASE[k])}" title="--${k}"></i>`).join('');
const cards = NAVRHY.map((n, i) => `    <a class="nv" href="${n.file}">
      <div class="shot"><iframe src="${n.file}" title="Náhled: ${esc(n.name)}" loading="lazy" tabindex="-1" aria-hidden="true"></iframe></div>
      <div class="txt">
        <h2><span>${String(i).padStart(2, '0')}</span> ${n.name}</h2>
        <p>${n.idea}</p>
        <p class="sw">${sw(n)}</p>
        <p class="meta">Písmo: ${n.fonts}${n.foto ? ` · fotka: ${{ pruh: 'pruh pod hlavičkou', uvod: 'nad nadpisem', kruh: 'kruhový výřez', polaroid: 'polaroid', zahlavi: 'pozadí hlavičky' }[n.foto]}` : ''}</p>
      </div>
    </a>`).join('\n');
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Barevné návrhy · Cestovní atlas</title>
  <style>
:root { --bg: #EEEEEC; --fg: #1B1B1B; --mut: #5F5F5F; --card: #FFF; --line: #DDDDD8; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 "Segoe UI", system-ui, sans-serif; }
.wrap { max-width: 1500px; margin: 0 auto; padding: 28px 28px 48px; }
h1 { margin: 0; font-size: 28px; font-weight: 600; }
.lead { max-width: 60em; margin: 6px 0 24px; color: var(--mut); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 20px; }
.nv { display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: var(--card); color: inherit; text-decoration: none; }
.nv:hover { border-color: #888; box-shadow: 0 6px 20px rgba(0, 0, 0, .08); }
.shot { position: relative; aspect-ratio: 1440 / 900; overflow: hidden; border-bottom: 1px solid var(--line); }
.shot iframe { position: absolute; top: 0; left: 0; width: 1440px; height: 900px; border: 0; transform-origin: 0 0; pointer-events: none; }
.txt { padding: 12px 16px 14px; }
.txt h2 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
.txt h2 span { color: var(--mut); font-weight: 400; }
.txt p { margin: 0 0 8px; }
.sw { display: flex; gap: 0; }
.sw i { flex: 1; height: 16px; }
.sw i:first-child { border-radius: 4px 0 0 4px; } .sw i:last-child { border-radius: 0 4px 4px 0; }
.meta { color: var(--mut); font-size: 13px; }
@media (max-width: 760px) { .wrap { padding: 20px 16px 40px; } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main class="wrap">
    <h1>Barevné návrhy úvodní stránky</h1>
    <p class="lead">Všechny návrhy mají stejný obsah a rozložení jako dnešní Přehled. Mění se jen barvy, písma, tvary a malá fotka. Klikněte na návrh; v něm se dá přepínat šipkami ← →.</p>
    <div class="grid">
${cards}
    </div>
  </main>
  <script>
    function fit() { document.querySelectorAll('.shot').forEach(function (s) { s.firstElementChild.style.transform = 'scale(' + s.clientWidth / 1440 + ')'; }); }
    addEventListener('resize', fit); fit();
  </script>
</body>
</html>
`);
console.log(`Zapsáno ${NAVRHY.length} stránek + rozcestník do ${out}`);
