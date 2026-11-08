# Vývoj a nasazení Cestovního atlasu

| Položka | Hodnota |
| --- | --- |
| Repozitář | `C:\Dev\TravelAtlas` · [GitHub](https://github.com/pocitacpc-hub/travel-atlas) |
| Vstup a konfigurace | `index.html`, `src/`, `vite.config.ts` a `package.json` |
| Nástroje a testy | `tools/`, `tests/` |
| Lokální vývoj | [127.0.0.1:5173/travel-atlas/](http://127.0.0.1:5173/travel-atlas/) |
| Lokální náhled sestavení | [127.0.0.1:4173/travel-atlas/](http://127.0.0.1:4173/travel-atlas/) |
| Cílový web | [GitHub Pages](https://pocitacpc-hub.github.io/travel-atlas/) |

## Spuštění a ověření

V kořeni repozitáře spusť `npm ci` a `npm run dev`. Zastav přes Ctrl+C ve stejném terminálu. Restart je zastavení a opětovné spuštění `npm run dev`. Vite hlásí obsazený port a nepřesouvá se automaticky na jiný.

```powershell
npm run test     # Vitest
npm run check    # TypeScript, obsah, soukromí, testy a sestavení
npm run build    # statické soubory v dist/
npm run preview  # lokální náhled dist/
```

`npm run export` je ve fázi A připravený vstup pro fázi B. Zatím skončí se zprávou, že export čeká na datový kontrakt.

## Zdroj dat a bezpečnost

Web nemá databázi. Zdrojové Markdowny jsou v soukromé složce `AI/MD/OsobniSystem/11 Cestování` na Google Drivu. Skutečnou cestu synchronizace ověř až při práci s exportem a nastav ji mimo Git v `config.local.json` nebo přes `CESTY_ZDROJ`. Pro spuštění fáze A zdroj nepotřebuješ.

Zdrojové Markdowny, `out/`, místní konfiguraci a seznam jmen drž mimo historii Gitu. Před commitem zkontroluj `git diff --cached -- public/data/` a spusť `npm run check`. Nasazení používá pouze `dist/`, který ve fázi A obsahuje HTML a CSS úvodní stránky.

## První nasazení

První nasazení už proběhlo. Následující postup je pro opětovné nastavení Pages.

1. Martin v [nastavení Pages](https://github.com/pocitacpc-hub/travel-atlas/settings/pages) vybere **Build and deployment → Source → GitHub Actions**.
2. Na kartě [Actions](https://github.com/pocitacpc-hub/travel-atlas/actions/workflows/check-and-pages.yml) vyber **Kontrola a GitHub Pages** a spusť nový běh přes **Run workflow** pro `main`. Běhy vytvořené před zapnutím Pages používají stav ze své původní události.
3. Po úspěšné kontrole a nasazení otevři [cílový web](https://pocitacpc-hub.github.io/travel-atlas/) a ověř český název, hlavičku, patičku a načtený styl. Na 390 px se stránka nemá vodorovně posouvat.

Workflow kontroluje každý push a pull request. Po zapnutí Pages nasazuje úspěšné sestavení z pushů na `main` a z ručního spuštění na `main`. Na vývojových větvích a v pull requestech se provádí pouze kontrola.
