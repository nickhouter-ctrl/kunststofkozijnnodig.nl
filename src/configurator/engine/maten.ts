/**
 * De maatberekening — het hart van de configurator.
 *
 * Werkt regel 2 uit hoofdstuk 1 van het functioneel ontwerp uit: glasmaat,
 * cilindermaat en hormaat worden ALTIJD berekend, ongeacht of het bijbehorende
 * product wordt meegeleverd. Er is geen enkel pad door dit bestand waarin een
 * maatveld leeg blijft.
 *
 * DE MAATKETEN (per zijde, alles in mm)
 *
 *   kozijn buitenmaat
 *     − 2 × kozijnZichtbreedte    → sponningopening van het kozijn
 *
 *   de indelingsboom verdeelt die opening met stijlen in vakken
 *
 *   vak mét vleugel:
 *     vakopening + 2 × aanslag             → vleugel buitenmaat
 *     vleugel buitenmaat − 2 × vleugelZicht → daglichtopening
 *
 *   vast vak (glas rechtstreeks in het kozijn):
 *     vakopening − 2 × (kozijnZichtVast − kozijnZicht) → daglichtopening
 *
 *   beide:
 *     daglichtopening + 2 × glasinleg   → sponningmaat van het glas
 *     sponningmaat − 2 × glasspeling    → GLASMAAT
 *
 * De geometrie die hier uitkomt wordt door drie afnemers gebruikt: de
 * technische tekening, het klikbare bewerkvlak in de configurator en de
 * productie-export. Alle drie lezen dezelfde rechthoeken (regel 1).
 */
import { BEWEEGBAAR, GLASINVULLINGEN, vakkenVan } from "./indeling";
import {
  FABRIEKSSTANDAARD_BESLAG,
  LEVERBARE_CILINDERMATEN,
  bijprofielOpId,
  glastypeOpId,
  hortypeOpId,
  paneeltypeOpId,
  roosterOpId,
} from "../data/onderdelen";
import type {
  Beslag,
  Cilindermaat,
  Configuratie,
  Glastype,
  Indeling,
  Kozijnzijde,
  Millimeter,
  Profiel,
  SkgKlasse,
  Splitsing,
  VakInvoer,
  VakMaten,
} from "../types";

/** Rondt af op hele millimeters. Productiematen zijn altijd geheel. */
function mm(waarde: number): Millimeter {
  return Math.round(waarde);
}

/** Oppervlak in m², afgerond op 3 decimalen. */
function m2(breedte: number, hoogte: number): number {
  return Math.round(((breedte * hoogte) / 1_000_000) * 1000) / 1000;
}

/**
 * Verdeelt een totale maat over delen volgens hun gewicht, zó dat de som exact
 * gelijk blijft aan het totaal. Zonder deze correctie loopt een kozijn met drie
 * gelijke vakken 1 mm uit de pas — precies het soort stille fout dat dit systeem
 * moet uitsluiten.
 */
export function verdeelBreedte(
  totaal: Millimeter,
  gewichten: number[],
  /**
   * Vaste verschuiving per deel in mm, vóór het afronden. De som hoort nul te
   * zijn. Wordt gebruikt bij een hefschuifpui, waar de vleugels een paar
   * millimeter van de vaste delen overnemen.
   */
  correcties?: number[]
): Millimeter[] {
  const som = gewichten.reduce((a, b) => a + b, 0);
  if (som <= 0) throw new Error("Vakgewichten moeten samen groter dan nul zijn");

  const exact = gewichten.map((v, i) => (totaal * v) / som + (correcties?.[i] ?? 0));
  const naarBeneden = exact.map((e) => Math.floor(e));
  let rest = totaal - naarBeneden.reduce((a, b) => a + b, 0);

  // De millimeters die door het afronden overblijven gaan naar de delen met de
  // grootste restfractie (grootste-restmethode).
  const volgorde = exact
    .map((e, i) => ({ i, fractie: e - Math.floor(e) }))
    .sort((a, b) => b.fractie - a.fractie);

  const uit = [...naarBeneden];
  for (const { i } of volgorde) {
    if (rest <= 0) break;
    uit[i] += 1;
    rest -= 1;
  }
  return uit;
}

// ---------------------------------------------------------------------------
// Geometrie van de indeling
// ---------------------------------------------------------------------------

export type { StijlMaten } from "../types";
import type { StijlMaten } from "../types";

/**
 * Het gebied waarin een knoop van de indelingsboom past. De bovenrand kan
 * schuin lopen: hij gaat van `topLinks` (bij x) naar `topRechts` (bij x+breedte).
 * De onderrand is altijd horizontaal.
 */
