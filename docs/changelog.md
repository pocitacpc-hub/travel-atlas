# Změny

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
