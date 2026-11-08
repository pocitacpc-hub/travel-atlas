# Revize návrhu – Cestovní stopa (v0.1)

**Datum:** 8. 11. 2026
**Revidoval:** Claude Code (nezávislá oponentura)
**Podklady:** návrh zadání v0.1, interní export archivu `11 Cestování` (102 MD souborů, stav 8. 11. 2026), existující repo `TravelApp-PublishedTrips` (pro srovnání zavedeného postupu)
**Stav:** Návrh k diskusi. Nic se neimplementuje.

> Dokument záměrně neobsahuje finanční údaje, jména osob, odkazy na Google Drive ani jiná soukromá data. Pokud bude repo veřejné, je v něm bezpečný.

---

## 0. Shrnutí

- **Návrh je dobrý a architektura sedí.** Statický web + JSON + GitHub Pages je pro ~100 záznamů, které se mění pár za měsíc, správná volba. Nejsilnější částí zadání jsou pravidla poctivosti dat: neznámé ≠ 0, průjezd ≠ návštěva, žádné fiktivní souřadnice. Ta jsou cennější než volba technologií.
- **Hlavní slabina: zadání podceňuje datovou vrstvu.** Zdrojové MD zatím nejsou připravené na strojový export. Chybí stabilní ID. Místa jsou strukturovaně jen v 1 z 97 souborů a stav cesty je volný text. Typ cesty ve zdroji vůbec není a část ověřených termínů leží jen v analytických dokumentech. Web je ta snazší polovina práce.
- **Soukromí se musí vynucovat mechanismem, ne úmyslem.** Export musí fungovat jako allowlist polí. Text těla MD nesmí jít do výstupu nikdy. Veřejné repo i jeho Git historie musí zůstat bez surových MD.
- **Nevymýšlet nový stack.** Existující `TravelApp-PublishedTrips` už řeší totéž: veřejný statický web na Pages s validací schématu, security lintem, testy a publikační bránou v DevCenteru. Doporučuji převzít jeho toolchain (TypeScript + Vite + vanilla DOM + AJV + Vitest + GitHub Actions). Exportní skript psát taky v TypeScriptu. Python na vývojovém stroji není nainstalovaný.
- **MVP rozdělit:** Etapa 0 = data a export (bez webu), Etapa 1 = web se státy, Etapa 1b = místa na mapě. Sport, kronika a fotky přijdou až potom.

---

## 1. Co jsem ověřil v datech

Analýza YAML frontmatteru všech 97 souborů cest (skript mimo repo, nic se neměnilo):

| Kontrola | Výsledek |
|---|---|
| Počet cest (bez rozpočtu Itálie 2020) | **96** ✔ |
| Česko / zahraničí | **49 / 47** ✔ |
| Počet států | **15** ✔ |
| Noci celkem / se známou délkou / neznámé | **349 / 79 / 17** ✔ |
| Cesty bez roku | **4** ✔ |
| Řecko 2009 | **2009-07-20 – 2009-07-30, 10 nocí** ✔ |

Kontrolní hodnoty ze zadání se dají spolehlivě spočítat z frontmatteru, takže metadata jako primární vstup exportu fungují. Zároveň se ukázalo:

| Pole | Výskyt (z 97) | Důsledek |
|---|---:|---|
| `typ`, `nazev`, `zeme`, `zacatek`, `konec`, `pocet_noci` | 97 | Jádro je jednotné. |
| `rok`, `mesic_konani`, `mesic_jisty`, `stav_zaznamu` | 96 | Alicante 2026 má jiné schéma (chybí rok, měsíc, stav). Schéma se už rozjíždí. |
| `stav_zaznamu` | 6 různých volných textů | Vyloučení rozpočtu Itálie 2020 závisí jen na formulaci textu. |
| `oblast` | 3 | Regiony prakticky chybí. |
| `mista` | **1** | Pro body na mapě dnes chybí strukturovaný vstup. |
| `id` | **0** | Stabilní identifikátor neexistuje. |
| typ cesty (dovolená/víkend/…) | **0** (všude `typ: cesta`) | Požadovaný „typ“ ve zdroji není. |
| `strava_*` souhrny | 23 | Souhrny jsou ve frontmatteru, jednotlivé aktivity jen v tabulkách v těle. |
| Odkazy na Google Drive/Docs v těle | 91 souborů | Tělo MD nesmí jít do výstupu. |

Konkrétní rozpory v datech jsou v kapitole 9.

---

## 2. Celkové zhodnocení

| Oblast | Hodnocení |
|---|---|
| Vize a vymezení vůči TravelApp | Jasné, dobře oddělené. Jen historie a statistiky, žádné plánování. |
| Architektura (statický web) | Vhodná. Žádný backend ani DB, nulové provozní náklady, dlouhá životnost. |
| Princip „MD je zdroj pravdy“ | Správný. Je ale potřeba ho dotáhnout: zdrojem jsou jen metadata, ne text ani podpůrné přehledy. |
| Datový model | Dobrý základ, ale chybí místa jako číselník, přesnost termínu jako výčet, oddělení délky od zaměření a stav jako výčet. |
| Pravidla poctivosti dat | Výborná. Doporučuji je převést do automatických testů. |
| Soukromí | Správně identifikované. Chybí ale mechanismus, který ho vynutí. |
| Rozsah MVP | Uživatelsky přiměřený, datově podceněný. |
| Akceptační kritéria | Dobrý směr. Kritéria 7, 8 a 10 je potřeba zpřesnit, aby byla testovatelná. |

---

