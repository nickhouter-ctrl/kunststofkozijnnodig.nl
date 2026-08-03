/**
 * Startpunten voor een nieuwe configuratie.
 *
 * De configurator begint met de keuze wát voor kozijn je maakt. Daarna sta je
 * meteen in de tekening: één vak vast glas, waar je op klikt om stijlen,
 * vleugels, deuren of een rooster toe te voegen.
 */
import { PROFIELEN } from "./profielen";
import { standaardKleur } from "./kleuren";
import { blancoIndeling, kopieerIndeling, maakSchuifpui, nieuwVak, voegStijlenToe } from "../engine/indeling";
import type { Configuratie, Indeling, KozijnType, VakInvoer } from "../types";

export const STANDAARD_PROFIEL_ID = "aluplast-ideal-7000-aanslag";

/** Leesbare namen voor de kozijntypes. */
export const KOZIJNTYPE_LABEL: Record<KozijnType, string> = {
  vast: "Vast kozijn",
  draaikiep: "Draaikiepraam",
  valraam: "Valraam",
  voordeur: "Voordeur",
  achterdeur: "Achterdeur",
  schuifpui: "Schuifpui",
  stelkozijn: "Stelkozijn",
  renovatiekozijn: "Renovatiekozijn",
};

export const KOZIJNTYPE_UITLEG: Record<KozijnType, string> = {
  vast: "Eén of meer vaste ruiten, niet te openen.",
  draaikiep: "Draait open en kan op een kier gekiept worden.",
  valraam: "Klapt aan de bovenzijde naar binnen open.",
  voordeur: "Buitendeur aan de voorzijde, met zwaarder beslag.",
  achterdeur: "Buitendeur aan de achterzijde of tuinzijde.",
  schuifpui: "Schuivende puien met hun eigen stijlen, 2- tot 4-delig.",
  stelkozijn: "Kozijn dat in het metselwerk wordt gesteld.",
  renovatiekozijn: "Vervangt een bestaand kozijn binnen de bestaande sparing.",
};

/** Verstandige beginmaten per kozijntype, in mm. */
const STANDAARD_MAAT: Record<KozijnType, { breedte: number; hoogte: number }> = {
  vast: { breedte: 1000, hoogte: 1200 },
  draaikiep: { breedte: 1000, hoogte: 1400 },
  valraam: { breedte: 900, hoogte: 700 },
  voordeur: { breedte: 1000, hoogte: 2300 },
  achterdeur: { breedte: 900, hoogte: 2200 },
  schuifpui: { breedte: 3000, hoogte: 2300 },
  stelkozijn: { breedte: 1200, hoogte: 1400 },
  renovatiekozijn: { breedte: 1200, hoogte: 1400 },
};

/**
 * De beginindeling per kozijntype. Alles begint zo eenvoudig mogelijk; de rest
 * bouw je op door in de tekening te klikken.
 */
function beginIndeling(kozijnType: KozijnType): Indeling {
  switch (kozijnType) {
    case "draaikiep":
      return nieuwVak("Vak 1", "draaikiep");
    case "valraam":
      return nieuwVak("Vak 1", "valraam");
    case "voordeur":
    case "achterdeur":
      return nieuwVak("Deur", "deur");
    case "schuifpui": {
      const basis = blancoIndeling("Pui");
      return maakSchuifpui(basis, basis.id, "2a-rechts-actief");
    }
    default:
      return blancoIndeling("Vak 1");
  }
}

/**
 * Het beslag dat bij een kozijntype hoort.
 *
 * Een vast kozijn krijgt géén beslag: er is niets te openen, dus ook geen
 * cilinder. De cilindermaat wordt desondanks berekend (regel 2), op basis van
 * de fabrieksstandaard rozetdikte.
 */
function standaardBeslag(kozijnType: KozijnType): Configuratie["beslag"] {
  switch (kozijnType) {
    case "voordeur":
      return { beslagId: "deurbeslag-skg3", cilinderMeegeleverd: true };
    case "achterdeur":
      return { beslagId: "deurbeslag-skg2", cilinderMeegeleverd: true };
    case "draaikiep":
    case "valraam":
      return { beslagId: "draaikiep-skg2", cilinderMeegeleverd: true };
    case "schuifpui":
      // Een hefschuifpui gaat met een greep open, niet met een kruk.
      return { beslagId: "hefschuif-skg2", cilinderMeegeleverd: true };
    default:
      return { beslagId: null, cilinderMeegeleverd: false };
  }
}

/**
 * Het profiel dat bij dit kozijntype hoort.
 *
 * Een hefschuifpui is een eigen profielsysteem, geen variant van het raamprofiel
 * — precies zoals de leverancier hem uitvraagt. Wissel je naar een schuifpui,
 * dan wisselt het profiel dus mee (en andersom weer terug).
 */
