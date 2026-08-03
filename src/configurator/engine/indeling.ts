/**
 * Hulpfuncties voor de indelingsboom.
 *
 * Een indeling is een boom: splitsingen verdelen de ruimte in kolommen
 * (gescheiden door verticale stijlen) of rijen (gescheiden door horizontale
 * stijlen), en vakken zijn de bladeren. Zo kan een rooster als eigen vak tussen
 * stijlen liggen, of een bovenlicht over de volle breedte boven twee deuren.
 *
 * Alle functies hier zijn puur: ze geven een nieuwe boom terug en passen de
 * bestaande nooit aan, zodat React elke wijziging ziet en de undo-geschiedenis
 * intact blijft.
 */
import type { Indeling, Invulling, Splitsing, VakInvoer } from "../types";

/** Standaarddikte van een tussenstijl, in mm. */
export const STIJL_STANDAARD = 102;

/**
 * Breedte van de ontmoetingsstijl van een schuifpui. Een schuifpui heeft altijd
 * zijn eigen stijlen: de vleugels lopen langs elkaar en ontmoeten elkaar in een
 * zwaardere stijl dan een gewone tussenstijl.
 */
export const SCHUIFPUI_STIJL = 130;

/**
 * De stijl waar twee schuivende vleugels elkaar ontmoeten. Die is breder dan de
 * stijl tussen een vast deel en een vleugel, omdat daar twee vleugelprofielen
 * langs elkaar lopen.
 *
 * Geijkt op AKUGT: een 4-delige hefschuif van 4000 breed geeft glasmaten
 * 776 / 789 / 789 / 776. Met een kader van 177 en gewone puistijlen van 130
 * blijft er precies 256 over voor de ontmoetingsstijl.
 */
export const SCHUIFPUI_ONTMOETING = 256;

/**
 * Hoeveel glas een schuivende vleugel wint op het vaste deel ernaast, wanneer
 * die vleugel tegen een tweede vleugel aanloopt.
 *
 * Geijkt op vier 4-delige puien uit AKUGT — 3600, 4000, 4400 en 3350 breed —
 * die alle vier hetzelfde beeld geven: de twee middelste vleugels krijgen 13 mm
 * meer glas dan de vaste delen ernaast, ongeacht de breedte. De vleugel wint dus
 * 6,5 mm en het vaste deel levert 6,5 mm in. Bij een 2-delige pui, waar geen
 * twee vleugels elkaar raken, zijn ze wél even groot (758 = 758).
 */
export const SCHUIFPUI_INGRIJPING = 13;

export const AS_LABEL: Record<Splitsing["as"], string> = {
  kolommen: "Verticale stijl",
  rijen: "Horizontale stijl",
};

export const INVULLING_LABEL: Record<Invulling, string> = {
  vast: "Vast glas",
  draaikiep: "Draaikiep",
  valraam: "Valraam",
  deur: "Deur",
  vastedeur: "Vaste deur",
  schuifvleugel: "Schuifvleugel",
  paneel: "Dicht paneel",
  rooster: "Ventilatierooster",
  geen: "Geen vulling",
};

/** Invullingen die glas bevatten — bepaalt of er een glasmaat wordt gerekend. */
export const GLASINVULLINGEN: Invulling[] = [
  "vast",
  "draaikiep",
  "valraam",
  "deur",
  "vastedeur",
  "schuifvleugel",
];

/** Invullingen met een beweegbare vleugel. */
export const BEWEEGBAAR: Invulling[] = ["draaikiep", "valraam", "deur", "schuifvleugel"];

let teller = 0;
/** Korte, stabiele id binnen één sessie. */
export function nieuweId(prefix: string): string {
  teller += 1;
  return `${prefix}${teller}`;
}

/** De bediening die standaard bij een invulling hoort. */
function standaardKruk(invulling: Invulling): string | null {
  if (invulling === "schuifvleugel") return "greep-hefschuif";
  if (invulling === "deur") return "deurkruk-binnen";
  if (invulling === "draaikiep" || invulling === "valraam") return "kruk-standaard";
  return null;
}

