import { readdirSync, readFileSync } from "node:fs";
import { resolveConfig } from "vite";
import { describe, expect, it } from "vitest";

const pages = [
  { file: "index.html", nav: "Přehled", module: "prehled" },
  { file: "kronika.html", nav: "Kronika", module: "kronika" },
  { file: "statistiky.html", nav: "Statistiky", module: "statistiky" },
  { file: "cesta.html", nav: "Kronika", module: "cesta" }
];
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("Stránky webu", () => {
  for (const page of pages) {
    it(`${page.file} má českou kostru, aktivní menu a vlastní modul`, () => {
      const html = read(page.file);
      expect(html).toContain('<html lang="cs">');
      expect(html).toContain(`<script type="module" src="/src/pages/${page.module}.ts"></script>`);
      const current = [...html.matchAll(/<a href="[^"]+" aria-current="page">([^<]+)<\/a>/gu)].map((m) => m[1]);
      expect(current).toEqual([page.nav]);
      // Bez CDN a cizích zdrojů.
      expect(html).not.toMatch(/(?:src|href)="https?:/u);
    });
  }

  it("neobsahuje prototypové prvky", () => {
    const files = readdirSync(new URL("../src/", import.meta.url), { recursive: true, encoding: "utf8" })
      .filter((f) => /\.(?:ts|css)$/u.test(f) && !f.startsWith("generated"));
    const text = files.map((f) => read(`src/${f.replaceAll("\\", "/")}`)).join("\n") + pages.map((p) => read(p.file)).join("\n");
    expect(text).not.toMatch(/ilustrační|Kontrola dat|Cestovní stopa|https?:\/\/(?!www\.w3\.org)/u);
  });

  it("se sestavuje pod cestou projektu jako čtyři stránky bez adresáře public", async () => {
    const config = await resolveConfig({}, "build");
    expect(config.base).toBe("/travel-atlas/");
    expect(config.publicDir).toBe("");
    expect(Object.keys(config.build.rollupOptions.input as Record<string, string>).sort()).toEqual(["cesta", "kronika", "prehled", "statistiky"]);
  });
});