function profielVoorType(profielId: string, kozijnType: KozijnType): string {
  const huidig = PROFIELEN.find((p) => p.id === profielId);
  if (!huidig) return profielId;
  if (huidig.toegestaneTypes.includes(kozijnType)) return profielId;

  const zelfdeMerk = PROFIELEN.find(
    (p) => p.merk === huidig.merk && p.toegestaneTypes.includes(kozijnType)
  );
  return (zelfdeMerk ?? PROFIELEN.find((p) => p.toegestaneTypes.includes(kozijnType)))?.id ?? profielId;
}

/**
 * Het glastype dat bij dit type en deze maat past.
 *
 * Boven een bepaald vleugeloppervlak schrijft het profiel triple glas voor. Een
 * schuifpui zit daar met zijn standaardmaat altijd boven: begin je hem met
 * dubbel glas, dan sta je meteen op een blokkade te kijken die je zelf niets
 * hebt aangedaan. Daarom kiest hij hier al het glas dat wél mag.
 */
function passendGlas(profielId: string, kozijnType: KozijnType, huidig: string | null): string | null {
  const profiel = PROFIELEN.find((p) => p.id === profielId);
  if (!profiel) return huidig;
  // Onder de 70 cm boven de vloer is letselveilig glas verplicht; een pui en een
  // deur beginnen daar per definitie onder.
  if (opDeVloer(kozijnType)) {
    const veilig = profiel.toegestaneGlastypes.find((id) => id.startsWith("gelaagd"));
    if (veilig) return veilig;
  }
  const grens = profiel.grenzen.tripleVerplichtVanafM2?.waarde ?? null;
  const maat = STANDAARD_MAAT[kozijnType];
  // Ruwe schatting van het grootste vleugelvlak: een pui heeft er twee naast elkaar.
  const grootsteVleugelM2 =
    ((kozijnType === "schuifpui" ? maat.breedte / 2 : maat.breedte) * maat.hoogte) / 1_000_000;

  if (grens === null || grootsteVleugelM2 <= grens) return huidig;
  const triple = profiel.toegestaneGlastypes.find((id) => id.startsWith("triple"));
  return triple ?? huidig;
}

/** Begint dit kozijntype op de vloer? */
function opDeVloer(kozijnType: KozijnType): boolean {
  return kozijnType === "schuifpui" || kozijnType === "voordeur" || kozijnType === "achterdeur";
}

/**
 * De aansluiting op het metselwerk per zijde. Een hefschuifkader is stomp: het
 * heeft geen lip die over het metselwerk valt, dus daar staat de aanslag uit.
 */
function standaardZijden(kozijnType: KozijnType): Configuratie["kozijnzijden"] {
  const aanslag = kozijnType !== "schuifpui";
  const zijde = { aanslag, rubber: aanslag, bijprofielId: null };
  return { boven: { ...zijde }, onder: { ...zijde }, links: { ...zijde }, rechts: { ...zijde } };
}

/**
 * Een complete, direct doorrekenbare startconfiguratie.
 * Standaard is vast glas — de eenvoudigste vorm om vanuit door te bouwen.
 */
export function standaardConfiguratie(
  profielId: string = STANDAARD_PROFIEL_ID,
  kozijnType: KozijnType = "vast"
): Configuratie {
  const gekozen = profielVoorType(profielId, kozijnType);
  const profiel = PROFIELEN.find((p) => p.id === gekozen) ?? PROFIELEN[0];
  const wit = standaardKleur(profiel.merk);
  const maat = STANDAARD_MAAT[kozijnType];

  return {
    naam: "Kozijn 1",
    profielId: profiel.id,
    kozijnType,
    vorm: "recht",
    // Houtlook is in Nederland de meest gevraagde uitstraling.
    hoekverbinding: "houtlook",
    breedte: maat.breedte,
    hoogte: maat.hoogte,
    hoogteLaag: null,
    indeling: beginIndeling(kozijnType),
    kleurBinnenId: wit.id,
    kleurBuitenId: wit.id,
    // De vleugel volgt standaard het kader; pas bij een bewuste keuze wijkt hij af.
    vleugelKleurBinnenId: null,
    vleugelKleurBuitenId: null,
    // Een buitenkozijn wordt altijd afgewaterd; zichtbare sleuven zijn de norm.
    afwatering: "zichtbaar",
    // Standaard rondom aanslag met rubber — de gangbare Nederlandse aansluiting.
    // Een hefschuifpui is de uitzondering: die staat stomp in de sparing.
    kozijnzijden: standaardZijden(kozijnType),
    // De kalksponning is de gangbare Nederlandse aansluiting; afkitten gebeurt
    // standaard aan beide zijden.
    muuraansluitingId: "kalksponning",
    afkitoptieId: "beide",
    glas: {
      meegeleverd: true,
      glastypeId: passendGlas(profiel.id, kozijnType, "hr-plus-plus-11"),
      // Aluminium is de standaard afstandshouder en zit in de glasprijs.
      afstandshouderId: "alu",
    },
    beslag: standaardBeslag(kozijnType),
    hortypeId: null,
    // Een pui loopt op een rail; die hoort er standaard bij.
    dorpelId: kozijnType === "schuifpui" ? "dorpel-hefschuif-rail" : null,
    // Een pui en een deur beginnen op de vloer; een raam staat standaard op een
    // borstwering van 900 mm — daar is gewoon glas toegestaan.
    borstweringHoogte: opDeVloer(kozijnType) ? 0 : 900,
    aantal: 1,
    staalversterking: false,
  };
}