interface Gebied {
  x: Millimeter;
  breedte: Millimeter;
  topLinks: Millimeter;
  topRechts: Millimeter;
  onderkant: Millimeter;
}

/** Hoogte van de bovenrand op een positie binnen het gebied. */
function topOp(gebied: Gebied, x: number): number {
  if (gebied.breedte <= 0) return gebied.topLinks;
  const fractie = (x - gebied.x) / gebied.breedte;
  return gebied.topLinks + (gebied.topRechts - gebied.topLinks) * fractie;
}

/** Een lijst van het kozijn zelf. Klikbaar, zodat de onderregel een dorpel kan worden. */
export interface KozijnDeel {
  zijde: "boven" | "onder" | "links" | "rechts";
  x: Millimeter;
  y: Millimeter;
  breedte: Millimeter;
  hoogte: Millimeter;
}

export interface IndelingGeometrie {
  vakken: { vak: VakInvoer; gebied: Gebied }[];
  stijlen: StijlMaten[];
  kozijndelen: KozijnDeel[];
}

/**
 * Verdeelt een maat over kinderen die deels een vaste maat hebben.
 * Vaste maten gaan er eerst af; wat overblijft wordt naar gewicht verdeeld.
 * Zo blijft een bovenlicht van 400 mm precies 400 mm als het kozijn groeit.
 */
function verdeelMetVasteMaten(
  totaal: Millimeter,
  kinderen: Indeling[],
  correcties?: number[]
): Millimeter[] {
  const vast = kinderen.map((k) => (k.vasteMaat !== null && k.vasteMaat > 0 ? Math.round(k.vasteMaat) : null));
  const vastTotaal = vast.reduce((som: number, v) => som + (v ?? 0), 0);
  const flexibelAantal = vast.filter((v) => v === null).length;

  /**
   * De som mag nooit groter worden dan de beschikbare ruimte: dan zou de
   * tekening buiten het kozijn lopen en zou de productie-export maten bevatten
   * die niet in het element passen. Passen de vaste maten niet, dan worden ze
   * evenredig teruggeschaald; de regelmotor meldt het te kleine vak apart.
   */
  const RUIMTE_PER_FLEXIBEL = 1;
  const maxVast = Math.max(0, totaal - flexibelAantal * RUIMTE_PER_FLEXIBEL);

  if (vastTotaal > maxVast && vastTotaal > 0) {
    const factor = maxVast / vastTotaal;
    const geschaald = vast.map((v) => (v === null ? null : Math.floor(v * factor)));
    const geschaaldTotaal = geschaald.reduce((som: number, v) => som + (v ?? 0), 0);
    const restje = Math.max(0, totaal - geschaaldTotaal);
    const flexDelen =
      flexibelAantal === 0
        ? []
        : verdeelBreedte(
            restje,
            kinderen.filter((_, i) => geschaald[i] === null).map((k) => Math.max(0.01, k.gewicht))
          );
    let g = 0;
    const uit = kinderen.map((_, i) => (geschaald[i] !== null ? (geschaald[i] as number) : flexDelen[g++]));
    // De laatste millimeters bij het eerste deel, zodat de som exact klopt.
    const som = uit.reduce((a, b) => a + b, 0);
    if (som !== totaal && uit.length > 0) uit[0] += totaal - som;
    return uit;
  }

  if (flexibelAantal === 0) return vast.map((v) => v as number);

  const rest = Math.max(0, totaal - vastTotaal);
  const flexDelen = verdeelBreedte(
    rest,
    kinderen.filter((_, i) => vast[i] === null).map((k) => Math.max(0.01, k.gewicht)),
    correcties?.filter((_, i) => vast[i] === null)
  );

  let f = 0;
  return kinderen.map((_, i) => (vast[i] !== null ? (vast[i] as number) : flexDelen[f++]));
}

