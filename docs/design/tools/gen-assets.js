// Generuje podklady pro UI makety: mapu Evropy (SVG cesty) a veřejná pole cest.
// Použití: node gen-assets.js <export.md> <geo node_modules dir> <out dir>
const fs = require("fs");
const path = require("path");
const [exportPath, geoDir, outDir] = process.argv.slice(2);
const topojson = require(path.join(geoDir, "topojson-client"));
const topo = JSON.parse(fs.readFileSync(path.join(geoDir, "world-atlas", "countries-50m.json"), "utf8"));

// ---------- Projekce: Lambertova azimutální stejnoplochá, střed Evropy ----------
const rad = Math.PI / 180;
const LON0 = 10, LAT0 = 49;
function laea(lon, lat) {
  const l = (lon - LON0) * rad, p = lat * rad, p1 = LAT0 * rad;
  const k = Math.sqrt(2 / (1 + Math.sin(p1) * Math.sin(p) + Math.cos(p1) * Math.cos(p) * Math.cos(l)));
  return [k * Math.cos(p) * Math.sin(l), -k * (Math.cos(p1) * Math.sin(p) - Math.sin(p1) * Math.cos(p) * Math.cos(l))];
}
const BOX = { lonMin: -12, lonMax: 31, latMin: 34.5, latMax: 62 };
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (let i = 0; i <= 40; i++) {
  const lon = BOX.lonMin + (BOX.lonMax - BOX.lonMin) * i / 40;
  const lat = BOX.latMin + (BOX.latMax - BOX.latMin) * i / 40;
  for (const [a, b] of [[lon, BOX.latMin], [lon, BOX.latMax], [BOX.lonMin, lat], [BOX.lonMax, lat]]) {
    const [x, y] = laea(a, b);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
}
// ořez na užší výřez (bez prázdných rohů)
const W = 1000;
const S = W / (maxX - minX);
const H = Math.round((maxY - minY) * S);
const proj = (lon, lat) => { const [x, y] = laea(lon, lat); return [(x - minX) * S, (y - minY) * S]; };

const ISO = { "203": "CZ", "380": "IT", "191": "HR", "703": "SK", "724": "ES", "300": "GR", "616": "PL", "705": "SI", "040": "AT", "372": "IE", "100": "BG", "620": "PT", "578": "NO", "826": "GB", "276": "DE" };
const M = 40;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const geo = topojson.feature(topo, topo.objects.countries);
const countries = {};
let bytes = 0;
for (const f of geo.features) {
  if (!f.geometry) continue;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let d = "";
  for (const poly of polys) {
    for (const ring of poly) {
      const pts = ring.map(([lon, lat]) => proj(lon, lat));
      const inside = pts.some(([x, y]) => x > -5 && x < W + 5 && y > -5 && y < H + 5);
      if (!inside) continue;
      let last = null, seg = [];
      for (let [x, y] of pts) {
        x = clamp(x, -M, W + M); y = clamp(y, -M, H + M);
        if (last && Math.hypot(x - last[0], y - last[1]) < 1.1) continue;
        seg.push([x, y]); last = [x, y];
      }
      if (seg.length < 3) continue;
      d += "M" + seg.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + "Z";
    }
  }
  if (!d) continue;
  const key = ISO[f.id] || "n" + (f.id || f.properties.name.replace(/\W/g, ""));
  countries[key] = (countries[key] || "") + d;
  bytes += d.length;
}
const mapJs = `// Hranice států: Natural Earth 1:50m (public domain) přes balíček world-atlas.
// Projekce: Lambertova azimutální stejnoplochá, střed ${LON0}° v. d., ${LAT0}° s. š. Generováno pro UI makety.
window.EUROPE_MAP = ${JSON.stringify({ width: W, height: H, countries })};
window.EUROPE_MAP.project = function (lon, lat) {
  var r = Math.PI / 180, l = (lon - ${LON0}) * r, p = lat * r, p1 = ${LAT0} * r;
  var k = Math.sqrt(2 / (1 + Math.sin(p1) * Math.sin(p) + Math.cos(p1) * Math.cos(p) * Math.cos(l)));
  var x = k * Math.cos(p) * Math.sin(l), y = -k * (Math.cos(p1) * Math.sin(p) - Math.sin(p1) * Math.cos(p) * Math.cos(l));
  return [(x - (${minX})) * ${S}, (y - (${minY})) * ${S}];
};
`;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "europe-map.js"), mapJs);
console.log("map:", W, "x", H, "countries:", Object.keys(countries).length, "path bytes:", bytes);

