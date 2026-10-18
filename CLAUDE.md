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

- To spillere, hot seat (samme skjerm), **tre kort hver** (endret fra fem — se Spillregler)
- Terningkast (D6), angrep, skade, statuseffekter, seier/tap
- Ett aktivt monster + resten av laget per spiller
- Startsett = de 7 kortene: Sleepius (200 HP), Magmo (100), Magecko (60), Atcool (50), Shag (40), Mush (30), Plune (30)
- Polerte, "juicy" animasjoner (Hearthstone-følelse)

**Utenfor v1:** AI-motstander, online multiplayer, evolusjon, deck-bygging, energikostnader.

## Spillregler (avklart — overstyrer prosjektbeskrivelsen der de er uenige)

Prosjektbeskrivelsen er skrevet før disse avklaringene og bruker delvis andre ord (særlig
«hånd» og «benk»). Der de er uenige gjelder listen under.

- **Lag, ikke hånd.** Hver spiller tar med **tre** kort inn i kampen. Alle er med fra start —
  det er et *lag* (som partyet i Pokémon-spillene), ikke en hånd med skjulte kort man spiller ut.
  Derfor bærer hele laget løpende HP og statuser hele tiden, ikke bare det aktive monsteret.
- **Felles bunke.** Begge spillere trekker sine tre fra én delt bunke på 7. Bunken hører derfor
  hjemme på `GameState`, ikke på `Player`. Når man kan trekke er ikke avklart — foreløpig kun
  ved spillstart.
- **Tre av sju × 2 spillere = 6 av 7 kort.** Regnestykket er grunnen til at det ble tre og ikke
  fem: 5 + 5 > 7. Ett kort blir liggende igjen i bunken.
- **Ingen duplikater i v1.** Hver kortart finnes i nøyaktig ett eksemplar, så `Card.id` fungerer
  som identitet for en monster-instans. **Merk:** åpner man for duplikater senere (deck-bygging
  medfører det nesten alltid) trenger hver instans en egen id ved siden av kortart-referansen —
  ellers kan ikke motoren skille to Magmo fra hverandre.
- **Fritt bytte.** Aktivt monster kan byttes når som helst, også skadet, og **må** byttes når det
  beseires. Et utbyttet monster går tilbake til laget og **beholder skade og statuser** — ellers
  blir bytte gratis helbredelse.
- **Beseiret → graveyard.** Ikke «benk». Ordet *benk* i prosjektbeskrivelsen betyr reserver;
  her heter reservene laget, og `graveyard` er de beseiterte. Beseiret er endelig (0 HP,
  statuser irrelevante), så graveyard trenger ikke bære kamptilstand.
- **`switch`, ikke `playCard`.** Med fritt bytte og alle kort i spill fra start finnes det ingen
  «spill et kort»-handling. Handlingen heter `switch`.

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

- Prosjektoppsett (Vite/React/TS) på plass, 7 kort skannet og croppet. `npm install` er kjørt (`node_modules` finnes), `npx tsc --noEmit -p tsconfig.app.json` fungerer for typesjekk. `App.tsx` er ryddet for ubrukt Vite-mal-innhold (men har fortsatt en ubrukt `useState`-import).

**Datamodellen er ferdig og kompilerer.** Alle tre filene under er komplette; typesjekken er ren
bortsett fra `useState` i `App.tsx`. Alle 14 `attackIds` i `CARDS` finnes i `ATTACKS` (kryssjekket).

- `src/game/cards.ts`: `Card`-interface + `CARDS: Record<string, Card>` med alle 7 kortene og
  `getCard(id)`. Kortene har egenskrevne norske beskrivelser.
- `src/game/attacks.ts`: `Attack`-interface + `ATTACKS: Record<string, Attack>` med alle 14
  handlingene og `getAttack(id)`. `"smoke"` er bevisst ikke i type-unionen: Magma Smoke er
  `type: "fire"` med en effekt — element og effekt er to akser. Gamle `BurnEffect`/`PoisonEffect`
  er slettet.
- `src/game/gamestate.ts`: `GameState`, `Player`, `InBattle`, `StatusEffect`. Rene typer.
- `src/game/events.ts`: `GameEvent` (diskriminert union med 10 varianter) + `ActionResult`
  (`{ state, events }` — returtypen alle handlinger deler).
- `src/game/actions.ts`: motorlogikken. `createGame`, `rollDice` og `getActive` er ferdige og
  kjører; `dealDamage` er under arbeid. Se Roadmap for resten.