/** Legt de indelingsboom uit over het beschikbare gebied. */
function legUit(knoop: Indeling, gebied: Gebied, uit: IndelingGeometrie): void {
  if (knoop.soort === "vak") {
    uit.vakken.push({ vak: knoop, gebied });
    return;
  }

  const n = knoop.kinderen.length;
  /**
   * De breedte van scheiding `i`. Bij een hefschuifpui verschilt die per plek:
   * tussen een vast deel en een vleugel staat een gewone stijl, tussen twee
   * vleugels de bredere ontmoetingsstijl.
   */
  const scheidingOp = (i: number): number =>
    knoop.scheidingBreedtes?.[i] ?? knoop.scheidingBreedte;
  const scheidingTotaal = Array.from({ length: Math.max(0, n - 1) }, (_, i) => scheidingOp(i)).reduce(
    (som, b) => som + b,
    0
  );

  if (knoop.as === "kolommen") {
    const beschikbaar = gebied.breedte - scheidingTotaal;
    const delen = verdeelMetVasteMaten(
      Math.max(0, beschikbaar),
      knoop.kinderen,
      knoop.maatCorrecties
    );
    let x = gebied.x;

    knoop.kinderen.forEach((kind, i) => {
      const kindGebied: Gebied = {
        x,
        breedte: delen[i],
        topLinks: mm(topOp(gebied, x)),
        topRechts: mm(topOp(gebied, x + delen[i])),
        onderkant: gebied.onderkant,
      };
      legUit(kind, kindGebied, uit);
      x += delen[i];

      if (i < n - 1) {
        const scheiding = scheidingOp(i);
        const topStijl = mm(Math.min(topOp(gebied, x), topOp(gebied, x + scheiding)));
        uit.stijlen.push({
          splitsingId: knoop.id,
          as: "kolommen",
          index: i,
          x,
          y: topStijl,
          breedte: scheiding,
          hoogte: gebied.onderkant - topStijl,
          vorigeMaat: delen[i],
          volgendeMaat: delen[i + 1] ?? 0,
        });
        x += scheiding;
      }
    });
    return;
  }

  // Rijen. De bovenste rij houdt de schuine bovenrand; alle rijen daaronder
  // zijn gewone rechthoeken. Er wordt verdeeld over het vlakke deel, zodat elke
  // rij een echte hoogte houdt en alleen de bovenste rij de schuinte opvangt.
  const laagsteTop = Math.max(gebied.topLinks, gebied.topRechts);
  const beschikbaar = gebied.onderkant - laagsteTop - scheidingTotaal;
  const delen = verdeelMetVasteMaten(
    Math.max(0, beschikbaar),
    knoop.kinderen,
    knoop.maatCorrecties
  );
  let y = laagsteTop;

  knoop.kinderen.forEach((kind, i) => {
    const isBovenste = i === 0;
    const kindGebied: Gebied = {
      x: gebied.x,
      breedte: gebied.breedte,
      topLinks: isBovenste ? gebied.topLinks : y,
      topRechts: isBovenste ? gebied.topRechts : y,
      onderkant: y + delen[i],
    };
    legUit(kind, kindGebied, uit);
    y += delen[i];

    if (i < n - 1) {
      const scheiding = scheidingOp(i);
      uit.stijlen.push({
        splitsingId: knoop.id,
        as: "rijen",
        index: i,
        x: gebied.x,
        y,
        breedte: gebied.breedte,
        hoogte: scheiding,
        vorigeMaat: delen[i],
        volgendeMaat: delen[i + 1] ?? 0,
      });
      y += scheiding;
    }
  });
}

/**
 * Legt een indelingsboom uit binnen een willekeurig gebied, los van het kozijn.
 * Gebruikt voor de indeling bínnen een vleugel: stijlen in de deur zelf.
 */
export function legUitIn(knoop: Indeling, gebied: Gebied): IndelingGeometrie {
  const uit: IndelingGeometrie = { vakken: [], stijlen: [], kozijndelen: [] };
  legUit(knoop, gebied, uit);
  return uit;
}

/** De sponningopening van het hele kozijn — het startgebied van de indeling. */
export function kozijnGebied(configuratie: Configuratie, profiel: Profiel): Gebied {
  const kozijnZicht = profiel.geometrie.kozijnZichtbreedte.waarde;
  const schuin = configuratie.vorm === "schuin" && configuratie.hoogteLaag !== null;

  // De hoge zijde bepaalt de kozijnhoogte; bij schuin ligt links lager.
  const topRechts = kozijnZicht;
  const topLinks = schuin
    ? kozijnZicht + (configuratie.hoogte - (configuratie.hoogteLaag as number))
    : kozijnZicht;

  return {
    x: kozijnZicht,
    breedte: configuratie.breedte - 2 * kozijnZicht,
    topLinks,
    topRechts,
    onderkant: configuratie.hoogte - kozijnZicht,
  };
}

