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

- **Pár Česko / zahraničí:** kontrast vůči kartě 6,5 a 4,1 : 1. Rozlišitelnost ΔE v Lab (CIE76) po simulaci podle Machada 2009: běžně 74, protanopie 59, deuteranopie 73, tritanopie 77. Ověřuje `node docs/design/tools/gen-barvy.mjs x --jen-kontrola`.
- **Text nikdy ve `--cz` ani `--abroad`.** Pro odkazy je `--cz-text`. Datové barvy jsou jen pro značky (pruhy, plochy, body). Výjimkou je velký text nad 24 px, například zvýrazněné číslo v hlavním nadpisu (`--accent`).
- **Sekvenční škála:** choropleth státu má třídy 1 (`q1`), 2–5 (`q2`), 6–10 (`q3`), 11–20 (`q4`) a 21+ (`q5`). Heatmapa rok × měsíc používá 1, 2, 3 a 4+ jako `q1`, `q2`, `q3` a `q5`. Čísla v buňkách jsou na `q1`–`q3` v barvě `--q-ink` `#08182A` (4,8–12,0 : 1) a na `q5` v `--q5-ink` bílé (11,7 : 1).
- **Mapa:** `--sea` `#E7EDED` (moře, pozadí mapy) a `--coast` `#A9BCC1` (pobřeží). `--paper-texture` je jemná textura papíru (SVG šum v data URI) na pozadí stránky. Panely ji nemají.
- **Pomocné tokeny** (dřív napevno v CSS): `--hover` (podklad při najetí), `--shade` a `--shade-2` (průsvitné výplně legendy a oblastí), `--stripe` (střídavé řádky Celých roků), `--cz-tint` (zvýrazněný stát ve Statistikách), `--grid` a `--grid-base` (mřížka a základna grafů, šrafování neznámé délky), `--flag-ring` (obrys vlajek, používá ho i generovaný `vlajky.css`) a `--tip-shadow`. Styly stránek nemají žádnou barvu napevno kromě stínu fotky.
- **Upozornění (kontrola dat):** pozadí `#FBF1E6`, okraj `#E8C9A9`, text `#6B3A10` (8,4 : 1). Používá se jen v prototypu, viz kapitola 10.
- **Tmavý režim** zatím není. Až přibude, dostane vlastní stupně stejných rolí ověřené proti tmavému povrchu a zapne se automaticky přes `prefers-color-scheme`. Nebude to jen převrácení barev.

---

## 3. Typografie

| Role | Písmo |
|---|---|
| `--serif` | `"Atlas Serif"` (= systémové Palatino, jinak lokální TeX Gyre Pagella) – logo, nadpisy, velká čísla, roky |
| `--sans` | `"Segoe UI", system-ui, -apple-system, sans-serif` – text, ovládání, popisky, tabulky |
| `--hand` | `"Atlas Hand"` (= systémové Ink Free, jinak lokální Patrick Hand) – jen nadtitulek (`.kicker`) |

| Prvek | Velikost (desktop / mobil) | Písmo |
|---|---|---|
| Hlavní nadpis Přehledu („15 států, 96 cest“) | 11,5 % šířky pravého sloupce, 36–56 px (`clamp`, jednotka `cqi`) | serif 400, číslo kurzívou v `--accent` |
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
- **Písma** (od 10. 11. 2026): `@font-face` „Atlas Serif“ a „Atlas Hand“ v `src/atlas.css` použijí nejdřív systémové Palatino (Windows, macOS) a Ink Free (Windows). Zařízení bez nich (Android, Linux, Ink Free na macOS) stáhne lokální podmnožiny z `src/fonts/`: TeX Gyre Pagella (3 řezy po asi 40 kB) a Patrick Hand (23 + 14 kB). Nic se nenačítá z cizího serveru. Původ, licence a rozsah znaků jsou v `src/fonts/README.md`. Patrick Hand nemá „ď“, to prohlížeč vykreslí záložním písmem (nadtitulky „ď“ zatím neobsahují).

