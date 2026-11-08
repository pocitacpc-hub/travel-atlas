import { describe, expect, it } from "vitest";
import { cesty, dateCz, noci, num, plural, searchable, shortName, termin, zN } from "../src/lib/format";

const NB = " ";
const term = (over: Partial<Parameters<typeof termin>[0]>) =>
  termin({ zacatek: null, konec: null, rok: null, mesic: null, presnostTerminu: "neznamy", ...over });

describe("Formátování", () => {
  it("skloňuje podle počtu", () => {
    expect([1, 2, 4, 5, 0].map((n) => plural(n, "cesta", "cesty", "cest"))).toEqual(["cesta", "cesty", "cesty", "cest", "cest"]);
    expect(plural(4.4, "noc", "noci", "nocí")).toBe("noci");
    expect(cesty(96)).toBe(`96${NB}cest`);
    expect(noci(1)).toBe(`1${NB}noc`);
    expect(noci(null)).toBe("nocí neznámo");
  });

  it("píše termíny podle přesnosti", () => {
    expect(term({ zacatek: "2009-07-20", konec: "2009-07-30", rok: 2009, mesic: 7, presnostTerminu: "den" })).toBe(`20.–30.${NB}7.${NB}2009`);
    expect(term({ zacatek: "2026-07-27", konec: "2026-08-03", rok: 2026, mesic: 7, presnostTerminu: "den" })).toBe(`27.${NB}7. – 3.${NB}8.${NB}2026`);
    expect(term({ zacatek: "2024-12-27", konec: "2025-01-02", rok: 2024, mesic: 12, presnostTerminu: "den" })).toBe(`27.${NB}12.${NB}2024 – 2.${NB}1.${NB}2025`);
    expect(term({ rok: 2005, mesic: 7, presnostTerminu: "mesic" })).toBe(`červenec${NB}2005`);
    expect(term({ rok: 2001, presnostTerminu: "rok" })).toBe("2001");
    expect(term({})).toBe("rok neznámý");
    expect(dateCz("2026-11-08")).toBe(`8.${NB}11.${NB}2026`);
  });

  it("zkracuje název jen o předponu hlavního státu", () => {
    expect(shortName("Itálie – Řím", "Itálie")).toBe("Řím");
    expect(shortName("Pasohlávky – Apalucha", "Česko")).toBe("Pasohlávky – Apalucha");
    expect(shortName("Itálie – ", "Itálie")).toBe("Itálie – ");
  });

  it("volí předložku z/ze a formátuje čísla česky", () => {
    expect([7, 17, 70, 79, 96, 100, 199, 200, 700].map(zN)).toEqual(
      [`ze${NB}7`, `ze${NB}17`, `ze${NB}70`, `ze${NB}79`, `z${NB}96`, `ze${NB}100`, `ze${NB}199`, `z${NB}200`, `ze${NB}700`]);
    expect(num(1237).replace(/\s/gu, " ")).toBe("1 237");
    expect(num(4.42, 1)).toBe("4,4");
  });

  it("hledá bez ohledu na diakritiku a velikost písmen", () => {
    expect(searchable("  Chorvatsko – POREČ ")).toBe("chorvatsko – porec");
  });
});
