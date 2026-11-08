# Zadání pro Codex – další fáze: data, export a web Atlas cest

**Datum:** 8. 11. 2026 · **Pro:** Codex · **Od:** Claude Code (návrh a prototyp) · **Rozhoduje:** Martin
**Repo:** `C:\Dev\TravelAtlas` → https://github.com/pocitacpc-hub/travel-atlas (veřejné)
**Cílový web:** https://pocitacpc-hub.github.io/travel-atlas/

---

## Text k vložení do Codexu

```text
Pracuješ v repu C:\Dev\TravelAtlas (projekt „Cestovní stopa“ – osobní atlas cest).
Nejdřív přečti:
1. docs/changes/2026-11-08-zadani-codex-dalsi-faze.md (toto zadání – hlavní zdroj),
2. docs/analysis/2026-11-08-revize-navrhu-cestovni-stopa.md (revize, datový model),
3. docs/design/system.md a docs/design/v2/ (schválený vzhled a prototyp).
Pracuj po fázích A → B → C → D. Na konci každé fáze spusť ověření,
aktualizuj dokumentaci a checklist, napiš předávací blok a zastav se.
Na Google Drive nic nezapisuj bez mého výslovného souhlasu (kromě kroků
popsaných ve fázi C, a to až po mém potvrzení). Repo je veřejné:
nikdy do něj nekopíruj zdrojové Markdowny ani reporty exportu.
Začni fází A.
```

---

## 1. Kde jsme

**Hotovo** (vše je na `main` a pushnuté):

| Co | Kde |
|---|---|
| Revize návrhu, datový model, rizika, otevřená rozhodnutí | `docs/analysis/2026-11-08-revize-navrhu-cestovni-stopa.md` |
| 5 maket, z nich vybrán směr Atlas | `docs/design/01–05-*.html` |
| Prototyp v2: Přehled, Kronika, Statistiky (Měsíce / Celé roky, Státy), detail cesty, vlajky | `docs/design/v2/` |
| Popis vzhledu a komponent | `docs/design/system.md` |
| Výpočty statistik z prototypu (vzor chování) | `docs/design/assets/viz.js`, `docs/design/v2/assets/app.js` |
| Pomocné skripty (mapa, snímky obrazovky) | `docs/design/tools/` |

**Kontrolní hodnoty** (spočítané z metadat 8. 11. 2026, musí sedět i po exportu): 96 cest · 49 Česko / 47 zahraničí · 15 států · 349 nocí u 79 cest · 17 bez délky · 4 bez roku · Řecko 2009 = 20.–30. 7., 10 nocí.

**Projektové soubory podle globálních pravidel** (`AGENTS.md`, `README.md`, `CODEX-DEV-RUNBOOK.md`, `docs/current-state.md`, checklist) **zatím neexistují**. Vzniknou ve fázi A.

---

## 2. Rozdělení: Google Drive × repo × web

Tohle je hlavní hranice projektu. Platí pro všechny fáze.

### 2.1 Google Drive – soukromý zdroj pravdy

Složka `AI/MD/OsobniSystem/11 Cestování/`, lokálně synchronizovaná, např. `G:\Můj disk\AI\MD\OsobniSystem\11 Cestování` (102 souborů).

| Co | Obsah | Kdo upravuje |
|---|---|---|
| `RRRR-MM - Destinace.md` (1 soubor = 1 cesta) | **YAML metadata** = jediný vstup exportu; **tělo** = soukromé poznámky, finance, plány, tabulky Stravy, souhrny GPS, odkazy | Martin / ChatGPT / Claude ručně; Codex jen migrací ve fázi C |
| `_SCHEMA.md` (nový) | kontrakt metadat a šablona nové cesty, aby nové cesty od kteréhokoli AI měly stejná pole | připraví Codex v repu, na Drive ho dá Martin nebo Codex po souhlasu |
| `README.md`, `Statistika cest 1996-2026.md`, `Bratrovy poznámky…`, `Strava – přiřazení…`, `Časová osa…` | podpůrné a odvozené dokumenty | zůstávají, **export je nečte** |