---

## 4. Rozvržení

- **Kontejner:** maximálně 1480 px (od 10. 11. 2026, dřív 1320), boční okraje 28 px, na mobilu 16 px. Pod obsahem je odsazení 48 px, patička není.
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
| Statistiky | `statistiky.html` | `?pohled=mesice` nebo `?pohled=roky` · `#po-letech` · `#kdy` · `#staty` · `#stat-HR` (otevře stát) |
| Detail cesty | `cesta.html?id=t-xxxxxx` | `id` = stabilní ID cesty. Samostatná stránka pro přímé odkazy. |
| Plovoucí okno cesty | `?cesta=t-xxxxxx` na Přehledu, v Kronice a Statistikách | otevře detail cesty v okně nad stránkou, ostatní parametry zůstávají |

- Výběr státu a pohledu se zapisuje do URL (`history.replaceState`), takže odkaz jde sdílet.
- Na GitHub Pages fungují samostatné HTML stránky s parametry bez potíží s chybou 404. ID v adrese musí být stabilní ID ze zdroje (viz revize, Z1), ne pořadí ani název souboru.
- **Náhled při sdílení** (Open Graph, od 10. 11. 2026): každá stránka má `og:title`, `og:description`, `og:image` (`src/img/sdileni.jpg`, 1200 × 630 px, bez metadat) a `twitter:card`. Při sestavení plugin ve `vite.config.ts` doplní `og:url` a z adresy obrázku udělá absolutní adresu na GitHub Pages, protože sociální sítě relativní adresy neberou.
- **Instalace jako aplikace (PWA, od 10. 11. 2026):** plugin `tools/pwa.ts` při sestavení zapíše `manifest.webmanifest` (název „Cestovní atlas“, krátce „Atlas“, `display: standalone`, barva `#f2eadb`, zkratky Kronika a Statistiky), ikony z `src/pwa/` (192 a 512 px, 512 px maskable s razítkem v bezpečné zóně, `apple-touch-icon` 180 px) a `sw.js`. Do stránek doplní odkazy na manifest a ikonu pro iPhone. Meta značky `theme-color` a `apple-mobile-web-app-*` jsou přímo v HTML.
  - **Android (Chrome):** nabídka „Nainstalovat aplikaci“ nebo „Přidat na plochu“. **iPhone (Safari):** Sdílet → Přidat na plochu. Atlas se pak otevírá bez lišty prohlížeče. Zpět v okně cesty i tlačítko „← Zpět“ na stránce cesty fungují i bez ní.
  - **Offline:** service worker při instalaci uloží stránky, skripty, styly, vlajky a ikony (asi 490 kB). Písma a obrázek pro sdílení uloží až při použití. Stránky bere nejdřív ze sítě, bez připojení z mezipaměti i s parametry (`?cesta=`, `?stat=`). Ostatní soubory mají otisk obsahu v názvu, proto je bere nejdřív z mezipaměti a hlavičku `Vary` přitom ignoruje (Vite načítá skripty s `crossorigin`). Nová verze se aktivuje po zavření všech oken atlasu. Do té doby se při připojení stejně načítají aktuální stránky.
  - Registraci dělá `src/lib/pwa.ts`, a to jen v sestavení. Vývojový server service worker nemá.
  - **Spodní lišta v nainstalované aplikaci:** na telefonu (do 760 px) v režimu `display-mode: standalone` je hlavní navigace lišta dole s ikonami (mapa, kniha, graf) a popisky. Aktivní položka má rámeček a rezavou ikonu. Lišta počítá s výřezy displeje (`viewport-fit=cover`, `env(safe-area-inset-*)`). V prohlížeči zůstává navigace nahoře.

---

## 6. Komponenty

U každé komponenty je uvedeno, kde ji v prototypu najdete.