/**
 * Dupliceert een configuratie onder een nieuwe naam (hoofdstuk 8.4).
 * De indeling krijgt nieuwe id's, zodat de kopie nooit meebeweegt met het origineel.
 */
export function dupliceer(configuratie: Configuratie, nieuweNaam: string): Configuratie {
  return {
    ...configuratie,
    naam: nieuweNaam,
    indeling: kopieerIndeling(configuratie.indeling),
    glas: { ...configuratie.glas },
    beslag: { ...configuratie.beslag },
  };
}

/** Wisselt van kozijntype en zet de indeling en maten mee om. */
export function wisselKozijnType(configuratie: Configuratie, kozijnType: KozijnType): Configuratie {
  const maat = STANDAARD_MAAT[kozijnType];
  const profielId = profielVoorType(configuratie.profielId, kozijnType);
  return {
    ...configuratie,
    kozijnType,
    profielId,
    kozijnzijden: standaardZijden(kozijnType),
    borstweringHoogte: opDeVloer(kozijnType) ? 0 : configuratie.borstweringHoogte,
    dorpelId:
      kozijnType === "schuifpui"
        ? "dorpel-hefschuif-rail"
        : configuratie.dorpelId === "dorpel-hefschuif-rail"
          ? null
          : configuratie.dorpelId,
    breedte: maat.breedte,
    hoogte: maat.hoogte,
    indeling: beginIndeling(kozijnType),
    // Beslag hoort bij het type: draaikiepbeslag past niet op een vast kozijn.
    beslag: standaardBeslag(kozijnType),
    glas: {
      ...configuratie.glas,
      glastypeId: passendGlas(profielId, kozijnType, configuratie.glas.glastypeId),
    },
  };
}

export { voegStijlenToe };

/**
 * Vult een opgeslagen configuratie aan met velden die er destijds nog niet
 * waren.
 *
 * Een snapshot wordt bewust nooit overschreven: wat er is opgeslagen blijft
 * staan zoals het was. Maar de configurator groeit door, en een offerte van
 * vorige week kent de nieuwere velden niet — zonder deze stap loopt de tekening
 * daarop stuk. Alles wat ontbreekt krijgt hier de waarde die het destijds
 * feitelijk had: geen roeden, geen eigen bediening, aanslag rondom.
 */
export function herstelConfiguratie(ruw: Configuratie): Configuratie {
  const kozijnType = ruw.kozijnType ?? "vast";

  const herstelVak = (vak: VakInvoer): VakInvoer => ({
    ...vak,
    roeden: vak.roeden ?? null,
    roosterpositie: vak.roosterpositie ?? "boven-in-glas",
    krukBinnenId: vak.krukBinnenId ?? null,
    krukBuitenId: vak.krukBuitenId ?? null,
    stapeldorpel: vak.stapeldorpel ?? false,
    roosterKleurBuitenId: vak.roosterKleurBuitenId ?? null,
    roosterKleurBinnenId: vak.roosterKleurBinnenId ?? null,
    naarBuitenDraaiend: vak.naarBuitenDraaiend ?? false,
    glastypeId: vak.glastypeId ?? null,
    paneelKleurId: vak.paneelKleurId ?? null,
    paneeltypeId: vak.paneeltypeId ?? null,
    binnenIndeling: vak.binnenIndeling ? herstelIndeling(vak.binnenIndeling) : null,
  });

  const herstelIndeling = (knoop: Indeling): Indeling =>
    knoop.soort === "vak"
      ? herstelVak(knoop)
      : { ...knoop, kinderen: knoop.kinderen.map(herstelIndeling) };

  return {
    ...ruw,
    kozijnType,
    vleugelKleurBinnenId: ruw.vleugelKleurBinnenId ?? null,
    vleugelKleurBuitenId: ruw.vleugelKleurBuitenId ?? null,
    afwatering: ruw.afwatering ?? "zichtbaar",
    borstweringHoogte: ruw.borstweringHoogte ?? (opDeVloer(kozijnType) ? 0 : 900),
    muuraansluitingId: ruw.muuraansluitingId ?? "kalksponning",
    afkitoptieId: ruw.afkitoptieId ?? "beide",
    glas: { ...ruw.glas, afstandshouderId: ruw.glas?.afstandshouderId ?? "alu" },
    // Oudere configuraties kennen het bijprofiel per zijde nog niet.
    kozijnzijden: ruw.kozijnzijden
      ? (Object.fromEntries(
          Object.entries(ruw.kozijnzijden).map(([zijde, afwerking]) => [
            zijde,
            { ...afwerking, bijprofielId: afwerking?.bijprofielId ?? null },
          ])
        ) as Configuratie["kozijnzijden"])
      : standaardZijden(kozijnType),
    indeling: herstelIndeling(ruw.indeling),
  };
}
