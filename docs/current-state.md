# Aktuální stav Cestovního atlasu

## Fáze A – základ projektu

Veřejný repozitář obsahuje schválený prototyp v `docs/design/v2/` a samostatnou úvodní stránku s názvem **Cestovní atlas**. Historické návrhy a prototyp používají pracovní název Cestovní stopa.

Node.js, TypeScript, Vite a Vitest mají nastavené příkazy pro vývoj a kontrolu. GitHub Actions spouští kontrolu a po aktivaci Pages umí nasadit sestavení z `main`. Stav CI je v [GitHub Actions](https://github.com/pocitacpc-hub/travel-atlas/actions/workflows/check-and-pages.yml). K uzavření fáze A zbývá první nasazení a kontrola cílového webu po ručním nastavení Pages podle [runbooku](../CODEX-DEV-RUNBOOK.md).

## Data

Fáze A pracuje bez dat. Kontrola obsahu vyžaduje prázdné `public/data/` a Vite adresář `public/` nekopíruje do sestavení. Příkaz `export` je připravený jako vstup pro fázi B. Datový kontrakt, validace schématu, export a kontrolní hodnoty přijdou v další fázi po potvrzení Martina.