/** Een nieuw, leeg vak met verstandige beginwaarden. */
export function nieuwVak(naam: string, invulling: Invulling = "vast"): VakInvoer {
  return {
    soort: "vak",
    id: nieuweId("vak"),
    naam,
    gewicht: 1,
    vasteMaat: null,
    invulling,
    draairichting: BEWEEGBAAR.includes(invulling) ? "links" : "geen",
    roosterId: invulling === "rooster" ? "rooster-standaard" : null,
    // Boven in de beglazing is verreweg het gangbaarst.
    roosterpositie: "boven-in-glas",
    horMeegeleverd: false,
    glastypeId: null,
    paneelKleurId: null,
    paneeltypeId: null,
    roeden: null,
    // De bediening volgt het type: een vleugel krijgt standaard een kruk binnen,
    // een vast vak niets. Wat er buiten zit kies je zelf.
    krukBinnenId: BEWEEGBAAR.includes(invulling) ? standaardKruk(invulling) : null,
    krukBuitenId: null,
    stapeldorpel: false,
    roosterKleurBuitenId: null,
    roosterKleurBinnenId: null,
    // In Nederland draait vrijwel alles naar binnen; dat is dus het startpunt.
    naarBuitenDraaiend: false,
    binnenIndeling: null,
  };
}

// ---------------------------------------------------------------------------
// Indeling bínnen een vleugel
// ---------------------------------------------------------------------------

/** Standaarddikte van een stijl bínnen een vleugel — smaller dan een kozijnstijl. */
export const BINNENSTIJL_STANDAARD = 78;

/**
 * Voegt stijlen toe bínnen een vleugel, zodat er in de deur of het raam zelf
 * vakken ontstaan waar glas of een dicht paneel in kan.
 *
 * Dit is nadrukkelijk iets anders dan een stijl in het kozijn: die splitst het
 * kozijn in losse vleugels. Deze stijl zit ín één vleugel en deelt dus de
 * aanslag, het beslag en de draairichting van die vleugel.
 */
export function voegBinnenStijlenToe(
  boom: Indeling,
  vakId: string,
  as: Splitsing["as"],
  aantal: number,
  binnenVakId?: string
): Indeling {
  const knoop = knoopOpId(boom, vakId);
  if (!knoop || knoop.soort !== "vak") return boom;
  const n = Math.max(1, Math.floor(aantal));

  const huidig = knoop.binnenIndeling;

  // Nog geen binnenindeling: het hele glasvlak wordt het eerste deel.
  if (!huidig) {
    const eerste = nieuwVak("Vulling 1", "vast");
    const nieuwe = Array.from({ length: n }, (_, i) => nieuwVak(`Vulling ${i + 2}`, "vast"));
    const splitsing: Splitsing = {
      soort: "splitsing",
      id: nieuweId("bsp"),
      as,
      scheidingBreedte: BINNENSTIJL_STANDAARD,
      gewicht: 1,
      vasteMaat: null,
      kinderen: [eerste, ...nieuwe],
    };
    return vervangKnoop(boom, vakId, { ...knoop, binnenIndeling: splitsing });
  }

  // Er is al een binnenindeling: splits daarbinnen verder.
  const doel = binnenVakId ?? vakkenVan(huidig)[0].id;
  const bijgewerkt = voegStijlenToe(huidig, doel, as, n, {
    stijlbreedte: BINNENSTIJL_STANDAARD,
    naamPrefix: "Vulling",
  });
  return vervangKnoop(boom, vakId, { ...knoop, binnenIndeling: bijgewerkt });
}

/** Past een vak bínnen een vleugel aan. */
export function wijzigBinnenVak(
  boom: Indeling,
  vakId: string,
  binnenVakId: string,
  patch: Partial<VakInvoer>
): Indeling {
  const knoop = knoopOpId(boom, vakId);
  if (!knoop || knoop.soort !== "vak" || !knoop.binnenIndeling) return boom;
  return vervangKnoop(boom, vakId, {
    ...knoop,
    binnenIndeling: wijzigVak(knoop.binnenIndeling, binnenVakId, patch),
  });
}

