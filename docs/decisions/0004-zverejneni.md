# Zveřejnění

Platí od 8. 11. 2026 podle [zadání dalších fází](../changes/2026-11-08-zadani-codex-dalsi-faze.md).

Výchozí nastavení pro `stav: probehla` je `zverejnit: true`. Nepotvrzený rozpočet Itálie 2020 má `stav: neoverena`. Export zveřejní jen ukončené cesty. Pro přesnost `den` musí být `konec` před dneškem, pro `mesic` musí uplynout poslední den měsíce a pro `rok` celý rok.

Kontrolní součet zároveň zahrnuje čtyři historické cesty bez roku. Jejich pravidlo pro ověření ukončení je potřeba výslovně popsat v datovém kontraktu ve fázi B.