## 3. Připomínky podle důležitosti

Značení: **[Zásadní]** řešit před vývojem · **[Důležité]** řešit v MVP · **[Volitelné]** zlepšení, nikoli problém.

### Z1 [Zásadní] Stabilní ID musí vzniknout ve zdrojovém MD, ne v exportu

- **Problém:** Žádný soubor nemá `id`. Jediný identifikátor je název souboru a ten se mění.
- **Doklad:** Soubor `2026-05 - Chata - Dolní Moravice.md` byl přejmenován na `2026-06 - …`, protože GPS ukázala jiný měsíc. Dokument „Časová osa“ dodnes odkazuje na starý název.
- **Dopad:** Kdyby export odvozoval ID z názvu nebo data, každá oprava termínu by rozbila odkazy na aktivity, fotky, URL detailu i sdílené odkazy.
- **Doporučení:** Do frontmatteru doplnit `id`. Má být krátké a náhodné, bez data a názvu (například `t-4k7m2q`) a jednou přidělené se už nemění. Export ID nepřiděluje ani nezapisuje do zdroje, jen kontroluje přítomnost a unikátnost. Doplnění ID do 96 souborů je jednorázový krok (Etapa 0).

### Z2 [Zásadní] Frontmatter zatím není úplný zdroj pravdy

- **Problém:** Část ověřených faktů je jen v těle MD nebo v podpůrných dokumentech.
  - Termíny ověřené GPS jsou jen v dokumentu „Časová osa“ u 10 cest: Bormio 2026, Poreč 2025, Vir 2025, Domažlice 2025, Dublin 2025, Slovinsko 2026, Lednice 2026, Pasohlávky 2026, Rožnov 2025 a Jižní Morava 2025. Ve frontmatteru mají `zacatek: null`. Ve všech 10 případech termín sedí s `pocet_noci`.
  - Místa jsou v názvech souborů a v textu („Piran, Izola a Bled“), ve frontmatteru jen u Alicante.
- **Dopad:** Export z frontmatteru by tyto údaje ztratil. Parsovat text a tabulky z těla je křehké a ve chvíli, kdy nové MD napíše jiný AI nástroj jiným stylem, se tiše rozbije.
- **Doporučení:** Pravidlo: **co není ve frontmatteru, pro web neexistuje.** Před vývojem udělat jednorázovou normalizaci metadat podle kontraktu v kapitole 6: ID, stav, přesnost termínu, místa, zaměření a přenesení termínů z Časové osy. Kontrakt uložit jako `_SCHEMA.md` přímo do složky `11 Cestování`, aby ho při zakládání nových cest viděl ChatGPT, Codex i Claude.

### Z3 [Zásadní] Stav cesty jako volný text nestačí

- **Problém:** `stav_zaznamu` má 6 textových variant. Rozpočet Itálie 2020 se od skutečných cest liší jen formulací „Uskutečnění … nepotvrzeno“.
- **Dopad:** Jedna přeformulovaná věta a neověřená cesta se začne počítat. Přesně tomu má zadání (pravidlo 4) zabránit.
- **Doporučení:** Strojové pole `stav: probehla | planovana | neoverena` a pole `zverejnit: true | false`. Volný text může zůstat jako poznámka. Export bere jen `stav: probehla` a `zverejnit: true`. Navíc jen cesty, které už skončily (`konec` < dnes): web je archiv a nemá prozrazovat, že je člověk právě pryč z domova.

### Z4 [Zásadní] Soukromí vynutit mechanismem

- **Problém:** Zdrojové MD obsahují odkazy na Drive a Sheets (91 souborů), finance, adresu ubytování, čísla letů, počty a věk účastníků a rodinné poznámky. Názvy aktivit ze Stravy obsahují křestní jména spolucestujících. Zadání soukromí popisuje, ale neříká, jak ho zajistit.
- **Další fakt:** GitHub Pages na bezplatném plánu vyžaduje **veřejné repo**. Veřejné je tedy všechno v repu včetně Git historie, skriptů a dokumentace. Soubor commitnutý omylem jen na minutu zůstane v historii.
- **Doporučení (stejně jako u PublishedTrips):**
  1. Export čte zdroj **mimo repo** (lokálně synchronizovaná složka Drive, cesta v lokální konfiguraci). Surové MD se do repa nikdy nekopírují.
  2. **Allowlist** polí. Export sestaví výstup jen z vyjmenovaných polí, nic nekopíruje „celé“. JSON Schema s `additionalProperties: false`.
  3. **Text těla MD se neexportuje nikdy.** Veřejný popis jen z dedikovaného pole (`verejny_popis`).
  4. **Security lint** nad výstupem: zakázané vzory (`drive.google.com`, `docs.google.com`, `czk`, `Kč`, `strava.com`, vzory adres, seznam jmen).
  5. **Deterministický výstup** (stabilní řazení, formátování), aby `git diff` ukázal přesně, co se mění. Ruční kontrola diffu před commitem funguje jako poslední lidská brána.
  6. Souřadnice míst jen na úroveň obce. U soukromých chat a chalup neuvádět přesný bod.

### Z5 [Zásadní] Číselník míst je pro mapu nutnost, ne volitelná položka

