# Číselník míst

Platí od 8. 11. 2026 podle [zadání dalších fází](../changes/2026-11-08-zadani-codex-dalsi-faze.md).

Číselník bude v `data/mista.yaml`. Souřadnice mají přesnost nejvýše na úroveň obce. Mapa používá pouze položky s `overeno: true`.

## Ověření (9. 11. 2026, fáze E)

- Souřadnice i identifikátor místa (pole `wikidata`) pochází z Wikidat. Podklad a výběr položek jsou v [ověření míst](../analysis/2026-11-09-overeni-mist.md).
- Bod je obec nebo pojmenovaná část obce či osada, ve které cesta proběhla. U ubytování je to sídlo, na jehož území leží, nikdy souřadnice samotného ubytování. Obec se určuje podle hranic obcí z Wikidat, kde jsou k dispozici.
- Oblast (pohoří, ostrov, poloostrov) se použije jen tam, kde konkrétní obec není známá.
- Ověření i přiřazení míst k cestám schvaluje Martin.
