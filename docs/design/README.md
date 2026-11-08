# UI návrhy – Cestovní stopa

**Stav:** 8. 11. 2026 · Vybraný směr je rozpracovaný v **prototypu v2** (`v2/`). Původních 5 maket zůstává pro srovnání. Nejde o produkční kód.

## Prototyp v2 (vybraný směr)

Jednotný vzhled podle návrhu 1 – Atlas, klikací stránky propojené odkazy:

| Stránka | Soubor | Obsah |
|---|---|---|
| Přehled | `v2/index.html` | Mapa států s detailem státu (`?stat=HR`), souhrn, poslední cesty, cesty po letech, návraty. Přepínač Státy / Místa. |
| Kronika | `v2/kronika.html` | Všechny cesty po letech, filtr Vše / Česko / Zahraničí, stát (`?stat=IT`) a hledání. Lišta let, odznak „nová země“. |
| Statistiky | `v2/statistiky.html` | **Kdy cestuji** s přepínačem *Měsíce* (rok × měsíc) / *Celé roky* (`?pohled=roky`), **Státy** s rozbalitelnými cestami, délka pobytu, rekordy, „Jak číst data“. |
| Detail cesty | `v2/cesta.html?id=c038` | Termín s přesností, noci, stát, místa, výřez mapy, sport, další cesty do státu, předchozí / další cesta. |

**Celé roky:** každý rok je jeden řádek leden–prosinec. Přesný termín je plný pruh podle skutečných dat (délka = noci), cesta se známým jen měsícem je čárkovaný pás přes celý měsíc, cesta se známým jen rokem je tečka ve sloupci „?“. Překrývající se cesty jdou pod sebe, takže jsou vidět i rozpory v datech (Řím × Rychlebské hory 2022). Detail takové cesty ukazuje upozornění „Kontrola dat“. Ve veřejné verzi se to má vyřešit ve zdroji, ne zobrazovat.

Sdílený vzhled: `v2/assets/atlas.css`. Sdílené komponenty (heatmapa, celé roky, státy, délka pobytu, rekordy, výřez mapy): `v2/assets/app.js`. Výpočty statistik: `assets/viz.js`. Náhledy: `nahledy/v2/`.

Ověřeno: desktop 1440 px a mobil 390 px bez přetečení do šířky a bez chyb JavaScriptu. Funkčnost filtrů, přepínačů a odkazů na detail jsem ověřil ručně v prohlížeči.

Co zbývá před implementací: popis vzhledu (`system.md`), a v datech ověřený číselník míst (body jsou zatím ilustrační).

## Původních 5 maket

## Jak otevřít

- Dvojklik na `index.html` (rozcestník) nebo přímo na kteroukoli maketu. Funguje bez internetu a bez instalace.
- Případně lokální server: `node docs/design/serve.mjs` → http://localhost:4317/
- Statické náhledy (desktop 1440 px, mobil 390 px) jsou v `nahledy/`.

## Návrhy

| # | Návrh | Hlavní myšlenka | Silné stránky | Slabiny |
|---|---|---|---|---|
| 1 | **Atlas** (`01-atlas.html`) | Mapa jako hlavní vizuál, redakční „tištěný“ styl | Nejlépe naplňuje vizi „kde všude jsem byl“; detail státu hned vedle mapy; přepínač Státy / Místa | Méně čísel na první pohled; serifové písmo je spíš osobní než pracovní |
| 2 | **Přehledový dashboard** (`02-dashboard.html`) | Kompaktní pracovní rozhraní | Nejvíc informací na obrazovce; funkční filtry; KPI s pokrytím dat; tabulka s akcemi vlevo | Působí jako interní nástroj, ne jako osobní web; na mobilu hustý |
| 3 | **Kronika** (`03-kronika.html`) | Časová osa rok po roku | Příběh cestování; poctivě ukazuje prázdné roky i neznámé délky; na mobilu přirozená | Dlouhá stránka; mapa a souhrny chybí (patří jinam) |
| 4 | **Sbírka zemí** (`04-sbirka.html`) | Hravé „sbírání“ států | Kartogram bez geodat; razítka, růst sbírky a rekordy jsou zábavné a čitelné na mobilu | Pro 15 států se brzy „vyčerpá“; detail cest až o úroveň níž |
| 5 | **Noční data** (`05-noc.html`) | Tmavý datový styl | Heatmapa rok × měsíc se sloupcem „?“; velká čísla; zrcadlový graf Česko / zahraničí | Tmavé téma jako jediné nevyhovuje všem; spíš inspirace než celek |

## Doporučení

Nevybírat jeden návrh celý, ale složit web po stránkách:

- **Přehled + Mapa:** základ z návrhu **1 – Atlas** (mapa, detail státu, poslední cesty).
- **Cesty (archiv):** seskupení podle let z návrhu **3 – Kronika**. Tabulkový režim převzít z návrhu 2.
- **Statistiky:** hustota a filtry z návrhu **2**, razítka / růst sbírky / rekordy z návrhu **4** a heatmapa rok × měsíc z návrhu **5**.
- **Tmavý režim:** jen automaticky (`prefers-color-scheme`) podle barev z návrhu 5, ne jako samostatný vzhled.

## Co mají všechny makety společné

- Všechna čísla se počítají z jednotlivých záznamů (`assets/data.js` + `assets/viz.js`), nic není napsané natvrdo v HTML.
- Neznámé hodnoty se nepočítají jako 0. U neúplných statistik je uvedené pokrytí („známo u 79 z 96 cest“).
- Cesty bez roku se počítají do států, ale ne do grafů po letech.
- Barvy grafů prošly validátorem kontrastu a čitelnosti pro barvoslepé. Hodnoty mají popisky a tooltipy.

## Omezení

- **Body míst jsou ilustrační.** Souřadnice obcí jsou doplněné z obecné znalosti jen pro maketu, nejde o ověřený číselník míst. Bulharsko a „Varne minde“ záměrně bod nemají.
- Štítek „kolo“ v datech je pro maketu odvozený z názvu cesty.
- `assets/data.js` obsahuje skutečné názvy, termíny a počty nocí 96 cest (bez financí, ubytování, účastníků, odkazů a poznámek). Pokud bude repo veřejné, je potřeba před pushnutím rozhodnout, zda tato data mohou být zveřejněna už teď.
- Hranice států: Natural Earth 1:50m (public domain), předpočítané do `assets/europe-map.js`.
- Ostatní stránky (detail cesty, archiv, statistiky) zatím nejsou nakreslené, makety ukazují jen úvodní obrazovku.