- `src/game/types.ts` er slettet — navnet sa ingenting, og hendelsene bor i `events.ts`. Den var
  opprinnelig en tom `interface Types {}`-stub, antakelig tenkt for elementtypene; et interface
  kunne aldri blitt det, siden elementtyper er en union av strenger og ikke et objekt.

**To slags funksjoner i `actions.ts`, ikke bland dem:** *handlinger* (`rollDice`, `attack`,
`switchMonster`) endrer spillet og returnerer `ActionResult`; *hjelpefunksjoner* (`getActive`,
`dealDamage`) svarer på et spørsmål eller gjør én liten ting og returnerer det de finner. Eieren
gikk i den fella én gang — `getActive` skrevet som om den skulle returnere `ActionResult`.

**Mønster gjennom hele motoren: `GameState` inneholder bare id-er og tilstand, aldri hele
`Card`-objekter.** `deck` og `graveyard` er `string[]`, `InBattle` har `cardId`. `CARDS`/`ATTACKS`
er statiske kataloger som lastes én gang; staten holder kun det som endrer seg. Dermed dupliseres
ikke statisk data ved hver immutable oppdatering, og `Card.hp` (maks-HP, en egenskap ved arten)
blandes aldri med `InBattle.currentHp` (tilstand nå). `gamestate.ts` importerer derfor ingenting
fra `cards.ts`.

**Effekt-ID-er som er tatt i bruk** (må matche nøklene i effektregisteret når det skrives):
`extraAction` (Mind Infuse), `grip`, `blind` (Magma Smoke), `mageckoGuard`, `reflect`,
`diceScaledDamage` (Atcools SPESS — har bevisst ingen `damage`, siden skaden er 10 × terningverdi),
`pollen`.

**Terningkrav:** alle 14 er avlest fra de fysiske kortene. **Kjent feil, ikke rettet ennå:** mange
står som `[4, 6]` (Rock Kick, Scratch, Charge, Bubbles, Pollen, Atcools SPESS, Magecko Guard). Det er
trolig intervaller lest som fra–til — Jakob ser ut til å ha brukt intervall på eldre kort og
utlistede sett på nyere. Men `diceCost` er et *sett*, så motoren leser `[4, 6]` som «kun 4 eller 6»
og en femmer feiler. Eieren skriver dem ut manuelt (`[4, 5, 6]`) senere; ikke rett dem uoppfordret.
Eieren noterte samtidig at Mind Infuse og Fireball trolig er for sterke og må balanseres når
spillet kjører.

## Roadmap

**Demo-frist: fredag 23. oktober 2026** — eieren overleverer spillet til Jakob da (flyttet fra
søndag 18.10). Motoren (fase 1) ble ferdig 18.10. Plan for resten: CLI-spill-løkke i
`scripts/play.ts` (fase 2 er gjeninnført, siden det er tid) → React-UI → juice → deploy.
Avtale: eieren skriver selv så lenge han kan — også UI. Først når han sier at tiden er ute, tar
Claude over UI-et. Ikke ta det over før det sies.

**Jakob er grafisk designer**, og en del av gaven er å spørre om han vil jobbe videre på spillet
sammen. Mye av det visuelle blir derfor trolig byttet ut. UI-et skal imponere litt, men investeringen
går i det som overlever en redesign: kortbildene hans i stort format, og billig «juice» (HP-bar som
drenerer, kortrist ved treff, skadetall som spretter, terninganimasjon). Ikke bruk tid på detaljert
styling. Hold UI-laget tynt og adskilt fra motoren, slik at han kan tegne om alt uten å røre reglene.

**Prioritert strategi: minimum spillbar demo først, effektsystemet etterpå.** Grunnen er at
**9 av 14 handlinger er ren skade** (Fireball, Scratch, Charge, Bubbles, Spectral Beem, Inflame,
Rock Kick, Mind Infuses skadedel). Bare 5 krever effektsystemet. Et spill med bare skadehandlingene
er ekte Quilimon, kan spilles, og gir svar på balansespørsmålene (Fireball/Mind Infuse er
mistenkt for sterke) som ingen diskusjon kan gi. Ikke bygg effektregisteret før spillet kjører.

Anslag ved siste oppdatering: ca. 10–15 % av full v1 er gjort; en spillbar demo uten effekter
ligger på ca. 35–40 %.

