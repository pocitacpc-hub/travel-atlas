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
- Po sloučení do `main` prošly [kontrola i nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42572251985). Veřejné stránky vrátily HTTP 200 se stejnými soubory jako lokální sestavení. V Chrome na 1440 i 390 px bez vodorovného posouvání a bez chyb JavaScriptu.

## Přiblížení státu (9. 11. 2026)

- `tests/map.test.ts` ověřuje výřez státu (poměr stran mapy, obsah státu, nevyjede z mapy pro CZ, PT, NO, IE, SI, GR), rozmístění popisků bez překryvu a mimo výřez a popisky osy let.
- Ruční kontrola v sestavení: klik na Itálii přiblíží mapu (16 popisků), klik na Rakousko v přiblížení přepne stát, vlajka Řecka přiblíží Řecko, Esc i „← Celá Evropa“ vrátí celou mapu s choroplethem a fokus na vybraný stát. `?stat=CZ` a `?stat=HR` otevřou přiblížení rovnou. Chrome na 1440 a 390 px bez vodorovného posouvání a bez chyb JavaScriptu.
- `npm run check` prošel: 7 souborů, 37 testů.

## Shrnutí cest (9. 11. 2026)

- `tests/text.test.ts` ověřuje převod popisu na HTML (odstavce, odrážky, tučně, kurzíva), escapování HTML, perex a pravidlo lintu pro odkazy.
- `tests/migration.test.ts` ověřuje zápis popisu do YAML, zachování těla a soukromých polí, druhý běh bez změn, export popisu a odmítnutí HTML, prázdného textu i přepisu jiného existujícího popisu.
- Před zápisem prošlo všech 26 textů schématem a security lintem. Zkouška migrace měla 26 změn pouze v `verejny_popis`, po zápisu druhý běh 0 změn. Porovnání se zálohou: 26 souborů se liší jen přidaným `verejny_popis`, těla jsou bajtově shodná.
- Po exportu prošel `npm run check` (8 souborů, 42 testů). Náhled sestavení zobrazil panel „O cestě“ u Osla (2 odstavce, tučně i kurzíva), Puly a Polska na 1440 px. Na 390 px nic vodorovně nepřetéká, v konzoli nebyly chyby.
- Na GitHub Pages po nasazení: Oslo má panel „O cestě“ se 2 odstavci, 5× tučně a 4× kurzívou, Polsko má shrnutí bez vodorovného posouvání, Dublin bez shrnutí panel nezobrazí. V konzoli nebyly chyby.

## Podrobnější shrnutí se Stravou (9. 11. 2026)

- `tests/migration.test.ts` ověřuje náhradu popisu: bez přesné shody `nahrazuje` skončí chybou, s ní přepíše text, druhý běh je bez změn a tělo souboru zůstane shodné. Odmítne `nahrazuje` u jiného druhu návrhu i shodné se zapisovaným textem.
- Před zápisem prošlo 29 textů schématem a security lintem. Zkouška migrace měla 29 změn jen v `verejny_popis`. Po zápisu druhý běh 0 změn. Porovnání se zálohou: 22 popisů nahrazeno přesně z původního textu, 7 doplněno, ostatní soubory beze změny, těla bajtově shodná.
- Export změnil jen 29 hodnot `popis`, všechny shodné se schválenými texty. `npm run check` prošel (8 souborů, 42 testů).
- Náhled: Poreč 2026 má 7 jízd s tepem a watty, Babí hora nové shrnutí, Oslo beze změny. Nejdelší texty (Poreč, Bormio) na 390 px bez vodorovného posouvání, konzole bez chyb.
- Na GitHub Pages po nasazení: Bormio má 5 jízd a souhrn 433 km, 10 489 m, tep 136, 149 W; nové shrnutí Hustopečí má 2 jízdy. Bez vodorovného posouvání, konzole bez chyb.

## Shrnutí podle Martinových doplnění (9. 11. 2026)

- Migrace se zastavila na neplatné YAML hlavičce Alicante a Londýna (editor slil řádky hlavičky a escapoval znaky). Před obnovou se soubory s poškozenou hlavičkou ověřeně zkopírovaly stranou. Londýn se obnovil ze zálohy, Alicante ze zálohy s popisem zapsaným stejnou funkcí migrace. Tělo Alicante je bajtově shodné se zálohou.
- Zkouška migrace pak měla 5 změn jen v `verejny_popis` a druhý běh 0 změn. Porovnání se zálohou: 3 popisy nahrazeny, 2 doplněny, ostatní soubory beze změny.
- Export změnil 5 hodnot `popis`, všechny shodné se schválenými texty. `npm run check` prošel (8 souborů, 42 testů). V náhledu má Londýn 4 odrážky, Dublin a Polsko (6 odrážek) se vykreslily bez chyb.

## Nová místa z potvrzených shrnutí (9. 11. 2026)

- Zkouška migrace měla 3 změny jen v poli `mista` a přísný náhled bez varování u dotčených cest. Po zápisu druhý běh 0 změn. Porovnání se zálohou: u tří cest se místa jen přidala, ostatní soubory beze změny, těla shodná.
- Export: 78 míst, `cesty.json` se změnil jen v seznamech míst tří cest. `npm run check` prošel (8 souborů, 42 testů).
- Náhled: `?stat=PL` ukazuje 8 ověřených míst s popisky Toruň, Gdaňsk, Sopoty, Hel, Łeba, Malbork a Jastrzębia Góra. Popisek Gdyně se kvůli překryvu nevykreslí, bod ano. `?stat=ES` má popisky Alicante a Finestrat, `?stat=GB` Londýn a Watford. Konzole bez chyb.

