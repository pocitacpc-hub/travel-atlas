import { describe, expect, it } from "vitest";
import { cropFor, layoutLabels, MAP_ASPECT } from "../src/lib/map";
import { project } from "../src/lib/projection";

type Box = [number, number, number, number];
const inside = (crop: number[], [x, y]: [number, number]) => x > crop[0]! && x < crop[0]! + crop[2]! && y > crop[1]! && y < crop[1]! + crop[3]!;

describe("Přiblížení mapy", () => {
  it("výřez státu drží poměr stran mapy, obsahuje stát a nevyjede z mapy", () => {
    for (const code of ["CZ", "PT", "NO", "IE", "SI", "GR"]) {
      const crop = cropFor([code], [], MAP_ASPECT);
      expect(crop[2] / crop[3]).toBeCloseTo(MAP_ASPECT, 1);
      expect(crop[0]).toBeGreaterThanOrEqual(0);
      expect(crop[1]).toBeGreaterThanOrEqual(0);
      expect(crop[0] + crop[2]).toBeLessThanOrEqual(1001);
    }
    expect(inside(cropFor(["CZ"], [], MAP_ASPECT), project(14.42, 50.09))).toBe(true);
    expect(inside(cropFor(["PT"], [], MAP_ASPECT), project(-9.14, 38.71))).toBe(true);
  });

  it("popisky se nepřekrývají, důležitější místo má přednost a nic nepřesahuje výřez", () => {
    const crop: Box = [0, 0, 200, 150];
    const items = [
      { x: 50, y: 50, r: 3, text: "Rožnov pod Radhoštěm" },
      { x: 52, y: 51, r: 2, text: "Trojanovice" },
      { x: 120, y: 100, r: 2, text: "Brno" },
      { x: 100, y: 2, r: 2, text: "Mimo výřez dlouhý název" }
    ];
    const labels = layoutLabels(items, 6, crop);
    expect(labels[0]).toMatchObject({ text: "Rožnov pod Radhoštěm", anchor: "start" });
    expect(labels.map((l) => l.text)).toContain("Brno");
    expect(labels.map((l) => l.text)).not.toContain("Mimo výřez dlouhý název");
    const boxes = labels.map((l): Box => {
      const w = l.text.length * 6 * 0.58;
      return l.anchor === "start" ? [l.x, l.y - 6, l.x + w, l.y] : [l.x - w, l.y - 6, l.x, l.y];
    });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i]!, boxes[j]!];
        expect(a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]).toBe(false);
      }
    }
  });
});

describe("Osa let", () => {
  it("nepřekrývá první rok s nejbližším pátým rokem", async () => {
    const { yearTick } = await import("../src/lib/charts");
    const ticks = (min: number) => Array.from({ length: 33 }, (_, i) => min + i).filter((y) => yearTick(y, min));
    expect(ticks(1994).slice(0, 3)).toEqual([1994, 2000, 2005]);
    expect(ticks(1996).slice(0, 3)).toEqual([1996, 2000, 2005]);
    expect(ticks(1997).slice(0, 3)).toEqual([1997, 2000, 2005]);
    expect(ticks(1998).slice(0, 3)).toEqual([1998, 2005, 2010]);
  });
});
