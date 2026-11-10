# Vzhled a komponenty – Cestovní stopa

**Stav:** 10. 11. 2026 · barvy a písmo podle vybraného návrhu **„Cestovní deník“** (návrh 06 v `docs/design/barvy/`, upravený Martinem), rozložení a komponenty podle prototypu „Atlas“ v2.
**Zdroj pravdy:** barvy a písma `src/atlas.css` (`:root`). Rozložení, komponenty a chování: `docs/design/v2/` – `assets/app.js` (sdílené komponenty), stránky `index.html`, `kronika.html`, `statistiky.html`, `cesta.html`. Výpočty a formátování: `docs/design/assets/viz.js`. Prototyp v2 má ještě původní barvy „Atlas“.
**Účel:** podklad pro implementaci MVP. Když se dokument a prototyp rozejdou, platí prototyp a dokument se opraví.
**Implementace (fáze D):** web v `src/` (`src/atlas.css`, `src/lib/`, `src/pages/`, `src/styles/`) převzal tokeny, komponenty, texty a URL parametry prototypu. Rozdíly proti prototypu jsou v kapitole 10. Název webu je **Cestovní atlas**.

---

## 1. Principy

1. **Atlas, ne dashboard.** Klidný „tištěný“ vzhled cestovního deníku: krémový papír, inkoustová modrá, rezavé akcenty, serifové nadpisy a ručně psaný nadtitulek, mapa jako hlavní vizuál. Hustota informací je střední, nikoli interní nástroj.
2. **Poctivost dat je vidět.** Neznámá hodnota se nikdy nezobrazí jako 0. Každé číslo z neúplných dat má pokrytí („známo u 79 z 96 cest“) a přesnost termínu je vždy čitelná.
3. **Vše se počítá z jednotlivých cest.** V HTML ani v kódu nejsou napsané žádné souhrny natvrdo.
4. **Mobil je plnohodnotný.** Každá stránka funguje na šířce 390 px bez vodorovného posouvání celé stránky. Posouvat se smí jen uvnitř boxu, například u heatmapy.
5. **Bez externích závislostí za běhu.** Systémová písma, žádné CDN, mapa bez dlaždic třetích stran, žádné požadavky na cizí servery.
6. **Česky, s diakritikou**, s českými tvary čísel a dat.

---

## 2. Barvy

Všechny barvy jsou CSS proměnné v `:root`. Kód používá role, nikdy přímé hodnoty.

### 2.1 Plochy, text a linky

| Token | Hodnota | Použití | Kontrast na papír / kartu |
|---|---|---|---|
| `--paper` | `#F2EADB` | pozadí stránky (krémový papír) | – |
| `--card` | `#FBF6EB` | panely, karty, povrch grafů | – |
| `--ink` | `#2E2419` | hlavní text, aktivní stav, tooltip (sépiová čerň) | 12,7 / 14,1 |
| `--ink-2` | `#4E4133` | sekundární text, ikony | 8,3 / 9,2 |
| `--muted` | `#6B5D4C` | popisky, poznámky, osy | 5,3 / 5,9 |
| `--line` | `#DCCDB4` | okraje panelů, oddělovače | – |
| `--line-2` | `#E9DFCB` | jemné obrysy (prázdné buňky heatmapy) | – |
| `--land` | `#E7DCC6` | nenavštívené státy na mapě | – |

### 2.2 Datové barvy a akcenty

| Token | Hodnota | Význam |
|---|---|---|
| `--cz` | `#2D5C88` | Česko (inkoustová modrá) |
| `--abroad` | `#B5613A` | zahraničí (rez) |
| `--cz-text` | `#2A5781` | text odkazů v modré (6,3 / 7,0 : 1) |
| `--q1` … `--q5` | `#C9D5E2`, `#9AB2CB`, `#6288AE`, `#2D5C88`, `#1B3A57` | sekvenční škála (počet cest), světlá → tmavá |
| `--accent` | `#A5532F` | zvýrazněné číslo v hlavním nadpisu (4,5 : 1 na papíře) |
| `--kicker` | `#9A4A28` | ručně psaný nadtitulek (5,2 : 1 na papíře) |
| `--photo-frame` | `#FFFDF8` | rámeček fotky (polaroid) |