/** Legt de volledige indeling uit, inclusief de klikbare kozijnlijsten. */
export function berekenGeometrie(configuratie: Configuratie, profiel: Profiel): IndelingGeometrie {
  const uit: IndelingGeometrie = { vakken: [], stijlen: [], kozijndelen: [] };
  const gebied = kozijnGebied(configuratie, profiel);
  legUit(configuratie.indeling, gebied, uit);

  // De vier lijsten van het kozijn zelf. De onderregel is klikbaar zodat er een
  // dorpel van gemaakt kan worden.
  const zicht = profiel.geometrie.kozijnZichtbreedte.waarde;
  const hoogsteTop = Math.min(gebied.topLinks, gebied.topRechts);
  uit.kozijndelen.push(
    { zijde: "boven", x: 0, y: hoogsteTop - zicht, breedte: configuratie.breedte, hoogte: zicht },
    { zijde: "onder", x: 0, y: gebied.onderkant, breedte: configuratie.breedte, hoogte: zicht },
    { zijde: "links", x: 0, y: hoogsteTop - zicht, breedte: zicht, hoogte: configuratie.hoogte },
    {
      zijde: "rechts",
      x: configuratie.breedte - zicht,
      y: hoogsteTop - zicht,
      breedte: zicht,
      hoogte: configuratie.hoogte,
    }
  );

  return uit;
}

// ---------------------------------------------------------------------------
// Afgeleide maten per vak
// ---------------------------------------------------------------------------

/**
 * Berekent de afgeleide maten van elk vak.
 *
 * `glastype` mag `null` zijn (geen glas meegeleverd); de glasmaat wordt dan
 * onverminderd berekend, alleen het gewicht blijft leeg omdat dat van het
 * gekozen glastype afhangt.
 */