**Kostra**

- **Hlavička** (`APP.shell`): logotyp „Cestovní atlas“ serifovou kurzívou (bez podtitulku) a navigace jako kulatá tlačítka. Aktivní položka je tmavá (`aria-current="page"`).
- **Patička** není (Martin, 10. 11. 2026). Datum dat, věta o neznámých údajích a box „Jak číst data“ ve Statistikách se nezobrazují. Pokrytí neznámých hodnot zůstává u jednotlivých čísel („známo u 80 z 96 cest“).
- **Záhlaví stránky** (`.page-head`): nadtitulek (rozsah let), H1, úvodní věta spočítaná z dat, volitelně legenda vpravo.
- **Panel** (`.panel`): karta na `--card` s okrajem `--line`. Záhlaví panelu (`.ph`) má nadpis a ovládání nebo legendu.

**Ovládání**

- **Přepínač** (`.seg`): skupina `<button aria-pressed>` v kulatém rámečku, aktivní je tmavý. Používá se pro Státy / Místa, Měsíce / Celé roky a Vše / Česko / Zahraničí.
- **Filtry** (`.filters`): přepínač rozsahu, výběr státu (`<select>` s počty), v Kronice přepínač „Jen s popisem“ a hledání (`<input type="search">`). Počet výsledků je napsaný vpravo („Zobrazeno 11 cest z 96“, `aria-live`).
- **Drobné prvky:** chip (`.chip`) pro noci, km a přesnost; kód státu (`.code`) jako orámované ISO; odkaz (`.link`) tučně v `--cz-text`; legenda (`.legend`) se vzorky ploch, pruhů, pásů, teček a kroužků.

**Mapa a státy**

- **Mapa států** (`VZ.renderMap`): SVG ze statických hranic na modrošedém moři (`--sea`) se zaoblenými rohy. Pod státy je obrys celé pevniny tlustší čarou v `--coast`. Na hranicích ho překryjí výplně sousedních států, takže zůstane vidět jen pobřeží. Zaměřený stát nemá obdélníkový rámeček prohlížeče, fokus z klávesnice ukazuje obrys státu. Po „← Celá Evropa“ myší se fokus na mapu nevrací, po Esc ano. Vlajky států na mapě nejsou (vyzkoušeno 10. 11. 2026 a zamítnuto). Navštívené státy jsou zbarvené podle počtu cest, nenavštívené mají `--land`. Ve vrstvě Místa zůstávají barvy podle počtu cest, přibudou jen body. Body míst jsou v `--accent` (rez) s obrysem v barvě karty, aby byly vidět i na tmavě modrých státech. Najetí nebo fokus ukáže tooltip a obrys v `--ink`, vybraný stát má obrys 2,2 px. Klik nebo Enter vybere stát.
- **Přiblížení státu** (Přehled): klik na stát v mapě nebo na jeho vlajku mapu plynule (0,45 s, bez animace při `prefers-reduced-motion`) přiblíží na stát. Výřez drží poměr stran celé mapy. Stát má výplň `--q2`, ostatní navštívené `--q1`, zobrazí se všechna ověřená místa s popisky (bez překryvu, důležitější místo má přednost). Body i písmo mají v přiblížení stálou velikost na obrazovce. Tlačítko „← Celá Evropa“ nebo klávesa Esc vrátí celou mapu. Klik na jiný stát v přiblížení přepne na něj.
- **Karta státu** (Přehled): na začátku je vybraný stát poslední cesty (bez přiblížení). Obsahuje vlajku a název (bez kódu státu), „11 cest · 1996–2026 · 82 nocí (známo u 9 z 11)“, posuvný seznam cest s odkazy na detail a odkazy „V kronice“ a „Ve statistikách“. Pravý sloupec má na desktopu výšku mapy: karta se natáhne a seznam se posouvá uvnitř (aspoň 140 px, vpravo 12 px od posuvníku). Pod 1100 px má seznam nejvýš 232 px.
- **Seznam států** (`APP.statesList`): `<details>` pro každý stát. Řádek má vlajku, název (bez kódu státu), pruh (Česko tyrkys, ostatní okr), počet a podřádek s nocemi a pokrytím a rozsahem let. Po rozbalení se ukážou cesty a odkazy „Na mapě“ a „V kronice“.

