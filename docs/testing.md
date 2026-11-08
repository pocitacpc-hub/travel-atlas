# Testování

## Fáze A

`npm run check` provede typovou kontrolu, kontrolu obsahu, security lint, testy Vitest a produkční sestavení. CI používá `npm ci` s lockfilem a Node.js 22.

- Vitest kontroluje strukturu úvodní stránky, základní cestu pro Pages a vypnuté kopírování `public/` ve fázi A.
- Pro kontrolu sestavení spusť `npm run preview` a otevři `http://127.0.0.1:4173/travel-atlas/`. Zkontroluj Přehled, CSS, aktivní navigaci a rozložení na šířce 390 px.
- Po ruční aktivaci Pages zopakuj kontrolu na veřejné adrese podle [runbooku](../CODEX-DEV-RUNBOOK.md).

### Ověření při předání

- `npm ci` a `npm run check` prošly lokálně na Node.js 26.1.0. Vitest provedl dva testy.
- Náhled produkčního sestavení vrátil HTTP 200 pro stránku i CSS pod `/travel-atlas/`.
- `npm run check` na Node.js 22 i nasazení prošly v [GitHub Actions](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42511828691).
- Veřejný Přehled a jeho CSS vrátily HTTP 200. V Chrome měl Přehled při šířce 390 px `scrollWidth` i `clientWidth` 390 px a při načtení se neobjevily chyby JavaScriptu.

## Fáze B

- `validate-content` kontroluje číselníky i dvojici JSON, pokud existuje v `public/data/`. Přísné veřejné schéma odmítá dočasná ID, další pole, neukončené cesty a odkazy na neověřená místa.
- `security-lint` ověřuje ignorování místních souborů, jejich absenci v indexu a citlivé vzory v dekódovaném veřejném JSON. Stejné vzory se kontrolují při exportu před zápisem.
- Vitest ověřuje kontrolní hodnoty snímku z 8. 11. 2026, izolaci těla Markdownu, přesnost, nulovou a neznámou délku, datum ukončení, vyřazení nepotvrzeného rozpočtu, ověření míst a deterministické řazení.

Zkušební export ze synchronizované složky na Drivu měl 0 chyb, 169 varování a jeden vynechaný záznam. Dva běhy pro 8. 11. 2026 měly shodné kontrolní součty obou JSON souborů i reportu. `npm run check` prošel s devíti testy. Obecné vzory byly zkontrolované na skutečném exportu. Vlastní seznam jmen je volitelný, jeho chování pokrývá test se zkušebním jménem.

## Fáze C

- Zkouška `npm run migrate` navrhla 97 přepisů a prošla přísnou kontrolou 96 cest. Kontrolní součty všech 102 zdrojových souborů se shodovaly před a po spuštění. Opakovaná zkouška zachovala uložený plán včetně ID.
- Přísný náhled souhlasil s kontrolním snímkem fáze B ve všech veřejných polích kromě nových trvalých ID.
- Testy na syntetických souborech ověřují zálohu i se skrytým souborem a podadresářem, zachování bajtů těla Markdownu, zachování soukromých metadat a existujících ID, kontrolu změny zdroje a druhý běh bez změn.
- Celý příkaz `--apply` v oddělené testovací kopii odmítl soubor změněný po náhledu. Po obnovení náhledu vytvořil ověřenou zálohu a zapsal změnu. Druhý běh ponechal soubor shodný a další zálohu nevytvořil.
- Po zápisu na Drive odpovídalo všech 97 hlaviček schválenému plánu. Bajty jejich těl i pěti dalších souborů souhlasily se zálohou. Nový `_SCHEMA.md` souhlasil s repozitářem.
- Druhý běh s `--apply` nenašel žádnou změnu. Kontrolní součty všech 103 souborů zůstaly stejné a další záloha nevznikla.
- Přísný export dal 96 cest, 0 ověřených míst, 0 chyb, 168 varování a jeden vynechaný záznam. Snímek byl obnoven z přísného exportu a testuje trvalá ID. Test odmítnutí dočasného ID používá zkušební hodnotu.