- **Pár Česko / zahraničí:** kontrast vůči kartě 6,5 a 4,1 : 1. Rozlišitelnost ΔE v Lab (CIE76) po simulaci podle Machada 2009: běžně 74, protanopie 59, deuteranopie 73, tritanopie 77. Ověřuje `node docs/design/tools/gen-barvy.mjs x --jen-kontrola`.
- **Text nikdy ve `--cz` ani `--abroad`.** Pro odkazy je `--cz-text`. Datové barvy jsou jen pro značky (pruhy, plochy, body). Výjimkou je velký text nad 24 px, například zvýrazněné číslo v hlavním nadpisu (`--accent`).
- **Sekvenční škála:** choropleth státu má třídy 1 (`q1`), 2–5 (`q2`), 6–10 (`q3`), 11–20 (`q4`) a 21+ (`q5`). Heatmapa rok × měsíc používá 1, 2, 3 a 4+ jako `q1`, `q2`, `q3` a `q5`. Čísla v buňkách jsou na `q1`–`q3` v barvě `--q-ink` `#08182A` (4,8–12,0 : 1) a na `q5` v `--q5-ink` bílé (11,7 : 1).
- **Pomocné tokeny** (dřív napevno v CSS): `--hover` (podklad při najetí), `--shade` a `--shade-2` (průsvitné výplně legendy a oblastí), `--stripe` (střídavé řádky Celých roků), `--cz-tint` (zvýrazněný stát ve Statistikách), `--track` (podklad pruhů Návratů), `--grid` a `--grid-base` (mřížka a základna grafů, šrafování neznámé délky), `--flag-ring` (obrys vlajek, používá ho i generovaný `vlajky.css`) a `--tip-shadow`. Styly stránek nemají žádnou barvu napevno kromě stínu polaroidu.
- **Upozornění (kontrola dat):** pozadí `#FBF1E6`, okraj `#E8C9A9`, text `#6B3A10` (8,4 : 1). Používá se jen v prototypu, viz kapitola 10.
- **Tmavý režim** zatím není. Až přibude, dostane vlastní stupně stejných rolí ověřené proti tmavému povrchu a zapne se automaticky přes `prefers-color-scheme`. Nebude to jen převrácení barev.

---

## 3. Typografie

| Role | Písmo |
|---|---|
| `--serif` | `"Palatino Linotype", "Book Antiqua", Palatino, serif` – logo, nadpisy, velká čísla, roky |
| `--sans` | `"Segoe UI", system-ui, -apple-system, sans-serif` – text, ovládání, popisky, tabulky |
| `--hand` | `"Ink Free", "Segoe Print", "Bradley Hand", cursive` – jen nadtitulek (`.kicker`) |

| Prvek | Velikost (desktop / mobil) | Písmo |
|---|---|---|
| Hlavní nadpis Přehledu („15 států, 96 cest“) | 56 / 38 px | serif 400, číslo kurzívou v `--accent` |
| Nadpis detailu cesty | 50 / 34 px | serif 400 |
| Nadpis stránky (`.page-head h1`) | 46 / 36 px | serif 400 |
| Rok v Kronice | 44 / 32 px | serif 400 |
| Nadpis sekce (`h2.sec`) | 28 px, v panelu 24 px | serif 400 |
| Číslo ve faktech | 26 px (detail 22 / 19) | serif 400 |
| Název na kartě cesty | 21 px | serif 400 |
| Základní text | 15 px / 1,5 | sans |
| Poznámka, popisek, sekundární údaj | 13 px | sans |
| Nadtitulek (`.kicker`) | 19 px / 1,3, bez verzálek, v `--kicker` | hand |
| Popisky os grafů | 11–12 px | sans, `tabular-nums` |

- V tabulkách, na osách a všude, kde se čísla zarovnávají pod sebe, se používá sans s `font-variant-numeric: tabular-nums`.
- Písma jsou systémová a mají české znaky. Palatino Linotype a Ink Free jsou ve Windows. macOS má Palatino a místo Ink Free použije Bradley Hand. Na Androidu nahradí Palatino výchozí serif a Ink Free výchozí ručně psané písmo. Rozhodnutí, zda písma hostovat lokálně, je v kapitole 11.