// ---------- Cesty: jen pole určená ke zveřejnění ----------
const text = fs.readFileSync(exportPath, "utf8");
const re = /\n### Cesta (\d{3}): (.+?)\n/g;
const heads = []; let m;
while ((m = re.exec(text))) heads.push({ num: m[1], start: m.index, end: re.lastIndex });
const ZEME = { "Česko": "CZ", "Itálie": "IT", "Chorvatsko": "HR", "Slovensko": "SK", "Španělsko": "ES", "Řecko": "GR", "Polsko": "PL", "Slovinsko": "SI", "Rakousko": "AT", "Irsko": "IE", "Bulharsko": "BG", "Portugalsko": "PT", "Norsko": "NO", "Velká Británie": "GB", "Německo": "DE" };
const nn = v => (v === undefined || v === "null" || v === "" ? null : v);
const trips = [];
heads.forEach((h, i) => {
  const body = text.slice(h.end, i + 1 < heads.length ? heads[i + 1].start : text.length);
  const fm = /````markdown\n---\n([\s\S]*?)\n---\n/.exec(body)[1];
  const d = {};
  for (const line of fm.split("\n")) { const kv = /^([A-Za-z_0-9]+):\s*(.*)$/.exec(line); if (kv) d[kv[1]] = kv[2].trim().replace(/^"|"$/g, ""); }
  if (/nepotvrzeno/.test(d.stav_zaznamu || "")) return; // neověřený rozpočet se nezveřejňuje
  const zac = nn(d.zacatek), kon = nn(d.konec);
  const rok = zac ? +zac.slice(0, 4) : nn(d.rok) ? +d.rok : null;
  const mk = nn(d.mesic_konani);
  const mesic = zac ? +zac.slice(5, 7) : mk && !mk.endsWith("-00") ? +mk.slice(5, 7) : null;
  const presnost = zac ? "den" : mesic ? "mesic" : rok ? "rok" : "neznamy";
  const nazev = d.nazev;
  trips.push({
    id: "c" + h.num, nazev, zeme: ZEME[d.zeme], rok, mesic, zacatek: zac, konec: kon, presnost,
    noci: nn(d.pocet_noci) === null ? null : +d.pocet_noci,
    kolo: /kol[ae]|cyklo|Giro|Bike|cyklistika/i.test(nazev),
    sport: nn(d.strava_pocet_aktivit) ? { aktivit: +d.strava_pocet_aktivit, km: +d.strava_celkem_km, prevyseni: +d.strava_prevyseni_m } : null,
  });
});

