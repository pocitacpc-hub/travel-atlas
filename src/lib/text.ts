// Veřejný popis cesty: bezpečná podmnožina Markdownu → HTML.
// Podporuje odstavce (prázdný řádek), odrážky („- “), **tučně** a *kurzívu*. Žádné HTML, odkazy ani nadpisy.
import { esc } from "./format";

function inline(text: string): string {
  return esc(text)
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/gu, "<strong>$1</strong>")
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/gu, "<em>$1</em>");
}

export function popisHtml(source: string): string {
  const blocks = source.replace(/\r\n?/gu, "\n").trim().split(/\n\s*\n/u);
  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length && lines.every((l) => /^[-•]\s+/u.test(l))) {
      return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-•]\s+/u, ""))}</li>`).join("")}</ul>`;
    }
    return `<p>${lines.map(inline).join("<br>")}</p>`;
  }).join("");
}

/** První věta popisu bez formátování (pro náhled v seznamech). */
export function popisPerex(source: string, max = 140): string {
  const plain = source.replace(/\*+/gu, "").replace(/^\s*[-•]\s+/gmu, "").replace(/\s+/gu, " ").trim();
  const sentence = /^.+?[.!?](?=\s|$)/u.exec(plain)?.[0] ?? plain;
  return sentence.length > max ? `${sentence.slice(0, max - 1).trimEnd()}…` : sentence;
}
