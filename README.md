# Cestovní atlas

Cestovní atlas je osobní archiv uskutečněných cest. Vzniká jako statický web s přehledem, kronikou, statistikami a detailem cesty. První verze obsahuje úvodní stránku ve stylu schváleného prototypu.

## Lokální vývoj

Vyžaduje npm, Git a podporovanou verzi Node.js. Pro vývoj použij řadu 22 (alespoň 22.12) nebo 24. CI používá řadu 22.

```powershell
npm ci
npm run dev
```

Otevři [lokální Přehled](http://127.0.0.1:5173/travel-atlas/). Celý balík kontrol spustíš přes `npm run check`. Výstup sestavení je v `dist/`.

Soukromé Markdowny jsou na Google Drivu. Tento veřejný repozitář obsahuje kód a dokumentaci. Až vznikne export, bude se zveřejňovat jen zkontrolovaný JSON s povolenými údaji.

- [Aktuální stav](docs/current-state.md)
- [Zadání a checklist](docs/00-zadani-a-checklist.md)
- [Vývoj a nasazení](CODEX-DEV-RUNBOOK.md)
- [Návrh Atlas](docs/design/system.md)
