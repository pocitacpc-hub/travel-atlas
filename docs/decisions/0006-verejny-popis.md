# Veřejný popis

Platí od 8. 11. 2026 podle [zadání dalších fází](../changes/2026-11-08-zadani-codex-dalsi-faze.md).

Veřejný text pochází výhradně z `verejny_popis`, které je zatím prázdné. Tělo zdrojového Markdownu se nečte pro export.

## Formát a postup (9. 11. 2026)

- `verejny_popis` je krátké shrnutí cesty do 1500 znaků. Formátování je podmnožina Markdownu: prázdný řádek odděluje odstavce, řádek začínající „- “ je odrážka, `**tučně**` a `*kurzíva*`. HTML, odkazy a nadpisy nejsou povolené. Schéma odmítne `<` a `>`, security lint odkazy.
- Web text vykreslí v detailu cesty jako první panel „O cestě“ (`src/lib/text.ts`).
- Shrnutí může navrhnout AI z potvrzených částí poznámek (vzpomínky, Časová osa, druhy aktivit Stravy, bratrovy zápisky). Návrhy se drží mimo Git v `out/`. Do repozitáře a na Drive jdou až schválené texty přes migraci (`zmeny: { verejny_popis: … }`). Plánovaný program se jako skutečnost nepíše. Jména, ubytování, finance a názvy aktivit Stravy do popisu nepatří.
