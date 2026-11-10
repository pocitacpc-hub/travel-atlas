import { describe, expect, it } from "vitest";
import { trips } from "../src/lib/data";
import { tripDetailHtml } from "../src/lib/trip";

describe("Detail cesty", () => {
  const withAll = trips.find((t) => t.popis && t.sport && t.mista.length);

  it("ukazuje jen cestu samotnou: údaje, popis, mapu a sport, bez dalších cest a stránkování", () => {
    expect(withAll).toBeDefined();
    const html = tripDetailHtml(withAll!);
    expect(html).toContain('id="td-title"');
    expect(html).toContain("O cestě");
    expect(html).toContain("data-trip-map");
    expect(html).not.toMatch(/Další cesty|Předchozí|pager|class="stamp"/u);
    // údaje v jednom řádku (termín, noci, místa; stát je v záhlaví), pak popis, mapa a sport
    expect(html).not.toMatch(/<dt>[^<]*Stát/u);
    expect(html.match(/<dt>/gu)).toHaveLength(3);
    expect(html.indexOf("Termín")).toBeLessThan(html.indexOf("O cestě"));
    expect(html.indexOf("O cestě")).toBeLessThan(html.indexOf("data-trip-map"));
    expect(html.indexOf("data-trip-map")).toBeLessThan(html.indexOf("Sport na cestě"));
    // místo kroužku s kódem státu vlajka
    expect(html).toContain(`<span class="td-flag"><span class="fi fi-${withAll!.zeme.toLowerCase()}"`);
  });
});