Pravidla:
- **Co není v YAML metadatech, pro web neexistuje.** Text těla se nikdy neparsuje.
- Finance, ubytování, účastníci, odkazy na Drive / Sheets / Docs, GPS a rodinné poznámky zůstávají **jen na Drivu**.
- Export Drive jen čte. Zapisovat smí výhradně migrační skript ve fázi C, a to se zálohou a po potvrzení.

### 2.2 Repo `travel-atlas` – veřejné

| Co | Kde | Poznámka |
|---|---|---|
| Kód webu (TS + Vite + vanilla DOM) | `src/` | podle `docs/design/system.md` a prototypu v2 |
| Exportní a kontrolní nástroje | `tools/` | `export-cest.ts`, `migrate-metadata.ts`, `validate-content.ts`, `security-lint.ts`, `build-map.ts` |
| Schémata | `schemas/` | JSON Schema s `additionalProperties: false` |
| Referenční data | `data/zeme.json`, `data/mista.yaml`, `data/migrace/*.yaml` | státy (český název ↔ ISO ↔ vlajka), číselník míst, ručně schválené návrhy migrace |
| **Vygenerovaná veřejná data** | `public/data/cesty.json`, `public/data/mista.json` | jen výstup exportu, nikdy ruční úpravy (`"generated": true`) |
| Testy | `tests/` | Vitest; fixture 2026-11-08 s kontrolními hodnotami |
| Dokumentace | `docs/`, kořenové `*.md` | česky |
| **Nikdy v repu** | – | zdrojové `.md` z Drivu, reporty exportu (`out/`), `config.local.json`, `.env*` |

Repo je veřejné včetně historie. Soubor commitnutý omylem jen jednou v ní zůstane.

### 2.3 Web Atlas cest (GitHub Pages) – co uvidí návštěvník

- **Stránky:** Přehled · Kronika · Statistiky · detail cesty, podle `docs/design/v2/`.
- **Údaje o cestě:** ID, název, hlavní stát (ISO) a případné další státy, termín s přesností (`den` / `mesic` / `rok` / `neznamy`), počet nocí (nebo null), místa (jen ověřená), zaměření, veřejný popis (zatím prázdný), souhrn sportu (počet aktivit, km, převýšení).
- **Nikdy na webu:** finance, ubytování, adresy, účastníci a jejich věk, jména (ani v názvech aktivit Stravy), odkazy na Stravu a Drive, čísla letů, text těla MD, neověřené nebo plánované cesty, cesty, které ještě neskončily.

---

## 3. Výchozí rozhodnutí

Codex podle nich pracuje, dokud Martin neřekne jinak. Každé zapiš do `docs/decisions/`.

| # | Téma | Výchozí rozhodnutí |
|---|---|---|
| 1 | Definice cesty | zachovat současných 96 záznamů, včetně 2 sportovních výjezdů bez potvrzeného noclehu (`pocet_noci: null`) |
| 2 | Počítání států | hlavní země `zeme` + volitelné `dalsi_zeme` (jen potvrzený pobyt, nikdy průjezd ani odvození z GPS nebo Stravy) |
| 3 | ID cesty | `t-` + 6 znaků `[a-z0-9]`, náhodně, jednou přidělené se nemění; nikdy z data ani názvu |
| 4 | Zveřejnění | `zverejnit: true` u všech cest se `stav: probehla`; neověřený rozpočet Itálie 2020 → `stav: neoverena`; export bere jen cesty, které skončily (`konec` < dnes; u přesnosti `mesic` konec měsíce < dnes; u `rok` rok < aktuální) |
| 5 | Sport na webu | souhrny ano, názvy aktivit a odkazy na Stravu ne |
| 6 | Veřejný text | jen pole `verejny_popis` (zatím prázdné), nic z těla MD |
| 7 | Číselník míst | `data/mista.yaml` v repu, souřadnice na úroveň obce, pole `overeno`; na mapu jen `overeno: true` |
| 8 | Slovník `zamereni` | `kolo`, `turistika`, `more`, `hory`, `mesto`, `chata`, `kemp`, `akce` |
| 9 | Stack | jako `C:\Dev\TravelApp-PublishedTrips`: Node ≥ 22, TypeScript (strict), Vite, Vitest, AJV, `tsx`, GitHub Actions + Pages; bez React / Vue / Angular |
| 10 | Vlajky | lokální podmnožina flag-icons (MIT) jen pro státy z dat, třídy `.fi .fi-xx` jako v TravelApp |
| 11 | Mapa | Natural Earth 1:50m (balíček `world-atlas`) převedená při buildu do statického souboru, projekce a výřez podle `docs/design/tools/README.md`, bez mapových dlaždic |
| 12 | `Statistika cest 1996-2026.md` na Drivu | zatím ponechat jako odvozený přehled, později generovat exportem |