export function berekenVakken(
  configuratie: Configuratie,
  profiel: Profiel,
  glastype: Glastype | null
): VakMaten[] {
  const g = profiel.geometrie;
  const overslag = g.vleugelOverslag.waarde;
  const vleugelZicht = g.vleugelZichtbreedte.waarde;
  const glasinleg = g.glasinleg.waarde;

  const hortype = hortypeOpId(configuratie.hortypeId);
  const horAftrek = profiel.horAansluitmaat.waarde + (hortype?.extraAftrek.waarde ?? 0);

  const geometrie = berekenGeometrie(configuratie, profiel);

  return geometrie.vakken.map(({ vak, gebied }): VakMaten => {
    const rooster = roosterOpId(vak.roosterId);
    /**
     * Een rooster ín de beglazing zit binnen de vleugel: het staat in het
     * glasvlak zelf en neemt daar hoogte van af. Het verkleint dus NIET de
     * vleugel — die houdt zijn volle maat, precies zoals in werkelijkheid.
     * Een rooster dat een eigen vak vult (tussen stijlen in) is iets anders:
     * dat vak ís het rooster.
     */
    const roosterInGlas = vak.invulling !== "rooster" && rooster !== null;
    const roosterHoogte = roosterInGlas ? rooster.bouwhoogte.waarde : 0;

    const sponningBreedte = gebied.breedte;
    const hoogteHoog = gebied.onderkant - Math.min(gebied.topLinks, gebied.topRechts);
    const hoogteLaagRuw = gebied.onderkant - Math.max(gebied.topLinks, gebied.topRechts);
    const schuin = gebied.topLinks !== gebied.topRechts;

    const sponningHoogte = mm(hoogteHoog);
    const sponningHoogteLaag = schuin ? mm(hoogteLaagRuw) : null;

    const heeftVleugel = BEWEEGBAAR.includes(vak.invulling);
    const heeftGlas = GLASINVULLINGEN.includes(vak.invulling);
    /**
     * Het glastype van dít vak. Bovenaan staat het glas dat voor het hele kozijn
     * geldt; wil je in één raam ander glas — gelaagd bij een deur, zonwerend aan
     * de zuidkant — dan wint de keuze op het vak zelf.
     */
    const vakGlas = glastypeOpId(vak.glastypeId) ?? glastype;
    const vulsoort: VakMaten["vulsoort"] =
      vak.invulling === "rooster" ? "rooster" : vak.invulling === "paneel" ? "paneel" : "glas";

    /**
     * De vakopening is al de glasmaat bij een vast vak: de zichtbreedte van het
     * kozijn is er in de indeling van afgetrokken, en die zichtbreedte ís de
     * glasaftrek (geijkt op EKO4U en AKUGT).
     *
     * Zit er een vleugel in het vak, dan komt het vleugelprofiel erbij — maar
     * niet zijn volle zichtbreedte: de vleugel valt met zijn overslag over het
     * kozijn heen, dus dat stuk telt niet dubbel.
     *
     *   Aluplast IDEAL 7000 NL, 1000 breed met vleugel 170020 (77 mm):
     *     1000 − 2 × 84 − 2 × (77 − 28) = 734   ← wat EKO4U toont
     */
    /*
     * Een deur krijgt het zwaardere deurprofiel wanneer de fabrikant dat op dit
     * kader levert; een raam het gewone vleugelprofiel. Bij hetzelfde kader
     * scheelt dat bij aluplast 19 mm per zijde (96 om 77).
     */
    const deurZicht = profiel.geometrie.deurVleugelZichtbreedte?.waarde ?? null;
    const isDeurblad = vak.invulling === "deur" || vak.invulling === "vastedeur";
    const vakVleugelZicht = isDeurblad && deurZicht !== null ? deurZicht : vleugelZicht;
    // Een vaste deur heeft wél het deurprofiel maar gaat niet open; hij krijgt
    // dus dezelfde glasaftrek als een draaiende deur.
    const glasAftrek = heeftVleugel || vak.invulling === "vastedeur" ? vakVleugelZicht - overslag : 0;

    // De vleugel valt met zijn overslag over het kozijn; dat is een aanzicht-
    // maat, niet de glasmaat.
    const vleugelBreedte = heeftVleugel ? mm(sponningBreedte + 2 * overslag) : sponningBreedte;
    const vleugelHoogte = heeftVleugel ? mm(sponningHoogte + 2 * overslag) : sponningHoogte;
    const vleugelHoogteLaag =
      sponningHoogteLaag === null
        ? null
        : heeftVleugel
          ? mm(sponningHoogteLaag + 2 * overslag)
          : sponningHoogteLaag;

    // De glasmaat. Een rooster in de beglazing gaat hier van de hoogte af: het
    // staat binnen de vleugel, bovenin het glasvlak.
    const glasBreedte = mm(sponningBreedte - 2 * glasAftrek);
    const glasHoogte = mm(sponningHoogte - 2 * glasAftrek - roosterHoogte);
    const glasHoogteLaag =
      sponningHoogteLaag === null ? null : mm(sponningHoogteLaag - 2 * glasAftrek - roosterHoogte);

    // Het daglicht is wat de klant aan glas ziet: de glasmaat minus de inleg
    // onder de glaslat.
    const inleg = vulsoort === "rooster" ? 0 : glasinleg;
    const daglichtBreedte = mm(glasBreedte - 2 * inleg);
    const daglichtHoogte = mm(glasHoogte - 2 * inleg);
    const daglichtHoogteLaag = glasHoogteLaag === null ? null : mm(glasHoogteLaag - 2 * inleg);
    // De sponningmaat waarin het glas valt is gelijk aan de glasmaat; de speling
    // zit al in de gepubliceerde zichtbreedte verwerkt.
    const glasSponningBreedte = glasBreedte;
    const glasSponningHoogte = glasHoogte;

    // Bij een schuin vak is het glas een trapezium; het oppervlak volgt uit de
    // gemiddelde hoogte van beide zijden.
    const glasRekenHoogte = glasHoogteLaag === null ? glasHoogte : (glasHoogte + glasHoogteLaag) / 2;
    const glasOppervlakM2 = m2(glasBreedte, glasRekenHoogte);
    const vleugelRekenHoogte =
      vleugelHoogteLaag === null ? vleugelHoogte : (vleugelHoogte + vleugelHoogteLaag) / 2;

    // Hormaat — ALTIJD berekend, ook zonder hor (regel 2). De hor valt in de
    // dagopening van het kozijn, met speling aan beide zijden.
    const horBreedte = mm(sponningBreedte - 2 * horAftrek);
    const horHoogte = mm(sponningHoogte - 2 * horAftrek);

    // De indeling bínnen deze vleugel, inclusief de stijlen die daar staan.
    const binnen = berekenBinnenVakken(vak, gebied, profiel, glastype, {
      heeftVleugel,
      zijAftrek: glasAftrek,
      roosterHoogte,
      inleg,
    });

    return {
      id: vak.id,
      naam: vak.naam,
      invulling: vak.invulling,
      draairichting: vak.draairichting,
      x: gebied.x,
      breedte: gebied.breedte,
      topLinks: gebied.topLinks,
      topRechts: gebied.topRechts,
      onderkant: gebied.onderkant,
      vulsoort,
      roosterId: vak.roosterId,
      roosterpositie: vak.roosterpositie,
      roosterHoogte,
      horMeegeleverd: vak.horMeegeleverd,
      sponningBreedte,
      sponningHoogte,
      vleugelBreedte,
      vleugelHoogte,
      daglichtBreedte,
      daglichtHoogte,
      glasSponningBreedte,
      glasSponningHoogte,
      glasBreedte,
      glasHoogte,
      effectieveGlasinleg: mm(inleg),
      glasOppervlakM2,
      glasGewichtKg:
        !heeftGlas || vakGlas === null
          ? null
          : Math.round(glasOppervlakM2 * vakGlas.gewichtPerM2 * 10) / 10,
      horBreedte,
      horHoogte,
      vleugelOppervlakM2: m2(vleugelBreedte, vleugelRekenHoogte),
      borstweringHoogte: 0,
      schuin,
      sponningHoogteLaag,
      vleugelHoogteLaag,
      daglichtHoogteLaag,
      glasHoogteLaag,
      glastypeId: vak.glastypeId,
      paneelKleurId: vak.paneelKleurId,
      paneeltypeId: vak.paneeltypeId,
      roeden: vak.roeden,
      krukBinnenId: vak.krukBinnenId,
      krukBuitenId: vak.krukBuitenId,
      stapeldorpel: vak.stapeldorpel,
      roosterKleurBuitenId: vak.roosterKleurBuitenId,
      roosterKleurBinnenId: vak.roosterKleurBinnenId,
      naarBuitenDraaiend: vak.naarBuitenDraaiend,
      // Stijlen bínnen de vleugel: elk deelvak krijgt zijn eigen vulmaat.
      binnenVakken: binnen.vakken,
      binnenStijlen: binnen.stijlen,
    };
  });
}