**Cesty**

- **Karta cesty** (Přehled, Poslední cesty): stát verzálkami (bez vlajky), název serifem, termín, chipy s ikonami (noci, km aktivit) a vlajka státu vpravo nahoře (26 px). Kroužek s kódem státu na kartě není. Celá karta je odkaz. Při najetí se karta lehce zvedne. Na telefonu (do 640 px) jsou karty kompaktní seznam pod sebou: vlajka vlevo, název, pod ním termín a chipy. Název státu je jen pro čtečky.
- **Fotka** (Přehled): vpravo vedle nadtitulku a nadpisu, bez rámečku a bez popisku, poměr 16 : 10, šířka `min(210px, 40 %)` sloupce, rádius 4 px, stín, pootočená o 3°. Bez pásky (Martin, 10. 11. 2026). Soubor `src/img/pobrezi.jpg` (480 × 270 px, bez metadat) zpracuje Vite při sestavení. Řada vlajek začíná až pod fotkou.
- **Fakta** (Přehled): tři údaje v jednom řádku – Do zahraničí („14 zahr. států“), Po Česku (podíl všech cest) a Nocí celkem (pokrytí).
- **Cesty po letech a Noci po letech** (Statistiky, první blok nad „Kdy cestuji“, kotva `#po-letech`): dva stejně široké panely vedle sebe, pod 1100 px pod sebou. Skládané sloupce Česko / zahraničí, nad sloupcem součet. Noci se sčítají jen z cest se známým počtem nocí, rok s cestami bez známých nocí má nad osou „?“. Cesty bez roku jsou v posledním sloupci „?“. Pod 560 px se graf posouvá uvnitř panelu. Přehled končí Posledními cestami, grafy po letech ani panel Návraty na něm nejsou.
- **Řádek cesty v Kronice** (`.trip`): měsíc, pruh ve stopě o pevné šířce 13 nocí × jednotka (15 px, mobil 9 px), název, vlajka před názvem cesty, metadata (stát bez vlajky, termín, noci a km s ikonami), první věta popisu (kurzívou serifem, jeden řádek s výpustkou, jen u cest s popisem) a případně odznak „nová země“.
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
- **Rekordy** (`APP.records`): mřížka 2 × 3 „razítek“: dvojitý rezavý rámeček (`--kicker`), mírně pootočené (−1,4°, 1,1°, −0,6°), velké číslo, popisek verzálkami a podtext. Razítko s konkrétní cestou je odkaz a při najetí se narovná.

**Detail cesty**