---

## 4. Fáze

Každá fáze končí ověřením, aktualizací dokumentace a checklistu a předávacím blokem. Další fáze začíná až po potvrzení.

### Fáze A – Založení projektu

1. **Projektové soubory podle globálních pravidel:**
   - `AGENTS.md`: projektová pravidla, včetně hranice Drive × repo × web z kapitoly 2 a zákazů z kapitoly 5.
   - `CLAUDE.md`: obsahuje jen `@AGENTS.md` a odkaz na něj.
   - `README.md`, `CODEX-DEV-RUNBOOK.md` (cesty, porty, příkazy, kde je zdroj dat, co nesmí agent rozbít).
   - `docs/current-state.md`, `docs/00-zadani-a-checklist.md` (fáze A–F se stavy Nezačato / Rozpracováno / Hotovo…), `docs/changelog.md`, `docs/testing.md`.
   - `docs/decisions/0001…` pro rozhodnutí z kapitoly 3.
2. **`.gitignore`:** `node_modules/`, `dist/`, `out/`, `config.local.json`, `.env*`, `*.local.*`.
3. **`.gitattributes`** s `* text=auto eol=lf` a `*.png binary`, aby zmizely dosavadní hlášky LF → CRLF. Normalizaci (`git add --renormalize .`) udělej samostatným commitem.
4. **Toolchain podle vzoru PublishedTrips:**
   - Skripty v `package.json`: `dev`, `build`, `lint` (`tsc --noEmit`), `test`, `validate-content`, `security-lint`, `export`, `check` (lint + validate + security-lint + test + build).
   - Vite `base: '/travel-atlas/'`.
5. **GitHub Actions:** kontrola na push a PR; nasazení na Pages z `main` (Pages artifact). Nastavení „Pages source = GitHub Actions“ udělá Martin ručně, napiš mu to do runbooku.
6. **Kostra webu:** jedna stránka s hlavičkou a patičkou podle `system.md`, aby šel ověřit build a nasazení.

**Hotovo, když:** `npm run check` projde lokálně i v CI, prázdná kostra běží na Pages, dokumentace a runbook odpovídají skutečnosti.

### Fáze B – Datový kontrakt a export (bez zápisu na Drive)

1. **Kontrakt metadat** `docs/data/_SCHEMA.md`, vycházet z revize, kap. 6.1:
   - Povinná pole: `typ: cesta`, `id`, `nazev`, `stav`, `zverejnit`, `zeme` (český název), `zacatek`, `konec`, `presnost_terminu`, `pocet_noci`.
   - Podmíněně povinná: `rok` a `mesic`, když chybí `zacatek`.
   - Volitelná: `dalsi_zeme`, `mista` (jména podle číselníku), `zamereni`, `verejny_popis`.
   - Stávající soukromá pole (finance, `strava_*`, ubytování…) se ponechají, export je ignoruje. Výjimkou je `strava_pocet_aktivit`, `strava_celkem_km` a `strava_prevyseni_m` pro souhrn sportu.
   - Přidej šablonu nové cesty.
