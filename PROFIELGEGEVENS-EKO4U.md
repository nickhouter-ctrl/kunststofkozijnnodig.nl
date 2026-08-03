# Profielgegevens uit EKO4U (aluplast) — nog te verwerken

Aangeleverd door Rebu als schermafdruk uit de aluplast-catalogus, mét de
technische doorsnede erbij. Deze waarden gaan vóór op onze eigen aannames.

## IDEAL 7000 NL BLOKPROFIEL 84 mm (met aanslag)

- profielklasse B
- **kozijndiepte 120 mm** — wij hebben nu 85 mm staan voor dit systeem. 85 mm is
  de bouwdiepte van het basissysteem; het NL-blokprofiel mét aanslag is 120 mm.
  De inbouwdiepte hoort dus per uitvoering te verschillen, niet per systeem.
- systeem met 2 afdichtingen
- **beglazing tot 41 mm** — onze `maxGlasdikte` moet hierop.
- HFL-technologie mogelijk

Maten uit de doorsnede: totaal 144 (59 + 85), glassponning 36, hoogte 133,
verder 113 / 98 / 64 / 57 / 49 / 36 / 24 / 20 / 13 / 12 / 5 / 4, diepte 120,
onderdorpelvlak 107, twee kamers van 60.

## Ideal 4000 Vin 20 mm (artikel 140041)

- profielklasse B
- **inbouwdiepte 70 mm**
- **5-kamerige bouwwijze**
- standaard open staal met een dikte van 1,5 mm
- beslag standaard met twee anti-inbraakpunten aan de vleugel
- systeem met 2 afdichtingen
- **beglazing tot 42 mm**

Maten uit de doorsnede: hoogte 133, 84, 49, 57, 36, 5.

## Wat hiermee moet gebeuren

1. `inbouwdiepte` en `maxGlasdikte` per **uitvoering** kunnen verschillen in
   plaats van alleen per systeem.
2. De opsomming (profielklasse, kamers, afdichtingen, staal, anti-inbraakpunten)
   hoort op de profielkaart die uit de vergelijking met toeleveringonline komt:
   doorsnede + eigenschappen + levertijd + prijs.
3. De doorsnedetekeningen zijn de ijking voor detail A — dat is meteen het
   antwoord op "de detailtekeningen kloppen niet".

## Gealan S 9000 NL Base — kozijnprofiel (doorsnede Ekozijn)

Maten uit de doorsnede, in mm:

- totale breedte **120** (52,5 + 67,5) — dit is de kozijndiepte
- **86** hoog aan de buitenzijde, met een afschuining van **15°**
- **26** boven de sponning, **42** sponninghoogte, **18** onder
- onderzijde **18 + 102**

Dit is het kaderprofiel waarvan wij de zichtbreedte al op **66 mm** hebben
geijkt via AKUGT (2000 breed → glasmaat 1868). De doorsnede geeft nu ook de
diepte: 120 mm, niet de 82,5 mm die wij als inbouwdiepte hebben staan. Net als
bij aluplast geldt: de 82,5 mm is de bouwdiepte van het basissysteem, het
NL-kozijnprofiel is dieper.

## Doorsneden als SVG in het project

De fabrikantstekeningen staan nu in `public/configurator/profielen/`. Het zijn
echte vectortekeningen uit de technische catalogus van aluplast, dus ze kunnen
rechtstreeks als detail A gebruikt worden in plaats van onze eigen parametrische
benadering.

| bestand | wat |
|---|---|
| `aluplast-ideal-7000-nl-kader84-vleugel77.svg` | kader 170054 × raamvleugel 170020 — **NL kader 84 mm, raamvleugel 77 mm**; 144 breed, 120 diep, 133 hoog, sponning 57 / 56 |
| `aluplast-ideal-7000-nl-17053-17030.svg` | kader 170053 × vleugel 170030 |
| `aluplast-ideal-7000-nl-17054-17033-deur.svg` | kader 170054 × vleugel 170033 — zware vleugel, hoogte 96 in plaats van 57, totaal 172 |
| `aluplast-hst85-standard-170x80-170x81.svg` | **HST 85 hefschuif**, kader 170080 × vleugel 170081 — 197 breed totaal (112 + 85), vleugel 80/100, rail 163/178 |

Twee dingen die hieruit volgen voor het model:

1. **Kader en vleugel zijn een combinatie**, geen systeemmaat. Bij hetzelfde
   kader 170054 hoort zowel een raamvleugel van 77 mm als een zware vleugel van
   96 mm. Wij hebben nu één vleugelzichtbreedte per systeem.
2. De **HST 85** doorsnede geeft de hefschuifmaten die wij tot nu toe alleen uit
   glasmaten hadden afgeleid: 197 mm totale opbouw, 112 mm vast deel, 85 mm
   vleugel, 100 mm vleugelhoogte.

## HST 85 — schema C, horizontale doorsnede

`aluplast-hst85-schema-c-horizontaal.svg` — de volledige horizontale doorsnede
door een 4-delige pui volgens schema C, met de maten die wij tot nu toe alleen
uit glasmaten hadden teruggerekend:

- **schuifraam (ontmoetingsstijl): 63 mm**
- **schuifraam links, rechts en boven: 100 mm**

Dit zijn aluplast-maten. Onze hefschuifgeometrie is geijkt op Gealan (kader 177,
puistijl 130, ontmoetingsstijl 256) en voor aluplast overgenomen als aanname —
met deze twee getallen kan de aluplast-pui nu op zijn eigen maten gezet worden.

## Bron: de volledige technische catalogus

https://benefit.ekookna.com/nl/technische-catalogus?filters%5BSystemodawca%5D%5B0%5D=ALUPLAST

Hier staan alle aluplast-doorsneden als SVG, per profielcombinatie en per schema.
Elk blad noemt de kader- en vleugelmaat expliciet ("NL kader: 84 mm",
"Raamvleugel: 77 mm", "Schuifraam: 63 mm"), dus de maatketen is er rechtstreeks
uit te lezen in plaats van terug te rekenen uit glasmaten.

Nog op te halen: Ideal 4000, de overige HST-schema's, en de doorsneden van
Gealan en Kömmerling (die staan in hun eigen catalogus, niet bij ekookna).
