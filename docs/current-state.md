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

## Fáze D – web MVP

Web má čtyři stránky podle prototypu v2: Přehled (`index.html`), Kronika, Statistiky a detail cesty `cesta.html?id=t-xxxxxx`. Kód je v TypeScriptu bez frameworku: výpočty v `src/lib/stats.ts` a `format.ts`, mapa v `map.ts`, grafy v `charts.ts`, stránky v `src/pages/`. Veřejná data se vkládají do sestavení, mapu a vlajky generuje `npm run assets` do ignorované složky `src/generated/` ([rozhodnutí 0013](decisions/0013-data-a-podklady-webu.md)).

Kontrolní hodnoty na webu sedí s exportem: 15 států, 96 cest (49 po Česku, 47 do zahraničí), 349 nocí známých u 79 cest, čtyři cesty bez roku jsou ve státech a v Kronice ve skupině „?“, ne v letech. Ověřených míst je 0, proto mapa nemá body, přepínač Státy / Místa je skrytý a Návraty ukazují prázdný stav. Prototypové prvky (ilustrační body, štítek „kolo“, box „Kontrola dat“) ve webu nejsou.

Lokálně prošel `npm run check` (33 testů) a kontrola sestavení v Chrome na 1440 a 390 px bez vodorovného posouvání a bez chyb JavaScriptu. Nasazení na Pages a smoke test na veřejné adrese čekají na sloučení větve `web/mvp` do `main`.