- **Problém:** Zadání uvádí `mista.json` jako volitelný. Bez něj ale mapa míst nemá odkud brát souřadnice (viz Z2) a opakovaná místa se zdvojí: Chata Heinz 7×, Penzion Visalaje 6×, Rožnov 7×, Poreč 3×.
- **Doporučení:** Číselník míst (gazetteer) s poli `id`, `nazev`, `aliasy`, `zeme`, `oblast`, `lat`, `lon`, `presnost` (obec / oblast). V MD se místa píšou **jménem** (`mista: [Piran, Izola, Bled]`), export je převede přes číselník včetně aliasů (např. Alcossebre / Alcoceber). Neznámé místo vyvolá varování a cesta se zobrazí bez bodu, nikdy s odhadem. Body na mapě se agregují **po místech**, ne po cestách („Jeseníky – Chata Heinz: 7 návštěv“).

### D1 [Důležité] „Typ cesty“ míchá délku a zaměření

- **Problém:** Výčet „dovolená / víkend / výlet / sportovní pobyt“ kombinuje dvě nezávislé dimenze. Sedmidenní Poreč na kole je dovolená i sportovní pobyt zároveň.
- **Doporučení:**
  - **Délka** se nikam neukládá. Počítá se z `pocet_noci` (pásma 1 / 2 / 3–4 / 5–7 / 8–10 / 11+ / neznámá, stejně jako v dnešní statistice).
  - **Zaměření** se ukládá jako krátký řízený seznam štítků, například `kolo`, `turistika`, `more`, `hory`, `mesto`, `chata`, `kemp`, `akce`. Cesta může mít víc štítků. Slovník definuje schéma a export odmítne neznámou hodnotu.

### D2 [Důležité] Termín jako hodnota + přesnost, bez zástupného „00“

- **Problém:** Neznámý měsíc se dnes kóduje jako `"2020-00"`, jistota jako `mesic_jisty`. U cest převzatých z rozpočtu může měsíc pocházet z data platby, ne z termínu cesty (případ Dolní Moravice).
- **Doporučení:** Pole `zacatek`, `konec` (ISO nebo null), `rok`, `mesic` (1–12 nebo null) a výčet `presnost_terminu: den | mesic | rok | neznamy`. Když je známé `zacatek`, `rok` a `mesic` se odvodí. Pokud jsou vyplněné i ručně, validátor kontroluje shodu. V UI se přesnost zobrazuje („07/2005, den neznámý“, „rok neznámý“).

### D3 [Důležité] Validátor s reportem je součást exportu

- **Doporučení:** Export kromě JSON vypíše **report**.
  - **Chyby (export se zastaví):** chybí ID, duplicitní ID, neznámá země, neznámá hodnota výčtu, neplatné datum, `konec` < `zacatek`.
  - **Varování (export pokračuje):** neznámé místo, nesoulad termínu a nocí, překryv dvou cest, aktivita mimo termín cesty, chybějící místa.
- Všechny rozpory z kapitoly 9 by takový validátor našel automaticky.

### D4 [Důležité] Převzít toolchain z TravelApp-PublishedTrips

- **Doporučení:** TypeScript + Vite + vanilla DOM + vlastní CSS + AJV + Vitest + GitHub Actions (deploy přes Pages artifact). Exportní skript taky v TS (`tsx`). Viz odpověď na otázku 4.

### D5 [Důležité] Ukazovat pokrytí dat u každé neúplné statistiky

- **Problém:** U 17 cest nejsou známé noci, u 15 měsíc, u 4 rok a Strava pokrývá jen výběr let 2023–2026. Holé číslo „349 nocí“ vypadá jako úplný součet.
- **Doporučení:** Každé číslo z neúplných dat nese pokrytí: „349 nocí · známo u 79 z 96 cest“, „sezónnost z 81 cest se známým měsícem“, „Strava: výběr 2023–2026, ne kompletní historie“. Neznámá hodnota se v UI zobrazuje jako „—“ nebo „neznámo“, nikdy jako 0. Dnešní statistický MD má u roků 1996–2000 a u Německa ve sloupci „známé noci“ hodnotu 0. Ve sloupci „známé“ je to formálně správně, ale na webu v grafu nebo kartě by to četl každý jako „0 nocí“. Proto „—“ a pokrytí.

### D6 [Důležité] Definovat „cestu“ a „návštěvu země“

- **Cesta:** Archiv dnes počítá i dvoudenní sportovní výjezdy bez potvrzeného noclehu. Jiné výjezdy (Praha, jižní Čechy podle GPS) ale ne. Pravidlo, co ještě je a co už není cesta, je potřeba napsat jednou větou.
- **Země:** Pro vícestátní cesty doplnit volitelné pole `dalsi_zeme`: jen skutečně navštívené země, nikdy průjezd ani odvození z GPS nebo Stravy. Dnes ho žádná cesta nepotřebuje. Projížďka z Jaroslavic do Rakouska je typický průjezd. Statistika „cest podle země“ zůstává podle hlavní země, „navštívené státy“ = sjednocení `zeme` a `dalsi_zeme`.

### D7 [Důležité] Sportovní data: jeden zdroj a deduplikace podle ID

- **Problém:** Souhrny Stravy jsou ve frontmatteru a zároveň v tabulkách v těle, tedy na dvou místech. Jednotlivé aktivity existují jen jako tabulky v textu.
- **Doporučení:**
  - V MVP jen souhrn u detailu cesty z polí `strava_*`.
  - V Etapě 2 vytvořit `aktivity.json` z originálního exportu Stravy plus mapování `stravaId → cestaId`. Deduplikovat podle ID aktivity (kvůli budoucímu Garminu).
  - Příznak `vyloucit_ze_statistik` pro anomálie: „turistika“ 41,8 km za 1:10 h (Horní Bečva 2023). Aktivita zůstane, jen se nezapočítá.
  - **Názvy aktivit nepublikovat** (obsahují jména). Odkazy na Stravu jen po výslovném rozhodnutí.

