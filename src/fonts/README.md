# Písma webu

Web používá systémová písma, pokud jsou v zařízení: **Palatino Linotype / Palatino** a **Ink Free**. Zařízení, které je nemá (hlavně Android a Linux), stáhne tato lokální písma. Žádné písmo se nenačítá z cizího serveru. Pravidla `@font-face` jsou na začátku `src/atlas.css`.

| Soubor | Písmo | Zdroj | Licence |
|---|---|---|---|
| `atlas-serif-regular.woff2`, `atlas-serif-italic.woff2`, `atlas-serif-bolditalic.woff2` | TeX Gyre Pagella (volná obdoba Palatina) | CTAN `fonts/tex-gyre/opentype/` (GUST e-foundry), staženo 10. 11. 2026 | GUST Font License (LPPL 1.3c), `LICENSE-TeX-Gyre-Pagella.txt` |
| `atlas-hand-latin.woff2`, `atlas-hand-latin-ext.woff2` | Patrick Hand (ručně psané) | npm `@fontsource/patrick-hand` 5.3.0 | SIL Open Font License 1.1, bez vyhrazeného jména, `LICENSE-Patrick-Hand.txt` |

**Úpravy proti originálu:** jde o podmnožiny znaků převedené do WOFF2. Soubory jsou přejmenované, jak licence GUST doporučuje. Obsahují jen znaky:

- U+0020–007E, U+00A0–00FF a U+0100–017F (latinka s češtinou),
- U+2010–2027 a U+2030–203A (pomlčky, uvozovky, tři tečky),
- U+20AC (€), U+2190–2193 (šipky) a U+2212 (minus).

Pagella má po zmenšení asi 40 kB na řez (originál 220 kB).

**Jak podmnožinu zopakovat:** balíček `subset-font` 2.9 (HarfBuzz) nainstalovat do pracovní složky mimo repozitář. Pro každý soubor zavolat `subsetFont(buffer, text, { targetFormat: "woff2" })` s textem ze znaků uvedených výše. Patrick Hand se zmenšuje zvlášť pro soubory `latin` a `latin-ext` z balíčku Fontsource.
