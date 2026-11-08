# Aktuální stav Cestovního atlasu

## Fáze A – základ projektu

Veřejný repozitář obsahuje schválený prototyp v `docs/design/v2/` a samostatnou úvodní stránku s názvem **Cestovní atlas**. Historické návrhy a prototyp používají pracovní název Cestovní stopa.

Fáze A je hotová. GitHub Actions kontroluje změny a nasazuje sestavení z `main`. Úvodní stránka běží na [GitHub Pages](https://pocitacpc-hub.github.io/travel-atlas/). První [kontrola a nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42511828691) prošly a veřejný Přehled byl ověřený i na šířce 390 px.

## Fáze B – datový kontrakt a export

Fáze B je hotová. [Datový kontrakt](data/_SCHEMA.md), číselníky a validace oddělují soukromý zdroj od veřejných polí. Příkaz `npm run export -- --legacy` prošel hlavičky 102 Markdownů na Drivu. Z 97 záznamů cest exportoval 96. Nepotvrzený rozpočet Itálie 2020 vyřadil.

Kontrolní hodnoty sedí. Česko 49 cest, zahraničí 47, celkem 15 států, 349 nocí u 79 cest, 17 cest bez počtu nocí a čtyři bez roku. Řecko 2009 vyšlo na 20.–30. 7., 10 nocí. V číselníku je 61 kandidátů míst. Všichni čekají na ověření, proto je v exportu 0 bodů.

Zkušební dvojice JSON je v ignorované složce `out/legacy/`, report v `out/export-report.md`. Veřejný build stále obsahuje úvodní stránku. Report upozornil na překryv Říma a Rychlebských hor, nesoulad nocí u Murteru a nejisté přiřazení Stravy u Jižní Moravy. Zdroj už uvádí název Warnemünde, místo stále nemá ověřené souřadnice. Rozhodnutí o opravách metadat a zápisu na Drive patří do fáze C po výslovném souhlasu Martina.

## Fáze C – návrh migrace

Fáze C je rozpracovaná. Zkouška nanečisto vytvořila `out/migrace-report.md` s přesným rozpisem změn 97 hlaviček. Přísný náhled dal 96 cest a zachoval kontrolní hodnoty fáze B. Obsah všech 102 zdrojových souborů byl po zkoušce shodný.

V [souboru návrhů](../data/migrace/2026-11-navrhy.yaml) čeká 10 termínů, 85 návrhů míst a 24 návrhů zaměření. Pro další státy není doložený další pobyt. Překryv, rozdílný počet nocí, nejistá přiřazení aktivit a další rozpory jsou k rozhodnutí podle [kapitoly 6 zadání](changes/2026-11-08-zadani-codex-dalsi-faze.md#6-známé-rozpory-a-mezery-v-datech).

Po schválení rozpisu lze vytvořit ověřenou zálohu mimo Drive a zapsat schválené změny. Následuje ověření druhého běhu, přísný export a výměna kontrolního snímku. Umístění `_SCHEMA.md` na Drive vyžaduje souhlas nebo ho provede Martin.
