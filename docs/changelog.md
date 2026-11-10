# Změny

## 10. 11. 2026 – plovoucí okno cesty, písma a sdílení

- Detail cesty se otevírá v plovoucím okně s „← Zpět“ a křížkem, zavírá se i Esc, klikem mimo okno a tlačítkem Zpět. Detail je zkrácený jen na cestu (bez dalších cest a předchozí / další) a má vlajku místo kroužku s kódem. Samostatná stránka má tlačítko „← Zpět“.
- Vrstva Místa nechává státy obarvené podle počtu cest, body míst jsou rezavé.
- Kronika: první věta popisu u cest a přepínač „Jen s popisem“.
- Lokální písma pro zařízení bez Palatina a Ink Free (TeX Gyre Pagella, Patrick Hand). Náhled odkazu při sdílení (Open Graph). Hlavička bez podtitulku.

## 10. 11. 2026 – úpravy Přehledu podle připomínek

- Přehled: bez textu „Klikněte na stát“, fotka bez rámečku a větší, vlajky podle počtu cest, tři fakta v jednom řádku (bez „Rok 2026“), pravý sloupec zarovnaný s mapou, seznam v kartě státu odsazený od posuvníku.
- Panel Návraty je pryč. Grafy Cesty po letech a Noci po letech se součtem nad sloupci jsou vedle sebe ve Statistikách nad „Kdy cestuji“, Přehled končí Posledními cestami.
- Patička a box „Jak číst data“ ve Statistikách jsou pryč. Obsah je široký až 1480 px.

## 10. 11. 2026 – vzhled „Cestovní deník“

- Web je přemalovaný podle vybraného návrhu 06: krémový papír, inkoustová modrá, rez, Palatino a ručně psaný nadtitulek. Favicon má nové barvy.
- Přehled má fotku z cest jako polaroid. Vlajky pod nadpisem jdou přes celou šířku sloupce a karty posledních cest mají vlajku vpravo místo kroužku s kódem státu.
- Barvy dříve zapsané ve stylech stránek a v generátoru vlajek jsou CSS proměnné.

## 10. 11. 2026 – barevné návrhy úvodní stránky

- V `docs/design/barvy/` je 10 variant barev a písma nad skutečným obsahem Přehledu a rozcestník se živými náhledy. Web se nemění.
- Generátor návrhů kontroluje kontrast a čitelnost barev pro barvoslepé. Statický server maket umí obrázky JPEG.
- Vybraný návrh 06 Cestovní deník je upravený: písmo Palatino, fotka bez popisku, vlajky přes celou šířku sloupce a na kartách cest vlajka místo kroužku s kódem.

## 9. 11. 2026 – nová místa z potvrzených shrnutí

- Číselník má deset nových ověřených obcí: Toruň, Gdyně, Sopoty, Hel, Gdaňsk, Łeba, Malbork, Villajoyosa, Finestrat a Watford. Cabo de las Huertas je alias Alicante.
- Polsko má na mapě 8 míst, Alicante 3, Londýn 2. Export má 78 míst.

## 9. 11. 2026 – shrnutí podle Martinových doplnění

- Málaga, Alicante a Polsko mají shrnutí s místy, která Martin potvrdil. Dublin a Londýn mají shrnutí poprvé. Shrnutí má 35 cest.
- Soubory Alicante a Londýn na Drivu přeuložil editor, který převádí Markdown, a rozbil jim YAML hlavičku. Se souhlasem Martina byly obnoveny ze zálohy a poškozené verze zůstaly uložené ve složce záloh.

## 9. 11. 2026 – podrobnější shrnutí se Stravou

- 22 shrnutí má podrobnější verzi s čísly ze Stravy (km, stoupání, čas, rychlost, tep, u wattmetru watty) a seznamem jízd po dnech. 7 cest dostalo shrnutí poprvé, celkem jich má 33.
- Migrace umí nahradit už zapsaný popis, jen když návrh v poli `nahrazuje` přesně uvádí dosavadní text.
- Rozhodnutí 0006 určuje, které sportovní údaje smí do veřejného textu.