/**
 * Berekent de vakken bínnen een vleugel.
 *
 * De vleugel heeft één daglichtopening; die wordt door de binnenindeling in
 * deelvakken verdeeld, gescheiden door stijlen ín de vleugel. Elk deelvak
 * doorloopt dezelfde glasketen: daglicht + 2 × inleg − 2 × speling. Zo geldt
 * regel 2 ook binnen een deur: elk paneel en elke ruit heeft een maat.
 */
function berekenBinnenVakken(
  vak: VakInvoer,
  gebied: Gebied,
  profiel: Profiel,
  glastype: Glastype | null,
  ctx: {
    heeftVleugel: boolean;
    zijAftrek: number;
    roosterHoogte: number;
    inleg: number;
  }
): { vakken: VakMaten[]; stijlen: StijlMaten[] } {
  if (!vak.binnenIndeling) return { vakken: [], stijlen: [] };

  const aanslag = ctx.heeftVleugel ? profiel.geometrie.vleugelOverslag.waarde : 0;

  // De daglichtopening van de vleugel, in kozijncoördinaten.
  const binnenGebied: Gebied = {
    x: gebied.x - aanslag + ctx.zijAftrek,
    breedte: gebied.breedte + 2 * aanslag - 2 * ctx.zijAftrek,
    topLinks: gebied.topLinks - aanslag + ctx.zijAftrek + ctx.roosterHoogte,
    topRechts: gebied.topRechts - aanslag + ctx.zijAftrek + ctx.roosterHoogte,
    onderkant: gebied.onderkant + aanslag - ctx.zijAftrek,
  };

  const geo = legUitIn(vak.binnenIndeling, binnenGebied);

  // De stijlen komen rechtstreeks uit de uitleg van de boom. Ze uit de posities
  // van de deelvakken afleiden ging bij een geneste indeling mis: dan werd een
  // vulling uit de ene rij met een vulling uit de andere gecombineerd en stond
  // er een zwevende stijl in de tekening.
  const vakken = geo.vakken.map(({ vak: deel, gebied: g }): VakMaten => {
    const schuin = g.topLinks !== g.topRechts;
    const hoogHoog = mm(g.onderkant - Math.min(g.topLinks, g.topRechts));
    const hoogLaag = schuin ? mm(g.onderkant - Math.max(g.topLinks, g.topRechts)) : null;

    const vulsoort: VakMaten["vulsoort"] = deel.invulling === "paneel" ? "paneel" : "glas";
    // Ook binnen een deur mag elke ruit zijn eigen glas hebben.
    const deelGlas = glastypeOpId(deel.glastypeId) ?? glastype;
    const glasBreedte = mm(g.breedte);
    const glasHoogte = mm(hoogHoog);
    const glasHoogteLaag = hoogLaag === null ? null : mm(hoogLaag);
    const rekenHoogte = glasHoogteLaag === null ? glasHoogte : (glasHoogte + glasHoogteLaag) / 2;
    const oppervlak = m2(glasBreedte, rekenHoogte);

    return {
      id: deel.id,
      naam: deel.naam,
      invulling: deel.invulling,
      draairichting: "geen",
      x: g.x,
      breedte: g.breedte,
      topLinks: g.topLinks,
      topRechts: g.topRechts,
      onderkant: g.onderkant,
      vulsoort,
      roosterId: null,
      roosterpositie: "boven-in-glas",
      roosterHoogte: 0,
      horMeegeleverd: false,
      binnenVakken: [],
      binnenStijlen: [],
      glastypeId: deel.glastypeId,
      roeden: deel.roeden,
      // Een vulling binnen een vleugel heeft geen eigen bediening; die zit op
      // de vleugel zelf.
      krukBinnenId: null,
      krukBuitenId: null,
      stapeldorpel: false,
      roosterKleurBuitenId: deel.roosterKleurBuitenId,
      roosterKleurBinnenId: deel.roosterKleurBinnenId,
      naarBuitenDraaiend: deel.naarBuitenDraaiend,
      paneelKleurId: deel.paneelKleurId,
      paneeltypeId: deel.paneeltypeId,
      sponningBreedte: g.breedte,
      sponningHoogte: hoogHoog,
      vleugelBreedte: g.breedte,
      vleugelHoogte: hoogHoog,
      daglichtBreedte: mm(g.breedte - 2 * ctx.inleg),
      daglichtHoogte: mm(hoogHoog - 2 * ctx.inleg),
      glasSponningBreedte: mm(g.breedte),
      glasSponningHoogte: mm(hoogHoog),
      glasBreedte,
      glasHoogte,
      effectieveGlasinleg: mm(ctx.inleg),
      glasOppervlakM2: oppervlak,
      glasGewichtKg:
        vulsoort !== "glas" || deelGlas === null
          ? null
          : Math.round(oppervlak * deelGlas.gewichtPerM2 * 10) / 10,
      // Een deelvak binnen een vleugel krijgt geen eigen hor; die zit op de vleugel.
      horBreedte: mm(g.breedte),
      horHoogte: hoogHoog,
      vleugelOppervlakM2: oppervlak,
      borstweringHoogte: 0,
      schuin,
      sponningHoogteLaag: hoogLaag,
      vleugelHoogteLaag: hoogLaag,
      daglichtHoogteLaag: hoogLaag,
      glasHoogteLaag,
    };
  });

  return { vakken, stijlen: geo.stijlen };
}

