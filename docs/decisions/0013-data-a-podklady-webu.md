# Data a podklady webu

Platí od 8. 11. 2026 (fáze D).

- **Veřejná data se vkládají do sestavení.** `src/lib/data.ts` importuje `public/data/cesty.json`, `public/data/mista.json` a `data/zeme.json`. Web je za běhu nenačítá, takže nemá chybový stav „data se nenačetla“. Kontrolu obsahu dělá `npm run check` před sestavením. `publicDir` zůstává vypnutý.
- **Nová cesta nevyžaduje změnu kódu.** Nový Markdown → `npm run export` → `npm run check` → commit. Pages sestaví web s novými daty.
- **Mapa a vlajky se generují.** `npm run assets` (`tools/build-assets.ts`) vytvoří ignorovanou složku `src/generated/`.
  - `mapa.json` obsahuje hranice z balíčku `world-atlas` (Natural Earth 1:50m) v projekci `src/lib/projection.ts`, státy z číselníku podle ISO kódu, ostatní pevninu jako jednu cestu a obdélníky států pro výřez v detailu.
  - `vlajky.css` a `flags/*.svg` obsahují podmnožinu balíčku `flag-icons` pro státy z `data/zeme.json`. Licence MIT zůstává jako komentář ve výsledném CSS.
- **Kontrola vlajek v exportu** používá stejný balíček (`tools/flags.ts`) místo prototypové složky.
- Stát z číselníku mimo výřez mapy nebo bez číselného kódu v tabulce `tools/build-assets.ts` sestavení ohlásí varováním. Na mapě se neobarví, v seznamech zůstane.