/** Past een splitsing bínnen een vleugel aan. */
export function wijzigBinnenSplitsing(
  boom: Indeling,
  vakId: string,
  splitsingId: string,
  patch: Partial<Splitsing>
): Indeling {
  const knoop = knoopOpId(boom, vakId);
  if (!knoop || knoop.soort !== "vak" || !knoop.binnenIndeling) return boom;
  return vervangKnoop(boom, vakId, {
    ...knoop,
    binnenIndeling: wijzigSplitsing(knoop.binnenIndeling, splitsingId, patch),
  });
}

/** Haalt de hele binnenindeling weg: de vleugel wordt weer één glasvlak. */
export function wisBinnenIndeling(boom: Indeling, vakId: string): Indeling {
  const knoop = knoopOpId(boom, vakId);
  if (!knoop || knoop.soort !== "vak") return boom;
  return vervangKnoop(boom, vakId, { ...knoop, binnenIndeling: null });
}

// ---------------------------------------------------------------------------
// Doorzoeken
// ---------------------------------------------------------------------------

/** Alle vakken (bladeren) in leesvolgorde. */
export function vakkenVan(indeling: Indeling): VakInvoer[] {
  if (indeling.soort === "vak") return [indeling];
  return indeling.kinderen.flatMap(vakkenVan);
}

/** Alle splitsingen in de boom. */
export function splitsingenVan(indeling: Indeling): Splitsing[] {
  if (indeling.soort === "vak") return [];
  return [indeling, ...indeling.kinderen.flatMap(splitsingenVan)];
}

/** Zoekt een knoop op id. */
export function knoopOpId(indeling: Indeling, id: string): Indeling | null {
  if (indeling.id === id) return indeling;
  if (indeling.soort === "vak") return null;
  for (const kind of indeling.kinderen) {
    const gevonden = knoopOpId(kind, id);
    if (gevonden) return gevonden;
  }
  return null;
}

