# Doplnění historických cest a Bulharska

Přísný export k 15. 11. 2026 má 109 cest, z toho 60 po Česku a 49 do zahraničí, v 15 státech. Přibylo 13 cest. Známe 359 nocí u 80 cest a jeden záznam je bez roku.

Kronika začíná v roce 1991. Zahrnuje dva pobyty u Zemplínské Šíravy (1991 a 1995), dvě historické cesty do Pasohlávek, devět pobytů na Visalajích a šest víkendů v Malenovicích. Historická Praha je vedená s přesností na rok 2001. Bulharsko z 5.–12. 8. 2024 má přiřazené Primorsko. Podrobnosti o ubytování a cestovních kancelářích jsou v soukromých poznámkách na Drivu.

## Mapa

Souřadnice pocházejí z Wikidat. Tabulka uvádí místa využívaná po následné kontrole evidence.

| Místo | Podklad | Použití |
| --- | --- | --- |
| Acharavi | [Wikidata](https://www.wikidata.org/wiki/Q992317) | Pobyt na Korfu 2000 |
| Malenovice | [Wikidata](https://www.wikidata.org/wiki/Q1887182) | Šest víkendů v letech 1996 a 1997 |
| Nea Iraklia | [Wikidata](https://www.wikidata.org/wiki/Q14656052) | Chalkidiki 1998 |
| Primorsko | [Wikidata](https://www.wikidata.org/wiki/Q405153) | Bulharsko 2024 |

Acharavi nahradilo obecný bod ostrova Korfu. Nea Iraklia zpřesnila jeden pobyt na Chalkidiki. Chalkidiki zůstává v mapě u další cesty. Přiřazení se zapsalo do deseti YAML hlaviček na Drivu s ověřenou zálohou a kontrolou shody původních těl souborů. Pozdější kontrola účasti vyřadila chybný záznam i čtyři body z jeho mapy.

## Ověření

- `npm run export -- --as-of=2026-11-15` vytvořil 109 cest a 85 míst bez chyb. Změny ve veřejných datech prošly kontrolou názvů, termínů, bodů a soukromí.
- `npm run check` prošel včetně 47 testů. `npm run migrate` navrhl doplnit 13 volitelných prázdných seznamů `zamereni`. Export používá stejnou výchozí hodnotu.
- Korčula má v evidenci 10 nocí a termín 19.–30. 7. 1994. Export upozorňuje na rozdíl mezi oběma údaji. Noci jsou ve statistice pouze u cest s doloženou hodnotou.
