import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { manifest, precacheList, serviceWorkerSource } from "../tools/pwa";

describe("PWA", () => {
  const m = manifest("/travel-atlas/") as {
    name: string; short_name: string; start_url: string; scope: string; display: string; lang: string;
    icons: { src: string; sizes: string; purpose: string }[];
  };

  it("má manifest pro instalaci na Android i iPhone", () => {
    expect(m).toMatchObject({ name: "Cestovní atlas", short_name: "Atlas", start_url: "/travel-atlas/", scope: "/travel-atlas/", display: "standalone", lang: "cs" });
    expect(m.icons.map((i) => `${i.sizes} ${i.purpose}`)).toEqual(["192x192 any", "512x512 any", "512x512 maskable"]);
    for (const i of m.icons) expect(existsSync(new URL(`../src/pwa/${i.src}`, import.meta.url)), i.src).toBe(true);
    expect(existsSync(new URL("../src/pwa/apple-touch-icon.png", import.meta.url))).toBe(true);
  });

  it("uloží offline stránky a skripty, písma a obrázek pro sdílení až při použití", () => {
    const list = precacheList(["index.html", "kronika.html", "assets/ui-a1.js", "assets/atlas-serif-regular-b2.woff2", "assets/sdileni-c3.jpg", "sw.js", "ikona-192.png", "ikona-192.png"]);
    expect(list).toEqual(["./", "assets/ui-a1.js", "ikona-192.png", "index.html", "kronika.html"]);
  });

  it("service worker zůstává na vlastní doméně a má verzi", () => {
    const sw = serviceWorkerSource("abc123", ["./"]);
    expect(sw).toContain('const CACHE = "atlas-abc123"');
    expect(sw).toContain("url.origin !== self.location.origin");
    expect(sw).not.toMatch(/https?:\/\//u);
  });
});