### D8 [Důležité] Kontrolní hodnoty jako automatický test

- Kontrolní hodnoty nepatří do kódu webu jako konstanty, ale ani nemají zůstat jen v textu zadání. Doporučuji zmrazit kopii exportovaného JSON (stav 8. 11. 2026) jako testovací fixture a nad ní ve Vitestu ověřovat výpočet statistik: 96 / 49 / 47 / 15 / 349 / 79 / 17 / 4 / Řecko 2009. Živá data hlídá schéma a validátor, logiku výpočtu hlídá fixture.

### V1 [Volitelné] Mapa celého světa až později

- Všech 15 zemí je v Evropě. Pohled na celý svět je teď zbytečný. Stačí zvolit geodata, která ho později umožní (viz otázka 5).

### V2 [Volitelné] Přepínač karty / tabulka nahradit responzivním seznamem

- Na desktopu tabulka, na mobilu karty, automaticky. Jeden komponent, žádný přepínač.

### V3 [Volitelné] Tmavý režim jen automaticky

- Barvy od začátku řešit přes CSS proměnné a `prefers-color-scheme`. Pak je tmavý režim skoro zdarma. Ruční přepínač až později.

### V4 [Volitelné] Vyřadit slabé vizualizace

- **Koláč podílu států:** 15 kategorií, z toho Česko 51 %. Stejnou informaci lépe předá sloupcový graf.
- **Desetiletí:** devadesátá léta mají v archivu jen 4 roky, dvacátá jsou neúplná, srovnání je zavádějící. Graf po letech vypráví totéž poctivěji.

### V5 [Volitelné] Duplicitní statistika na Drivu

- `Statistika cest 1996-2026.md` a tabulka v `README.md` jsou ručně udržované odvozené přehledy. Po spuštění webu budou statistiky na dvou místech a začnou se rozcházet (porušení pravidla 8 ze zadání). Doporučuji je buď generovat stejným exportem, nebo z nich nechat jen odkaz na web.

### V6 [Volitelné] Propojení s TravelApp

- U cest, které mají publikovaný itinerář v TravelApp-PublishedTrips (např. Polsko 2026), lze v detailu uvést odkaz. Pole `odkaz_itinerar` půjde přes allowlist, jen pokud jde o veřejnou URL.

---

## 4. Odpovědi na otázky ze zadání

**1. Je architektura HTML/CSS/JS + JSON + GitHub Pages vhodná dlouhodobě?**
Ano. Statické soubory přežijí desetiletí a nemají provozní náklady ani bezpečnostní plochu serveru. Výkon při ~100 záznamech (JSON v desítkách kB) není téma. Omezení jsou dvě. Za prvé, všechno je veřejné, protože Pages nemají přihlášení. Kdyby později vznikla rodinná neveřejná část (kronika, fotky), řeší se šifrováním (podobně jako plánovaný trezor v PublishedTrips) nebo jiným hostingem s přístupovou vrstvou, ne v MVP. Za druhé, dlouhodobě nejkřehčí jsou externí služby (mapové dlaždice, CDN) a stárnutí npm závislostí. Proto minimum závislostí, žádné CDN, knihovny přes npm s lockfilem. I kdyby build za pár let nešel spustit, nasazený web dál funguje.

**2. Je oddělení MD (zdroj) a JSON (publikační vrstva) správné? Jak řešit export?**
Ano, správné a nutné. Nejjednodušší spolehlivé řešení na tomto stroji: složka `11 Cestování` je lokálně synchronizovaná přes Google Drive for desktop. Exportní skript ji přečte přímo z disku, bez Google API, OAuth a servisních účtů. Postup: `npm run export` → validace + report → `npm run check` → kontrola `git diff` → commit → push → Actions nasadí. Vygenerovaný JSON se commituje, protože GitHub Actions lokální disk nevidí. JSON se nikdy needituje ručně: hlavička `"generated": true` a CI kontrola. Automatická synchronizace (hlídání složky, plánovaná úloha) až po MVP, nejlépe jako akce v DevCenteru podle vzoru publikační brány PublishedTrips.

**3. Je datový model dostatečný?**
Koncepčně skoro ano: null pro neznámé, víc míst na cestu, stabilní ID, verze schématu. Chybí: číselník míst (Z5), přesnost termínu jako výčet (D2), oddělení délky a zaměření (D1), stav jako výčet a příznak zveřejnění (Z3), `dalsi_zeme` (D6), u aktivit ID ze Stravy a příznak anomálie (D7). Největší mezera ale není v cílovém JSON, nýbrž ve zdroji (Z1, Z2). Návrh je v kapitole 6.

**4. Čistý JavaScript, nebo lehký framework?**
Bez UI frameworku (React, Vue a Angular nejsou potřeba), ale s lehkým buildem. Doporučuji stejný stack jako PublishedTrips: TypeScript + Vite + vanilla DOM.
- **Pro:** Už ho udržujete, je ověřený na Pages a má hotový vzor validace, security lintu, testů, deploye i publikační brány v DevCenteru.
- **Pro:** TypeScript pomáhá právě s hlavním rizikem projektu, tedy s poli, která můžou být `null`. Kompilátor donutí ošetřit „neznámo“ všude, kde se počítá.
- **Pro:** Leaflet a Chart.js přes npm se zamčenými verzemi, bez CDN.
- **Proti:** build krok a `node_modules`. U ~5 závislostí je to zanedbatelné.
- **Alternativa:** čistý JS bez buildu je proveditelný, ale ztratíte typy, sdílený pipeline a testovací vzor. Pro dva podobné weby nemá smysl udržovat dva různé postupy.
- Routování přes hash (`#/cesta/<id>`), aby přímé odkazy na Pages nekončily chybou 404.

