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

## Kortfakta (avlest fra originalfotoene i `src/assets/Original/`)

Alle 14 handlingene på de 7 kortene. Terningkrav mangler — se Åpne designspørsmål.

| Kort | HP | Korttype | Handling | Skade | Effekt |
|---|---|---|---|---|---|
| Slepio (= Sleepius) | 200 | mørk/psykisk | Mind Infuse | 40 | «og lar deg angripe igjen» |
| | | | Grip | – | «vinner runden og stjeler kort til din bunke» |
| Magmo | 100 | ild | Magma Smoke | – | «blind's the enemy for one round» |
| | | | Fireball | 70 | – |
| Magecko | 60 | kamp | *(uten navn)* | – | «neste angrep på Magecko tar 40 mindre skade og sender 20 tilbake» |
| | | | Reflekt `SPESS` | – | «sender tilbake angrepet» |
| Atcool | 50 | stein | Rock Kick | 30 | – |
| | | | *(uten navn)* `SPESS` | 10 × terningverdi | – |
| Shag | 40 | ild | Scratch | 20 | – |
| | | | Inflame `SPESS` | 40 | – |
| Mush | 30 | gress | Charge | 20 | – |
| | | | Pollen `SPESS` | – | «motstanderen må rulle 6 neste runde for å angripe» |
| Plune | 30 | vann | Bubbles | 20 | – |
| | | | Spectral Beem `SPESS` | 60 | – |

Evolusjonslinje står kun på tre kort: Mush→Lumpbeard, Shag→Infireo, Plune→Pawlune. De fire
andre har Quilimon-logoen i samme felt — altså ingen evolusjon. Bekrefter `evolution: string | null`.

**Observasjoner som treffer datamodellen:**

1. **Terningkrav er notert på to måter.** Fem kort bruker intervall (`A: [terning]–[terning]`,
   fra–til). Slepio og Magmo lister i stedet opp enkeltterninger (Magmos Fireball har en rad på
   fem ikoner). `diceCost: number[]` dekker begge, siden et intervall bare er et utlistet sett.
2. **Skade er ikke obligatorisk.** 5 av 14 handlinger gjør ingen skade — de er ren effekt.
3. **Én skade er beregnet, ikke fast:** Atcools SPESS er «10 × the dice number». Kan ikke stå
   som et tall i datafilen; skade må kunne være enten et tall eller en regel.
4. **«A:» er ikke alltid et angrep.** Mageckos første handling legger en forsvarsbuff på Magecko
   selv — samme felt og terningkrav, motsatt retning. Vurder et mer nøytralt navn enn `Attack`.
5. **Typen hører hjemme på angrepet, ikke bare på kortet.** Fireball er et ildangrep og Spectral
   Beem et vannangrep, mens Charge og Scratch er nøytrale og aldri får elementbonus. Noen angrep
   har altså *ingen* type — en egen tilstand, ikke en av elementene. Merk at typematchen krever
   oppslag på **begge** sider: angrepets type på angripersiden (kan ikke leses av angriperens
   `Card.type`, siden Magmo har både et ild- og et nøytralt angrep), og forsvarerens `Card.type`
   på mottakersiden — nådd via `InBattle` → `Card`. Har angrepet ingen type, hoppes hele
   oppslaget over.
6. **`SPESS` = «special attack».** Faller i praksis sammen med «angrepet har en type», så det
   trengs neppe som eget felt. Ignoreres inntil videre.

**Beslutninger:**

- Kortenes «10+ [typesymbol]»-felt (Shag, Plune, Atcool) betyr at kortet gjør **10 ekstra skade
  mot** de listede typene — ikke at det tar ekstra. Feltet ignoreres i v1; et ordentlig
  type-styrke/svakhet-system bygges senere som eget system.
- Konsekvens for effektsystemet: en typematch er en funksjon av **to** monstre, så
  skadeberegnings-kroken må kunne se både angriper og forsvarer — ikke bare skaden og målet.
  Ta høyde for det nå, selv om selve mekanikken utsettes.
- **Effekter løses med et register av funksjoner, ikke som ren data-union.** Kortdataene peker på
  en effekt via streng-ID (samme fremmednøkkel-mønster som `attackIds`), og et eget register slår
  opp en liten funksjon per effekt. Valgt fordi det matcher arkitekturkravet «ny dataoppføring +
  evt. en liten effektfunksjon», og fordi effekter som Grip (roter i bunkene) og Magecko A (gjør
  to ting samtidig) ikke lar seg presse inn i en fast tagg-union. `BurnEffect`/`PoisonEffect` var
  plassholdere uten grunnlag i kortene og skal bort.

**Konsekvenser av registervalget — ta høyde for disse fra start:**

1. **Registeret fjerner ikke behovet for statuser.** Fire av seks effekter er *utsatte*: funksjonen
   som kjøres ved angrep påfører bare noe, mens virkningen inntreffer senere ved en krok. Statusen
   må finnes som data i spilltilstanden (for nedtelling, serialisering, UI); funksjonen er det
   statusen *gjør*. Det gir to slags funksjoner: én ved utførelse, én per krok.
2. **Effektfunksjoner trenger kontekst, ikke bare tilstand:** angriper, mål, terningkast og hvilket
   angrep som ble brukt — ellers kan ikke samme funksjon gjenbrukes på tvers av kort. De må
   returnere hendelser i tillegg til ny tilstand.
3. **Kroker må kunne svare med mer enn ett tall.** Reflekt avbryter et innkommende angrep og snur
   det; Magecko A både reduserer innkommende skade (−40) og påfører skade motsatt vei (20). Designes
   kroken som «returner justert skade», fungerer alt unntatt disse to — og det oppdages først sent.
   Svaret må kunne være «avbryt og erstatt».
4. **Streng-ID-er gir kjøretidsfeil, ikke kompileringsfeil**, hvis en ID mangler i registeret. Bevisst
   bytte av kompilator-trygghet mot fleksibilitet.

**Effektoversikt (hvilken krok hver effekt hører hjemme i):**

| Effekt | Når | Krok | Inngrep |
|---|---|---|---|
| Mind Infuse | umiddelbar | – | gir en ekstra handling (bryter turflyt) |
| Grip | umiddelbar | – | flytter kort mellom bunker |
| Magma Smoke | utsatt | før angrep | blokkerer angrepet helt |
| Pollen | utsatt | før angrep | endrer terningkravet |
| Magecko A | utsatt | ved skadeberegning | −40 skade **og** 20 tilbake til angriper |
| Reflekt | utsatt | før angrep treffer | omdirigerer hele angrepet |

**Varighet måles ikke likt:** Magma Smoke og Pollen varer i *runder*, mens Magecko A varer til
«neste angrep» — altså et antall bruk, ikke runder. Varighet må kunne uttrykkes på begge måter.

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

- **Eksakte terningkrav per angrep for alle 14 handlingene.** Terningprikkene lar seg ikke lese
  sikkert fra fotoene (4/5/6 er ikke til å skille fra hverandre), og det er nettopp de høye
  verdiene som går igjen. Må leses av på de fysiske kortene.
- Magecko og Atcool har hver sin handling uten navn — hadde de navn?
- Slepio og Magmo mangler `SPESS`-merket som de fem andre har. Bevisst? (Slepio er merket «v.0»
  og er kanskje tegnet først.)
- Om aktivt monster byttes fritt eller kun når ett beseires
- Hva som skjer ved terningkast som ikke matcher noe angrep
- Presis tolkning av "Grip – vinner runden og stjeler kort"