---

## 4. Rozvržení

- **Kontejner:** maximálně 1320 px, boční okraje 28 px, na mobilu 16 px.
- **Mezery:** 24–28 px mezi bloky (`.stack` 24 px), vnitřní odsazení panelu 20 px (mobil 14 px).
- **Rádiusy:** panel 18 px (mobil 14), karta 16, kulaté ovládání (přepínač, chip, vyhledávání) 999, kód státu 5, konce pruhů 2–6 px.
- **Okraje:** 1 px `--line`. Stín má jen tooltip.

**Zlomy:**

| Šířka | Změna |
|---|---|
| ≤ 1100 px | dvousloupcové sekce (Přehled, Statistiky) se skládají pod sebe, karty cest ve 2 sloupcích |
| ≤ 900 px | detail cesty v jednom sloupci |
| ≤ 820 px | Kronika: lišta let se přesouvá nahoru jako vodorovný pás |
| ≤ 760 px | hlavička pod sebe, menší panely, ovládací prvky vysoké aspoň 44 px |
| ≤ 640 px | karty posledních cest jako vodorovný posuvný pás, menší nadpisy |

---

## 5. Stránky a navigace

Hlavní navigace má 3 položky: **Přehled · Kronika · Statistiky**. Detail cesty patří pod Kroniku, takže v menu je aktivní Kronika. Sport (etapa 2) a Mapa míst (etapa 1b) přibudou jako další položky.

| Stránka | Soubor | Parametry a kotvy |
|---|---|---|
| Přehled | `index.html` | `?stat=HR` vybraný a přiblížený stát |
| Kronika | `kronika.html` | `?stat=IT` filtr státu · `#y2023` rok · `#yunk` cesty bez roku |
| Statistiky | `statistiky.html` | `?pohled=mesice` nebo `?pohled=roky` · `#kdy` · `#staty` · `#stat-HR` (otevře stát) · `#metodika` |
| Detail cesty | `cesta.html?id=c038` | `id` = stabilní ID cesty |

- Výběr státu a pohledu se zapisuje do URL (`history.replaceState`), takže odkaz jde sdílet.
- Na GitHub Pages fungují samostatné HTML stránky s parametry bez potíží s chybou 404. ID v adrese musí být stabilní ID ze zdroje (viz revize, Z1), ne pořadí ani název souboru.

---

## 6. Komponenty

U každé komponenty je uvedeno, kde ji v prototypu najdete.

**Kostra**

- **Hlavička** (`APP.shell`): logotyp „Cestovní atlas“ serifovou kurzívou s podtitulkem „osobní atlas cest“ (na mobilu skrytý) a navigace jako kulatá tlačítka. Aktivní položka je tmavá (`aria-current="page"`).
- **Patička** (`APP.shell`): „Data k 8. 11. 2026“, „Neznámé údaje se nepočítají jako nula.“ a odkaz „Jak číst data“.
- **Záhlaví stránky** (`.page-head`): nadtitulek (rozsah let), H1, úvodní věta spočítaná z dat, volitelně legenda vpravo.
- **Panel** (`.panel`): karta na `--card` s okrajem `--line`. Záhlaví panelu (`.ph`) má nadpis a ovládání nebo legendu.

**Ovládání**

- **Přepínač** (`.seg`): skupina `<button aria-pressed>` v kulatém rámečku, aktivní je tmavý. Používá se pro Státy / Místa, Měsíce / Celé roky a Vše / Česko / Zahraničí.
- **Filtry** (`.filters`): přepínač rozsahu, výběr státu (`<select>` s počty) a hledání (`<input type="search">`). Počet výsledků je napsaný vpravo („Zobrazeno 11 cest z 96“, `aria-live`).
- **Drobné prvky:** chip (`.chip`) pro noci, km a přesnost; kód státu (`.code`) jako orámované ISO; odkaz (`.link`) tučně v `--cz-text`; legenda (`.legend`) se vzorky ploch, pruhů, pásů, teček a kroužků.

**Mapa a státy**