## 9. 11. 2026 – shrnutí cest

- Detail cesty zobrazí veřejné shrnutí z pole `verejny_popis` s formátováním (odstavce, odrážky, tučně, kurzíva).
- Kontrakt omezuje popis na 1500 znaků bez HTML, security lint odmítne odkazy. Migrace umí zapsat schválený popis.
- Martin schválil 26 shrnutí. Migrace je zapsala na Drive se zálohou a export je přenesl do `public/data/cesty.json`.

## 9. 11. 2026 – přiblížení státu na mapě

- Klik na stát v mapě nebo na vlajku přiblíží mapu na stát a ukáže ověřená místa s popisky. Zpět vede tlačítko „← Celá Evropa“ nebo Esc, odkaz `?stat=XX` otevře přiblížení rovnou.
- Opravené překrývání popisků 1994 a 1995 na ose grafu Cesty po letech.

## 9. 11. 2026 – fáze E (místa)

- Číselník 73 míst ověřený proti Wikidatům. Souřadnice a identifikátor jsou z Wikidat, přesnost nejvýš na úroveň obce.
- Martin schválil přiřazení míst k 90 cestám. Migrace je zapsala do YAML hlaviček na Drivu se zálohou, druhý běh měl nula změn.
- Migrace umí doplnit rok, měsíc a počet nocí cestě bez přesných dnů. Korčula je nově červenec 1994, 10 nocí.
- Kontrakt metadat zná stav `zrusena` pro cestu, která se nekonala.
- Export obsahuje 68 ověřených míst. Mapa na Přehledu má vrstvu Místa a Návraty.
- Web nasazený na GitHub Pages a ověřený na veřejné adrese.

## 8. 11. 2026 – fáze D (web MVP)

- Přehled, Kronika, Statistiky a detail cesty podle prototypu v2, přepsané do TypeScriptu s testy výpočtů a formátování.
- Generátor podkladů `npm run assets`: mapa z Natural Earth 1:50m (world-atlas) a podmnožina vlajek flag-icons s licencí.
- Veřejná data se vkládají do sestavení. Nová cesta nevyžaduje změnu kódu.
- Kontrola vlajek v exportu používá balíček flag-icons místo prototypové složky.
- Prototypové prvky odstraněné: ilustrační body, štítek „kolo“ z názvu, box „Kontrola dat“.
- Web nasazený na GitHub Pages a ověřený na veřejné adrese.

## 8. 11. 2026 – dokončení fáze C

- Po ověřené záloze zapsaná schválená základní migrace 97 YAML hlaviček na Drive a přidaný `_SCHEMA.md`.
- Přísný export 96 cest s trvalými ID přidaný do repozitáře. Kontrolní snímek obnovený z tohoto exportu.

## 8. 11. 2026 – příprava fáze C

- Přidaná zkouška migrace metadat s uloženým plánem a přísným náhledem.
- Připravené návrhy termínů, míst a zaměření ke schválení. Skript před zápisem vyžaduje ověřenou zálohu a shodu s plánem.

## 8. 11. 2026 – fáze B

- Přidaný datový kontrakt a číselníky 15 států a 61 kandidátů míst.
- Export čte YAML hlavičky a sestavuje veřejný JSON jen z povolených polí. Zkušební výstup a report se ukládají do `out/`.
- Přidané kontroly schématu, přípustných termínů, odkazů na ověřená místa a citlivých vzorů. Kontrolní snímek z exportu obsahuje 96 cest.

## 8. 11. 2026 – fáze A

- Přidaná úvodní stránka Cestovního atlasu s hlavičkou a patičkou podle návrhu Atlas.
- Přidaná sada nástrojů pro sestavení, kontrolu TypeScriptu a testy. Kontroly hlídají oddělení veřejných a místních souborů ve fázi A.
- Zapnuté nasazení na GitHub Pages. První nasazení prošlo a veřejný Přehled byl ověřený na desktopu a při šířce 390 px.
- Doplněná projektová pravidla, checklist a záznam výchozích rozhodnutí. Textové soubory mají v Gitu konce řádků LF.