### Fase 1 — motorlogikk uten effekter *(ferdig 18.10)*
Valg gjort: beseiret fjernes fra `team` til `graveyard` og `activeIndex` settes til 0; `gameEnded`
sendes fra `attack`; bytte avslutter ikke turen; `endTurn` teller ikke ned statuser ennå (fase 4).
1. ✅ `createGame(player1Setup, player2Setup)` → `GameState`. Kortene sendes **inn**, trekkes ikke
   tilfeldig inni, slik at tester kan sette opp en bestemt situasjon.
2. ✅ `rollDice(state, value)` → `ActionResult`. Terningverdien sendes inn av samme grunn.
3. ✅ `getActive(state, playerIndex)` → `InBattle`. Ren oppslagsfunksjon, ingen `ActionResult`.
4. ✅ `dealDamage(state, playerIndex, amount)` → `GameState`. Nestet immutabel oppdatering
   (`state → players → team → monster`); én kopi per nivå.
5. ✅ `attack(state, attackId)` → `ActionResult`. Sjekk at `lastRoll` matcher `diceCost`, kall
   `dealDamage`, sjekk om målet er beseiret (→ `graveyard`), send hendelsene.
6. ✅ `switchMonster(state, teamIndex)` → `ActionResult`. Fritt bytte; skade og statuser beholdes.
7. ✅ `endTurn(state)` → `ActionResult`. Bytt `currentPlayerIndex`, tell ned `"turns"`-statuser
   (men **ikke** `"uses"`-statuser — de telles ned av kroken som utløser dem).
8. ✅ Seier/tap: en spiller uten monstre igjen har tapt → `gameEnded`.

### Fase 2 — CLI
Tekstbasert spill over samme motor (arkitekturkrav 6). Validerer reglene før noe UI bygges, og er
stedet `Math.random()` for terningen hører hjemme — utenfor motoren.

### Fase 3 — grafisk skall
React-UI over samme motor: to kort på skjermen, HP, terningknapp, angrepsknapper. Bildene i
`src/assets/Cropped/`; UI-laget oversetter `Card.image` (filnavn) → URL, så motoren forblir fri
for bundler-avhengigheter.

### Fase 4 — effektsystemet
Først nå. Se «Konsekvenser av registervalget» over — særlig at kroker må kunne svare «avbryt og
erstatt», ikke bare returnere et justert tall. Rekkefølge: typene (kontrakten) → krokpunktene i
`attack` → én effekt om gangen, mot en flyt som allerede kjører.

### Fase 5 — polish og deploy
«Juicy» animasjoner (terningkast, kortrist, HP-drenering, tall som spretter), og deploy til en
nettlenke uten installasjon.

### Etter demoen — «ordentlig» versjon i spillmotor (besluttet 2026-10-16)

Hvis Jakob sier ja til å jobbe videre, flyttes spillet fra nettleser til en **spillmotor med C#**
og leveres som kjørbar fil (Windows/Mac). Nettlenke er ikke lenger et krav. Arbeidsdeling:
Jakob eier det visuelle i editoren (animasjoner, timing, partikler), eieren eier reglene.

**Valget står mellom Godot 4 og Unity, begge med C#.** Polish er ikke et motorargument — begge
rendrer 2D likt; det er illustrasjonene og animasjonene som avgjør utseendet. Reelle forskjeller:
Unity har større økosystem og bedre no-code-verktøy for effekter (Shader Graph, VFX Graph,
DOTween) og er mer verdt på Jakobs CV. Godot er lettere, gratis uten konto, og har førsteklasses
2D/UI. Står det likt, velg Unity.

**Avgjøres med et prøveprosjekt, likt i begge motorer, én kveld per motor:** ett kort med Jakobs
tegning, en terningknapp, og ved trykk: terningen ruller, kortet rister, skadetall spretter opp,
HP-bar drenerer. Ingen regler, bare juice. Jakob skal justere timing og farger **uten hjelp** — den
editoren han kommer lengst i på egen hånd, er den riktige.

**Motoren porteres, ikke skrives om.** Arkitekturen (motor adskilt fra UI, immutabel tilstand,
hendelseslogg, datadrevne kort) er den samme i C#: rene klasser uten motor-avhengigheter i en egen
mappe/prosjekt, `record` + `with`-uttrykk for immutabilitet (tilsvarer `{ ...state, x }`), testet
med NUnit/xUnit uten editoren. Scenene abonnerer på hendelseslisten. `actions.ts` oversettes nesten
linje for linje.