2. **Referenční data:**
   - `data/zeme.json`: 15 států, český název, ISO a soubor vlajky. Neznámý název = chyba exportu.
   - `data/mista.yaml`: kandidáti z `docs/design/tools/gen-assets.js`, všichni `overeno: false`, s poli `id`, `nazev`, `aliasy`, `zeme`, `oblast`, `lat`, `lon`, `presnost` (`obec` / `oblast`), `overeno`.
3. **`tools/export-cest.ts`:**
   - Zdrojová složka z `config.local.json` nebo proměnné `CESTY_ZDROJ`.
   - Čte jen YAML metadata souborů s `typ: cesta`, skutečným YAML parserem (balíček `yaml`).
   - Výstup sestavuje **jen z povolených polí**, státy převádí na ISO, místa přes číselník (aliasy).
   - Výstup je deterministický (stabilní řazení i formát) a nese `schemaVersion`, `generated: true` a `dataAsOf`.
   - **Režim `--legacy`** pro současná metadata: ze `stav_zaznamu` odvodí stav (text „nepotvrzeno“ → `neoverena`), z `mesic_konani` „RRRR-00“ → `mesic: null`, z `mesic_jisty` přesnost, a přidělí dočasná ID `tmp-…`.
   - Výstup s `tmp-` ID **nesmí projít** `validate-content`, takže se nedá commitnout.
   - Bez `--legacy` platí přísný kontrakt.
4. **Validátor s reportem** do `out/export-report.md` (mimo Git):
   - **Chyby (export se zastaví):** chybí nebo je duplicitní ID, neznámý stát, neplatná hodnota výčtu, neplatné datum, `konec` < `zacatek`.
   - **Varování:**
     - neznámé nebo neověřené místo, nesoulad termínu a nocí, překryv dvou cest se známými daty;
     - souhrn Stravy u cesty bez termínu v jiném měsíci;
     - chybí `mista`, stát bez vlajky.
5. **`tools/security-lint.ts`** nad `public/data`:
   - zakázané vzory `drive.google.com`, `docs.google.com`, `strava.com`, `czk`, `Kč`, `Calle `, čísla letů `[A-Z]{2}\d{3,4}`, `pocet_ucastniku`;
   - seznam jmen v lokálním (necommitovaném) souboru.
6. **Testy:**
   - Zmraz výstup `--legacy` z 8. 11. 2026 jako fixture (`tests/fixtures/`, jen veřejná pole). Dočasná `tmp-` ID tu nevadí, `validate-content` kontroluje jen `public/data`. Po fázi C fixture obnov s trvalými ID.
   - Ověř kontrolní hodnoty, převod přesnosti, `null` ≠ 0, vyřazení rozpočtu Itálie 2020, filtr „jen skončené cesty“, deterministický výstup a odmítnutí neznámého pole.

**Hotovo, když:**
- `npm run export -- --legacy` nad aktuálním Drivem vyrobí 96 cest a kontrolní hodnoty projdou.
- Report obsahuje známé rozpory (kap. 6) jako varování.
- Security lint je čistý.
- Na Drive se nezapsalo nic.

### Fáze C – Normalizace metadat na Drivu (jen s Martinem)

1. **`tools/migrate-metadata.ts`:**
   - **Výchozí je zkouška nanečisto:** pro každý soubor vypíše navrhovanou změnu metadat do `out/migrace-report.md`.
   - **Návrh obsahuje:** `id`, `stav`, `zverejnit`, `presnost_terminu`, `rok` a `mesic` ve správném tvaru, prázdné `mista: []` a `zamereni: []`.
   - Hodnoty, které nejdou spolehlivě odvodit, bere jen z ručně schváleného souboru `data/migrace/2026-11-navrhy.yaml`.
2. **`data/migrace/2026-11-navrhy.yaml` připraví Codex, schvaluje Martin:**
   - termíny z Časové osy pro 10 cest (kap. 6, bod 4);
   - návrhy `mista` (jen z názvu cesty, Martin potvrdí), `zamereni` a `dalsi_zeme`.
   - Každá položka má `potvrzeno: false`, dokud ji Martin nezmění.
