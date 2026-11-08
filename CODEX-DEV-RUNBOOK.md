# Vývoj a nasazení Cestovního atlasu

| Položka | Hodnota |
| --- | --- |
| Repozitář | `C:\Dev\TravelAtlas` · [GitHub](https://github.com/pocitacpc-hub/travel-atlas) |
| Stránky | `index.html` (Přehled), `kronika.html`, `statistiky.html`, `cesta.html?id=…` |
| Kód webu | `src/lib/` (výpočty, formátování, mapa, grafy), `src/pages/`, `src/styles/`, `src/atlas.css` |
| Generované podklady | `src/generated/` (mimo Git, `npm run assets`) |
| Konfigurace | `vite.config.ts`, `package.json`, `tsconfig.json` |
| Nástroje a testy | `tools/`, `tests/` |
| Lokální vývoj | [127.0.0.1:5173/travel-atlas/](http://127.0.0.1:5173/travel-atlas/) |
| Lokální náhled sestavení | [127.0.0.1:4173/travel-atlas/](http://127.0.0.1:4173/travel-atlas/) |
| Cílový web | [GitHub Pages](https://pocitacpc-hub.github.io/travel-atlas/) |

## Spuštění a ověření

V kořeni repozitáře spusť `npm ci` a `npm run dev`. Příkaz nejdřív vygeneruje mapu a vlajky (`npm run assets`) a pak spustí Vite. Zastav přes Ctrl+C ve stejném terminálu. Restart je zastavení a opětovné spuštění `npm run dev`. Vite hlásí obsazený port a nepřesouvá se automaticky na jiný.

```powershell
npm run test     # Vitest
npm run check    # TypeScript, obsah, soukromí, testy a sestavení
npm run assets   # mapa a vlajky do src/generated/
npm run build    # podklady a statické soubory v dist/
npm run preview  # lokální náhled dist/
```

## Zdroj dat a bezpečnost

Web nemá databázi. Zdrojové Markdowny jsou v soukromé složce `AI/MD/OsobniSystem/11 Cestování` na Google Drivu. Nastav lokální cestu pomocí proměnné `CESTY_ZDROJ` nebo stejnojmenného klíče v `config.local.json`. Přednost má proměnná prostředí. Lokální vývoj webu a CI zdroj nepotřebují.

```powershell
$env:CESTY_ZDROJ = 'G:\Můj disk\AI\MD\OsobniSystem\11 Cestování'
npm run export -- --legacy
```

Zkušební režim ukládá JSON s dočasnými ID do `out/legacy/` a report do `out/export-report.md`. Datum exportu vychází z časové zóny Europe/Prague. Pro reprodukci ověření použij `--as-of=2026-11-08`. Neúspěšný export skončí nenulovým kódem. Stav posledního běhu ověř v reportu, protože na disku může zůstat starší výstup.

Pro běžný export po migraci spusť `npm run export`. Ověřená dvojice JSON se uloží do `public/data/`. Lokální seznam jmen pro export a security lint má formát `jmena.local.txt`, jedno jméno na řádek. Prázdné řádky a řádky začínající `#` se ignorují. Bez tohoto souboru proběhnou obecné kontroly citlivých vzorů.

Zdrojové Markdowny, `out/`, místní konfiguraci a seznam jmen drž mimo historii Gitu. Před commitem zkontroluj `git diff --cached -- public/data/` a spusť `npm run check`. Nasazení používá pouze `dist/`. Veřejná data se do něj vkládají při sestavení, nová cesta proto znamená export, kontrolu a commit bez změny kódu.

## Migrace metadat

Základní migrace proběhla 8. 11. 2026. Rozpis a umístění zálohy jsou v místním `out/`. Další návrhy vyžadují samostatné potvrzení.

1. Spusť `npm run migrate`. Výchozí zkouška vytvoří `out/migrace-report.md` se změnami před a po pro každý záznam a `out/migrace-plan.local.json` se stabilními navrženými ID a otisky souborů. Přísný náhled se ověří v paměti.
2. Martin vybere položky v [návrzích](data/migrace/2026-11-navrhy.yaml) změnou `potvrzeno: true`. Každý termín, seznam míst nebo zaměření schvaluje samostatně. Cestu návrh identifikuje názvem a rokem. Návrh termínu musí zachovat rok začátku. Případný další stát doplní jako `zmeny: { dalsi_zeme: [Český název státu] }` pouze při doloženém pobytu. Po změně návrhů znovu spusť zkoušku a nech schválit nový rozpis.
3. Po výslovném souhlasu se zápisem spusť následující příkaz se záložní složkou na místním disku mimo Drive a mimo Git.

```powershell
npm run migrate -- --apply --backup 'C:\Dev\Zálohy\TravelAtlas'
```

Skript odmítne změnu zdroje nebo návrhů proti uloženému plánu. Nejdřív vytvoří časovanou kopii celé složky a ověří ji pomocí SHA-256. Potom jednotlivě nahradí YAML hlavičky. Tělo Markdownu si zachová původní bajty. Umístění zálohy a výsledek zápisu jsou v `out/migrace-zapis.md`.

Po zápisu spusť `npm run migrate` a ověř nulu navržených změn. Při přerušení nejdřív zkontroluj zálohu a stav zdroje. Soubor `out/migrace.lock` odstraň pouze tehdy, když migrační proces prokazatelně neběží. Pak připrav nový náhled zbývajících změn. Přísný export, kontroly a výměna testovacího snímku následují po ověření zápisu. `_SCHEMA.md` přidej na Drive jen po schválení.

## První nasazení

První nasazení už proběhlo. Následující postup je pro opětovné nastavení Pages.

1. Martin v [nastavení Pages](https://github.com/pocitacpc-hub/travel-atlas/settings/pages) vybere **Build and deployment → Source → GitHub Actions**.
2. Na kartě [Actions](https://github.com/pocitacpc-hub/travel-atlas/actions/workflows/check-and-pages.yml) vyber **Kontrola a GitHub Pages** a spusť nový běh přes **Run workflow** pro `main`. Běhy vytvořené před zapnutím Pages používají stav ze své původní události.
3. Po úspěšné kontrole a nasazení otevři [cílový web](https://pocitacpc-hub.github.io/travel-atlas/) a ověř český název, hlavičku, patičku a načtený styl. Na 390 px se stránka nemá vodorovně posouvat.

Workflow kontroluje každý push a pull request. Po zapnutí Pages nasazuje úspěšné sestavení z pushů na `main` a z ručního spuštění na `main`. Na vývojových větvích a v pull requestech se provádí pouze kontrola.
