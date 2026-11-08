// Lambertova azimutální stejnoplochá projekce se středem 10° v. d. a 49° s. š.
// Sdílí ji generátor mapy (tools/build-assets.ts) i web pro body ověřených míst.

const RAD = Math.PI / 180;
export const CENTER = { lon: 10, lat: 49 } as const;
// Výřez 12° z. d. – 31° v. d. × 34,5–62° s. š.
export const BOX = { lonMin: -12, lonMax: 31, latMin: 34.5, latMax: 62 } as const;
export const MAP_WIDTH = 1000;

function laea(lon: number, lat: number): [number, number] {
  const l = (lon - CENTER.lon) * RAD;
  const p = lat * RAD;
  const p1 = CENTER.lat * RAD;
  const k = Math.sqrt(2 / (1 + Math.sin(p1) * Math.sin(p) + Math.cos(p1) * Math.cos(p) * Math.cos(l)));
  return [k * Math.cos(p) * Math.sin(l), -k * (Math.cos(p1) * Math.sin(p) - Math.sin(p1) * Math.cos(p) * Math.cos(l))];
}

function frame() {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const lon = BOX.lonMin + ((BOX.lonMax - BOX.lonMin) * i) / steps;
    const lat = BOX.latMin + ((BOX.latMax - BOX.latMin) * i) / steps;
    const edge: [number, number][] = [[lon, BOX.latMin], [lon, BOX.latMax], [BOX.lonMin, lat], [BOX.lonMax, lat]];
    for (const [a, b] of edge) {
      const [x, y] = laea(a, b);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  const scale = MAP_WIDTH / (maxX - minX);
  return { minX, minY, scale, width: MAP_WIDTH, height: Math.round((maxY - minY) * scale) };
}

export const FRAME = frame();

/** Zeměpisná délka a šířka → souřadnice SVG mapy (0…width × 0…height). */
export function project(lon: number, lat: number): [number, number] {
  const [x, y] = laea(lon, lat);
  return [(x - FRAME.minX) * FRAME.scale, (y - FRAME.minY) * FRAME.scale];
}
