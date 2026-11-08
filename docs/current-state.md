# Aktuální stav Cestovního atlasu

## Fáze A – základ projektu

Veřejný repozitář obsahuje schválený prototyp v `docs/design/v2/` a samostatnou úvodní stránku s názvem **Cestovní atlas**. Historické návrhy a prototyp používají pracovní název Cestovní stopa.

Fáze A je hotová. GitHub Actions kontroluje změny a nasazuje sestavení z `main`. Úvodní stránka běží na [GitHub Pages](https://pocitacpc-hub.github.io/travel-atlas/). První [kontrola a nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42511828691) prošly a veřejný Přehled byl ověřený i na šířce 390 px.

## Fáze B – datový kontrakt a export

Fáze B je hotová. [Datový kontrakt](data/_SCHEMA.md), číselníky a validace oddělují soukromý zdroj od veřejných polí. Příkaz `npm run export -- --legacy` prošel hlavičky 102 Markdownů na Drivu. Z 97 záznamů cest exportoval 96. Nepotvrzený rozpočet Itálie 2020 vyřadil.

Kontrolní hodnoty sedí. Česko 49 cest, zahraničí 47, celkem 15 států, 349 nocí u 79 cest, 17 cest bez počtu nocí a čtyři bez roku. Řecko 2009 vyšlo na 20.–30. 7., 10 nocí. V číselníku je 61 kandidátů míst. Všichni čekají na ověření, proto je v exportu 0 bodů.

Zkušební dvojice JSON je v ignorované složce `out/legacy/`, report v `out/export-report.md`. Veřejný build stále obsahuje úvodní stránku. Report upozornil na překryv Říma a Rychlebských hor, nesoulad nocí u Murteru a nejisté přiřazení Stravy u Jižní Moravy. Zdroj už uvádí název Warnemünde, místo stále nemá ověřené souřadnice. Rozhodnutí o opravách metadat a zápisu na Drive patří do fáze C po výslovném souhlasu Martina.

## Fáze C – migrace metadat

Fáze C je hotová. Po schválení vznikla ověřená záloha všech 102 původních souborů mimo Drive. Změnilo se 97 YAML hlaviček přesně podle plánu. Těla Markdownů i zbývajících pět původních souborů jsou bajtově shodné se zálohou. Na Drive přibyl `_SCHEMA.md`. Druhý běh měl nula změn. Umístění zálohy je v místním `out/migrace-zapis.md`.

Přísný export vytvořil `public/data/cesty.json` s 96 jedinečnými trvalými ID a `public/data/mista.json` bez bodů. Kontrolní hodnoty i ostatní veřejná pole souhlasí s fází B. Testovací snímek používá stejná trvalá ID. Úvodní stránka začne data používat ve fázi D.

Martin schválil základní migraci s ponecháním 119 [doplňkových návrhů](../data/migrace/2026-11-navrhy.yaml) k samostatnému rozhodnutí. Přísný export má 0 chyb a 168 přijatých varování. Patří mezi ně chybějící nebo neověřená místa, neúplné termíny, překryv Říma a Rychlebských hor, nesoulad nocí u Murteru a nejisté přiřazení aktivit u Jižní Moravy. Podrobnosti jsou v místním `out/export-report.md` a v [kapitole 6 zadání](changes/2026-11-08-zadani-codex-dalsi-faze.md#6-známé-rozpory-a-mezery-v-datech).