**5. Jak realizovat mapu? Knihovny a limity?**
- **Leaflet** (malý, stabilní, nativně umí GeoJSON a dobře funguje na mobilu). MapLibre GL je pro tento účel zbytečně těžký, vlastní D3 + SVG znamená implementovat zoom a interakce sám.
- **Hranice států:** Natural Earth (public domain), zjednodušené přes mapshaper a uložené jako statický soubor v repu. Pro Evropu spíš měřítko 1:50m kvůli pobřeží a ostrovům, hrubší 1:110m řadu malých ostrovů nemá. Velikost změřit, cíl jsou stovky kB, ne MB.
- **Podklad:** doporučuji začít **bez mapových dlaždic**, jen polygony států a body na neutrálním pozadí. Je to rychlejší, nezávislé na cizí službě a vizuálně čistší „atlas“. Navíc žádné požadavky návštěvníků nejdou na servery třetích stran. Dlaždice se dají přidat později. OSM dlaždice mají usage policy, vyžadují atribuci a nejde o garantovanou službu. Komerční poskytovatelé chtějí API klíč, který by byl ve veřejném repu.
- **Choropleth** podle počtu cest s hlavní zemí. Barva nesmí být jediný nosič informace: legenda plus seznam zemí vedle mapy (na mobilu pod ní). Ten slouží zároveň jako přístupná alternativa k mapě.
- **Body:** jeden bod = jedno místo z číselníku, velikost nebo štítek podle počtu návštěv. Při současném počtu míst není potřeba clustering. Místa s přesností jen „oblast“ (Jeseníky, Riviera Adriatica) odlišit stylem, nebo je na mapu nedávat (rozhodnutí).
- **Mobil:** popupy Leafletu nahradit spodním panelem (bottom sheet) se seznamem cest. Náhled mapy na úvodní stránce udělat **neinteraktivní** (klik otevře mapu), jinak mapa „zachytává“ posouvání stránky prstem.
- **Limity:** hranice států se v historii měnily (Jugoslávie a Chorvatsko 1997–1999). Doporučuji počítat podle dnešních států a jednou větou to uvést v metodice.

**6. Které statistiky přinesou největší hodnotu? Co chybí, co je zbytečné?**
- **Nejvyšší hodnota:**
  1. Mapa zemí s detailem země (počet cest, první a poslední známý rok, noci s pokrytím, seznam cest).
  2. Cesty po letech, skládaný graf Česko / zahraničí. Ukazuje hlavní příběh, nárůst po roce 2020.
  3. „Sbírka zemí“: kdy přibyla která země a kumulativní počet. U Německa „rok neznámý“.
  4. **Návraty:** místa navštívená opakovaně (Jeseníky, Visalaje, Poreč 3 roky po sobě). Emočně nejcennější a vyžaduje číselník míst.
  5. Rekordy: nejdelší pobyt, nejvíc cest za rok, nejvíc zahraničních cest za rok.
- **Chybí:** indikace pokrytí (D5), datum aktualizace dat v patičce, krátká metodika „Jak číst data“ (hlavní země, průjezd, neznámé hodnoty, dnešní hranice) a strukturovaný detail země.
- **Zbytečné nebo slabé:** koláč podílů, desetiletí (V4), samostatná „nejdelší série opakovaných pobytů“ (sloučit do Návratů) a samostatná „Země navštívené opakovaně“ (je vidět v grafu zemí). Volitelně heatmapa rok × měsíc jako kompaktní náhrada sezónnosti, s pokrytím.

**7. Je MVP přiměřené?**
Uživatelsky ano, ale chybí v něm datová příprava, která je pracnější než web. Návrh etap je v kapitole 7. Hlavní změny: přidat Etapu 0 (data a export), mapu míst oddělit do Etapy 1b, sport stránku dát do Etapy 2.

**8. Hlavní rizika**

| Oblast | Riziko | Opatření |
|---|---|---|
| Kvalita dat | Fakta mimo frontmatter se ztratí | Z2: normalizace, pravidlo „co není v metadatech, neexistuje“ |
| Kvalita dat | Rozjíždění schématu: nové MD píšou různé AI nástroje (Alicante už má jiné schéma) | `_SCHEMA.md` ve složce, validátor s chybami |
| Kvalita dat | Rozpory (překryv termínů, noci vs. termín, Strava vs. GPS) | D3: report varování a jejich vyřešení na Drivu |
| Kvalita dat | Měsíc z data platby místo termínu cesty | D2: přesnost termínu, metodika |
| Soukromí | Únik těla MD, financí, jmen, odkazů na Drive | Z4: allowlist, lint, schéma bez dalších polí, kontrola diffu |
| Soukromí | Veřejná Git historie | Zdroj čtený mimo repo, `.gitignore`, nikdy necommitovat surová data ani dočasně |
| Soukromí | Prozrazení nepřítomnosti doma | Publikovat jen ukončené cesty |
| Soukromí | Fotky s GPS v EXIF (Etapa 3) | Při publikaci fotek EXIF odstraňovat |
| Výkon | Prakticky žádné; nejtěžší jsou geodata | Zjednodušit geometrii, mapovou knihovnu načítat až na stránce mapy |
| Údržba | Stárnutí npm závislostí | Minimum závislostí, lockfile, stejný stack jako PublishedTrips |
| Údržba | Externí mapové služby | Mapa bez dlaždic |