// Ilustrační body míst (souřadnice obcí / oblastí z obecné znalosti) – NE ověřený číselník.
const P = (id, nazev, zeme, lat, lon, presnost, cesty) => ({ id, nazev, zeme, lat, lon, presnost, cesty: cesty.map(n => "c" + String(n).padStart(3, "0")) });
const places = [
  P("alicante", "Alicante", "ES", 38.345, -0.481, "obec", [1]),
  P("bormio", "Bormio", "IT", 46.468, 10.37, "obec", [2]),
  P("pasohlavky", "Pasohlávky", "CZ", 48.902, 16.553, "obec", [3, 60]),
  P("jaroslavice", "Jaroslavice", "CZ", 48.758, 16.233, "obec", [4]),
  P("jastrzebia", "Jastrzębia Góra", "PL", 54.83, 18.3, "obec", [5]),
  P("lednice", "Lednice", "CZ", 48.8, 16.803, "obec", [7, 60]),
  P("piran", "Piran", "SI", 45.528, 13.568, "obec", [8]),
  P("izola", "Izola", "SI", 45.539, 13.66, "obec", [8]),
  P("bled", "Bled", "SI", 46.369, 14.114, "obec", [8]),
  P("porec", "Poreč", "HR", 45.227, 13.595, "obec", [9, 18, 24]),
  P("malaga", "Málaga", "ES", 36.721, -4.421, "obec", [10]),
  P("roznov", "Rožnov pod Radhoštěm", "CZ", 49.458, 18.143, "obec", [12, 22, 28, 36, 46, 50, 69]),
  P("vir", "Vir", "HR", 44.3, 15.08, "obec", [13]),
  P("bruck", "Bruck an der Mur", "AT", 47.41, 15.27, "obec", [14]),
  P("domazlice", "Domažlice", "CZ", 49.44, 12.93, "obec", [15]),
  P("dublin", "Dublin", "IE", 53.349, -6.26, "obec", [16]),
  P("jeseniky", "Jeseníky", "CZ", 50.08, 17.2, "oblast", [6, 17, 23, 25, 39, 40, 42, 43, 49, 56, 59, 64, 66, 68, 70]),
  P("palma", "Palma", "ES", 39.57, 2.65, "obec", [19]),
  P("trojanovice", "Trojanovice", "CZ", 49.52, 18.23, "obec", [20]),
  P("porto", "Porto", "PT", 41.15, -8.611, "obec", [27]),
  P("sintra", "Sintra", "PT", 38.8, -9.38, "obec", [27]),
  P("lisboa", "Lisabon", "PT", 38.722, -9.139, "obec", [27]),
  P("murter", "Murter", "HR", 43.82, 15.59, "obec", [29]),
  P("babia-hora", "Babia hora", "SK", 49.573, 19.53, "oblast", [30]),
  P("jizerske", "Jizerské hory", "CZ", 50.82, 15.25, "oblast", [31]),
  P("tribunj", "Tribunj", "HR", 43.753, 15.748, "obec", [32]),
  P("horni-becva", "Horní Bečva", "CZ", 49.43, 18.29, "obec", [33]),
  P("sv-filip", "Sveti Filip i Jakov", "HR", 43.965, 15.43, "obec", [34]),
  P("liptovsky", "Liptovský Mikuláš", "SK", 49.083, 19.612, "obec", [35]),
  P("rychleby", "Rychlebské hory", "CZ", 50.33, 17.06, "oblast", [37, 41]),
  P("rim", "Řím", "IT", 41.902, 12.496, "obec", [38]),
  P("oslo", "Oslo", "NO", 59.914, 10.752, "obec", [44]),
  P("praha", "Praha", "CZ", 50.075, 14.437, "obec", [45, 57, 84]),
  P("martinsicuro", "Martinsicuro", "IT", 42.885, 13.915, "obec", [47, 79]),
  P("brno", "Brno", "CZ", 49.195, 16.608, "obec", [48]),
  P("breclav", "Břeclav", "CZ", 48.759, 16.882, "obec", [48]),
  P("cavallino", "Cavallino-Treporti", "IT", 45.46, 12.48, "obec", [52]),
  P("nizke-tatry", "Nízké Tatry", "SK", 48.93, 19.6, "oblast", [53, 61]),
  P("mala-fatra", "Malá Fatra", "SK", 49.2, 19.05, "oblast", [54]),
  P("londyn", "Londýn", "GB", 51.507, -0.128, "obec", [55]),
  P("fazana", "Fažana", "HR", 44.927, 13.803, "obec", [58, 87]),
  P("zlin", "Zlín", "CZ", 49.226, 17.667, "obec", [62]),
  P("olomouc", "Olomouc", "CZ", 49.594, 17.251, "obec", [63]),
  P("nitra", "Nitra", "SK", 48.307, 18.087, "obec", [65]),
  P("vranov", "Vranov nad Dyjí", "CZ", 48.893, 15.811, "obec", [67]),
  P("pec", "Pec pod Sněžkou", "CZ", 50.692, 15.733, "obec", [71]),
  P("moravka", "Morávka", "CZ", 49.6, 18.52, "obec", [72]),
  P("sarti", "Sarti", "GR", 40.09, 23.98, "obec", [73]),
  P("alba", "Alba Adriatica", "IT", 42.83, 13.93, "obec", [74]),
  P("santa-susanna", "Santa Susanna", "ES", 41.636, 2.711, "obec", [76]),
  P("paestum", "Paestum", "IT", 40.42, 15.005, "obec", [77]),
  P("visalaje", "Visalaje (Beskydy)", "CZ", 49.52, 18.43, "obec", [78, 80, 82, 86, 88, 92]),
  P("alcossebre", "Alcossebre", "ES", 40.25, 0.28, "obec", [83]),
  P("korfu", "Korfu", "GR", 39.62, 19.92, "oblast", [85]),
  P("chalkidiki", "Chalkidiki", "GR", 40.3, 23.5, "oblast", [89]),
  P("pula", "Pula", "HR", 44.866, 13.85, "obec", [90]),
  P("palamos", "Palamós", "ES", 41.846, 3.13, "obec", [91]),
  P("vieste", "Vieste", "IT", 41.882, 16.176, "obec", [93]),
  P("korcula", "Korčula", "HR", 42.96, 17.14, "oblast", [94]),
  P("jesolo", "Lido di Jesolo", "IT", 45.5, 12.64, "obec", [95]),
  P("sirava", "Zemplínská Šírava", "SK", 48.8, 21.95, "oblast", [97]),
];
const ids = new Set(trips.map(t => t.id));
for (const p of places) for (const c of p.cesty) if (!ids.has(c)) throw new Error("unknown trip " + c + " in " + p.id);

const dataJs = `// Veřejná pole cest pro UI makety (stav archivu 8. 11. 2026).
// Neobsahuje finance, ubytování, účastníky, odkazy ani poznámky. Rozpočet Itálie 2020 vyřazen.
// "kolo" je pro účely makety odvozeno z názvu cesty. Body míst jsou ILUSTRAČNÍ (nejde o ověřený číselník).
window.TRAVEL_DATA = ${JSON.stringify({ schemaVersion: 1, dataAsOf: "2026-11-08", trips, places }, null, 1)};
`;
fs.writeFileSync(path.join(outDir, "data.js"), dataJs);
console.log("trips:", trips.length, "places:", places.length, "with nights:", trips.filter(t => t.noci !== null).length);