- **Plovoucí okno** (`src/lib/tripDialog.ts`, od 10. 11. 2026): na Přehledu, v Kronice a Statistikách se každý odkaz na cestu (karty, seznamy, rekordy, pruhy Celých roků) otevře v `<dialog>` nad stránkou. V pravém horním rohu je křížek, který zůstává na místě i při posouvání obsahu. Tlačítko „← Zpět“ v okně není. Okno zavře i Esc, klik mimo okno a tlačítko Zpět prohlížeče či telefonu (adresa dostane `?cesta=ID`). Na desktopu má šířku nejvýš 1060 px (o 20 % víc než dřív), pod 760 px je přes celou obrazovku. Otevře se krátkým vysunutím (0,24 s). Obsah s mapou se stáhne až při prvním otevření.
- **Samostatná stránka** `cesta.html?id=` zůstává pro přímé odkazy. Místo drobečkové navigace má tlačítko „← Zpět“ (předchozí stránka atlasu, jinak Kronika).
- **Obsah** (`src/lib/trip.ts`, stejný v okně i na stránce), v tomto pořadí: hlavička (nadtitulek s hlavním státem a dalšími státy pobytu, H1, termín, chip přesnosti, vlajka vpravo místo razítka s kódem), údaje s ikonami v jednom řádku (termín, noci, místa, bez řádku Stát, protože stát je v záhlaví; na telefonu termín a noci, pod nimi místa), „O cestě“, výřez mapy, sport na cestě s ikonami.
- **Výřez mapy** (`cropFor`): výřez kolem státu a míst v poměru stran podle šířky okna a výšky 340 px (mobil 260 px), takže mapa vyplní celou šířku. Vybraný stát je ve `--q3`, místa jsou tečky s popisky názvů (bez překryvu, 12 px).
- **Sport na cestě:** tři hodnoty (aktivit, km, m převýšení) a věta, že jde o výběr Strava 2023–2026.
- Další cesty do státu a stránkování předchozí / další v detailu nejsou (Martin, 10. 11. 2026).

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
  | Přehled | řada vlajek pod hlavním nadpisem (15 tlačítek podle počtu cest, při shodě podle první návštěvy, v mřížce 8 sloupců přes celou šířku sloupce, klik vybere stát, `aria-pressed`), karta státu, karty posledních cest (vpravo nahoře), tooltip mapy |
  | Kronika | metadata cesty |
  | Statistiky | seznam států (místo kódu, kód je malý vedle názvu), tooltipy heatmapy a Celých roků |
  | Detail cesty | nadtitulek, fakt „Stát“, nadpis „Další cesty“ |

- **Nový stát:** přidat ho do `data/zeme.json`. Vlajku doplní `npm run assets` z balíčku `flag-icons`. Export i generátor hlásí stát bez vlajky.

---

## 7. Grafy a mapa

- **Ikony** (`src/lib/icons.ts`): jednoduché čárové SVG 24 × 24 v barvě textu, vždy jen vedle textu (`aria-hidden`): noc (měsíc), trasa (km), hora (převýšení), místo (špendlík), termín (kalendář), aktivita.
- **Animace:** jen při `prefers-reduced-motion: no-preference`. Sloupce grafů po letech a délky pobytu při prvním zobrazení vyrostou (0,55–0,6 s, postupně po letech). Karta cesty se při najetí zvedne o 2 px. Okno cesty se vysune. Při změně šířky se grafy překreslí bez animace.
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

- Body míst berou jen ověřená místa z `mista.json`. Bez nich je přepínač Státy / Místa skrytý.
- Místo štítku „kolo“ se zobrazují chipy z pole `zamereni`. Box „Kontrola dat“ a varování o překryvu v tooltipu nejsou.
- Detail bez popisu nemá prázdný rámeček. Pole `popis` se zobrazí jako první panel „O cestě“: text 16 px, místa **tučně** v `--ink`, kurzíva serifem, odstavce a odrážky.
- Neznámé ID v `cesta.html?id=` ukáže „Cesta nenalezena“, nepřesměruje na poslední cestu.
- Fakt „Letos“ (později „Rok 2026“ s datem dat) na Přehledu od 10. 11. 2026 není.
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
| 1 | Hostovat vlastní serif a ručně psané písmo (stejný vzhled na Androidu), nebo zůstat u systémových písem | rozhodnuto 10. 11. 2026: nejdřív systémová, jinak lokální podmnožiny (`src/fonts/`) |
| 2 | Barvy tmavého režimu | odvodit z návrhu 5 a ověřit validátorem, zapínat automaticky |
| 3 | Zobrazení míst s přesností jen „oblast“ | ponechat čárkovaný kroužek |
| 4 | Ikona a favicon | `src/favicon.svg`: čárkované razítko s „CA“ v barvách deníku (rez na krémové) |
