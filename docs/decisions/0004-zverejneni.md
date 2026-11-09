# Zveřejnění

Platí od 8. 11. 2026 podle [zadání dalších fází](../changes/2026-11-08-zadani-codex-dalsi-faze.md).

Výchozí nastavení pro `stav: probehla` je `zverejnit: true`. Nepotvrzený rozpočet Itálie 2020 má `stav: neoverena`. Export zveřejní jen ukončené cesty. Pro přesnost `den` musí být `konec` před dneškem, pro `mesic` musí uplynout poslední den měsíce a pro `rok` celý rok.

Čtyři historické cesty bez roku zůstávají v kontrolním součtu. U nedatovaného záznamu se vychází z potvrzeného stavu `probehla` a výslovného `zverejnit: true`. Datum zůstává neznámé. Podrobnosti jsou v [kontraktu metadat](../data/_SCHEMA.md).

Od 9. 11. 2026 kontrakt zná i `stav: zrusena` pro cestu, která se nekonala. Má ho rozpočet Itálie 2020. Export takovou cestu nezveřejní.
