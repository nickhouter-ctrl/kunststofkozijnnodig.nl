/**
 * Prijsbasis. Alle bedragen in eurocenten (integer) — nooit floats, zodat er
 * geen afrondingsdrift tussen configurator, offerte en factuur kan ontstaan.
 *
 * Dit zijn INKOOPPRIJZEN voor Rebu. De verkoopprijs volgt uit de marge en
 * hangt af van de prijscontext (hoofdstuk 2.4). Deze tarieven zijn plaatsvervangend
 * tot Rebu de echte inkoopstaffels aanlevert; ze staan bewust op één plek zodat
 * ze zonder developer bijgewerkt kunnen worden.
 */

/** Euro's naar eurocenten, zodat de tabellen hieronder leesbaar blijven. */
const euro = (bedrag: number): number => Math.round(bedrag * 100);

export interface Prijsbasis {
  /** Basisprijs per m² kozijnoppervlak, per profielsysteem. */
  profielPerM2: Record<string, number>;
  /** Toeslag per m² glas, per glastype. */
  glasPerM2: Record<string, number>;
  /** Vaste toeslag per beweegbare vleugel. */
  vleugelToeslag: number;
  /** Toeslag per beslagvariant. */
  beslag: Record<string, number>;
  /** Kostprijs van een dicht paneel per m², per paneeldikte. */
  paneelPerM2: Record<string, number>;
  /** Toeslag per hortype, per m² horoppervlak. */
  horPerM2: Record<string, number>;
  /** Toeslag per rooster, per strekkende meter. */
  roosterPerMeter: Record<string, number>;
  /** Toeslag per dorpel, per strekkende meter. */
  dorpelPerMeter: Record<string, number>;
  /** Toeslag voor staalversterking, per strekkende meter vleugelomtrek. */
  staalPerMeter: number;
  /** Toeslag voor roeden, per strekkende meter roede. */
  roedePerMeter: number;
  /** Afkitten per strekkende meter kitvoeg. */
  afkitPerMeter: number;
  /** Prijs per bediening (kruk, greep of trekker), per stuk. */
  krukPerStuk: Record<string, number>;
  /** Meerprijs van een afstandshouder, per strekkende meter glasrand. */
  afstandshouderPerMeter: Record<string, number>;
  /** Toeslag voor gekleurde folie t.o.v. standaard wit, als factor op het profieldeel. */
  folieToeslag: { eenzijdig: number; tweezijdig: number };
  /** Btw-percentage. */
  btwPercentage: number;
  /**
   * De richtprijsopslag voor publieke bezoekers (hoofdstuk 2.4). Dit is een
   * door Rebu ingesteld gemiddeld consumententarief — nadrukkelijk NIET de
   * marge van een specifieke aannemer.
   */
  publiekeRichtprijsOpslag: number;
  /**
   * De marge die Rebu op zijn kostprijs legt richting de aannemer. Dit is de
   * prijs die op onze factuur aan de aannemer staat.
   */
  rebuMarge: number;
  /** Standaardmarge van een aannemer zonder eigen instelling, bovenop onze factuur. */
  standaardAannemersmarge: number;
}

export const PRIJSBASIS: Prijsbasis = {
  profielPerM2: {
    "aluplast-ideal-4000": euro(295),
    "aluplast-ideal-7000": euro(365),
    "gealan-s9000": euro(380),
    "kommerling-kvision": euro(340),
    /*
     * AANNAME — hefschuiftarieven. Zonder deze regels prijst de profielregel een
     * pui stil op € 0/m². Afgeleid van het raamtarief van hetzelfde merk met een
     * hefschuiffactor van ± 1,45 (zwaardere profielen, rail en beslagkader);
     * de verhouding tussen de merken blijft gelijk aan die van de raamsystemen.
     * Bij Rebu zijn de echte inkoopstaffels opgevraagd — deze drie waarden dan
     * 1-op-1 vervangen.
     */
    "gealan-s9000-hefschuif": euro(550),
    "aluplast-hst85": euro(530),
    "kommerling-premislide": euro(495),
  },
  glasPerM2: {
    "hr-plus-plus-11": euro(78),
    "hr-plus-plus-10": euro(92),
    "hr-plus-plus-11-mat": euro(96),
    "gelaagd-binnen-mat": euro(138),
    "triple-07": euro(135),
    "triple-06": euro(158),
    "gelaagd-binnen": euro(118),
    "gelaagd-buiten": euro(118),
    zonwerend: euro(142),
    veiligheidsglas: euro(105),
  },
  paneelPerM2: {
    "paneel-24": euro(96),
    "paneel-28": euro(112),
    "paneel-40": euro(148),
    "paneel-48": euro(176),
  },
  vleugelToeslag: euro(85),
  beslag: {
    "draaikiep-skg2": euro(62),
    "meerpunt-skg2": euro(148),
    "meerpunt-skg3": euro(215),
    "deurbeslag-skg2": euro(135),
    "deurbeslag-skg3": euro(240),
    "hefschuif-skg2": euro(485),
  },
  horPerM2: {
    inzethor: euro(72),
    plissehor: euro(145),
    scharnierhor: euro(118),
    schuifhor: euro(165),
  },
  roosterPerMeter: {
    "rooster-standaard": euro(58),
    "rooster-geluiddempend": euro(96),
    "rooster-zelfregelend": euro(84),
    "rooster-vlak": euro(112),
  },
  dorpelPerMeter: {
    "dorpel-onder": euro(34),
    "dorpel-hefschuif-rail": euro(165),
    "dorpel-deur-laag": euro(72),
    "dorpel-deur-standaard": euro(58),
  },
  staalPerMeter: euro(11),
  roedePerMeter: euro(28),
  afstandshouderPerMeter: {
    // Aluminium zit in de glasprijs; de warm edge-varianten kosten extra.
    alu: 0,
    "warm-edge-zwart": euro(6.5),
    "warm-edge-grijs": euro(5.8),
  },
  afkitPerMeter: euro(6.75),
  krukPerStuk: {
    "kruk-standaard": euro(18),
    "kruk-afsluitbaar": euro(42),
    "deurkruk-binnen": euro(38),
    "greep-hefschuif": euro(145),
    "deurkruk-buiten": euro(46),
    "deurkruk-buiten-cilinder": euro(88),
    "trekker-buiten": euro(125),
  },
  folieToeslag: { eenzijdig: 0.08, tweezijdig: 0.14 },
  btwPercentage: 21,
  publiekeRichtprijsOpslag: 0.9,
  // Rebu rekent doorgaans 40–50% op de kostprijs richting de aannemer.
  rebuMarge: 0.45,
  standaardAannemersmarge: 0.25,
};

/**
 * De id van de standaard witte folie per merk. Kozijnen in standaard wit
 * krijgen geen folietoeslag.
 */
export const STANDAARD_WIT: Record<string, string[]> = {
  aluplast: ["aluplast:ap116"],
  gealan: [],
  kommerling: ["kommerling:wx", "kommerling:ch"],
};