## Vzhled „Cestovní deník“ (10. 11. 2026)

- Kontrola barev: `node docs/design/tools/gen-barvy.mjs x --jen-kontrola`. Text aspoň 4,5 : 1, datové barvy a zvýrazněné číslo aspoň 3 : 1, pár Česko / zahraničí rozlišitelný při protanopii i deuteranopii. Čísla v heatmapě na `q3` mají 4,8 : 1.
- Ve stylech stránek nesmí zůstat barva napevno: `grep -rnE "#[0-9a-fA-F]{3,6}\b|rgba?\(" src/styles src/lib src/pages` najde jen stín polaroidu.
- Ověření při předání (lokálně): `npm run check` prošel (8 souborů, 42 testů). V náhledu sestavení měly Přehled, Kronika, Statistiky (Měsíce i Celé roky) a detail cesty na 1440 i 390 px `scrollWidth` rovný šířce okna a žádné chyby JavaScriptu. Na snímcích sedí barvy, Palatino, ručně psaný nadtitulek, polaroid, vlajky v 8 sloupcích a vlajka vpravo na kartách cest.

## Úpravy Přehledu podle připomínek (10. 11. 2026)

- `tests/stats.test.ts` ověřuje součty grafů po letech: cesty dají 96, noci 349 ze 79 cest se známým počtem nocí, neznámé noci se nepočítají jako nula.
- Ověření při předání (lokálně): `npm run check` prošel (8 souborů, 43 testů). Přehled na 1920, 1440, 1280, 1200, 1120 a 390 px a Kronika, Statistiky a detail na 1440 a 390 px bez vodorovného posouvání a bez chyb JavaScriptu. Po přesunu grafů po letech do Statistik znovu ověřen Přehled a Statistiky (Měsíce i Celé roky) na 1440 a 390 px. Na snímcích končí mapa a karta státu na stejné výšce (1440 a 1920 px) a nadpis se vejde vedle fotky na všech šířkách.

## Plovoucí okno cesty, písma a sdílení (10. 11. 2026)

- `tests/trip.test.ts` ověřuje obsah detailu: popis, fakta, mapa pod termínem a sport za ní, vlajka, žádné další cesty ani stránkování.
- Ruční kontrola v sestavení (Chrome, 1440 px): karta cesty otevře okno a adresa dostane `?cesta=`. Okno zavře křížek, „← Zpět“, Esc, klik mimo okno i Zpět v prohlížeči, adresa se vrátí. Přímý odkaz `kronika.html?cesta=…` okno otevře a po zavření zůstane na Kronice. Pruh v Celých rocích otevře okno a ponechá `?pohled=roky`. Filtr „Jen s popisem“ ukáže 35 cest. Vrstva Místa má státy podle počtu cest a 78 bodů.
- Písma: na Windows se žádný soubor `.woff2` nestáhne (Atlas Serif = Palatino, Atlas Hand = Ink Free). Lokální soubory načtené přes `FontFace`: Pagella má všechny české znaky, Patrick Hand nemá „ď“.
- `dist/*.html` mají absolutní `og:image` a `og:url` na GitHub Pages.
- `npm run check` prošel (9 souborů, 44 testů). Všechny stránky, okno a stránka „Cesta nenalezena“ na 1440 i 390 px bez vodorovného posouvání a bez chyb JavaScriptu.
- Po pushnutí do `main` prošly [kontrola i nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42759562130). Na veřejné adrese vrátily všechny čtyři stránky HTTP 200. `og:image` je absolutní a obrázek (1200 × 630, 159 kB) i pět souborů písem vrací HTTP 200. V Chrome na 1440 i 390 px byly Přehled, Kronika, Statistiky, detail cesty a plovoucí okno (`?cesta=`) bez vodorovného posouvání a bez chyb JavaScriptu.

## PWA (10. 11. 2026)

- `tests/pwa.test.ts` ověřuje manifest (název, `standalone`, rozsah, ikony 192, 512 a maskable, existence souborů), seznam souborů pro offline bez duplicit a bez písem a že service worker zůstává na vlastní doméně.
- Instalovatelnost: Chrome přes DevTools Protocol (`Page.getAppManifest`, `Page.getInstallabilityErrors`) hlásí 0 chyb manifestu a 0 překážek instalace. Service worker je aktivní a uloží 28 souborů.
- Offline: po načtení webu se zastavil server náhledu. Kronika s oknem cesty (`?cesta=`) a mapou, Statistiky (Měsíce, Celé roky, grafy po letech), samostatná stránka cesty a Přehled s `?stat=HR` se načetly ze service workeru i se styly. První pokus odhalil neshodu kvůli hlavičce `Vary`, opraveno přes `ignoreVary`.
- Neověřeno automaticky: instalace na skutečném telefonu (Android, iPhone). Postup je v `docs/design/system.md`, kapitola 5.
- Po pushnutí do `main` prošly [kontrola i nasazení](https://github.com/pocitacpc-hub/travel-atlas/actions/runs/42760617693). Na Pages vrací `manifest.webmanifest`, `sw.js` a všechny čtyři ikony HTTP 200 se správným typem a stránky mají odkazy na manifest a `apple-touch-icon`. Chrome nad veřejnou adresou hlásí 0 chyb manifestu a 0 překážek instalace. Service worker je aktivní s 28 uloženými soubory, bez chyb JavaScriptu.