3. **`--apply --backup <složka>`:**
   - nejdřív úplná záloha celé složky s časovou značkou;
   - pak přepis **jen YAML hlavičky**, tělo zůstane bajt po bajtu stejné;
   - skript je idempotentní (druhý běh nic nezmění) a nové ID nikdy nepřepíše existující.
4. **Martin rozhodne rozpory z kap. 6.** Codex nic nehádá a neopravuje sám.
5. **`_SCHEMA.md` na Drive** (Martin nebo Codex po souhlasu).
6. **Přísný export bez `--legacy`:** commit `public/data/*.json` s trvalými ID a obnova fixture.

**Hotovo, když:**
- Záloha existuje a druhý běh migrace je bez změn.
- Přísný export dá 96 cest se stálými ID a kontrolní hodnoty sedí.
- Validátor nemá chyby a zbylá varování jsou vědomě přijatá v `docs/current-state.md`.

### Fáze D – Web MVP

1. **Stránky podle prototypu v2 a `system.md`:** Přehled, Kronika, Statistiky (Kdy cestuji: Měsíce / Celé roky; Státy; Délka pobytu; Rekordy; Jak číst data) a detail cesty `cesta.html?id=…`.
2. **Moduly:**

   | Modul | Obsah |
   |---|---|
   | `stats` | čisté funkce, s testy nad fixture |
   | `format` | data, tvary slov, čísla, zkrácení názvů |
   | `map` | mapa států a míst |
   | `charts` | grafy po letech, měsíce, heatmapa, Celé roky, délka pobytu |
   | `pages` | jednotlivé stránky |

   Chování prototypu (`viz.js`, `v2/assets/app.js`) je specifikace, kód ale napiš znovu s typy.
3. **`tools/build-map.ts`:** vygeneruje hranice států z `world-atlas` při buildu, stejná projekce a výřez jako prototyp.
4. **Vlajky:** podmnožina flag-icons podle států v datech, generovaná při buildu.
5. **Místa na mapě a „Návraty“** jen z `overeno: true`. Neověřené místo = cesta bez bodu.
6. **Bez prototypových prvků:** žádné ilustrační body, žádný štítek „kolo“ z názvu, žádný box „Kontrola dat“ (rozpory řeší report exportu).
7. **Nasazení na Pages a smoke test** na https://pocitacpc-hub.github.io/travel-atlas/.

**Hotovo, když platí akceptační kritéria** (revize, kap. 8):
- web běží na Pages, kontrolní hodnoty sedí;
- neznámé údaje se zobrazují jako „—“ nebo „neznámo“ s pokrytím;
- cesty bez roku jsou ve státech, ne v letech;
- nová cesta = nový MD + export + commit, bez změny kódu;
- stránky fungují na 390 px bez vodorovného posouvání stránky;
- security lint je čistý a v CI není žádné neprošlé ověření.

### Další etapy (teď nedělat)

| Fáze | Obsah | Podmínka |
|---|---|---|
| **E – Místa (etapa 1b)** | Martin ověří souřadnice v `data/mista.yaml` | – |
| **F – Sport (etapa 2)** | `aktivity.json` z originálního exportu Stravy podle ID aktivity, příznak anomálie (Horní Bečva 2023 „turistika“ 41,8 km za 1:10 h), bez názvů a odkazů | – |
| **Kronika a fotky (etapa 3)** | odstraňovat GPS z EXIF | – |
| **Publikační brána (etapa 4)** | akce v DevCenteru: export → kontrola → diff → commit → push | podle vzoru TravelApp – Published Trip |

---

## 5. Pravidla pro Codex v tomto projektu