### Etterslep (ikke blokkerende)
- `[4, 6]`-terningkravene i `attacks.ts` skrives ut til `[4, 5, 6]` — eieren gjør det manuelt
- De seks elementtypene står duplisert i `cards.ts` og `attacks.ts`; kan trekkes ut til én
  `QuilimonType`-union (`Attack.type` blir `QuilimonType | "normal"`)
- Ubrukt `useState`-import i `App.tsx`
- Balansejustering av Mind Infuse og Fireball — krever at spillet kan spilles først

## Samarbeidsform / preferanser

**Bygg først, diskuter etterpå.** Dette er den viktigste instruksen i fila. Eieren har erfart at
øktene går med til en halvtimes gamedesign-diskusjon, fem linjer kode, og så to uker før neste økt
der de samme spørsmålene tas opp igjen. Det skal ikke skje mer.

- **Ta beslutninger på eierens vegne.** Når et designvalg dukker opp: velg det rimeligste, si i én
  setning hva du valgte og hva det betyr, og kod videre. Ikke legg fram alternativer med
  trade-offs og be eieren velge, med mindre valget er dyrt å reversere.
- **Jakobs regler er løse og åpne for tolkning.** Eieren har ingen fast visjon og forventer å endre
  struktur underveis. Mye av gamedesignet *er* å bygge noe, se hva som funker, og endre. En
  beslutning som viser seg feil i faktisk spill koster mindre enn diskusjonen som skulle unngått den.
- **Eieren lærer TypeScript** (kommer fra Java/JavaScript) og vil henge med på hva koden betyr og
  hvordan ting fungerer. Forklar kort underveis — hva en konstruksjon gjør og hvorfor — men ikke
  over-forklar hver eneste avgjørelse.

**Foreslå den enkleste og mest lesbare løsningen, ikke den smarteste.** Eieren ba eksplisitt om
dette (2026-10-13): Claude hadde en tendens til å gi korteste/mest elegante variant — tette
`.map()`-kall med ternære uttrykk, `Math.max` i stedet for en `if`, kjeder i stedet for navngitte
mellomsteg. De er vanskeligere å lese og lærer bort mindre.

- Velg eksplisitte, åpenbare steg med navngitte variabler, selv om det blir flere linjer og litt
  mindre effektivt. En vanlig `if` slår et smart uttrykk.
- Gjør det gjerne i flere små, navngitte trinn framfor én tett setning.
- Optimalisering er et **eget, senere** steg. Da har eieren kontroll på hva funksjonen gjør, hvordan
  den så ut før, og hva omskrivingen faktisk forbedrer — og lærer av begge versjoner.

**Eieren skriver koden. Claude skriver ikke kode i `src/game/`.** Dette gjelder fortsatt, og er
ikke i konflikt med «bygg først» over — «ta beslutninger på mine vegne» betyr *designbeslutninger*
(hvordan skal regelen være, hva skal feltet hete), ikke at Claude tar tastaturet. Claude tok feil
om dette 2026-09-05 og skrev `gamestate.ts` og `attacks.ts`; det ble rullet tilbake.

Formen som fungerer: **step-by-step-instruksjoner og veiledning**. Fortell hva som skal skrives,
i hvilken rekkefølge og hvorfor — og la eieren skrive det. Vis gjerne små fragmenter eller
signaturer for å forklare en konstruksjon, men ikke lever ferdige filer.

## Åpne designspørsmål

Disse er *ikke* blokkerende. Anta noe rimelig, kod videre, og noter antakelsen her.

- **Eksakte terningkrav per angrep for alle 14 handlingene.** Terningprikkene lar seg ikke lese
  sikkert fra fotoene (4/5/6 er ikke til å skille fra hverandre), og det er nettopp de høye
  verdiene som går igjen. Må leses av på de fysiske kortene — inntil da brukes gjettede verdier
  i kortdataene, merket i fila.
- Magecko og Atcool har hver sin handling uten navn — hadde de navn?
- Slepio og Magmo mangler `SPESS`-merket som de fem andre har. Bevisst? (Slepio er merket «v.0»
  og er kanskje tegnet først.)
- Hva som skjer ved terningkast som ikke matcher noe angrep (prosjektbeskrivelsen sier «ingenting
  skjer, turen går videre» — brukes til noe annet er bestemt)
- Presis tolkning av «Grip – vinner runden og stjeler kort». Med felles bunke gir «din bunke»
  ikke lenger mening; mest sannsynlig betyr det å ta et kort fra motstanderens lag over i sitt eget.
- Når man kan trekke fra fellesbunken (kun ved start, eller underveis?)
