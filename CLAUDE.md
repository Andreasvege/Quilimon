# CLAUDE.md — Quilimon

Digitalt kortspill: en gjenskapning av et Pokémon-inspirert kortspill som ble
tegnet og oppfunnet for hånd av fetteren Jakob som barn. Lages som bursdagsgave
til Jakob (deadline ca. tre måneder fra prosjektstart, sommer 2026). Deles som en
nettlenke uten installasjon. De sju originale håndtegnede kortene skannes og
brukes som kortgrafikk.

Full prosjektbeskrivelse: [quilimon-prosjektbeskrivelse.md](quilimon-prosjektbeskrivelse.md) — les den for detaljer.

**Språk:** Eieren er norsk. Svar og kommuniser på norsk.

## Teknologi

- Vite + React + TypeScript
- Kildekode i `src/`, skannede kort i `src/assets/Cropped/` (7 kort), spillmotor i `src/game/`

## Arkitekturkrav (ufravikelige — fra prosjektbeskrivelsen)

1. **Motor helt adskilt fra UI.** Spillogikken er et rent, UI-uavhengig bibliotek uten avhengigheter til visningslaget.
2. **Immutabel tilstand + rene funksjoner.** Én tilstandsstruktur beskriver hele spillet. Handlinger som `rollDice`, `playCard`, `attack` tar inn tilstand og returnerer ny tilstand.
3. **Hendelseslogg.** Hver handling returnerer, i tillegg til ny tilstand, en ordnet liste av hendelser som presentasjonslaget bruker til å animere i riktig rekkefølge.
4. **Datadrevne kort.** Alle kort defineres som ren data i en egen datafil. Å legge til et nytt kort skal ikke kreve motorendringer — kun ny dataoppføring + evt. en liten effektfunksjon.
5. **Generelt effektsystem fra start** — ikke hardkodede unntak. Bygges rundt statuser på monstre (med varighet i runder) og faste kroker i spillflyten: før angrep, ved skadeberegning, ved rundeslutt.
6. **Tekstbasert (CLI) først**, deretter grafisk skall over samme motor.
7. **Testbar motor** med enhetstester for regellogikk og effekter.

## Versjon 1 (omfang)

- To spillere, hot seat (samme skjerm), fem kort hver
- Terningkast (D6), angrep, skade, statuseffekter, seier/tap
- Ett aktivt monster + benk per spiller
- Startsett = de 7 kortene: Sleepius (200 HP), Magmo (100), Magecko (60), Atcool (50), Shag (40), Mush (30), Plune (30)
- Polerte, "juicy" animasjoner (Hearthstone-følelse)

**Utenfor v1:** AI-motstander, online multiplayer, evolusjon, deck-bygging, energikostnader.

## Status (per nå)

- Prosjektoppsett (Vite/React/TS) på plass, 7 kort skannet og croppet. `npm install` er kjørt (`node_modules` finnes), `npx tsc --noEmit -p tsconfig.app.json` fungerer for typesjekk.
- Datamodell for kort/angrep er i gang (eieren skriver selv, Claude gir kun konseptuell veiledning — jf. Samarbeidsform under):
  - `src/game/cards.ts`: `Card`-interface (eksportert) med `id`, `name`, `description`, `image`, `type` (union av elementtype-literals: `"dark" | "fire" | "fighting" | "grass" | "water" | "rock"`), `hp`, `attackIds: string[]` (fremmednøkkel-referanse til `Attack`), `evolution: string | null` (bevisst beholdt selv om evolusjon er utenfor v1-scope — koster ingenting å ha med nå).
  - `src/game/attacks.ts` (ny fil): `Attack`-interface (eksportert) med `id`, `name`, `description`, `damage`, `diceCost: number[]` (sett av spesifikke terningverdier som utløser angrepet). Mangler ennå et `effect`-felt.
  - Statuseffekter er modellert som discriminated union: `BurnEffect` og `PoisonEffect` (egne interfaces, felles tag-felt `type: "burn" | "poison"`), samlet i `type StatusEffect = BurnEffect | PoisonEffect`. Bevisst holdt som to separate interfaces (ikke ett delt) siden burn/poison sine faktiske spilleregler ikke er avklart ennå mot de fysiske kortene.
  - `src/game/types.ts` er fortsatt tom stub.
- Viktig arkitekturinnsikt underveis: en fremtidig "monster i kamp"-type (arbeidstittel `InBattle`) vil trengs for mutable kamp-tilstand (f.eks. `damageMultiplier`, løpende HP, aktive statuseffekter). Den skal *referere til* `Card` via id (samme fremmednøkkel-mønster som `attackIds`), ikke utvide eller mutere `Card` direkte — `Card` skal forbli den immutable malen for en kortart. Ikke bygget ennå, kommer med selve spilltilstanden (`GameState`).
- Neste steg:
  1. Legg til et valgfritt `effect`-felt på `Attack`, av type `StatusEffect`.
  2. Fyll inn faktiske kortdata for de 7 kortene + reelle angrep/terningkrav (krever avlesning av de fysiske kortene — jf. Åpne designspørsmål under).
  3. Deretter: `GameState`-struktur + handlinger (`rollDice`, `playCard`, `attack`), inkl. `InBattle`-typen for kamp-tilstand.

## Samarbeidsform / preferanser

- Eieren lærer TypeScript (kommer fra Java/JavaScript) og vil **skrive motorkoden selv**. Ønsker teoretisk/konseptuell hjelp og forklaringer, men **ikke at Claude skriver koden eller gir konkrete føringer på hvordan f.eks. kort-modellen skal se ut** — med mindre det uttrykkelig bes om. Spør før du produserer kode i `src/game/`.

## Åpne designspørsmål (avklares mot de fysiske kortene)

- Eksakte terningkrav per angrep (noen utydelige på skanningene)
- Om aktivt monster byttes fritt eller kun når ett beseires
- Hva som skjer ved terningkast som ikke matcher noe angrep
- Presis tolkning av "Grip – vinner runden og stjeler kort"