- **Mapa států** (`VZ.renderMap`): SVG ze statických hranic. Navštívené státy jsou zbarvené podle počtu cest, nenavštívené mají `--land`. Najetí nebo fokus ukáže tooltip a obrys v `--ink`, vybraný stát má obrys 2,2 px. Klik nebo Enter vybere stát.
- **Přiblížení státu** (Přehled): klik na stát v mapě nebo na jeho vlajku mapu plynule (0,45 s, bez animace při `prefers-reduced-motion`) přiblíží na stát. Výřez drží poměr stran celé mapy. Stát má výplň `--q2`, ostatní navštívené `--q1`, zobrazí se všechna ověřená místa s popisky (bez překryvu, důležitější místo má přednost). Body i písmo mají v přiblížení stálou velikost na obrazovce. Tlačítko „← Celá Evropa“ nebo klávesa Esc vrátí celou mapu. Klik na jiný stát v přiblížení přepne na něj.
- **Karta státu** (Přehled): název, kód, „11 cest · 1996–2026 · 82 nocí (známo u 9 z 11)“, posuvný seznam cest s odkazy na detail a odkazy „V kronice“ a „Ve statistikách“.
- **Seznam států** (`APP.statesList`): `<details>` pro každý stát. Řádek má kód, název, pruh (Česko tyrkys, ostatní okr), počet a podřádek s nocemi a pokrytím a rozsahem let. Po rozbalení se ukážou cesty a odkazy „Na mapě“ a „V kronice“.

**Cesty**

- **Karta cesty** (Přehled, Poslední cesty): stát verzálkami (bez vlajky), název serifem, termín, chipy (noci, km aktivit) a vlajka státu vpravo nahoře (26 px). Kroužek s kódem státu na kartě není. Celá karta je odkaz.
- **Fotka** (Přehled): polaroid vpravo vedle nadtitulku a nadpisu, rámeček `--photo-frame`, pootočený o 3°, bez popisku. Soubor `src/img/pobrezi.jpg` (480 × 270 px, bez metadat) zpracuje Vite při sestavení. Řada vlajek pod fotkou začíná až pod ní.
- **Řádek cesty v Kronice** (`.trip`): měsíc, pruh ve stopě o pevné šířce 13 nocí × jednotka (15 px, mobil 9 px), název, metadata a případně odznak „nová země“.
  - Pruh: Česko tyrkys, zahraničí okr, cesta se známým jen měsícem s průhledností 55 %, neznámá délka jako čárkovaný obrys.
- **Rok v Kronice** (`.year`): rok serifem, souhrn („9 cest · 5 do zahraničí, 38 nocí“) a seznam cest. Prázdný rok je zúžený řádek „bez záznamu v archivu“ (jen bez filtru). Cesty bez roku mají vlastní skupinu „?“.
- **Lišta let** (Kronika): na desktopu svislý seznam let s mini pruhy Česko / zahraničí a zvýrazněným aktuálním rokem, na mobilu vodorovný pás tlačítek.
- **Odznak „nová země“** (`.new`): obrysový štítek s hvězdou u první datované cesty do státu.

**Statistiky**

- **Fakta** (`.facts`): mřížka 2 × 2 s popiskem, serifovou hodnotou a drobným podtextem (pokrytí, přesnost).
- **Heatmapa rok × měsíc** (`APP.heatmap`): tabulka s pevnými sloupci. Řádky jsou roky od nejnovějšího, sloupce měsíce, za nimi oddělený sloupec „?“ (měsíc neznámý) a nakonec řádek „rok ?“. Buňky jsou vysoké 20 px s mezerou 3 px, prázdné mají jen obrys `--line-2`. Na úzkém displeji se tabulka posouvá uvnitř boxu (min. 520 px).
- **Celé roky** (`APP.yearRows`): každý rok jeden řádek leden–prosinec ve stopě úměrné dnům roku, se střídavými pruhy řádků a svislými čarami měsíců.
  - Přesný termín je plný pruh 9 px od začátku do konce cesty (min. 3 px).
  - Známý jen měsíc je čárkovaný pás s 28% výplní přes celý měsíc.
  - Známý jen rok je tečka (r = 4) ve sloupci „?“, nejvýš 3 vedle sebe.
  - Překrývající se položky jdou pod sebe do dalších řad. Klik vede na detail cesty.