/** De splitsing waar een knoop direct in zit, of `null` bij de wortel. */
export function zoekOuder(boom: Indeling, id: string): Splitsing | null {
  if (boom.soort === "vak") return null;
  if (boom.kinderen.some((k) => k.id === id)) return boom;
  for (const kind of boom.kinderen) {
    const gevonden = zoekOuder(kind, id);
    if (gevonden) return gevonden;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Wijzigen
// ---------------------------------------------------------------------------

/** Vervangt een knoop door een andere en geeft een nieuwe boom terug. */
export function vervangKnoop(boom: Indeling, id: string, vervanger: Indeling): Indeling {
  if (boom.id === id) return vervanger;
  if (boom.soort === "vak") return boom;
  return { ...boom, kinderen: boom.kinderen.map((k) => vervangKnoop(k, id, vervanger)) };
}

/** Past een vak aan op id. */
export function wijzigVak(boom: Indeling, id: string, patch: Partial<VakInvoer>): Indeling {
  const knoop = knoopOpId(boom, id);
  if (!knoop || knoop.soort !== "vak") return boom;

  const bijgewerkt: VakInvoer = { ...knoop, ...patch };
  // Draairichting en invulling horen bij elkaar: een vast vak of paneel draait
  // niet, een beweegbaar vak moet juist een richting hebben.
  if (patch.invulling !== undefined) {
    if (!BEWEEGBAAR.includes(bijgewerkt.invulling)) {
      bijgewerkt.draairichting = "geen";
      // Een hor hangt vóór een opening die opengaat. Wordt het vak vast glas,
      // een paneel of een rooster, dan valt de hor er dus ook af — anders blijft
      // er een hor op de order staan die nergens voor dient.
      bijgewerkt.horMeegeleverd = false;
    } else if (bijgewerkt.draairichting === "geen") {
      bijgewerkt.draairichting = "links";
    }
    if (bijgewerkt.invulling === "rooster" && !bijgewerkt.roosterId) {
      bijgewerkt.roosterId = "rooster-standaard";
    }
  }
  return vervangKnoop(boom, id, bijgewerkt);
}

/**
 * Zet de vaste maat van een knoop en laat een buurman het verschil opvangen.
 *
 * Zonder dat zouden na twee ingetypte maten álle vakken vastliggen en past de
 * som niet meer in het kozijn — dan loopt de tekening erbuiten. De buurman die
 * loslaat is bij voorkeur het vak eráchter; is dat er niet, dan het vak ervóór.
 */
export function zetVasteMaat(boom: Indeling, knoopId: string, maat: number | null): Indeling {
  const ouder = zoekOuder(boom, knoopId);
  // Zonder ouder is er niets te verdelen: de knoop vult het hele kozijn.
  if (!ouder) return boom;

  const index = ouder.kinderen.findIndex((k) => k.id === knoopId);
  const buurman = index < ouder.kinderen.length - 1 ? index + 1 : index - 1;

  const kinderen = ouder.kinderen.map((kind, i) => {
    if (i === index) return { ...kind, vasteMaat: maat };
    if (i === buurman) return { ...kind, vasteMaat: null };
    return kind;
  });
  return wijzigSplitsing(boom, ouder.id, { kinderen });
}

/**
 * Schaalt alle vastgezette maten mee met een nieuwe kozijnmaat.
 *
 * Zodra je een stijl versleept of een maat intypt, ligt dat deel vast. Wordt
 * daarna de buitenmaat van het kozijn veranderd, dan hoort de indeling gewoon
 * mee te groeien of te krimpen: een kozijn van 1000 met een vak van 250 wordt op
 * 1500 een vak van 375. Zonder deze schaling blijft het vastgezette vak op 250
 * staan en slikt het buurvak de hele 500 mm — dat is niet wat iemand bedoelt als
 * hij de breedte aanpast.
 *
 * Welke as van toepassing is volgt uit de splitsing waar een knoop ín zit: bij
 * kolommen is de vaste maat een breedte, bij rijen een hoogte.
 */
export function schaalVasteMaten(
  boom: Indeling,
  factor: { breedte: number; hoogte: number }
): Indeling {
  const schaalKind = (kind: Indeling, as: Splitsing["as"]): Indeling => {
    const f = as === "kolommen" ? factor.breedte : factor.hoogte;
    const vasteMaat =
      kind.vasteMaat !== null && kind.vasteMaat > 0
        ? Math.max(1, Math.round(kind.vasteMaat * f))
        : kind.vasteMaat;
    return { ...loopDoor(kind), vasteMaat };
  };

  const loopDoor = (knoop: Indeling): Indeling => {
    if (knoop.soort !== "splitsing") {
      // Een vleugel kan zelf een indeling hebben; die schaalt mee met de vleugel.
      if (knoop.binnenIndeling) {
        return { ...knoop, binnenIndeling: schaalVasteMaten(knoop.binnenIndeling, factor) };
      }
      return knoop;
    }
    return {
      ...knoop,
      kinderen: knoop.kinderen.map((kind) => schaalKind(kind, knoop.as)),
    };
  };

  if (factor.breedte === 1 && factor.hoogte === 1) return boom;
  return loopDoor(boom);
}

/** Past een splitsing aan op id. */
export function wijzigSplitsing(boom: Indeling, id: string, patch: Partial<Splitsing>): Indeling {
  const knoop = knoopOpId(boom, id);
  if (!knoop || knoop.soort !== "splitsing") return boom;
  return vervangKnoop(boom, id, { ...knoop, ...patch });
}

// ---------------------------------------------------------------------------
// Stijlen toevoegen
// ---------------------------------------------------------------------------

/**
 * Voegt `aantal` stijlen toe in een vak, waardoor het vak in `aantal + 1`
 * gelijke vakken uiteenvalt.
 *
 * Zit het vak al in een splitsing met dezelfde as, dan komen de nieuwe vakken
 * ernaast in diezelfde splitsing. Anders krijg je bij drie kolommen een onnodig
 * diepe boom en zet de tekening twee stijlen op één plek.
 */
export function voegStijlenToe(
  boom: Indeling,
  vakId: string,
  as: Splitsing["as"],
  aantal: number,
  opties: { invulling?: Invulling; stijlbreedte?: number; naamPrefix?: string } = {}
): Indeling {
  const n = Math.max(1, Math.floor(aantal));
  const knoop = knoopOpId(boom, vakId);
  if (!knoop || knoop.soort !== "vak") return boom;

  const prefix = opties.naamPrefix ?? (as === "kolommen" ? "Vak" : "Rij");
  // Doornummeren vanaf wat er al staat, anders krijgt een genest kozijn twee
  // keer 'Vak 1' en is de stuklijst niet meer te lezen.
  const bezet = new Set(vakkenVan(boom).map((v) => v.naam));
  let volgnummer = 1;
  const volgendeNaam = () => {
    let naam = `${prefix} ${volgnummer}`;
    while (bezet.has(naam)) naam = `${prefix} ${++volgnummer}`;
    bezet.add(naam);
    return naam;
  };
  const nieuwe = Array.from({ length: n }, () => nieuwVak(volgendeNaam(), opties.invulling ?? "vast"));

  const ouder = zoekOuder(boom, vakId);
  if (ouder && ouder.as === as) {
    const index = ouder.kinderen.findIndex((k) => k.id === vakId);
    const kinderen = [...ouder.kinderen];
    kinderen.splice(index + 1, 0, ...nieuwe);
    return vervangKnoop(boom, ouder.id, { ...ouder, kinderen });
  }

  const splitsing: Splitsing = {
    soort: "splitsing",
    id: nieuweId("spl"),
    as,
    scheidingBreedte: opties.stijlbreedte ?? STIJL_STANDAARD,
    gewicht: knoop.gewicht,
    vasteMaat: knoop.vasteMaat,
    kinderen: [{ ...knoop, gewicht: 1, vasteMaat: null }, ...nieuwe],
  };
  return vervangKnoop(boom, vakId, splitsing);
}

/**
 * Zet een rooster als eigen vak boven een bestaand vak, met een horizontale
 * stijl ertussen. Dit is 'een rooster tussen stijlen in': het rooster zit niet
 * in het glas, er zit direct een stijl onder.
 */
export function voegRoosterBovenToe(
  boom: Indeling,
  vakId: string,
  roosterId: string,
  bouwhoogte: number
): Indeling {
  const knoop = knoopOpId(boom, vakId);
  if (!knoop || knoop.soort !== "vak") return boom;

  const roostervak = nieuwVak("Rooster", "rooster");
  roostervak.roosterId = roosterId;
  // Een rooster heeft een vaste bouwhoogte; het moet niet meeschalen met het glas.
  roostervak.vasteMaat = bouwhoogte;

  const ouder = zoekOuder(boom, vakId);
  if (ouder && ouder.as === "rijen") {
    const index = ouder.kinderen.findIndex((k) => k.id === vakId);
    const kinderen = [...ouder.kinderen];
    kinderen.splice(index, 0, roostervak);
    return vervangKnoop(boom, ouder.id, { ...ouder, kinderen });
  }

  const splitsing: Splitsing = {
    soort: "splitsing",
    id: nieuweId("spl"),
    as: "rijen",
    scheidingBreedte: STIJL_STANDAARD,
    gewicht: knoop.gewicht,
    vasteMaat: knoop.vasteMaat,
    kinderen: [roostervak, { ...knoop, gewicht: 1, vasteMaat: null }],
  };
  return vervangKnoop(boom, vakId, splitsing);
}

/**
 * De schema's van een hefschuifpui, zoals de fabrikant ze levert.
 *
 * Een pui is geen vrije indeling: de fabrikant levert een vast aantal schema's,
 * en per schema ligt vast welk deel schuift en welke kant het op gaat. Bij
 * Aluplast HST 85 zijn dit de zeven mogelijkheden; ze staan in de catalogus met
 * dezelfde tekeningetjes als hieronder beschreven.
 *
 * `delen` leest van links naar rechts. Een pijl in de tekening van de fabrikant
 * betekent hier een schuivend deel met zijn richting.
 */
export interface Puischema {
  id: string;
  naam: string;
  omschrijving: string;
  /** Van links naar rechts: vast, of schuivend met een richting. */
  delen: Puideel[];
}

/** Eén deel van een pui: vast, of een vleugel die naar links of rechts schuift. */
export type Puideel =
  | { soort: "vast" }
  | { soort: "schuift"; naar: "links" | "rechts"; loopdeur?: boolean };

const vast: Puideel = { soort: "vast" };
const naarLinks = (loopdeur = false): Puideel => ({ soort: "schuift", naar: "links", loopdeur });
const naarRechts = (loopdeur = false): Puideel => ({ soort: "schuift", naar: "rechts", loopdeur });

export const PUISCHEMAS: Puischema[] = [
  {
    id: "2a-links-actief",
    naam: "2-delig — linkerdeel schuift",
    omschrijving: "Twee delen, één schuivend. Het linkerdeel schuift naar rechts voor het vaste deel langs.",
    delen: [naarRechts(true), vast],
  },
  {
    id: "2a-rechts-actief",
    naam: "2-delig — rechterdeel schuift",
    omschrijving: "Twee delen, één schuivend. Het rechterdeel schuift naar links voor het vaste deel langs.",
    delen: [vast, naarLinks(true)],
  },
  {
    id: "2c-beide-actief",
    naam: "2-delig — beide delen schuiven",
    omschrijving: "Twee schuivende vleugels die elkaar in het midden ontmoeten en naar buiten opengaan.",
    delen: [naarLinks(true), naarRechts()],
  },
  {
    id: "3-midden-actief",
    naam: "3-delig — middendeel schuift",
    omschrijving: "Twee vaste delen met één schuivende vleugel ertussen.",
    delen: [vast, naarLinks(true), vast],
  },
  {
    id: "3-buitenste-actief",
    naam: "3-delig — buitenste delen schuiven",
    omschrijving: "Een vast middendeel met aan weerszijden een schuivende vleugel die naar buiten opengaat.",
    delen: [naarRechts(true), vast, naarLinks()],
  },
  {
    id: "3-links-actief",
    naam: "3-delig — linkerdeel schuift",
    omschrijving: "Eén schuivende vleugel links, die langs twee vaste delen schuift.",
    delen: [naarRechts(true), vast, vast],
  },
  {
    id: "3-rechts-actief",
    naam: "3-delig — rechterdeel schuift",
    omschrijving: "Eén schuivende vleugel rechts, die langs twee vaste delen schuift.",
    delen: [vast, vast, naarLinks(true)],
  },
  {
    id: "4-midden-actief",
    naam: "4-delig — twee middelste schuiven",
    omschrijving:
      "Twee vaste delen aan de buitenzijde, twee schuivende vleugels in het midden die naar buiten opengaan.",
    delen: [vast, naarLinks(true), naarRechts(), vast],
  },
];

export function puischemaOpId(id: string): Puischema | null {
  return PUISCHEMAS.find((s) => s.id === id) ?? null;
}

/**
 * Maakt van een vak een hefschuifpui volgens schema en richting.
 *
 * Een pui heeft altijd zijn eigen stijlen; die zijn zwaarder dan een gewone
 * tussenstijl omdat de vleugels elkaar daar ontmoeten. Door de pui als
 * splitsing met schuifvleugels te modelleren werkt alle bestaande maatvoering
 * er ongewijzigd op: glasmaat, hormaat, tekening en productie-export.
 */
export function maakSchuifpui(boom: Indeling, vakId: string, schemaId: string): Indeling {
  const knoop = knoopOpId(boom, vakId);
  if (!knoop || knoop.soort !== "vak") return boom;

  const schema = puischemaOpId(schemaId) ?? PUISCHEMAS[0];
  const delen = schema.delen;
  const panelen = delen.map((deel, i) => {
    const vast = deel.soort === "vast";
    const vak = nieuwVak(
      vast ? `Vast deel ${i + 1}` : deel.loopdeur ? `Loopdeur ${i + 1}` : `Schuifvleugel ${i + 1}`,
      vast ? "vast" : "schuifvleugel"
    );
    if (!vast) vak.draairichting = deel.naar;
    return vak;
  });

  /**
   * Tussen twee schuivende vleugels staat de bredere ontmoetingsstijl; overal
   * elders de gewone puistijl. Zonder dat onderscheid kloppen de glasmaten niet:
   * de leverancier rekent er ook mee.
   */
  const scheidingBreedtes = delen.slice(0, -1).map((deel, i) => {
    const volgende = delen[i + 1];
    return deel.soort === "schuift" && volgende.soort === "schuift"
      ? SCHUIFPUI_ONTMOETING
      : SCHUIFPUI_STIJL;
  });

  /**
   * Waar twee vleugels elkaar ontmoeten grijpen hun profielen in elkaar; die
   * vleugels krijgen daardoor meer glas dan het vaste deel ernaast. Wat de
   * vleugels winnen leveren de vaste delen samen weer in, zodat het totaal klopt.
   */
  const wint: number[] = delen.map(
    (deel, i) =>
      deel.soort === "schuift" &&
      (delen[i - 1]?.soort === "schuift" || delen[i + 1]?.soort === "schuift")
        ? SCHUIFPUI_INGRIJPING / 2
        : 0
  );
  const teVerdelen = wint.reduce((som, w) => som + w, 0);
  const vasteDelen = delen.filter((d) => d.soort === "vast").length;
  const maatCorrecties =
    teVerdelen === 0 || vasteDelen === 0
      ? undefined
      : delen.map((deel, i) => (deel.soort === "vast" ? -teVerdelen / vasteDelen : wint[i]));

  const splitsing: Splitsing = {
    soort: "splitsing",
    id: nieuweId("spl"),
    as: "kolommen",
    scheidingBreedte: SCHUIFPUI_STIJL,
    scheidingBreedtes,
    maatCorrecties,
    gewicht: knoop.gewicht,
    vasteMaat: knoop.vasteMaat,
    kinderen: panelen,
  };
  return vervangKnoop(boom, vakId, splitsing);
}

/**
 * Verwijdert een knoop. Houdt een splitsing met één kind over, dan wordt die
 * splitsing opgeheven — een stijl zonder tweede vak bestaat niet.
 */
export function verwijderKnoop(boom: Indeling, id: string): Indeling {
  const ouder = zoekOuder(boom, id);
  if (!ouder) return boom; // De wortel kan niet verwijderd worden.

  const kinderen = ouder.kinderen.filter((k) => k.id !== id);
  if (kinderen.length === 0) return boom;
  if (kinderen.length === 1) {
    // Splitsing opheffen: het overgebleven kind neemt de plaats in.
    return vervangKnoop(boom, ouder.id, {
      ...kinderen[0],
      gewicht: ouder.gewicht,
      vasteMaat: ouder.vasteMaat,
    });
  }
  return vervangKnoop(boom, ouder.id, { ...ouder, kinderen });
}

/** Verwijdert een hele splitsing en laat er één vak voor terugkomen. */
export function hefSplitsingOp(boom: Indeling, splitsingId: string): Indeling {
  const knoop = knoopOpId(boom, splitsingId);
  if (!knoop || knoop.soort !== "splitsing") return boom;
  const eerste = vakkenVan(knoop)[0];
  return vervangKnoop(boom, splitsingId, {
    ...eerste,
    gewicht: knoop.gewicht,
    vasteMaat: knoop.vasteMaat,
  });
}

/** Een blanco indeling: één vak vast glas. */
export function blancoIndeling(naam = "Vak 1"): Indeling {
  return nieuwVak(naam, "vast");
}

/** Diepe kopie met nieuwe id's, voor het dupliceren van een kozijn. */
export function kopieerIndeling(indeling: Indeling): Indeling {
  if (indeling.soort === "vak") {
    return {
      ...indeling,
      id: nieuweId("vak"),
      binnenIndeling: indeling.binnenIndeling ? kopieerIndeling(indeling.binnenIndeling) : null,
    };
  }
  return {
    ...indeling,
    id: nieuweId("spl"),
    kinderen: indeling.kinderen.map(kopieerIndeling),
  };
}
