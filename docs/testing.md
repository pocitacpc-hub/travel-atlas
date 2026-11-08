# Testování

## Fáze A

`npm run check` provede typovou kontrolu, kontrolu obsahu, security lint, testy Vitest a produkční sestavení. CI používá `npm ci` s lockfilem a Node.js 22.

- `validate-content` odmítne obsah v `public/data/`, dokud nevznikne datové schéma.
- `security-lint` kontroluje ignorování místních reportů, konfigurace a seznamu jmen a odmítne položky v indexu, které má `.gitignore` vyloučit.
- Vitest kontroluje strukturu úvodní stránky, základní cestu pro Pages a vypnuté kopírování `public/` ve fázi A.
- Pro kontrolu sestavení spusť `npm run preview` a otevři `http://127.0.0.1:4173/travel-atlas/`. Zkontroluj Přehled, CSS, aktivní navigaci a rozložení na šířce 390 px.
- Po ruční aktivaci Pages zopakuj kontrolu na veřejné adrese podle [runbooku](../CODEX-DEV-RUNBOOK.md).

Testy kontrolních hodnot cest a validace schématu přibudou s exportem ve fázi B.

### Ověření při předání

- `npm ci` a `npm run check` prošly lokálně na Node.js 26.1.0. Vitest provedl dva testy.
- Náhled produkčního sestavení vrátil HTTP 200 pro stránku i CSS pod `/travel-atlas/`.
- `npm run check` na Node.js 22 i nasazení prošly v [GitHub Actions](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42511828691).
- Veřejný Přehled a jeho CSS vrátily HTTP 200. V Chrome měl Přehled při šířce 390 px `scrollWidth` i `clientWidth` 390 px a při načtení se neobjevily chyby JavaScriptu.