- **Délka pobytu** (`APP.lengthHist`): svislé sloupce 1 / 2 / 3–4 / 5–7 / 8–10 / 11+ a šrafovaný sloupec „neznámá“ s hodnotou nad sloupcem.
- **Rekordy** (`APP.records`): mřížka 2 × 3 kartiček s velkým číslem, popiskem a podtextem. Kartička s konkrétní cestou je odkaz.

**Detail cesty**

- **Hlavička:** drobečková navigace „Kronika › rok › název“, nadtitulek se státem, H1, termín, chip přesnosti (když termín není přesný) a razítko s kódem a rokem.
- **Výřez mapy** (`APP.cropFor`): výřez kolem státu a míst v poměru 4 : 3, minimálně 240 × 180 jednotek. Vybraný stát je ve `--q3`, místa jsou tečky.
- **Sport na cestě:** tři hodnoty (aktivit, km, m převýšení) a věta, že jde o výběr Strava 2023–2026.
- **Další cesty do státu:** nejvýš 8 a odkaz „Všech N v kronice“.
- **Prázdný stav** (`.empty`): čárkovaný rámeček „Popis, vzpomínky a fotky zatím nejsou.“
- **Stránkování** (`.pager`): předchozí / další cesta. Datované cesty jdou chronologicky, cesty bez roku jen mezi sebou.

**Tooltip** (`.vz-tip`): tmavý (`--ink`) s papírovým textem, max. 280 px, u kurzoru a při fokusu u prvku. Nesmí nést informaci, která není jinde dostupná.

**Vlajka státu** (`APP.flag(code)` → `<span class="fi fi-cz" aria-hidden="true"></span>`)