/** Alle vakken plat: eerst de vleugels, dan de vullingen daarbinnen. */
export function alleVakken(vakken: VakMaten[]): VakMaten[] {
  return vakken.flatMap((v) => [v, ...v.binnenVakken]);
}

/** De vakken die daadwerkelijk een vulling krijgen: glas, paneel of rooster. */
export function vullingsVakken(vakken: VakMaten[]): VakMaten[] {
  return vakken.flatMap((v) => (v.binnenVakken.length > 0 ? v.binnenVakken : [v]));
}

/** Alle vakinvoeren van een configuratie, in leesvolgorde. */
export function vakInvoeren(configuratie: Configuratie): VakInvoer[] {
  return vakkenVan(configuratie.indeling);
}

// ---------------------------------------------------------------------------
// Cilindermaat
// ---------------------------------------------------------------------------

/** Rondt naar boven af naar de eerstvolgende leverbare cilinderlengte. */
function naarLeverbareMaat(ruw: number): number {
  const passend = LEVERBARE_CILINDERMATEN.find((maat) => maat >= ruw);
  return passend ?? LEVERBARE_CILINDERMATEN[LEVERBARE_CILINDERMATEN.length - 1];
}

/**
 * Het SKG-advies uit hoofdstuk 6.4. Wordt altijd getoond, ook wanneer er geen
 * cilinder wordt meegeleverd.
 */
export function skgAdvies(kozijnType: Configuratie["kozijnType"]): SkgKlasse {
  if (kozijnType === "voordeur") return "SKG***";
  return "SKG**";
}

/**
 * De cilindermaat volgens hoofdstuk 6.2 — ALTIJD beschikbaar, ook wanneer er
 * geen cilinder wordt meegeleverd en zelfs wanneer er geen beslag is gekozen.
 * In dat laatste geval geldt de fabrieksstandaard rozetdikte als vaste aanname.
 */
