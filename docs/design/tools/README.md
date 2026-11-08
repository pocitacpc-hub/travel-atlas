# Pomocné skripty prototypu

Nejde o produkční kód. Skripty jsou tu, aby šel prototyp zopakovat a aby je implementace mohla převzít.

## gen-assets.js

Vyrobil `../assets/europe-map.js` a `../assets/data.js`.

```powershell
# jednorázově: Natural Earth data a dekodér TopoJSON do pracovní složky (mimo repo)
npm install --prefix <pracovni-slozka> world-atlas@2 topojson-client@3
node docs/design/tools/gen-assets.js <export.md> <pracovni-slozka>\node_modules docs/design/assets
```

- **Mapa:** `countries-50m` z world-atlas (Natural Earth, public domain).
  - Lambertova azimutální stejnoplochá projekce se středem 10° v. d. a 49° s. š. a výřezem 12° z. d. – 31° v. d. × 34,5–62° s. š., šířka 1000.
  - Body mimo rámec se ořežou na rámec + 40 a body bližší než 1,1 jednotky se zahodí.
  - Státy z archivu dostanou ISO kód, ostatní `n<id>`.
- **Data:** z interního exportu vezme jen veřejná pole cest a vyřadí neověřený rozpočet.
- **Místa:** seznam míst ve skriptu je **ilustrační** (souřadnice obcí z obecné znalosti). Pro web se smí použít jen jako kandidáti do číselníku míst s příznakem `overeno: false`.

## cdp-shot.mjs

Snímky stránek s emulací zařízení přes Chrome DevTools Protocol, bez závislostí (Node 22+). U každé stránky vypíše `scrollWidth` a `clientWidth` (přetékání do šířky) a chyby JavaScriptu.

```powershell
node docs/design/serve.mjs        # statický server maket na http://localhost:4317/
node docs/design/tools/cdp-shot.mjs "C:\Program Files\Google\Chrome\Application\chrome.exe" <profil> <vystup> 390 prehled=http://localhost:4317/v2/index.html
```

- Šířka pod 768 px se emuluje jako mobil.
- Běžný `--screenshot` v headless Chrome má minimální šířku okna kolem 500 px a mobil nezobrazí věrně, proto tenhle skript.
