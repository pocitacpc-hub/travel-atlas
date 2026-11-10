# Cestovní atlas

Cestovní atlas je osobní archiv uskutečněných cest. Statický web má Přehled s mapou států, Kroniku po letech, Statistiky a detail cesty. Rozložení vychází ze schváleného prototypu Atlas, barvy a písmo z vybraného návrhu „Cestovní deník“ ([popis vzhledu](docs/design/system.md)).

## Lokální vývoj

Vyžaduje npm, Git a podporovanou verzi Node.js. Pro vývoj použij řadu 22 (alespoň 22.12) nebo 24. CI používá řadu 22.

```powershell
npm ci
npm run dev
```

Otevři [lokální Přehled](http://127.0.0.1:5173/travel-atlas/). Mapu a vlajky generuje `npm run assets` z balíčků world-atlas a flag-icons. Celý balík kontrol spustíš přes `npm run check`. Výstup sestavení je v `dist/`.

Soukromé Markdowny jsou na Google Drivu. Přísný export čte jejich YAML hlavičky a ukládá ověřený veřejný výstup do `public/data/`. Zkušební režim se starými metadaty používá ignorovanou složku `out/legacy/`.

- [Aktuální stav](docs/current-state.md)
- [Zadání a checklist](docs/00-zadani-a-checklist.md)
- [Vývoj a nasazení](CODEX-DEV-RUNBOOK.md)
- [Datový kontrakt](docs/data/_SCHEMA.md)
- [Návrh Atlas](docs/design/system.md)