**9. Pojmenování, navigace, úvodní stránka**
- **Název:** „Cestovní stopa“ je dobrý: česky, výstižně „kde jsem byl“, nekoliduje s TravelApp. Lokální složka se už jmenuje `TravelAtlas`. Název repa se propisuje do URL (`…github.io/<repo>/`), takže je potřeba rozhodnout `TravelAtlas` (konzistentní s `TravelApp`) vs. `cestovni-stopa` (česká URL). Doporučuji zobrazovaný název „Cestovní stopa“ a slug repa podle toho, jakou URL chcete sdílet.
- **Navigace (4 položky):** Přehled · Mapa · Cesty · Statistiky. Na mobilu spodní lišta. Sport a Kronika přibydou jako 5. a 6. položka v dalších etapách. V UI důsledně používat „cesty“ (ne střídat dovolená / výlet / cesta).
- **Úvodní stránka (shora):**
  1. Neinteraktivní mapa zemí jako hlavní vizuál, vedle nebo pod ní pruh KPI: **Cesty 96 · Státy 15 · Zahraničí 47 / Česko 49 · Nocí 349 (u 79 cest) · Letos N.** Pět dlaždic místo šesti, protože Česko a zahraničí jsou jedna dlaždice.
  2. Posledních 5 cest (karty).
  3. Graf po letech (Česko / zahraničí).
  4. TOP země (krátký seznam s odkazem na mapu).
  5. Tři zajímavosti nebo rekordy.
  6. Patička: „Data k 8. 11. 2026“ a odkaz na metodiku.
  Úvodní stránka nemá kopírovat celé Statistiky. Každý blok odkazuje na svou stránku.

**10. Nejasné, příliš složité nebo zbytečně omezující části**
- **Nejasné:**
  - Co je „cesta“ (D6).
  - Zda „Sport na cestách“ patří do MVP. Kapitola 4 ho řadí mezi hlavní obrazovky, seznam MVP v kapitole 9 ho neuvádí. Doporučení: v MVP jen souhrn v detailu cesty.
  - Jak se počítají vícestátní cesty (D6).
- **Rozpor:** Akceptační kritérium 8 mluví o „přidání nové cesty do JSON“. JSON se ale ručně editovat nemá, cesta se přidává do MD a JSON vznikne exportem. Kritérium je potřeba přeformulovat.
- **Netestovatelné:** kritérium 7 („bez chybných odhadů“) a 10 („neobsahuje nechtěně zveřejněná data“). Návrh testovatelné podoby je v kapitole 8.
- **Zbytečně složité:**
  - Mapa světa, přepínač karty / tabulka, filtry „období“ na mapě. V MVP stačí rozsah let a zaměření.
  - Statistika „nejdelší série“.
- **Zbytečně omezující:** „`zeme` jako ISO kód“ platí pro výstupní JSON. Ve zdrojovém MD je pro člověka i pro AI lepší ponechat český název („Slovinsko“) a převádět ho pevnou tabulkou v exportu. Neznámý název = chyba exportu.
- **Drobnost:** „Neaktivnější“ → „Nejaktivnější“.

---

## 5. Doporučená architektura a datový tok

```text
Google Drive (lokálně synchronizovaná složka „11 Cestování“)
  *.md – YAML frontmatter = zdroj pravdy, tělo = soukromé poznámky
        │
        │  npm run export   (TS; cesta ke zdroji v lokální konfiguraci mimo repo)
        │  - čte jen frontmatter, jen soubory s typ: cesta
        │  - allowlist polí, převod českých názvů zemí na ISO
        │  - místa přes číselník míst (aliasy), neznámé → varování
        │  - jen stav: probehla, zverejnit: true, konec < dnes
        ▼
Validace: JSON Schema (AJV) + konzistenční pravidla + security lint
        │  report: CHYBY (export se zastaví) / VAROVÁNÍ (rozpory, neznámá místa)
        ▼
public/data/cesty.json, mista.json   (deterministický výstup, commitovaný)
        │  ruční kontrola git diff → commit → push
        ▼
GitHub Actions: lint + validate + security-lint + test + build → GitHub Pages
        │
        ▼
Prohlížeč: načte JSON, statistiky počítá čistý TS modul
           (tentýž modul testuje Vitest nad zmrazenou fixture)
```

Struktura repa podle vzoru PublishedTrips, přibližně:

```text
schemas/        cesty.schema.json, mista.schema.json
tools/          export-cest.ts, validate-content.ts, security-lint.ts
data-src/       mista.yaml (číselník míst – referenční data, ne evidence cest)
public/data/    cesty.json, mista.json (generované)
public/geo/     zjednodušené hranice států
src/            app (stránky), data (načtení + typy), stats (čisté funkce), styles
tests/          fixture 2026-11-08 + testy statistik a exportu
docs/           current-state, testing, decisions, analysis
```

Číselník míst doporučuji držet **v repu**: souřadnice obcí nejsou osobní data, potřebují verzování a validaci a nejsou to další evidence cest. Cesty dál odkazují na místa jménem ze svého MD.

---

## 6. Návrh datového modelu

### 6.1 Kontrakt frontmatteru ve zdrojovém MD (cílový stav po normalizaci)

