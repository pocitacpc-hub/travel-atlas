import { describe, expect, it } from "vitest";
import { securityFindings } from "../tools/content-security";
import { popisHtml, popisPerex } from "../src/lib/text";

describe("Veřejný popis cesty", () => {
  it("převede odstavce, odrážky, tučné písmo a kurzívu", () => {
    const html = popisHtml("První den **Toruň** a *perník*.\nVečer pláž.\n\n- **Rozewie**, maják\n- procházka po molu");
    expect(html).toBe("<p>První den <strong>Toruň</strong> a <em>perník</em>.<br>Večer pláž.</p>" +
      "<ul><li><strong>Rozewie</strong>, maják</li><li>procházka po molu</li></ul>");
  });

  it("nepustí HTML a nechá osamělé hvězdičky", () => {
    expect(popisHtml("<b>x</b> & 5 * 3")).toBe("<p>&lt;b&gt;x&lt;/b&gt; &amp; 5 * 3</p>");
  });

  it("vytvoří krátký perex z první věty bez formátování", () => {
    expect(popisPerex("Týden na **Baltu**. Další věta.")).toBe("Týden na Baltu.");
    expect(popisPerex("a".repeat(200), 20)).toHaveLength(20);
  });

  it("security lint hlásí odkazy ve veřejném textu", () => {
    expect(securityFindings({ popis: "Viz https://example.com" })).toContain("odkaz");
    expect(securityFindings({ popis: "Odkaz www.example.com" })).toContain("odkaz");
    expect(securityFindings({ popis: "Bez odkazu." })).toEqual([]);
  });
});
