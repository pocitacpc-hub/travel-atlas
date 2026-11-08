# Aktuální stav Cestovního atlasu

## Fáze A – základ projektu

Veřejný repozitář obsahuje schválený prototyp v `docs/design/v2/` a samostatnou úvodní stránku s názvem **Cestovní atlas**. Historické návrhy a prototyp používají pracovní název Cestovní stopa.

Fáze A je hotová. GitHub Actions kontroluje změny a nasazuje sestavení z `main`. Úvodní stránka běží na [GitHub Pages](https://pocitacpc-hub.github.io/travel-atlas/). První [kontrola a nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42511828691) prošly a veřejný Přehled byl ověřený i na šířce 390 px.

## Fáze B – datový kontrakt a export

Fáze B je hotová. [Datový kontrakt](data/_SCHEMA.md), číselníky a validace oddělují soukromý zdroj od veřejných polí. Příkaz `npm run export -- --legacy` prošel hlavičky 102 Markdownů na Drivu. Z 97 záznamů cest exportoval 96. Nepotvrzený rozpočet Itálie 2020 vyřadil.

Kontrolní hodnoty sedí. Česko 49 cest, zahraničí 47, celkem 15 států, 349 nocí u 79 cest, 17 cest bez počtu nocí a čtyři bez roku. Řecko 2009 vyšlo na 20.–30. 7., 10 nocí. V číselníku je 61 kandidátů míst. Všichni čekají na ověření, proto je v exportu 0 bodů.

Zkušební dvojice JSON je v ignorované složce `out/legacy/`, report v `out/export-report.md`. Veřejný build stále obsahuje úvodní stránku. Report upozornil na překryv Říma a Rychlebských hor, nesoulad nocí u Murteru a nejisté přiřazení Stravy u Jižní Moravy. Zdroj už uvádí název Warnemünde, místo stále nemá ověřené souřadnice. Rozhodnutí o opravách metadat a zápisu na Drive patří do fáze C po výslovném souhlasu Martina.
