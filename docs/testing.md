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

## Fáze D

- `npm run check` nově začíná příkazem `npm run assets`, který vygeneruje mapu a vlajky do `src/generated/`. Bez něj neprojde typová kontrola stránek.
- `tests/stats.test.ts` ověřuje kontrolní hodnoty nad snímkem z 8. 11. 2026 (15 států, 49 / 47 cest, 349 nocí u 79 cest, medián 3, rozdělení délek, rekordy, prázdné roky 2008 a 2011), oddělení cest bez roku od let, rozklad pohledu Celé roky (28 přesných termínů, 53 měsíců, 15 cest jen s rokem nebo bez roku), další státy pobytu, místa a prázdný archiv.
- `tests/format.test.ts` ověřuje tvary slov, termíny podle přesnosti včetně přelomu měsíce a roku, zkracování názvů, předložku z/ze a hledání bez diakritiky.
- `tests/assets.test.ts` ověřuje projekci (rámec 1000 × 823), mapu se všemi státy z číselníku, existenci vlajek a licenci v CSS.
- `tests/web.test.ts` ověřuje českou kostru čtyř stránek, aktivní položku menu, absenci cizích zdrojů a prototypových prvků a nastavení sestavení.

### Ruční kontrola sestavení

1. `npm run build` a `npm run preview`, otevřít `http://127.0.0.1:4173/travel-atlas/`.
2. Snímky a přetékání: `node docs/design/tools/cdp-shot.mjs <chrome.exe> <profil> <výstup> 390 prehled=http://127.0.0.1:4173/travel-atlas/ …` pro všechny čtyři stránky na 1440 a 390 px.
3. Interakce: klik na stát v mapě a ve vlajkách přepne kartu státu a `?stat=`, filtr Chorvatsko v Kronice dá 11 cest, hledání „porec“ 3 cesty, `statistiky.html#stat-HR` otevře Chorvatsko, Celé roky ukážou 28 pruhů, 53 pásů a 15 teček, `cesta.html?id=x` ukáže „Cesta nenalezena“.
4. Síťové požadavky jdou jen na vlastní adresu webu.

### Ověření při předání (8. 11. 2026, lokálně)

- `npm run check` prošel na Node.js 26.1.0: 6 souborů, 33 testů.
- Chrome na 1440 a 390 px: Přehled, Kronika (i s filtrem), Statistiky (Měsíce i Celé roky) a detail měly `scrollWidth` rovný šířce okna a žádné chyby JavaScriptu. Interakce z bodu 3 odpovídaly očekávání.
- Po sloučení do `main` prošly [kontrola i nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42518613640). Na veřejné adrese vrátily všechny čtyři stránky a jejich soubory HTTP 200. V Chrome měly na 1440 i 390 px `scrollWidth` rovný šířce okna a žádné chyby JavaScriptu.

## Fáze E

- `tests/migration.test.ts` nově ověřuje doplnění roku, měsíce a nocí cestě bez data a odmítnutí neplatného měsíce, přesnosti `rok` s měsícem, přesnosti `den`, záporných nocí a přepisu již vyplněného roku.
- `tests/export.test.ts` ověřuje, že cesta se stavem `zrusena` se nezveřejní. Testy neověřeného místa používají vlastní kopii číselníku, takže nezávisí na stavu `data/mista.yaml`.
- `validate-content` kontroluje, že každé veřejné místo je v číselníku ověřené a shoduje se s ním.

### Ověření při předání (9. 11. 2026, lokálně)

- Zkouška migrace: 89 navržených změn, přísný náhled 96 cest. Zápis vytvořil ověřenou zálohu a přepsal 89 hlaviček. Druhý běh měl nula změn. Těla všech Markdownů a soubory bez hlavičky jsou bajtově shodné se zálohou.
- Přísný export: 96 cest, 90 s místem, 68 ověřených míst. Proti předchozímu exportu se kromě míst změnila jen Korčula (rok, měsíc, přesnost, noci, název ze zdroje).
- `npm run check` prošel: 6 souborů, 34 testů.
- Chrome na 1440 a 390 px: všechny čtyři stránky bez vodorovného posouvání a bez chyb JavaScriptu. Přehled ukazuje rozsah 1994–2026, vrstva Místa 68 bodů (6 oblastí), Návraty šest míst.
- Neověřeno: nasazení na Pages.
