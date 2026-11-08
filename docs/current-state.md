# Aktuální stav Cestovního atlasu

## Fáze A – základ projektu

Veřejný repozitář obsahuje schválený prototyp v `docs/design/v2/` a samostatnou úvodní stránku s názvem **Cestovní atlas**. Historické návrhy a prototyp používají pracovní název Cestovní stopa.

Fáze A je hotová. GitHub Actions kontroluje změny a nasazuje sestavení z `main`. Úvodní stránka běží na [GitHub Pages](https://pocitacpc-hub.github.io/travel-atlas/). První [kontrola a nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42511828691) prošly a veřejný Přehled byl ověřený i na šířce 390 px.

## Data

Fáze A pracuje bez dat. Kontrola obsahu vyžaduje prázdné `public/data/` a Vite adresář `public/` nekopíruje do sestavení. Příkaz `export` je připravený jako vstup pro fázi B. Datový kontrakt, validace schématu, export a kontrolní hodnoty přijdou v další fázi po potvrzení Martina.