export function berekenCilindermaat(
  configuratie: Configuratie,
  profiel: Profiel,
  beslag: Beslag | null
): Cilindermaat {
  const bron = beslag ?? FABRIEKSSTANDAARD_BESLAG;
  const halveDikte = profiel.vleugeldikte.waarde / 2;

  const ruwBinnen = halveDikte + bron.binnenschild.waarde - bron.overlapBinnen.waarde;
  const ruwBuiten = halveDikte + bron.buitenschild.waarde - bron.overlapBuiten.waarde;

  const binnen = naarLeverbareMaat(ruwBinnen);
  const buiten = naarLeverbareMaat(ruwBuiten);

  return {
    binnen,
    buiten,
    notatie: `${binnen}/${buiten}`,
    skgAdvies: beslag?.skg ?? skgAdvies(configuratie.kozijnType),
    ruwBinnen: Math.round(ruwBinnen * 10) / 10,
    ruwBuiten: Math.round(ruwBuiten * 10) / 10,
    gebaseerdOpFabrieksstandaard: beslag === null,
  };
}

// ---------------------------------------------------------------------------
// Weergaveteksten
// ---------------------------------------------------------------------------

/** De vulmaat van een vak als tekst, ongeacht wat het vak vult. */
function vulmaatTekst(vak: VakMaten): string {
  return vak.glasHoogteLaag === null
    ? `${vak.glasBreedte} × ${vak.glasHoogte} mm`
    : `${vak.glasBreedte} × ${vak.glasHoogteLaag}–${vak.glasHoogte} mm (schuin)`;
}

/**
 * Weergavetekst van de glasmaat. Bij 'geen glas' vermeldt hij expliciet dat het
 * glas niet wordt meegeleverd én toch welke maat nodig is (hoofdstuk 5.3).
 */
export function glasmaatTekst(vak: VakMaten, glastype: Glastype | null, meegeleverd: boolean): string {
  const maat = vulmaatTekst(vak);
  if (vak.vulsoort === "paneel") {
    const paneel = paneeltypeOpId(vak.paneeltypeId);
    return `${paneel ? paneel.naam : "Paneel"} — ${maat}`;
  }
  if (vak.vulsoort === "rooster") return `Rooster — ${maat}`;
  // Het glas van dit vak wint van het glas van het kozijn.
  const soort = glastypeOpId(vak.glastypeId) ?? glastype;
  const roeden = vak.roeden
    ? ` · roeden ${vak.roeden.verticaal}v × ${vak.roeden.horizontaal}h (${vak.roeden.breedte} mm)`
    : "";
  if (meegeleverd && soort) return `${soort.naam} — ${maat}${roeden}`;
  return `Glas niet meegeleverd — vereiste glasmaat: ${maat}${roeden}`;
}

/** Weergavetekst van de cilindermaat, ook zonder meegeleverde cilinder. */
export function cilindermaatTekst(cilinder: Cilindermaat, meegeleverd: boolean): string {
  if (meegeleverd) return `${cilinder.skgAdvies} cilinder — ${cilinder.notatie} mm`;
  return `Cilinder niet meegeleverd — vereiste maat: ${cilinder.notatie} mm (${cilinder.skgAdvies} geadviseerd)`;
}

/** Weergavetekst van de hormaat, ook zonder meegeleverde hor. */
export function hormaatTekst(vak: VakMaten, hortypeNaam: string | null): string {
  const maat = `${vak.horBreedte} × ${vak.horHoogte} mm`;
  if (vak.horMeegeleverd && hortypeNaam) return `${hortypeNaam} — ${maat}`;
  return `Hor niet meegeleverd — vereiste hormaat: ${maat}`;
}

/**
 * De stelmaat: de maat van de sparing waarin dit kozijn wordt gesteld.
 *
 * Elke zijde met een aanslag legt zijn lip over het metselwerk, en die lip gaat
 * dus van de sparingmaat af. Laat je de aanslag aan een zijde weg, dan sluit het
 * profiel daar vlak aan en telt die zijde volledig mee. Configurator, tekening
 * en fabrieksorder lezen allemaal deze ene functie (regel 1).
 */
export function berekenStelmaat(
  configuratie: Configuratie,
  profiel: Profiel
): { breedte: Millimeter; hoogte: Millimeter } {
  const a = profiel.geometrie.aanslag.waarde;
  const z = configuratie.kozijnzijden;
  // Een bijprofiel komt aan die zijde bíj het kozijn: de sparing moet dus ruimer.
  const bij = (zijde: Kozijnzijde) => bijprofielOpId(z[zijde].bijprofielId)?.hoogte.waarde ?? 0;
  return {
    breedte: mm(
      configuratie.breedte -
        (z.links.aanslag ? a : 0) -
        (z.rechts.aanslag ? a : 0) +
        bij("links") +
        bij("rechts")
    ),
    hoogte: mm(
      configuratie.hoogte -
        (z.boven.aanslag ? a : 0) -
        (z.onder.aanslag ? a : 0) +
        bij("boven") +
        bij("onder")
    ),
  };
}
