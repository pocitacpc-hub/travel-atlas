import { readFileSync } from "node:fs";
import { resolveConfig } from "vite";
import { describe, expect, it } from "vitest";

describe("Kostra veřejného webu", () => {
  it("má českou hlavičku, obsah a patičku", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

    expect(html).toContain('<html lang="cs">');
    expect(html).toMatch(/<header[\s\S]*Cestovní atlas[\s\S]*aria-current="page"[\s\S]*<\/header>/);
    expect(html).toMatch(/<main[\s\S]*<h1>Přehled<\/h1>[\s\S]*<\/main>/);
    expect(html).toMatch(/<footer[\s\S]*Neznámé údaje se nepočítají jako nula\.[\s\S]*<\/footer>/);
  });

  it("se sestavuje pod cestou projektu a nekopíruje adresář public", async () => {
    const config = await resolveConfig({}, "build");

    expect(config.base).toBe("/travel-atlas/");
    expect(config.publicDir).toBe("");
  });
});