- **Nekopírovat** zdrojové `.md` z Drivu do repa, ani dočasně. Repo i historie jsou veřejné.
- `out/`, `config.local.json` a lokální seznam jmen se **nikdy necommitují**. Ověř to v `.gitignore` i v security lintu.
- **Drive jen čte.** Výjimkou je `migrate-metadata --apply` po výslovném souhlasu a se zálohou.
- **Nehádat fakta.** Neznámé zůstává `null`. Žádné odhadované termíny, noci ani souřadnice.
- **Žádné externí zdroje za běhu webu:** žádné CDN, mapové dlaždice ani webová písma z cizích serverů.
- Texty v UI česky s diakritikou. Formáty a tvary slov podle `system.md`, kap. 8.
- **Před každým commitem** `npm run check` a kontrola `git diff` veřejných dat.
- **Nesouběh nástrojů:** neběžet současně s Claude Code nad stejnými soubory. Po každé fázi předávací blok a `git status`.
- **Dokumentace je součást hotové práce:** `docs/current-state.md`, checklist, changelog, `docs/testing.md`, runbook.

---

## 6. Známé rozpory a mezery v datech

Nevyřešené, rozhoduje Martin. Validátor je musí hlásit.

1. **Řím 2022 × Rychlebské hory 2022:** shodný termín 26.–30. 5. 2022. U Rychleb jsou platby z dubna.
2. **Murter a Betina 2023:** 25. 7. – 3. 8. je 9 nocí, v metadatech 8.
3. **Jižní Morava – víkend 2025:** aktivity ve Stravě 4.–5. 9. (Hustopeče, čtvrtek–pátek), Časová osa ukazuje pobyt 13.–14. 9. Přiřazení Stravy je nejisté.
4. **Termíny z Časové osy jen v analytickém dokumentu, v metadatech `null`.** Ve všech případech sedí s počtem nocí:

   | Cesta | Termín |
   |---|---|
   | Bormio 2026 | 14.–21. 8. |
   | Poreč 2025 | 22.–30. 3. |
   | Vir 2025 | 29. 7. – 5. 8. |
   | Domažlice 2025 | 24.–29. 5. |
   | Dublin 2025 | 7.–10. 5. |
   | Slovinsko 2026 | 6.–10. 5. |
   | Lednice 2026 | 12.–14. 6. |
   | Pasohlávky 2026 | 28.–30. 8. |
   | Rožnov 2025 | 15.–17. 8. |
   | Jižní Morava 2025 | 13.–14. 9. |

5. **Santa Susanna 2005:** neplatné „37. 7.“ → přesnost `mesic`, nic neodhadovat.
6. **Alicante 2026:** jiný tvar metadat (chybí `rok`, `mesic_konani`, `stav_zaznamu`).
7. **„Varne minde“ (Německo):** poloha neověřená. Bez potvrzení nedávat na mapu.
8. **Názvy aktivit Stravy** obsahují jména spolucestujících. Nikdy je nezveřejňovat.

---

## 7. Předávací blok (Claude Code → Codex)

```text
Stav předání:
- Cíl: Navázat na schválený návrh a prototyp – založit projekt, postavit export
  z metadat na Google Drivu do veřejného JSON a web MVP podle prototypu v2.
- Změněné soubory (Claude Code): docs/analysis/*, docs/design/** (makety, prototyp v2,
  system.md, vlajky, nástroje), docs/changes/2026-11-08-zadani-codex-dalsi-faze.md,
  .claude/launch.json.
- Co je hotovo: revize, 5 maket, prototyp v2 (4 stránky), system.md, vlajky,
  toto zadání. Vše na main a na GitHubu.
- Ověřeno: kontrolní hodnoty z metadat (96/49/47/15/349/79/17/4, Řecko 2009);
  prototyp na 1440 a 390 px bez přetečení a chyb JS; interakce ručně v prohlížeči;
  kontrast barev (system.md, kap. 2 a 9).
- Neověřeno: souřadnice míst (ilustrační); žádný produkční kód, testy ani CI
  zatím neexistují; GitHub Pages nejsou zapnuté.
- Rizika: veřejné repo (únik soukromých dat při chybě exportu); rozjíždění
  tvaru metadat mezi AI nástroji; zápis na Drive (jen migrací se zálohou).
- Další krok: Fáze A (založení projektu), pak B (export bez zápisu na Drive).
```