```yaml
---
typ: cesta
id: t-4k7m2q                 # povinné, náhodné, neměnné
nazev: "Řecko – Chalkidiki"
stav: probehla               # probehla | planovana | neoverena
zverejnit: true              # false = export cestu vynechá
zeme: "Řecko"                # český název hlavní země (export → GR)
dalsi_zeme: []               # jen skutečně navštívené, ne průjezd
zacatek: 2009-07-20          # ISO nebo null
konec: 2009-07-30            # ISO nebo null
rok: 2009                    # povinné jen když zacatek chybí; jinak se kontroluje shoda
mesic: 7                     # 1–12 nebo null; totéž
presnost_terminu: den        # den | mesic | rok | neznamy
pocet_noci: 10               # null = neznámo, nikdy 0 jako „nevím“
mista: [Sarti]               # jména podle číselníku míst (aliasy povoleny)
zamereni: [more]             # řízený slovník štítků
verejny_popis: null          # jediný text, který smí na web
# Stávající soukromá pole (finance, ubytování, účastníci, strava_* …)
# zůstávají beze změny; export je ignoruje, pokud nejsou v allowlistu.
---
```

Příklad nedatované cesty: `rok: null`, `mesic: null`, `presnost_terminu: neznamy`, `pocet_noci: null`, `mista: [Korčula]`.

### 6.2 Veřejný výstup `cesty.json`

```json
{
  "schemaVersion": 1,
  "generated": true,
  "dataAsOf": "2026-11-08",
  "cesty": [
    {
      "id": "t-4k7m2q",
      "nazev": "Řecko – Chalkidiki",
      "zeme": "GR",
      "dalsiZeme": [],
      "zacatek": "2009-07-20",
      "konec": "2009-07-30",
      "rok": 2009,
      "mesic": 7,
      "presnostTerminu": "den",
      "pocetNoci": 10,
      "mista": ["gr-sarti"],
      "zamereni": ["more"],
      "popis": null,
      "sport": null
    }
  ]
}
```

- `sport` (jen u cest se Stravou): `{ "aktivit": n, "km": x, "prevyseniM": y, "zdroj": "strava-vyber-2023-2026" }`.
- Vynechané úmyslně: finance, ubytování, účastníci, odkazy, poznámky, původní název souboru.
- Délka (pásmo), domácí / zahraniční a všechny součty se **počítají**, neukládají.

### 6.3 `mista.json` (z číselníku)

```json
{ "id": "gr-sarti", "nazev": "Sarti", "zeme": "GR", "oblast": "Chalkidiki",
  "lat": "…ověřená hodnota…", "lon": "…ověřená hodnota…", "presnost": "obec" }
```

### 6.4 `aktivity.json` (Etapa 2)

```json
{ "id": "strava:1234567890", "cestaId": "t-…", "datum": "2026-08-15",
  "druh": "kolo", "km": 0, "prevyseniM": 0, "casPohybuS": 0,
  "vyloucitZeStatistik": false }
```

Bez názvu aktivity, odkaz jen po rozhodnutí. Zdroj = originální export Stravy + mapování, ne tabulky z těla MD.

---

## 7. Doporučená podoba MVP a etapy

### Etapa 0 – Data a export (bez UI)

1. Kontrakt `_SCHEMA.md` ve složce cest a šablona nové cesty.
2. Jednorázová normalizace frontmatteru na Drivu: ID, `stav`, `zverejnit`, `presnost_terminu`, `mista`, `zamereni`, přenos termínů z Časové osy. Před změnou záloha složky.
3. Vyřešení rozporů z kapitoly 9 (rozhoduje uživatel).
4. Číselník míst se souřadnicemi na úroveň obce.
5. Exportní skript, JSON Schema, validátor s reportem, security lint, test kontrolních hodnot.

**Hotovo, když:** export vyrobí 96 cest a kontrolní hodnoty projdou, report nemá chyby, varování jsou vědomě přijatá, lint je čistý.

### Etapa 1 – MVP web (státy)

- **Přehled:** KPI s pokrytím, statický náhled mapy, posledních 5 cest, graf po letech, TOP země, 3 zajímavosti, datum dat.
- **Mapa:** choropleth zemí, detail země (panel / bottom sheet), seznam zemí jako alternativa, filtr rozsahu let a zaměření.
- **Cesty:** vyhledávání, filtry (země, rok, zaměření, délka), řazení (datum, délka), responzivní seznam, skupina „Rok neznámý“ na konci, jednoduchý detail cesty s přesností termínu a souhrnem Stravy.
- **Statistiky:** země (počty, noci s pokrytím, první a poslední rok), roky (Česko / zahraničí), měsíce (s pokrytím), délka pobytu (pásma, medián, průměr), rekordy.
- **Metodika „Jak číst data“** (krátká sekce).
- Deploy přes GitHub Actions, automatický světlý / tmavý režim.

### Etapa 1b – Místa na mapě

- Body z číselníku agregované po místech, klik → cesty v místě, sekce **Návraty** ve statistikách.

### Etapa 2 – Sport

- Stránka Sport na cestách z `aktivity.json`: deduplikace podle ID, anomálie, rekordy, jasné označení „výběr 2023–2026“.

### Etapa 3 – Kronika a fotky

- Veřejné vzpomínky z `verejny_popis` nebo vyhrazené sekce, fotky (bez EXIF GPS), životní období.

### Etapa 4 – Automatizace

- Akce v DevCenteru (export → check → diff → commit → push) podle vzoru publikační brány PublishedTrips. Případně hlídání změn ve složce.

---

## 8. Upravená akceptační kritéria (testovatelná podoba)

