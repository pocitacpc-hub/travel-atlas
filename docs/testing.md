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
- Výsledek CI na Node.js 22 je v [Actions](https://github.com/pocitacpc-hub/travel-atlas/actions/workflows/check-and-pages.yml). Veřejný web se ověřuje po prvním nasazení.
