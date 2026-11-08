# Metadata cesty

Jeden Markdown představuje jednu cestu. Metadata začínají oddělovačem `---` na prvním řádku a končí samostatným `---`. Export vybírá soubory s `typ: cesta`. Soukromá pole zůstávají ve zdroji. Export vybírá pouze pole z [datového kontraktu](../../schemas/metadata.schema.json) a ze soukromých údajů o aktivitách čte mezní dny jen pro místní varování.

## Povinná pole

| Pole | Hodnota |
| --- | --- |
| `typ` | `cesta` |
| `id` | Náhodné a jedinečné `t-` a šest malých znaků z `[a-z0-9]`. Po přidělení ho neměň. |
| `nazev` | Název, který smí být veřejný. |
| `stav` | `probehla`, `planovana` nebo `neoverena`. |
| `zverejnit` | YAML boolean `true` nebo `false`. |
| `zeme` | Český název hlavního státu z [číselníku](../../data/zeme.json). |
| `zacatek`, `konec` | Kalendářní data `RRRR-MM-DD` nebo `null`. Při přesnosti `den` jsou povinná obě data a konec nesmí být před začátkem. |
| `presnost_terminu` | `den`, `mesic`, `rok` nebo `neznamy`. |
| `pocet_noci` | Celé nezáporné číslo nebo `null`. Nula znamená prokazatelně bez noclehu. |
| `rok`, `mesic` | Vyplň, když je `zacatek: null`. U známého začátku se odvodí. Ručně vyplněné hodnoty s ním musí souhlasit. |

Při přesnosti `mesic` vyplň rok a měsíc 1 až 12. Při přesnosti `rok` vyplň rok a `mesic: null`. U nedatované cesty dej `rok: null` i `mesic: null`. Ve všech třech případech nech začátek a konec `null`.

## Volitelná pole

- `dalsi_zeme` obsahuje další potvrzené státy pobytu podle číselníku.
- `mista` obsahuje názvy nebo aliasy z [číselníku míst](../../data/mista.yaml). Do výstupu jdou pouze ověřená místa ve státech cesty.
- `zamereni` je seznam hodnot `kolo`, `turistika`, `more`, `hory`, `mesto`, `chata`, `kemp` nebo `akce`.
- `verejny_popis` je text určený ke zveřejnění nebo `null`.
- Souhrn aktivit tvoří společně `strava_pocet_aktivit`, `strava_celkem_km` a `strava_prevyseni_m`. Počet aktivit a metry převýšení jsou celá čísla, kilometry mohou být desetinné. Všechny tři hodnoty jsou nezáporné.

## Kdy se cesta zveřejní

Cesta potřebuje `stav: probehla` a `zverejnit: true`. U přesného termínu musí konec ležet před datem exportu. Při známém měsíci musí uplynout celý měsíc, při známém roku celý rok. U historické cesty bez data potvrzuje uskutečnění výslovný stav `probehla`. Neznámé datum zůstává `null`.

Veřejný výstup používá ISO kódy států a ID míst. Klíče a strukturu určují schémata [cest](../../schemas/cesty.schema.json) a [míst](../../schemas/mista.schema.json). Výstupy sdílejí `schemaVersion`, `generated: true` a stejné `dataAsOf`.

## Šablona nové cesty

Před uložením přiděl jedinečné ID, nahraď zástupný název a vyplň známé údaje. Stav a příznak zveřejnění uprav až po potvrzení uskutečnění.

```yaml
---
typ: cesta
id: t-xxxxxx
nazev: "Název cesty"
stav: planovana
zverejnit: false
zeme: "Česko"
zacatek: null
konec: null
rok: null
mesic: null
presnost_terminu: neznamy
pocet_noci: null
dalsi_zeme: []
mista: []
zamereni: []
verejny_popis: null
---
```