1. Web běží na GitHub Pages bez backendu a databáze, nasazení přes Actions s povinným krokem `check`.
2. Export současného archivu vyrobí 96 cest. Automatický test nad fixture 2026-11-08 ověří 49 / 47 / 15 / 349 / 79 / 17 / 4 a Řecko 2009 (20.–30. 7., 10 nocí).
3. Rozpočet Itálie 2020 (`stav: neoverena`) ve výstupu není. Cesty s `konec` v budoucnu ve výstupu nejsou.
4. JSON odpovídá schématu s `additionalProperties: false`. Security lint nenajde zakázané vzory (odkazy na Drive a Docs, měnu, Stravu, adresy, jména ze seznamu).
5. Cesty bez roku se počítají do zemí, nejsou v grafech po letech a měsících a v archivu jsou ve skupině „Rok neznámý“ (test).
6. Neznámé noci se zobrazují jako „—“, nepočítají se jako 0 a součty uvádějí pokrytí „u X z Y“ (test).
7. Cesta bez místa nebo souřadnic se zobrazí v archivu i ve statistikách země, na mapě nemá bod (test).
8. Přidání nové cesty = nový MD na Drivu + `npm run export` + commit. Bez změny kódu se promítne do KPI, grafů i mapy.
9. Kliknutí na stát zobrazí jeho cesty. Mapa má seznamovou alternativu.
10. Všechny stránky jsou použitelné na šířce 375 px. Náhled mapy na úvodní stránce nezachytává posouvání.

---

## 9. Zjištěné rozpory a mezery ve zdrojových datech

Neopravoval jsem je. Jde o seznam k rozhodnutí. Validátor z D3 by je měl hlásit automaticky.

| # | Cesta | Zjištění | Návrh |
|---|---|---|---|
| 1 | Řím 2022 × Rychlebské hory 2022 | **Shodný termín 26.–30. 5. 2022, obě 4 noci.** U Rychleb jsou navíc platby z dubna. | Ověřit, která cesta má termín špatně (pravděpodobně kopie). |
| 2 | Murter a Betina 2023 | 25. 7. – 3. 8. = 9 nocí, ve frontmatteru 8 (už známo) | Rozhodnout termín nebo noci. |
| 3 | Jižní Morava – víkend 2025 | Strava má aktivity 4.–5. 9. (čtvrtek–pátek, Hustopeče), Časová osa ukazuje pobyt 13.–14. 9. (víkend). | Přiřazení Stravy (vedené jako „pravděpodobné“) může patřit jinému výjezdu. Ověřit. |
| 4 | 10 cest 2025–2026 | Termín z Časové osy je jen v analytickém dokumentu, ve frontmatteru `null` (seznam v Z2). Noci ve všech případech souhlasí. | Přenést do frontmatteru při normalizaci. |
| 5 | Santa Susanna 2005 | Neplatné „37. 7.“ (i v bratrově soupisu) | `presnost_terminu: mesic`, nic neodhadovat. |
| 6 | Alicante 2026 | Jiné schéma frontmatteru (chybí `rok`, `mesic_konani`, `stav_zaznamu`) | Sjednotit při normalizaci. Doklad rizika rozjíždění schématu. |
| 7 | Nedatovaná cesta – Německo – „Varne minde“ | Název bez jednoznačné lokality | Bez potvrzení na mapu nedávat. Možná jde o Warnemünde, ale je to jen hypotéza k ověření. |
| 8 | Dolní Moravice 2026 | Po přejmenování souboru zůstal starý odkaz v dokumentu Časová osa | Doklad pro Z1 (stabilní ID). |
| 9 | Strava, Jaroslavice 2026 | Názvy aktivit obsahují křestní jméno spolucestující osoby | Názvy aktivit nepublikovat (D7). |
| 10 | Horní Bečva 2023 | Aktivita „turistika“ 41,8 km za 1:10 h | Příznak `vyloucit_ze_statistik`. |

---

## 10. Otevřená rozhodnutí před vývojem

| # | Rozhodnutí | Doporučení |
|---|---|---|
| 1 | Definice „cesty“ (nocleh? jednodenní výlety? sportovní výjezd bez noclehu?) | Jedna věta v `_SCHEMA.md`; současný stav (96) zachovat |
| 2 | Počítání zemí u vícestátních cest | Hlavní země + volitelné `dalsi_zeme` (jen potvrzený pobyt) |
| 3 | Kdo a jak provede normalizaci metadat na Drivu (ChatGPT / Codex / Claude) a kdo potvrdí rozpory z kap. 9 | Jeden nástroj, se zálohou složky a předávacím blokem |
| 4 | Toolchain | TS + Vite + vanilla DOM jako PublishedTrips |
| 5 | Mapový podklad | Bez dlaždic (jen polygony a body) |
| 6 | Přesnost bodů a místa s přesností „oblast“ | Úroveň obce; oblasti odlišit stylem, nebo nezobrazovat |
| 7 | Strava na webu: souhrny / odkazy / názvy | Souhrny ano, názvy ne, odkazy rozhodnout |
| 8 | Kde v MD je veřejný text | Pole `verejny_popis` (nic jiného z textu) |
| 9 | Název repa a URL (`TravelAtlas` vs. `cestovni-stopa`), zobrazovaný název | „Cestovní stopa“; slug podle požadované URL |
| 10 | Slovník štítků `zamereni` | Krátký řízený seznam (~8 hodnot) |
| 11 | Budoucnost `Statistika cest 1996-2026.md` a tabulky v README | Generovat exportem, nebo nahradit odkazem na web |
| 12 | Publikovat jen ukončené cesty | Ano |
