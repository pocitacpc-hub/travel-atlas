# Ověření míst – podklad ke schválení (fáze E)

**Stav:** 9. 11. 2026 · schváleno Martinem a zapsáno. Místa jsou v [číselníku](../../data/mista.yaml) ověřená, přiřazení v [návrzích](../../data/migrace/2026-11-navrhy.yaml) potvrzená a migrace je zapsala na Drive. Tabulky níže ukazují stav před schválením.

Web ukáže bod na mapě jen u ověřeného místa a jen u cesty, která má místo v YAML hlavičce na Drivu. Schvalují se proto souřadnice míst (tabulka [Místa](#místa)) a přiřazení míst k cestám (tabulka [Přiřazení](#přiřazení-míst-k-cestám), 90 návrhů).

## Upřesnění od Martina (9. 11. 2026)

- **Korčula:** cesta byla v červenci 1994, 10 nocí. Místo je **Vela Luka**. Do hlavičky se zapíše `rok: 1994`, `mesic: 7`, `presnost_terminu: mesic` a `pocet_noci: 10`. Atlas pak bude začínat rokem 1994.
- **Cavallino-Treporti:** kemp leží v části obce **Ca' Savio**. Na mapě bude bod Ca' Savio, asi 2 km od kempu.
- **Visalaje:** penzion je v osadě **Visalaje** obce Krásná. Dosavadní bod v číselníku byl o 7 km vedle, návrh používá bod osady z Wikidat.
- **Jeseníky a Rychleby:** každá cesta má vlastní obec podle toho, kde ubytování leží.
  - Chata Heinz a Chata Lucka Heinz jsou tatáž chata Lucka na území obce **Václavov u Bruntálu**.
  - Desný Kout a Roubenka Vyhlídka jsou v **Koutech nad Desnou**, chata Johann v **Lipové-lázních**, Kosanda v **Branné**, Ondřejovice a Dolní Moravice podle názvu.
  - Rychlebské stezky mají **Velkou Kraš**, cyklovýlet v Rychlebských horách **Vápennou**.
  - Původní návrh u Malé Morávky obsahoval beskydskou obec Morávka, to byla chyba.
- **Slovensko:** obě cesty do Nízkých Tater mají obec **Mýto pod Ďumbierom**. Liptovský Mikuláš, Malá Fatra a Horní Bečva zůstávají.

**Přesnost bodů:** podle [pravidel projektu](../../AGENTS.md) je bod na mapě nejvýš s přesností na obec nebo její část a ubytování zůstává soukromé. Do veřejného repozitáře proto nejdou souřadnice ubytování, jen bod obce nebo sídla, ve kterém leží. Obec jsem určil podle hranic obcí z Wikidat, kde byly k dispozici.

## Otevřené otázky

1. Rozhodnutí u Korfu a Chalkidiki (kapitola [Rozhodnutí](#rozhodnutí)).
2. Schválení souřadnic a přiřazení podle tabulek níže.

## Postup ověření

- Každé místo se hledalo ve Wikidatech podle přesného názvu (česky, anglicky a v jazyce státu) mezi položkami ve správném státě (P17) se souřadnicemi (P625).
- Ze shod jsem ručně vybral položku odpovídající přesnosti: u obce obec nebo sídlo, u oblasti pohoří, ostrov nebo poloostrov. Nádraží, hrady, katastrální území, volební obvody a duplicitní položky jsem vyřadil.
- Navržené souřadnice jsou souřadnice vybrané položky. Do číselníku se zapíše i její identifikátor (pole `wikidata`).
- Posun je vzdálenost dosavadního bodu v číselníku od navrženého. U nových míst je dosavadní bod už převzatý z Wikidat, proto je posun nulový.

## Souhrn

| Výsledek | Míst | Význam |
| --- | ---: | --- |
| souhlasí | 62 | Položka Wikidat odpovídá. Rozdíl je do 1,5 km u obce, do 10 km u oblasti. |
| posunout | 4 | Položka odpovídá, ale dosavadní bod je dál. Návrh ho posune. |
| rozhodnout | 2 | Návrh mění význam bodu (ostrov místo města, obec místo osady, jiné pohoří). |
| bez cesty | 5 | Na místo neodkazuje žádný návrh, ve webu se neobjeví. |

## Rozhodnutí

- **Chalkidiki** (2 cesty): Bod poloostrova Wikidat leží 31 km od dosavadního. Návrh ho přesouvá. Návrh: [Q204728](https://www.wikidata.org/wiki/Q204728) Chalkidiki, posun 31,1 km.
- **Korfu** (1 cesta): Cesta je na ostrov, dosavadní bod je město Korfu. Návrh používá ostrov. Návrh: [Q121378](https://www.wikidata.org/wiki/Q121378) Korfu, posun 4,8 km.

## Místa

Souřadnice jsou zaokrouhlené na tři desetinná místa u obce a na dvě u oblasti. Cest = počet návrhů přiřazení ke schválení.

| Místo | Stát | Přesnost | Cest | Číselník | Wikidata | Návrh | Posun | Výsledek |
| --- | --- | --- | ---: | --- | --- | --- | ---: | --- |
| Alba Adriatica | IT | obec | 1 | 42,830 / 13,930 | [Q51417](https://www.wikidata.org/wiki/Q51417) Alba Adriatica | 42,833 / 13,917 | 1,1 km | souhlasí |
| Alcossebre | ES | obec | 1 | 40,250 / 0,280 | [Q2832200](https://www.wikidata.org/wiki/Q2832200) Alcossebre – Lokalita v obci Alcalà de Xivert. | 40,245 / 0,277 | 0,6 km | souhlasí |
| Alicante | ES | obec | 1 | 38,345 / -0,481 | [Q11959](https://www.wikidata.org/wiki/Q11959) Alicante | 38,345 / -0,483 | 0,2 km | souhlasí |
| Babia hora | SK | oblast | 1 | 49,573 / 19,530 | [Q595780](https://www.wikidata.org/wiki/Q595780) Babia hora | 49,57 / 19,53 | 0,3 km | souhlasí |
| Bled | SI | obec | 1 | 46,369 / 14,114 | [Q202852](https://www.wikidata.org/wiki/Q202852) Bled | 46,368 / 14,115 | 0,1 km | souhlasí |
| Bormio | IT | obec | 1 | 46,468 / 10,370 | [Q40516](https://www.wikidata.org/wiki/Q40516) Bormio | 46,469 / 10,372 | 0,2 km | souhlasí |
| Branná | CZ | obec | 1 | 50,153 / 17,012 | [Q898791](https://www.wikidata.org/wiki/Q898791) Branná – Podle Martina. | 50,153 / 17,012 | 0 km | souhlasí |
| Břeclav | CZ | obec | 1 | 48,759 / 16,882 | [Q581478](https://www.wikidata.org/wiki/Q581478) Břeclav | 48,759 / 16,882 | 0 km | souhlasí |
| Brno | CZ | obec | 1 | 49,195 / 16,608 | [Q14960](https://www.wikidata.org/wiki/Q14960) Brno | 49,195 / 16,608 | 0 km | souhlasí |
| Bruck an der Mur | AT | obec | 1 | 47,410 / 15,270 | [Q259893](https://www.wikidata.org/wiki/Q259893) Bruck an der Mur | 47,411 / 15,269 | 0,1 km | souhlasí |
| Ca' Savio | IT | obec | 1 | 45,454 / 12,457 | [Q18503017](https://www.wikidata.org/wiki/Q18503017) Ca' Savio – Část obce Cavallino-Treporti. Bod sídla, ne kempu. | 45,454 / 12,457 | 0 km | souhlasí |
| Cavallino-Treporti | IT | obec | 0 | 45,460 / 12,480 | [Q47995](https://www.wikidata.org/wiki/Q47995) Cavallino-Treporti – Cesta má nově místo Ca' Savio. | 45,454 / 12,454 | 2,1 km | bez cesty |
| Dolní Moravice | CZ | obec | 1 | 49,977 / 17,322 | [Q1236151](https://www.wikidata.org/wiki/Q1236151) Dolní Moravice – Podle Martina. | 49,977 / 17,322 | 0 km | souhlasí |
| Domažlice | CZ | obec | 1 | 49,440 / 12,930 | [Q986068](https://www.wikidata.org/wiki/Q986068) Domažlice | 49,441 / 12,930 | 0,1 km | souhlasí |
| Dublin | IE | obec | 1 | 53,349 / -6,260 | [Q1761](https://www.wikidata.org/wiki/Q1761) Dublin | 53,350 / -6,260 | 0,1 km | souhlasí |
| Fažana | HR | obec | 2 | 44,927 / 13,803 | [Q1024726](https://www.wikidata.org/wiki/Q1024726) Fažana | 44,928 / 13,804 | 0,1 km | souhlasí |
| Horní Bečva | CZ | obec | 1 | 49,430 / 18,290 | [Q2232658](https://www.wikidata.org/wiki/Q2232658) Horní Bečva – Chalupa leží na území obce. Podle Martina. | 49,432 / 18,289 | 0,2 km | souhlasí |
| Chalkidiki | GR | oblast | 2 | 40,300 / 23,500 | [Q204728](https://www.wikidata.org/wiki/Q204728) Chalkidiki – Bod poloostrova Wikidat leží 31 km od dosavadního. Návrh ho přesouvá. | 40,58 / 23,50 | 31,1 km | rozhodnout |
| Izola | SI | obec | 1 | 45,539 / 13,660 | [Q15877](https://www.wikidata.org/wiki/Q15877) Izola | 45,539 / 13,660 | 0 km | souhlasí |
| Jaroslavice | CZ | obec | 1 | 48,758 / 16,233 | [Q787877](https://www.wikidata.org/wiki/Q787877) Jaroslavice | 48,757 / 16,233 | 0,1 km | souhlasí |
| Jastrzębia Góra | PL | obec | 1 | 54,830 / 18,300 | [Q1021252](https://www.wikidata.org/wiki/Q1021252) Q1021252 – Vesnice v gmině Władysławowo. | 54,831 / 18,313 | 0,8 km | souhlasí |
| Jeseníky | CZ | oblast | 0 | 50,080 / 17,200 | [Q280987](https://www.wikidata.org/wiki/Q280987) Hrubý Jeseník – Všechny jesenické cesty mají vlastní obec. Oblast zůstává v číselníku bez cesty. | 50,08 / 17,17 | 2,1 km | bez cesty |
| Lido di Jesolo | IT | obec | 1 | 45,500 / 12,640 | [Q6543738](https://www.wikidata.org/wiki/Q6543738) Lido di Jesolo – Část obce Jesolo. | 45,502 / 12,633 | 0,6 km | souhlasí |
| Jizerské hory | CZ | oblast | 1 | 50,820 / 15,250 | [Q1345416](https://www.wikidata.org/wiki/Q1345416) Jizerské hory | 50,83 / 15,25 | 1,1 km | souhlasí |
| Korčula | HR | oblast | 0 | 42,960 / 17,140 | [Q13288](https://www.wikidata.org/wiki/Q13288) Korčula – Cesta má nově místo Vela Luka. Ostrov zůstává v číselníku bez cesty. | 42,95 / 16,90 | 19,6 km | bez cesty |
| Korfu | GR | oblast | 1 | 39,620 / 19,920 | [Q121378](https://www.wikidata.org/wiki/Q121378) Korfu – Cesta je na ostrov, dosavadní bod je město Korfu. Návrh používá ostrov. | 39,60 / 19,87 | 4,8 km | rozhodnout |
| Kouty nad Desnou | CZ | obec | 3 | 50,100 / 17,107 | [Q1512019](https://www.wikidata.org/wiki/Q1512019) Kouty nad Desnou – Část obce Loučná nad Desnou. Podle Martina. | 50,100 / 17,107 | 0 km | souhlasí |
| Lednice | CZ | obec | 2 | 48,800 / 16,803 | [Q1017320](https://www.wikidata.org/wiki/Q1017320) Lednice | 48,800 / 16,803 | 0 km | souhlasí |
| Lipová-lázně | CZ | obec | 1 | 50,228 / 17,141 | [Q1025170](https://www.wikidata.org/wiki/Q1025170) Lipová-lázně – Chata leží na území obce. Podle Martina. | 50,228 / 17,140 | 0,1 km | souhlasí |
| Liptovský Mikuláš | SK | obec | 1 | 49,083 / 19,612 | [Q272040](https://www.wikidata.org/wiki/Q272040) Liptovský Mikuláš – Podle Martina. | 49,081 / 19,618 | 0,5 km | souhlasí |
| Lisabon | PT | obec | 1 | 38,722 / -9,139 | [Q597](https://www.wikidata.org/wiki/Q597) Lisabon | 38,708 / -9,139 | 1,6 km | posunout |
| Londýn | GB | obec | 1 | 51,507 / -0,128 | [Q84](https://www.wikidata.org/wiki/Q84) Londýn | 51,507 / -0,128 | 0 km | souhlasí |
| Malá Fatra | SK | oblast | 1 | 49,200 / 19,050 | [Q523671](https://www.wikidata.org/wiki/Q523671) Malá Fatra – Martin uvedl oblast Chleb ve Vrátné dolině, ta leží uvnitř oblasti. | 49,19 / 19,03 | 1,8 km | souhlasí |
| Malá Morávka | CZ | obec | 1 | 50,021 / 17,312 | [Q268409](https://www.wikidata.org/wiki/Q268409) Malá Morávka | 50,021 / 17,312 | 0 km | souhlasí |
| Málaga | ES | obec | 1 | 36,721 / -4,421 | [Q8851](https://www.wikidata.org/wiki/Q8851) Malaga | 36,717 / -4,417 | 0,6 km | souhlasí |
| Martinsicuro | IT | obec | 2 | 42,885 / 13,915 | [Q51452](https://www.wikidata.org/wiki/Q51452) Martinsicuro | 42,885 / 13,916 | 0,1 km | souhlasí |
| Morávka | CZ | obec | 1 | 49,600 / 18,520 | [Q1691438](https://www.wikidata.org/wiki/Q1691438) Morávka | 49,596 / 18,525 | 0,6 km | souhlasí |
| Murter | HR | obec | 1 | 43,820 / 15,590 | [Q3503912](https://www.wikidata.org/wiki/Q3503912) Murter | 43,820 / 15,592 | 0,2 km | souhlasí |
| Mýto pod Ďumbierom | SK | obec | 2 | 48,854 / 19,633 | [Q1074354](https://www.wikidata.org/wiki/Q1074354) Mýto pod Ďumbierom – Nejbližší obec k chatě pod Ďumbierem (1,8 km). Hranici obce ve Wikidatech nešlo ověřit. | 48,854 / 19,633 | 0 km | souhlasí |
| Nitra | SK | obec | 1 | 48,307 / 18,087 | [Q26397](https://www.wikidata.org/wiki/Q26397) Nitra | 48,315 / 18,087 | 0,9 km | souhlasí |
| Nízké Tatry | SK | oblast | 0 | 48,930 / 19,600 | [Q558893](https://www.wikidata.org/wiki/Q558893) Nízké Tatry – Obě cesty mají nově místo Mýto pod Ďumbierom. | 48,95 / 19,50 | 7,6 km | bez cesty |
| Olomouc | CZ | obec | 1 | 49,594 / 17,251 | [Q81137](https://www.wikidata.org/wiki/Q81137) Olomouc | 49,594 / 17,251 | 0 km | souhlasí |
| Ondřejovice | CZ | obec | 1 | 50,257 / 17,349 | [Q11798301](https://www.wikidata.org/wiki/Q11798301) Ondřejovice – Část města Zlaté Hory. Podle Martina. | 50,257 / 17,349 | 0 km | souhlasí |
| Oslo | NO | obec | 1 | 59,914 / 10,752 | [Q585](https://www.wikidata.org/wiki/Q585) Oslo | 59,913 / 10,739 | 0,7 km | souhlasí |
| Paestum | IT | obec | 1 | 40,420 / 15,005 | [Q16896941](https://www.wikidata.org/wiki/Q16896941) Paestum – Část obce Capaccio Paestum. Antické město je samostatná položka. | 40,406 / 15,002 | 1,6 km | posunout |
| Palamós | ES | obec | 1 | 41,846 / 3,130 | [Q23994224](https://www.wikidata.org/wiki/Q23994224) Palamós | 41,848 / 3,129 | 0,2 km | souhlasí |
| Palma | ES | obec | 1 | 39,570 / 2,650 | [Q8826](https://www.wikidata.org/wiki/Q8826) Palma de Mallorca | 39,567 / 2,650 | 0,3 km | souhlasí |
| Pasohlávky | CZ | obec | 2 | 48,902 / 16,553 | [Q965616](https://www.wikidata.org/wiki/Q965616) Pasohlávky | 48,903 / 16,544 | 0,7 km | souhlasí |
| Pec pod Sněžkou | CZ | obec | 1 | 50,692 / 15,733 | [Q1641742](https://www.wikidata.org/wiki/Q1641742) Pec pod Sněžkou | 50,694 / 15,733 | 0,2 km | souhlasí |
| Piran | SI | obec | 1 | 45,528 / 13,568 | [Q1382](https://www.wikidata.org/wiki/Q1382) Piran | 45,527 / 13,569 | 0,1 km | souhlasí |
| Poreč | HR | obec | 3 | 45,227 / 13,595 | [Q5323](https://www.wikidata.org/wiki/Q5323) Poreč | 45,227 / 13,595 | 0 km | souhlasí |
| Porto | PT | obec | 1 | 41,150 / -8,611 | [Q36433](https://www.wikidata.org/wiki/Q36433) Porto | 41,150 / -8,611 | 0 km | souhlasí |
| Praha | CZ | obec | 3 | 50,075 / 14,437 | [Q1085](https://www.wikidata.org/wiki/Q1085) Praha | 50,087 / 14,421 | 1,8 km | posunout |
| Pula | HR | obec | 1 | 44,866 / 13,850 | [Q4656](https://www.wikidata.org/wiki/Q4656) Pula | 44,870 / 13,846 | 0,5 km | souhlasí |
| Řím | IT | obec | 1 | 41,902 / 12,496 | [Q220](https://www.wikidata.org/wiki/Q220) Řím | 41,893 / 12,483 | 1,5 km | souhlasí |
| Rožnov pod Radhoštěm | CZ | obec | 7 | 49,458 / 18,143 | [Q1008696](https://www.wikidata.org/wiki/Q1008696) Rožnov pod Radhoštěm | 49,459 / 18,143 | 0,1 km | souhlasí |
| Rychlebské hory | CZ | oblast | 0 | 50,330 / 17,060 | [Q1935661](https://www.wikidata.org/wiki/Q1935661) Rychlebské hory – Obě rychlebské cesty mají nově obec (Velká Kraš, Vápenná). | 50,25 / 17,00 | 9,9 km | bez cesty |
| Santa Susanna | ES | obec | 1 | 41,636 / 2,711 | [Q12587](https://www.wikidata.org/wiki/Q12587) Santa Susanna | 41,637 / 2,708 | 0,3 km | souhlasí |
| Sarti | GR | obec | 1 | 40,090 / 23,980 | [Q750762](https://www.wikidata.org/wiki/Q750762) Sarti – Vesnice na Sithonii. | 40,097 / 23,979 | 0,8 km | souhlasí |
| Sintra | PT | obec | 1 | 38,800 / -9,380 | [Q33716124](https://www.wikidata.org/wiki/Q33716124) Sintra | 38,798 / -9,388 | 0,7 km | souhlasí |
| Zemplínská Šírava | SK | oblast | 1 | 48,800 / 21,950 | [Q189395](https://www.wikidata.org/wiki/Q189395) Zemplínská šírava – Přehradní nádrž. | 48,78 / 22,04 | 7,0 km | souhlasí |
| Sveti Filip i Jakov | HR | obec | 1 | 43,965 / 15,430 | [Q1014083](https://www.wikidata.org/wiki/Q1014083) Sveti Filip i Jakov | 43,961 / 15,425 | 0,6 km | souhlasí |
| Tribunj | HR | obec | 1 | 43,753 / 15,748 | [Q607058](https://www.wikidata.org/wiki/Q607058) Tribunj | 43,756 / 15,746 | 0,4 km | souhlasí |
| Trojanovice | CZ | obec | 1 | 49,520 / 18,230 | [Q973536](https://www.wikidata.org/wiki/Q973536) Trojanovice | 49,520 / 18,238 | 0,6 km | souhlasí |
| Václavov u Bruntálu | CZ | obec | 7 | 49,975 / 17,376 | [Q2353719](https://www.wikidata.org/wiki/Q2353719) Václavov u Bruntálu – Chata Lucka (vedená i jako Chata Heinz) leží podle hranic obcí na území této obce. Malá Morávka a Dolní Moravice jsou blíž, ale chata k nim nepatří. | 49,975 / 17,376 | 0 km | souhlasí |
| Vápenná | CZ | obec | 1 | 50,283 / 17,098 | [Q775829](https://www.wikidata.org/wiki/Q775829) Vápenná – Podle Martina. | 50,283 / 17,098 | 0 km | souhlasí |
| Vela Luka | HR | obec | 1 | 42,961 / 16,719 | [Q994341](https://www.wikidata.org/wiki/Q994341) Vela Luka – Obec na Korčule. Podle Martina. | 42,961 / 16,719 | 0 km | souhlasí |
| Velká Kraš | CZ | obec | 1 | 50,363 / 17,146 | [Q1017294](https://www.wikidata.org/wiki/Q1017294) Velká Kraš – Cyklokemp leží na území obce. Podle Martina. | 50,363 / 17,146 | 0 km | souhlasí |
| Vieste | IT | obec | 1 | 41,882 / 16,176 | [Q51967](https://www.wikidata.org/wiki/Q51967) Vieste | 41,883 / 16,167 | 0,8 km | souhlasí |
| Vir | HR | obec | 1 | 44,300 / 15,080 | [Q426522](https://www.wikidata.org/wiki/Q426522) Vir – Obec Vir na stejnojmenném ostrově. | 44,300 / 15,090 | 0,8 km | souhlasí |
| Visalaje (Beskydy) | CZ | obec | 6 | 49,520 / 18,430 | [Q11903432](https://www.wikidata.org/wiki/Q11903432) Visalaje – Osada obce Krásná. Podle Martina. Bod osady, ne ubytování. | 49,519 / 18,527 | 7,0 km | posunout |
| Vranov nad Dyjí | CZ | obec | 1 | 48,893 / 15,811 | [Q585050](https://www.wikidata.org/wiki/Q585050) Vranov nad Dyjí | 48,895 / 15,813 | 0,3 km | souhlasí |
| Zlín | CZ | obec | 1 | 49,226 / 17,667 | [Q171018](https://www.wikidata.org/wiki/Q171018) Zlín | 49,233 / 17,667 | 0,8 km | souhlasí |

## Přiřazení míst k cestám

Návrhy vznikly z názvů cest. Potvrzením říkáte, že jste na místě skutečně pobývali. Číslo v prvním sloupci slouží k označení výjimek.

| # | Cesta | Rok | Navržená místa |
| ---: | --- | --- | --- |
| 1 | Alicante a Costa Blanca | 2026 | Alicante |
| 2 | Apalucha – cyklovýlet Javorový a Rožnov | 2022 | Rožnov pod Radhoštěm |
| 3 | Beskydy – Penzion Visalaje | 1996 | Visalaje (Beskydy) |
| 4 | Beskydy – Penzion Visalaje | 1998 | Visalaje (Beskydy) |
| 5 | Beskydy – Penzion Visalaje | 1999 | Visalaje (Beskydy) |
| 6 | Beskydy – Penzion Visalaje | 2002 | Visalaje (Beskydy) |
| 7 | Beskydy – Penzion Visalaje | 2003 | Visalaje (Beskydy) |
| 8 | Beskydy – Penzion Visalaje | 2004 | Visalaje (Beskydy) |
| 9 | Beskydy – Trojanovice (cyklistika, Strava) | 2024 | Trojanovice |
| 10 | Domažlice – cyklistika (Tour de Kozina) | 2025 | Domažlice |
| 11 | Horní Bečva – U Juráša | 2023 | Horní Bečva |
| 12 | Chorvatsko – Fažana | 1999 | Fažana |
| 13 | Chorvatsko – Fažana | 2018 | Fažana |
| 14 | Chorvatsko – Murter a Betina | 2023 | Murter |
| 15 | Chorvatsko – ostrov Korčula | ? | Vela Luka |
| 16 | Chorvatsko – ostrov Vir | 2025 | Vir |
| 17 | Chorvatsko – Poreč (kola) | 2024 | Poreč |
| 18 | Chorvatsko – Poreč (kola) | 2025 | Poreč |
| 19 | Chorvatsko – Poreč (kola) | 2026 | Poreč |
| 20 | Chorvatsko – Pula | 1997 | Pula |
| 21 | Chorvatsko – Sveti Filip i Jakov | 2022 | Sveti Filip i Jakov |
| 22 | Chorvatsko – Tribunj (kola) | 2023 | Tribunj |
| 23 | Irsko – Dublin | 2025 | Dublin |
| 24 | Itálie – Alba Adriatica (Abruzzo) | 2007 | Alba Adriatica |
| 25 | Itálie – Bormio a Alpy na kole | 2026 | Bormio |
| 26 | Itálie – Gargano, Vieste | 1996 | Vieste |
| 27 | Itálie – Lido di Jesolo | ? | Lido di Jesolo |
| 28 | Itálie – Martinsicuro, Camping Riva Nuova | 2003 | Martinsicuro |
| 29 | Itálie – Paestum, komplex La Giara | 2004 | Paestum |
| 30 | Itálie – Řím | 2022 | Řím |
| 31 | Jaroslavice a Znojmo – jižní Morava | 2026 | Jaroslavice |
| 32 | Jeseníky – Desný Kout | 2021 | Kouty nad Desnou |
| 33 | Jeseníky – Desný Kout s přáteli | 2022 | Kouty nad Desnou |
| 34 | Jeseníky – Chata Heinz | 2012 | Václavov u Bruntálu |
| 35 | Jeseníky – Chata Heinz | 2013 | Václavov u Bruntálu |
| 36 | Jeseníky – Chata Heinz | 2014 | Václavov u Bruntálu |
| 37 | Jeseníky – Chata Heinz | 2015 | Václavov u Bruntálu |
| 38 | Jeseníky – chata Johann | 2022 | Lipová-lázně |
| 39 | Jeseníky – chata Kosanda, Branná | 2022 | Branná |
| 40 | Jeseníky – Chata Lucka Heinz | 2017 | Václavov u Bruntálu |
| 41 | Jeseníky – Chata Lucka Heinz | 2018 | Václavov u Bruntálu |
| 42 | Jeseníky – Chata Lucka Heinz | 2020 | Václavov u Bruntálu |
| 43 | Jeseníky – Malá Morávka (záznamy Strava) | 2023 | Malá Morávka |
| 44 | Jeseníky – Roubenka Ondřejovice | 2024 | Ondřejovice |
| 45 | Jeseníky – Roubenka Vyhlídka | 2025 | Kouty nad Desnou |
| 46 | Jizerské hory – cyklovýlet | 2023 | Jizerské hory (oblast) |
| 47 | Jižní Morava – Brno a Břeclav | 2021 | Břeclav, Brno |
| 48 | Krkonoše – Pec pod Sněžkou | 2012 | Pec pod Sněžkou |
| 49 | Lednice – cyklovýlet | 2026 | Lednice |
| 50 | Mallorca – Palma a okolí | 2024 | Palma |
| 51 | Morávka – Beskydy | 2010 | Morávka |
| 52 | Norsko – Oslo | 2021 | Oslo |
| 53 | Olomouc – rodinný výlet | 2016 | Olomouc |
| 54 | Pasohlávky – Apalucha | 2026 | Pasohlávky |
| 55 | Pasohlávky a Lednice | 2017 | Lednice, Pasohlávky |
| 56 | Polsko – Jastrzębia Góra a Baltské pobřeží | 2026 | Jastrzębia Góra |
| 57 | Portugalsko – Porto, Sintra a Lisabon | 2023 | Lisabon, Porto, Sintra |
| 58 | Praha – historická cesta | 2001 | Praha |
| 59 | Praha – městský výlet | 2018 | Praha |
| 60 | Praha – rodinný výlet | 2021 | Praha |
| 61 | Rakousko – Bruck an der Mur a Štýrsko | 2025 | Bruck an der Mur |
| 62 | Rožnov – Apalucha | 2021 | Rožnov pod Radhoštěm |
| 63 | Rožnov – Apalucha | 2023 | Rožnov pod Radhoštěm |
| 64 | Rožnov – Apalucha | 2024 | Rožnov pod Radhoštěm |
| 65 | Rožnov – Apalucha | 2025 | Rožnov pod Radhoštěm |
| 66 | Rožnov – kemp | 2020 | Rožnov pod Radhoštěm |
| 67 | Rožnov pod Radhoštěm | 2013 | Rožnov pod Radhoštěm |
| 68 | Rychlebské hory – cyklovýlet s přáteli | 2022 | Vápenná |
| 69 | Řecko – Chalkidiki | 1998 | Chalkidiki (oblast) |
| 70 | Řecko – Chalkidiki, Sarti | 2009 | Chalkidiki (oblast), Sarti |
| 71 | Řecko – Korfu | 2000 | Korfu (oblast) |
| 72 | Slovensko – Babia hora | 2023 | Babia hora (oblast) |
| 73 | Slovensko – Liptovský Mikuláš a Bešeňová | 2022 | Liptovský Mikuláš |
| 74 | Slovensko – Malá Fatra | 2019 | Malá Fatra (oblast) |
| 75 | Slovensko – Nitra | 2015 | Nitra |
| 76 | Slovensko – Nízké Tatry | 2017 | Mýto pod Ďumbierom |
| 77 | Slovensko – Nízké Tatry | 2019 | Mýto pod Ďumbierom |
| 78 | Slovinsko – Piran, Izola a Bled | 2026 | Bled, Izola, Piran |
| 79 | Španělsko – Alcossebre, Camping Playa Tropicana | 2001 | Alcossebre |
| 80 | Španělsko – Costa Brava, Palamós (Camp King) | 1997 | Palamós |
| 81 | Španělsko – Málaga | 2025 | Málaga |
| 82 | Španělsko – Santa Susanna | 2005 | Santa Susanna |
| 83 | Velká Británie – Londýn | 2019 | Londýn |
| 84 | Vranov nad Dyjí | 2014 | Vranov nad Dyjí |
| 85 | Zlín – s přáteli | 2016 | Zlín |
| 86 | Itálie – Cavallino Treporti, Camping Mediterraneo | 2019 | Ca' Savio |
| 87 | Itálie – Riva Nuova Camping Village | 2021 | Martinsicuro |
| 88 | Rychlebské stezky – Bike 2000 | 2022 | Velká Kraš |
| 89 | Slovensko – Širava | ? | Zemplínská Šírava (oblast) |
| 90 | Chata – Dolní Moravice | 2026 | Dolní Moravice |

## Cesty bez návrhu místa

Těchto 6 cest zůstane na mapě bez bodu. Jejich místo není v číselníku nebo z názvu nejde bezpečně určit.

- Bulharsko – letní dovolená (2024)
- Giro 2023 – cyklovýlet (2023)
- Itálie – Camping Delle Rose, Riviera Adriatica (2002)
- Itálie – Lido del Sole, kemp Jamaica (2006)
- Jižní Morava – víkend (2025)
- Německo – Warnemünde (rok neznámý)

## Po schválení

1. V číselníku nastavím schváleným místům `overeno: true`, navržené souřadnice a pole `wikidata`.
2. Schválená přiřazení označím v návrzích `potvrzeno: true`.
3. Migrace zatím umí měnit jen přesné dny, místa, zaměření a další státy. Pro Korčulu (rok, měsíc a počet nocí u cesty bez data) ji rozšířím, i s testem.
4. Spustím zkoušku `npm run migrate` a pošlu rozpis změn YAML hlaviček. Na Drive se zapíše až po vašem výslovném souhlasu a s ověřenou zálohou.
5. Pak kontrolní druhý běh, `npm run export`, `npm run check`, kontrola webu na 1440 a 390 px, nasazení a dokumentace.

Návrhy přesných termínů (10) a zaměření (24) v témže souboru do fáze E nepatří a zůstávají otevřené.
