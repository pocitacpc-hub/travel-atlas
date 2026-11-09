# Veřejný popis

Platí od 8. 11. 2026 podle [zadání dalších fází](../changes/2026-11-08-zadani-codex-dalsi-faze.md).

Veřejný text pochází výhradně z `verejny_popis`, které je zatím prázdné. Tělo zdrojového Markdownu se nečte pro export.

## Formát a postup (9. 11. 2026)

- `verejny_popis` je krátké shrnutí cesty do 1500 znaků. Formátování je podmnožina Markdownu: prázdný řádek odděluje odstavce, řádek začínající „- “ je odrážka, `**tučně**` a `*kurzíva*`. HTML, odkazy a nadpisy nejsou povolené. Schéma odmítne `<` a `>`, security lint odkazy.
- Web text vykreslí v detailu cesty jako první panel „O cestě“ (`src/lib/text.ts`).
- Shrnutí může navrhnout AI z potvrzených částí poznámek (vzpomínky, Časová osa, druhy aktivit Stravy, bratrovy zápisky). Návrhy se drží mimo Git v `out/`. Do repozitáře a na Drive jdou až schválené texty přes migraci (`zmeny: { verejny_popis: … }`). Plánovaný program se jako skutečnost nepíše. Jména, ubytování, finance a celé názvy aktivit Stravy do popisu nepatří.
- Sportovní údaje ze Stravy (od 9. 11. 2026, schválil Martin): popis smí uvést km, stoupání, čas, průměrnou rychlost, průměrný tep a watty jen z wattmetru, u běhu tempo. Průměry za cestu jsou vážené časem pohybu. Jízdy se označují pořadím dne („3. den“), ne datem, aby text neprozradil přesnější termín, než atlas zveřejňuje. Cíl jízdy lze převzít z názvu aktivity nebo ze segmentu na trase, ale jen jako název obce, vrcholu či oblasti. Výchozí místo z domova se neuvádí. Úseky jízdy dopravou a výpadky snímače se do čísel nepočítají. Strava se čte jen pro čtení a data zůstávají v místním `out/strava-cesty.local.json`.
- Už zapsaný popis migrace nepřepíše. Schválenou novou verzi zapíše jen návrh s polem `nahrazuje`, které přesně obsahuje dosavadní text ve zdroji. Když se text ve zdroji mezitím změnil, migrace skončí chybou.