- **Zdroj:** knihovna [flag-icons](https://github.com/lipis/flag-icons) (licence MIT), stejně jako v TravelApp (`src/TravelApp.Web/wwwroot/lib/flag-icons`). Třídy `.fi .fi-xx` jsou shodné, takže se vzhled i kód mezi aplikacemi dají přenášet.
- **Lokální podmnožina:** web generuje podmnožinu z npm balíčku `flag-icons` příkazem `npm run assets` do `src/generated/` (rozhodnutí 0013). Prototyp má ruční kopii v `v2/assets/flag-icons/`, ta obsahuje jen 15 vlajek z archivu (formát 4 : 3, SVG, celkem asi 173 kB, z toho Španělsko 91 kB a Chorvatsko 41 kB kvůli znakům), zkrácený `flag-icons.css` a `LICENSE`. Nic se nenačítá z CDN.
- **Vzhled:** výška = 1 em (velikost se řídí `font-size`), šířka 4/3 em, rádius 2 px, jemný obrys `rgba(30,43,51,.18)`, aby byly vidět i vlajky s bílým okrajem (Polsko, Rakousko, Česko).
- **Pravidla:**
  - Vlajka je vždy dekorace vedle názvu nebo kódu státu (`aria-hidden="true"`), nikdy nenese informaci sama.
  - Do nativního `<select>` se nedává.
  - V tmavém tooltipu obrys nevadí.
- **Kde je:**

  | Stránka | Místa s vlajkou |
  |---|---|
  | Přehled | řada vlajek pod hlavním nadpisem (15 tlačítek podle první návštěvy v mřížce 8 sloupců přes celou šířku sloupce, klik vybere stát, `aria-pressed`), karta státu, karty posledních cest (vpravo nahoře), tooltip mapy |
  | Kronika | metadata cesty |
  | Statistiky | seznam států (místo kódu, kód je malý vedle názvu), tooltipy heatmapy a Celých roků |
  | Detail cesty | nadtitulek, fakt „Stát“, nadpis „Další cesty“ |

- **Nový stát:** přidat ho do `data/zeme.json`. Vlajku doplní `npm run assets` z balíčku `flag-icons`. Export i generátor hlásí stát bez vlajky.

---

## 7. Grafy a mapa

- **Jeden graf = jedna osa.** Žádné dvě různé škály v jednom grafu.
- **Značky:** sloupce se zaobleným horním koncem (4 px) a rovnou základnou. Mezi skládanými segmenty je 2px mezera v barvě povrchu. Body mají průměr aspoň 8 px a obrys v barvě povrchu, pokud se překrývají.
- **Legenda** je vždy, když jsou v grafu aspoň dvě řady nebo třídy. Totožnost se nikdy nepozná jen podle barvy: pomáhají popisky, tooltip a seznam.
- **Osy a mřížka** jsou nevýrazné (`#E4DCCB`, základna `#BFB4A0`), popisky v `--muted` 11 px.
- **Tooltip** se ukazuje při najetí i při fokusu. Plocha pro najetí je větší než samotná značka (celý sloupec roku).
- **Alternativa:** ke každé vizualizaci existuje textová nebo tabulková cesta k údajům. Mapa má kartu a seznam států, Celé roky mají Kroniku a heatmapa má tooltip a Kroniku.
- **Mapa:**
  - Hranice z Natural Earth 1:50m (public domain), předpočítané do statického souboru.
  - Lambertova azimutální stejnoplochá projekce se středem 10° v. d. a 49° s. š., rámec 1000 × 823.
  - Mapa nemá podkladové dlaždice.
  - Tahy čar mají `vector-effect: non-scaling-stroke`.
  - Velikost bodu místa: r = 4 + 2,2 · √(počet cest) v jednotkách mapy, v přiblížení 3,5 + 1,5 · √(počet cest) v pixelech. Oblast se kreslí jako čárkovaný kroužek s 18% výplní.
  - Popisky os let: první rok a každý pátý rok, pátý rok bližší než tři roky za prvním se vynechá.
  - Do státu se počítá jen hlavní země cesty. Průjezd se nezobrazuje.

---

## 8. Zobrazení dat

| Situace | Zobrazení |
|---|---|
| Neznámý počet nocí | v tabulce „—“, v textu „nocí neznámo“ nebo „noci neznámé“, nikdy 0 |
| Součet z neúplných dat | „349 nocí · známo u 79 z 96 cest“ |
| Přesný termín | „26.–30. 5. 2022“, „27. 7. – 3. 8. 2026“, přes rok „27. 12. 2024 – 2. 1. 2025“ |
| Známý měsíc | „červenec 2005“ + chip „známý měsíc“ |
| Známý rok | „2001“ + chip „jen rok“ |
| Neznámý rok | „rok neznámý“, ve skupinách „?“ |
| Cesty bez roku | počítají se do států, ne do let a měsíců. Grafy po letech je mají zvlášť a označené. |
| „Nová země“ | první **datovaná** cesta do státu („první známá cesta“). Stát jen s nedatovanou cestou (Německo) má „rok první cesty neznámý“. |

- **Tvary slov:** 1 cesta / 2–4 cesty / 5+ cest, 1 noc / 2–4 noci / 5+ nocí. U desetinných čísel tvar „noci“ (4,4 noci).
- **Čísla** podle `cs-CZ`: mezera mezi tisíci, desetinná čárka. Před procenty a jednotkami je pevná mezera („49 %“, „46 km“).
- **Mezi číslem a měsícem** v datu je pevná mezera, aby se datum nezalomilo.
- **Název cesty:** když začíná názvem hlavní země („Itálie – Řím“), na kartách a v seznamech se předpona vynechá („Řím“). Názvy jako „Pasohlávky – Apalucha“ zůstávají celé.

---

## 9. Přístupnost

- **Kontrast:** běžný text aspoň 4,5 : 1, velký text a grafické značky aspoň 3 : 1. Hodnoty jsou v kapitole 2.
- Při revizi jsem opravil odkazy (`--cz` → `--cz-text`), popisky prázdných let v Celých rocích (`#9AA2A8` 2,3 : 1 → `--muted`) a výšku ovládacích prvků na mobilu (aspoň 44 px).
- **Ovládání klávesnicí:**
  - Navštívené státy na mapě mají `tabindex="0"`, `role="button"` a `aria-label` („Chorvatsko, 11 cest“) a vybírají se Enterem nebo mezerníkem.
  - Přepínače jsou `<button aria-pressed>`, státy `<details>/<summary>`, cesty běžné odkazy.
- **Fokus** se nesmí skrývat. Výchozí obrys prohlížeče zůstává, u státu na mapě je vlastní.
- **SVG** mají `role="img"` nebo `role="group"` s `aria-label`, dekorace mají `aria-hidden="true"`.
- **Známé mezery** (v implementaci řešit, nebo přijmout s alternativou):
  - Pruhy v pohledu Celé roky nejsou dosažitelné klávesnicí. Alternativou je Kronika.
  - Nejsvětlejší třída choroplethu (`q1`, 1 cesta) se od nenavštíveného státu liší jen málo (1,2 : 1). Alternativou je karta a seznam států, tooltip a `aria-label`.

---

## 10. Co je jen v prototypu

- **Body míst jsou ilustrační.** Souřadnice obcí jsou z obecné znalosti, nejde o ověřený číselník (revize, Z5). Bulharsko a „Varne minde“ bod nemají.
- **Štítek „kolo“** v `data.js` je odvozený z názvu cesty. Ve webu ho nahradí pole `zamereni` ze zdroje.
- **Upozornění „Kontrola dat“** (překryv termínů) v detailu cesty slouží k revizi. Ve veřejné verzi se rozpor opraví ve zdroji a validátor exportu ho ohlásí jako varování.
- **`data.js`** je jednorázově vygenerovaný z exportu. Web vkládá `public/data/cesty.json` z exportu při sestavení.
- **`viz.js` a `app.js`** jsou prototypový kód bez typů a testů.

**Co web ve fázi D udělal jinak:**

- Body míst a Návraty berou jen ověřená místa z `mista.json`. Bez nich je přepínač Státy / Místa skrytý a Návraty mají prázdný stav.
- Místo štítku „kolo“ se zobrazují chipy z pole `zamereni`. Box „Kontrola dat“ a varování o překryvu v tooltipu nejsou.
- Detail bez popisu nemá prázdný rámeček. Pole `popis` se zobrazí jako první panel „O cestě“: text 16 px, místa **tučně** v `--ink`, kurzíva serifem, odstavce a odrážky.
- Neznámé ID v `cesta.html?id=` ukáže „Cesta nenalezena“, nepřesměruje na poslední cestu.
- Fakt „Letos“ je „Rok 2026“ s datem dat, aby po přelomu roku netvrdil nepravdu.
- Hledání v Kronice nerozlišuje diakritiku a prohledává i název státu.
- Další státy pobytu (`dalsiZeme`) se počítají do navštívených států a na mapě, počet cest u státu zůstává podle hlavního státu (rozhodnutí 0002).

---

## 11. Podklad pro implementaci

**Převod do kódu**

- Tokeny z kapitoly 2 převzít jako CSS proměnné se stejnými názvy. Komponenty mají používat jen role, ne přímé barvy.
- Moduly podle odpovědností:

  | Modul | Obsah |
  |---|---|
  | `stats` | čisté funkce výpočtu, pokryté testy nad zmrazenou fixture s kontrolními hodnotami |
  | `format` | data, tvary slov, čísla, zkrácení názvů |
  | `map` | mapa států a míst |
  | `charts` | grafy po letech, měsíce, heatmapa, Celé roky, délka pobytu |
  | `pages` | jednotlivé stránky |

- Chování prototypu je specifikace: stejné výpočty, texty, prázdné stavy a URL parametry.
- Vlajky: npm balíček `flag-icons`, do buildu jen státy z číselníku (rozhodnutí 0013). Nikdy ne z CDN.

**Otevřená rozhodnutí**

| # | Rozhodnutí | Doporučení |
|---|---|---|
| 1 | Hostovat vlastní serif a ručně psané písmo (stejný vzhled na Androidu), nebo zůstat u systémových písem | zatím systémová písma (Palatino, Ink Free), rozhodnout podle vzhledu na telefonu |
| 2 | Barvy tmavého režimu | odvodit z návrhu 5 a ověřit validátorem, zapínat automaticky |
| 3 | Zobrazení míst s přesností jen „oblast“ | ponechat čárkovaný kroužek |
| 4 | Ikona a favicon | `src/favicon.svg`: čárkované razítko s „CA“ v barvách deníku (rez na krémové) |
