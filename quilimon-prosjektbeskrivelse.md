# Quilimon – digitalt kortspill

## Bakgrunn og formål

Quilimon er et hjemmelaget, Pokémon-inspirert kortspill skapt av min fetter Jakob da vi var barn. Han tegnet alle monstrene og kortene for hånd og fant opp reglene selv. Dette prosjektet er en digital gjenskapning av spillet, laget som bursdagsgave til Jakob og som noe hele familien som spilte det kan samles om. De originale håndtegnede kortene skal skannes og brukes som kortgrafikk, slik at spillet beholder det håndlagde uttrykket.

## Spillkonsept

To spillere kjemper mot hverandre med hver sin bunke Quilimon-kort. Hver spiller starter med fem kort. Spillerne angriper hverandres monstre ved hjelp av terningkast, og et monster som mister all HP er ute av spillet. Første spiller som har beseiret alle motstanderens monstre vinner. Følelsen skal ligne Hearthstone: kort på et brett, tydelig tur-struktur, og taktile, "juicy" animasjoner (terning som ruller, kort som rister ved treff, HP som drenerer, tall som spretter ut).

## Kortenes anatomi

Hvert Quilimon-kort har:

- **Navn** (f.eks. Mush, Shag, Plune)
- **Level / HP** (skrives "L.30", "L.100" osv. på kortene – dette er monsterets helsepoeng, fra 30 til 200)
- **Type** markert med et symbol (ild, vann, gress, kamp, stein, psykisk m.fl.)
- **Illustrasjon** (skannet håndtegning)
- **1–2 angrep**, hvert med:
  - Et **terningkrav**: ett bestemt terningverdi-intervall eller -sett (f.eks. "4–6" eller "1–3") som avgjør om angrepet kan brukes
  - Et navn og eventuelt **skade** (f.eks. "Charge −20", "Fireball −70")
  - Eventuelt en **spesialeffekt** i fritekst i stedet for eller i tillegg til skade
- Noen kort har et **SPESS**-felt (spesialangrep), ofte med strengere terningkrav og kraftigere effekt
- Noen kort angir en **evolusjonslinje** (f.eks. "Shag – Infireo", "Plune – Pawlune", "Mush – Lumpbeard")

## Grunnregler (versjon 1)

1. Hver spiller har en bunke og trekker en hånd på fem kort.
2. Spillerne har ett aktivt monster hver på brettet om gangen (designspørsmål: bekreft om det skal være ett aktivt + benk, eller alle fem synlige – start med ett aktivt monster og resten som benk).
3. På sin tur kaster spilleren én sekssidet terning.
4. Viser terningen en verdi som matcher terningkravet til ett eller flere av det aktive monsterets angrep, kan spilleren velge og utføre ett av disse angrepene. Matcher den ingen, skjer ingenting og turen går videre.
5. Skade trekkes fra motstandermonsterets HP. Ved 0 HP er monsteret beseiret og fjernes; motstanderen sender inn et nytt fra benken.
6. Spillet er slutt når en spiller ikke har flere monstre. Den andre spilleren vinner.

## Spesialeffekter (viktig for arkitekturen)

Kortene inneholder effekter som går utover ren skade, og motoren må ha et generelt effektsystem fra starten – ikke hardkodede unntak. Eksempler fra de faktiske kortene:

- **Magma Smoke** (Magmo): "blinder motstanderen i én runde" – en status som varer på tvers av turer
- **Pollen** (Mush): "motstanderen må rulle 6 neste runde for å angripe" – endrer reglene for et fremtidig terningkast
- **Reflekt** (Magecko): "sender angrepet tilbake" – avskjærer og omdirigerer en annen handling
- **Magecko passiv**: "neste angrep på Magecko gjør 40 mindre skade og sender 20 tilbake" – modifiserer skadeberegning
- **Mind Infuse** (Sleepius): gjør skade "og lar deg angripe igjen" – bryter normal turflyt
- **Grip** (Sleepius): "vinner runden og stjeler kort til din bunke" – manipulerer kortbunker
- **Atcool SPESS**: "10 × terningverdien" i skade – skade avledet av terningkastet

Effektsystemet bør bygges rundt statuser som ligger på monstre (med varighet i runder) og faste kroker i spillflyten der effekter kan gripe inn: før angrep, ved skadeberegning, ved rundeslutt.

## Arkitekturkrav

- **Motor og presentasjon skal være fullstendig adskilt.** Spillogikken skal være et rent, UI-uavhengig bibliotek uten avhengigheter til visningslaget.
- **Immutabel tilstand og rene funksjoner**: én tilstandsstruktur beskriver hele spillet (tur, brett, hender, bunker, HP, aktive statuser, siste terningkast). Handlinger som `rollDice`, `playCard` og `attack` tar inn tilstand og returnerer ny tilstand.
- **Hendelseslogg**: hver handling returnerer, i tillegg til ny tilstand, en ordnet liste av hendelser (f.eks. terning kastet → skade påført → status påført → monster beseiret). Presentasjonslaget bruker hendelsene til å animere i riktig rekkefølge.
- **Datadrevne kort**: alle kort defineres som ren data (navn, HP, type, angrep, terningkrav, skade, effektreferanser) i en egen datafil. Å legge til et nytt kort skal ikke kreve endringer i motorkoden, kun ny dataoppføring pluss eventuelt en liten effektfunksjon.
- **Tekstbasert først**: en enkel kommandolinjeversjon av spillet bygges før noe grafisk grensesnitt, for å validere regler og spillfølelse. Grensesnittet legges deretter på som et skall over samme motor.
- Motoren skal være testbar, med enhetstester for regellogikk og effekter.

## Omfang

**Versjon 1 (må være ferdig til bursdagen, om ca. tre måneder):**
- To spillere på samme skjerm (hot seat)
- Fem kort hver, terningkast, angrep, skade, statuseffekter, seier/tap
- De sju skannede originalkortene som startsett: Sleepius (200 HP), Magmo (100), Magecko (60), Atcool (50), Shag (40), Mush (30), Plune (30)
- Polerte animasjoner: kort som løftes/tiltes, terningkast, treff-feedback, HP-drenering

**Eksplisitt utenfor versjon 1 (mulige senere utvidelser):**
- AI-motstander
- Online multiplayer
- Evolusjon av monstre (Shag → Infireo osv.)
- Deck-bygging og flere kort
- Energikostnader eller andre nye regler

## Åpne designspørsmål (avklares mot de fysiske kortene)

- Nøyaktige terningkrav per angrep på hvert kort (noen er utydelige på skanningene)
- Om spilleren bytter aktivt monster fritt eller kun når ett beseires
- Hva som skjer ved terningkast som ikke matcher noe angrep (bortkastet tur, eller nytt kast?)
- Hvordan "Grip – vinner runden og stjeler kort" skal tolkes presist
