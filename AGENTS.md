# AGENTS.md – Cestovní atlas

Pracuj podle [aktuálního stavu](docs/current-state.md), [checklistu](docs/00-zadani-a-checklist.md) a [runbooku](CODEX-DEV-RUNBOOK.md). Zadání fází je v [předání z 8. 11. 2026](docs/changes/2026-11-08-zadani-codex-dalsi-faze.md). Každou fázi ukonči ověřením, aktualizací dokumentace a předávacím blokem. Další fázi začni po potvrzení Martina.

## Hranice dat

- **Google Drive je soukromý zdroj.** Z lokálně synchronizované složky `11 Cestování` čte export výhradně YAML hlavičky souborů s `typ: cesta`. Tělo Markdownu a podpůrné dokumenty neparsuj. Zdrojové soubory nikdy nekopíruj do repozitáře, ani dočasně.
- **Repozitář i jeho historie jsou veřejné.** Patří sem kód, dokumentace, schémata, veřejné číselníky a zkontrolovaný výstup exportu. `out/`, `config.local.json`, `.env*` a seznam jmen (`jmena.local.txt`) jsou místní soubory. Nikdy je necommituj.
- **Web je veřejný archiv.** Veřejný JSON sestavuj výčtem povolených polí a kontroluj schématem, security lintem a ruční kontrolou diffu. Zobrazuj pouze ukončené a potvrzené cesty určené ke zveřejnění. Finance, ubytování, adresy, soukromé souřadnice, jména, účastníci, čísla letů, názvy aktivit a odkazy na Drive či Stravu zůstávají soukromé.
- Na Drive zapisuj až ve fázi C, pouze po výslovném potvrzení Martina a se zálohou. Případné umístění `_SCHEMA.md` na Drive také vyžaduje souhlas.
- Neznámá fakta ponech jako `null`. Neodvozuj návštěvu, termín, noc ani místo z názvu, platby nebo trasy. Body na mapě vyžadují ověření a přesnost nejvýše na úroveň obce.

## Změny a ověření

- Web je statický (TypeScript, Vite, vanilla DOM) a běží pod `/travel-atlas/`. Publikuje se pouze `dist/`. Bez CDN, cizích webových písem a mapových dlaždic. Viditelné texty piš česky s diakritikou a vzhled drž podle [návrhu Atlas](docs/design/system.md).
- Před každým commitem spusť `npm run check` a zkontroluj `git diff` včetně staged změn, zvlášť veřejný obsah v `public/data/`. Generované JSON soubory ručně neupravuj.
- S Claude Code nepracuj současně nad stejnými soubory. Na konci fáze ověř `git status` a aktualizuj aktuální stav, checklist, changelog, testování a podle potřeby runbook.
