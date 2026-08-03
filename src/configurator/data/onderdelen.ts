/**
 * Productdatabase — glas, beslag, horren, roosters en dorpels.
 * Hoofdstukken 5.1, 6.1 en 7.1 van het functioneel ontwerp.
 */
import type {
  Afkitoptie,
  Bijprofiel,
  Afstandshouder,
  Afwatering,
  Muuraansluiting,
  Beslag,
  Constante,
  Dorpel,
  Glastype,
  Hortype,
  Invulling,
  KozijnType,
  Kozijnzijde,
  Kruk,
  Paneeltype,
  Rooster,
  Roosterpositie,
} from "../types";

const aanname = (waarde: number, toelichting: string): Constante => ({
  waarde,
  bron: { soort: "aanname", toelichting },
});

const ontwerp = (waarde: number, hoofdstuk: string): Constante => ({
  waarde,
  bron: { soort: "functioneel-ontwerp", hoofdstuk },
});

// ---------------------------------------------------------------------------
// Glas (hoofdstuk 5.1)
// ---------------------------------------------------------------------------

export const GLASTYPES: Glastype[] = [
  {
    id: "hr-plus-plus-11",
    naam: "HR++ 1.1",
    dikte: 28,
    gewichtPerM2: 20,
    uWaarde: 1.1,
    triple: false,
    veilig: false,
    mat: false,
    subsidiabel: true,
    maxRuitBreedte: 2500,
    maxRuitHoogte: 3000,
    omschrijving: "Dubbel glas met coating en argonvulling. De standaardkeuze bij renovatie.",
  },
  {
    id: "hr-plus-plus-10",
    naam: "HR++ 1.0",
    dikte: 32,
    gewichtPerM2: 22,
    uWaarde: 1.0,
    triple: false,
    veilig: false,
    mat: false,
    subsidiabel: true,
    maxRuitBreedte: 2500,
    maxRuitHoogte: 3000,
    omschrijving: "HR++ met een dikkere spouw; iets beter isolerend dan 1.1.",
  },
  {
    id: "triple-07",
    naam: "Triple 0.7",
    dikte: 44,
    gewichtPerM2: 30,
    uWaarde: 0.7,
    triple: true,
    veilig: false,
    mat: false,
    subsidiabel: true,
    maxRuitBreedte: 2200,
    maxRuitHoogte: 2800,
    omschrijving: "Drievoudig glas. Vereist een profiel met voldoende sponningdiepte.",
  },
  {
    id: "triple-06",
    naam: "Triple 0.6",
    dikte: 48,
    gewichtPerM2: 33,
    uWaarde: 0.6,
    triple: true,
    veilig: false,
    mat: false,
    subsidiabel: true,
    maxRuitBreedte: 2200,
    maxRuitHoogte: 2800,
    omschrijving: "De best isolerende standaardbeglazing. Zwaar — let op het beslag.",
  },
  {
    id: "gelaagd-binnen",
    naam: "Gelaagd binnen (33.2)",
    dikte: 30,
    gewichtPerM2: 25,
    uWaarde: 1.1,
    triple: false,
    veilig: true,
    mat: false,
    subsidiabel: true,
    maxRuitBreedte: 2400,
    maxRuitHoogte: 2800,
    omschrijving: "Letselveilig aan de binnenzijde. Verplicht bij doorvalgevaar.",
  },
  {
    id: "gelaagd-buiten",
    naam: "Gelaagd buiten (33.2)",
    dikte: 30,
    gewichtPerM2: 25,
    uWaarde: 1.1,
    triple: false,
    veilig: true,
    mat: false,
    subsidiabel: true,
    maxRuitBreedte: 2400,
    maxRuitHoogte: 2800,
    omschrijving: "Inbraakvertragend aan de buitenzijde.",
  },
  {
    id: "zonwerend",
    naam: "Zonwerend",
    dikte: 30,
    gewichtPerM2: 23,
    uWaarde: 1.1,
    triple: false,
    veilig: false,
    mat: false,
    subsidiabel: true,
    maxRuitBreedte: 2400,
    maxRuitHoogte: 2800,
    omschrijving: "Houdt zonnewarmte tegen. Lichte tint, zichtbaar in de 3D-weergave.",
  },
  {
    id: "veiligheidsglas",
    naam: "Veiligheidsglas (gehard)",
    dikte: 28,
    gewichtPerM2: 21,
    uWaarde: 1.1,
    triple: false,
    veilig: true,
    mat: false,
    subsidiabel: false,
    maxRuitBreedte: 2200,
    maxRuitHoogte: 2600,
    omschrijving: "Gehard glas dat bij breuk in stompe korrels uiteenvalt.",
  },
  {
    /**
     * Matglas is geen apart pakket maar een matte binnenruit in hetzelfde
     * HR++-pakket. Maat, dikte en gewicht zijn daarom gelijk; alleen het
     * doorzicht verdwijnt. Gangbaar in een toilet, badkamer of voordeur.
     */
    id: "hr-plus-plus-11-mat",
    naam: "HR++ 1.1 matglas",
    dikte: 28,
    gewichtPerM2: 20,
    uWaarde: 1.1,
    triple: false,
    veilig: false,
    mat: true,
    subsidiabel: true,
    maxRuitBreedte: 2500,
    maxRuitHoogte: 3000,
    omschrijving: "HR++ met een matte (gezandstraalde) binnenruit — licht binnen, geen doorzicht.",
  },
  {
    id: "gelaagd-binnen-mat",
    naam: "Gelaagd matglas (binnenblad)",
    dikte: 30,
    gewichtPerM2: 24,
    uWaarde: 1.1,
    triple: false,
    veilig: true,
    mat: true,
    subsidiabel: true,
    maxRuitBreedte: 2400,
    maxRuitHoogte: 2800,
    omschrijving: "Gelaagd veiligheidsglas met matte folie — geen doorzicht én letselveilig.",
  },
];

export function glastypeOpId(id: string | null): Glastype | null {
  if (!id) return null;
  return GLASTYPES.find((g) => g.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Panelen
// ---------------------------------------------------------------------------

/**
 * Dichte panelen in verschillende diktes.
 *
 * De dunne panelen vallen in dezelfde sponning als het glas en zijn dus zonder
 * meer inwisselbaar; de dikkere panelen isoleren beter maar vragen een profiel
 * met voldoende sponningdiepte. De regelmotor controleert dat tegen de maximale
 * glasdikte van het profiel.
 */
export const PANEELTYPES: Paneeltype[] = [
  {
    id: "paneel-24",
    naam: "Vlak paneel 24 mm",
    dikte: 24,
    gewichtPerM2: 12,
    uWaarde: 1.4,
    omschrijving: "Standaard vulpaneel, valt in de glassponning.",
  },
  {
    id: "paneel-28",
    naam: "Vlak paneel 28 mm",
    dikte: 28,
    gewichtPerM2: 14,
    uWaarde: 1.2,
    omschrijving: "Zelfde sponning als HR++ glas.",
  },
  {
    id: "paneel-40",
    naam: "Geïsoleerd paneel 40 mm",
    dikte: 40,
    gewichtPerM2: 18,
    uWaarde: 0.8,
    omschrijving: "Dikker isolatiepaneel; vraagt een diepere sponning.",
  },
  {
    id: "paneel-48",
    naam: "Geïsoleerd paneel 48 mm",
    dikte: 48,
    gewichtPerM2: 21,
    uWaarde: 0.6,
    omschrijving: "Isolatiepaneel op tripledikte, voor voordeuren.",
  },
];

export function paneeltypeOpId(id: string | null): Paneeltype | null {
  if (!id) return null;
  return PANEELTYPES.find((p) => p.id === id) ?? null;
}

/** Het paneel dat gebruikt wordt wanneer er geen keuze is gemaakt. */
export const STANDAARD_PANEEL = PANEELTYPES[0];

// ---------------------------------------------------------------------------
// Beslag en cilinders (hoofdstuk 6.1)
// ---------------------------------------------------------------------------

/**
 * De overlap-constante uit de cilinderformule (hoofdstuk 6.2).
 *
 * LET OP — bekend openstaand punt. De twee voorbeeldrijen in hoofdstuk 6.2 van
 * het functioneel ontwerp zijn onderling niet met één constante te reproduceren:
 *
 *   rij 1: 70 mm deur, schild 8+8  → 32/42  vereist overlap 11 mm binnen
 *   rij 2: 78 mm deur, schild 10+10 → 34/44  vereist overlap 15 mm binnen
 *
 * De formule zelf (½ × deurdikte + schilddikte − overlap) is aangehouden zoals
 * beschreven; de overlap staat hieronder als instelbare constante per beslag.
 * Rebu moet deze waarde bevestigen bij de beslagleverancier voordat het systeem
 * live gaat. De configurator toont daarom bij elke cilindermaat expliciet dat
 * hij op deze constante gebaseerd is.
 */
const OVERLAP_TOELICHTING =
  "Fabrieksconstante uit de cilinderformule (hoofdstuk 6.2). De voorbeeldtabel in het functioneel ontwerp is niet met één constante te reproduceren — bevestigen bij de beslagleverancier.";

export const BESLAGEN: Beslag[] = [
  {
    id: "draaikiep-skg2",
    naam: "Draaikiepbeslag SKG**",
    soort: "draaikiep",
    skg: "SKG**",
    binnenschild: ontwerp(8, "6.2 voorbeeldberekening"),
    buitenschild: ontwerp(8, "6.2 voorbeeldberekening"),
    overlapBinnen: aanname(3, OVERLAP_TOELICHTING),
    overlapBuiten: aanname(3, OVERLAP_TOELICHTING),
    voorTypes: ["draaikiep", "valraam"],
  },
  {
    id: "meerpunt-skg2",
    naam: "Meerpuntssluiting SKG**",
    soort: "meerpuntssluiting",
    skg: "SKG**",
    binnenschild: aanname(8, "Rozetdikte standaard meerpuntssluiting."),
    buitenschild: aanname(8, "Rozetdikte standaard meerpuntssluiting."),
    overlapBinnen: aanname(3, OVERLAP_TOELICHTING),
    overlapBuiten: aanname(3, OVERLAP_TOELICHTING),
    voorTypes: ["draaikiep", "achterdeur"],
  },
  {
    id: "meerpunt-skg3",
    naam: "Meerpuntssluiting SKG***",
    soort: "meerpuntssluiting",
    skg: "SKG***",
    binnenschild: aanname(10, "Zwaarder schild bij SKG***."),
    buitenschild: aanname(10, "Zwaarder schild bij SKG***."),
    overlapBinnen: aanname(3, OVERLAP_TOELICHTING),
    overlapBuiten: aanname(3, OVERLAP_TOELICHTING),
    voorTypes: ["achterdeur", "voordeur"],
  },
  {
    id: "deurbeslag-skg2",
    naam: "Deurbeslag SKG**",
    soort: "deurbeslag",
    skg: "SKG**",
    binnenschild: aanname(8, "Standaard deurschild."),
    buitenschild: aanname(8, "Standaard deurschild."),
    overlapBinnen: aanname(3, OVERLAP_TOELICHTING),
    overlapBuiten: aanname(3, OVERLAP_TOELICHTING),
    voorTypes: ["achterdeur", "voordeur"],
  },
  {
    /**
     * Een schuifpui heeft geen kruk in een vleugel maar een greep die de vleugel
     * optilt en over de rail rolt. Het schild is daardoor forser dan bij een
     * draaikiep; de cilindermaat volgt dezelfde rekenregel.
     */
    id: "hefschuif-skg2",
    naam: "Hefschuifbeslag SKG**",
    soort: "meerpuntssluiting",
    skg: "SKG**",
    binnenschild: aanname(12, "Greepschild hefschuifbeslag; bevestigen bij beslagleverancier."),
    buitenschild: aanname(12, "Greepschild hefschuifbeslag; bevestigen bij beslagleverancier."),
    overlapBinnen: aanname(3, OVERLAP_TOELICHTING),
    overlapBuiten: aanname(3, OVERLAP_TOELICHTING),
    voorTypes: ["schuifpui"],
  },
  {
    id: "deurbeslag-skg3",
    naam: "Voordeurbeslag SKG***",
    soort: "deurbeslag",
    skg: "SKG***",
    binnenschild: ontwerp(10, "6.2 voorbeeldberekening voordeur"),
    buitenschild: ontwerp(10, "6.2 voorbeeldberekening voordeur"),
    overlapBinnen: aanname(3, OVERLAP_TOELICHTING),
    overlapBuiten: aanname(3, OVERLAP_TOELICHTING),
    voorTypes: ["voordeur"],
  },
];

export function beslagOpId(id: string | null): Beslag | null {
  if (!id) return null;
  return BESLAGEN.find((b) => b.id === id) ?? null;
}

/**
 * De fabrieksstandaard die de regelmotor gebruikt wanneer er géén beslag is
 * gekozen. Zo is de cilindermaat óók zonder beslag altijd te berekenen (regel 2).
 */
export const FABRIEKSSTANDAARD_BESLAG: Pick<
  Beslag,
  "binnenschild" | "buitenschild" | "overlapBinnen" | "overlapBuiten"
> = {
  binnenschild: ontwerp(8, "6.2 — standaard rozetdikte als vaste aanname"),
  buitenschild: ontwerp(8, "6.2 — standaard rozetdikte als vaste aanname"),
  overlapBinnen: aanname(3, OVERLAP_TOELICHTING),
  overlapBuiten: aanname(3, OVERLAP_TOELICHTING),
};

/**
 * Leverbare cilinderlengtes per zijde in mm. Europrofielcilinders komen in
 * stappen van 5 mm; de berekende maat wordt naar boven afgerond naar de
 * eerstvolgende leverbare maat, want te kort betekent dat de sleutel niet past.
 */
export const LEVERBARE_CILINDERMATEN = [27, 32, 37, 42, 47, 52, 57, 62];

// ---------------------------------------------------------------------------
// Horren (hoofdstuk 7.1)
// ---------------------------------------------------------------------------

export const HORTYPES: Hortype[] = [
  {
    id: "inzethor",
    naam: "Inzethor",
    extraAftrek: aanname(0, "Inzethor valt precies in de dagopening."),
    voorTypes: ["vast", "draaikiep", "valraam"],
  },
  {
    id: "plissehor",
    naam: "Plisséhor",
    extraAftrek: aanname(3, "Plisséhor heeft extra speling voor het geleidingsprofiel."),
    voorTypes: ["draaikiep", "valraam", "achterdeur", "voordeur"],
  },
  {
    id: "scharnierhor",
    naam: "Scharnierhor",
    extraAftrek: aanname(2, "Scharnierhor heeft speling aan de scharnierzijde."),
    voorTypes: ["draaikiep", "achterdeur"],
  },
  {
    id: "schuifhor",
    naam: "Schuifhor",
    extraAftrek: aanname(5, "Schuifhor loopt in een rail; extra speling nodig."),
    voorTypes: ["achterdeur", "schuifpui"],
  },
];

export function hortypeOpId(id: string | null): Hortype | null {
  if (!id) return null;
  return HORTYPES.find((h) => h.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Roosters en dorpels
// ---------------------------------------------------------------------------

export const ROOSTERS: Rooster[] = [
  {
    id: "rooster-standaard",
    naam: "Standaard ventilatierooster",
    bouwhoogte: aanname(60, "Bouwhoogte standaardrooster; bevestigen bij leverancier."),
    capaciteit: 25,
    vlak: false,
  },
  {
    id: "rooster-geluiddempend",
    naam: "Geluiddempend rooster",
    bouwhoogte: aanname(95, "Bouwhoogte geluiddempend rooster; bevestigen bij leverancier."),
    capaciteit: 22,
    vlak: false,
  },
  {
    id: "rooster-zelfregelend",
    naam: "Zelfregelend rooster",
    bouwhoogte: aanname(75, "Bouwhoogte zelfregelend rooster; bevestigen bij leverancier."),
    capaciteit: 30,
    vlak: false,
  },
  {
    /**
     * Het vlakke rooster ligt in het glasvlak zelf. Bij een hefschuifpui is dit
     * de enige uitvoering die kan: een opbouwrooster steekt uit en dan loopt de
     * schuivende vleugel er niet meer langs.
     */
    id: "rooster-vlak",
    naam: "Vlak rooster (in de beglazing)",
    bouwhoogte: aanname(105, "Bouwhoogte vlak rooster; bevestigen bij leverancier."),
    capaciteit: 28,
    vlak: true,
  },
];

/** De roosters die in dit kozijntype gemonteerd kunnen worden. */
export function roostersVoor(kozijnType: KozijnType): Rooster[] {
  // In een pui past alleen een vlakke uitvoering.
  return kozijnType === "schuifpui" ? ROOSTERS.filter((r) => r.vlak) : ROOSTERS;
}

/** Leesbare aanduiding van de plek van het rooster, voor op de documenten. */
export const ROOSTERPOSITIE_LABEL: Record<Roosterpositie, string> = {
  "boven-in-glas": "boven in de beglazing",
  "onder-in-glas": "onder in de beglazing",
  "boven-in-kozijn": "boven in het kozijn",
};

export function roosterOpId(id: string | null): Rooster | null {
  if (!id) return null;
  return ROOSTERS.find((r) => r.id === id) ?? null;
}

/**
 * Onderdorpels. De twee gangbare bouwhoogtes in Nederland zijn 30 en 55 mm;
 * die zijn door Rebu opgegeven. De overige maten staan als aanname.
 */
export const DORPELS: Dorpel[] = [
  {
    id: "dorpel-30",
    naam: "Onderdorpel 30 mm",
    hoogte: {
      waarde: 30,
      bron: { soort: "aanname", toelichting: "Bouwhoogte opgegeven door Rebu als gangbare maat." },
    },
    voorTypes: ["vast", "draaikiep", "valraam", "stelkozijn", "renovatiekozijn", "voordeur", "achterdeur"],
  },
  {
    id: "dorpel-55",
    naam: "Onderdorpel 55 mm",
    hoogte: {
      waarde: 55,
      bron: { soort: "aanname", toelichting: "Bouwhoogte opgegeven door Rebu als gangbare maat." },
    },
    voorTypes: ["vast", "draaikiep", "valraam", "stelkozijn", "renovatiekozijn", "voordeur", "achterdeur"],
  },
  {
    /**
     * Een hefschuifpui staat niet op een dorpel maar op een rail: de vleugels
     * worden opgetild en rollen daarover. Bij de leverancier heet dit onderdeel
     * 'GU Rail-stomp' en het hoort standaard bij het hefschuifprofiel.
     */
    id: "dorpel-hefschuif-rail",
    naam: "Hefschuifrail (stomp)",
    hoogte: aanname(45, "Bouwhoogte hefschuifrail; bevestigen bij Rebu."),
    voorTypes: ["schuifpui"],
  },
  {
    id: "dorpel-deur-laag",
    naam: "Lage deurdorpel (drempelloos)",
    hoogte: aanname(20, "Hoogte drempelloze deurdorpel; bevestigen bij leverancier."),
    voorTypes: ["voordeur", "achterdeur"],
  },
  {
    id: "dorpel-deur-hoog",
    naam: "Hoge deurdorpel",
    hoogte: aanname(80, "Hoogte hoge deurdorpel; bevestigen bij leverancier."),
    voorTypes: ["voordeur", "achterdeur"],
  },
];

export function dorpelOpId(id: string | null): Dorpel | null {
  if (!id) return null;
  return DORPELS.find((d) => d.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Afwatering
// ---------------------------------------------------------------------------

/**
 * De onderste sponning van een kunststof kozijn is een bak: al het water dat
 * langs het glas naar beneden loopt komt daar samen. Het moet er via
 * afwateringssleuven in de buitenwand van de onderregel weer uit. Zonder die
 * sleuven blijft het water staan, loopt de sponning bij vorst kapot en komt het
 * uiteindelijk aan de binnenzijde naar buiten.
 *
 * De sleuf zelf wordt vanaf de buitenzijde afgedekt met een klikkapje wanneer
 * er voor 'afdekkap' is gekozen; de sleuf blijft dan even groot, alleen niet
 * meer zichtbaar.
 */
export const AFWATERING = {
  /** Lengte van één sleuf, gefreesd in de buitenwand van de onderregel. */
  sleufBreedte: aanname(
    25,
    "Gangbare freesmaat 25 × 5 mm voor afwateringssleuven; bevestigen bij Rebu per profielsysteem."
  ),
  /** Hoogte van de sleuf. */
  sleufHoogte: aanname(5, "Gangbare freesmaat 25 × 5 mm; bevestigen bij Rebu."),
  /**
   * Grootste toegestane hart-op-hart afstand tussen twee sleuven. Hieruit volgt
   * het aantal: bij een breder kozijn komen er sleuven bij.
   */
  maxTussenafstand: aanname(
    700,
    "Vuistregel uit de verwerkingsvoorschriften: elke sponningkamer waterdicht binnen ~700 mm afvoeren. Bevestigen bij Rebu."
  ),
  /** Minimaal aantal sleuven per sponningkamer, ongeacht de breedte. */
  minimumAantal: aanname(2, "Twee sleuven per kamer, zodat er altijd afvoer is als er één verstopt."),
  /** Meerprijs van de afdekkapjes per stuk, in eurocent. */
  kapjePerStuk: 275,
} as const;

/**
 * Het aantal afwateringssleuven in één sponningkamer van deze breedte.
 * Zowel de tekening als de fabrieksorder leest dit — één plek, één antwoord.
 */
export function aantalAfwateringssleuven(breedte: number): number {
  return Math.max(
    AFWATERING.minimumAantal.waarde,
    Math.ceil(breedte / AFWATERING.maxTussenafstand.waarde)
  );
}

/** Wat er in de documenten over de afwatering komt te staan. */
export const AFWATERING_LABEL: Record<Afwatering, string> = {
  zichtbaar: "Zichtbare afwateringssleuven",
  afdekkap: "Afwateringssleuven met afdekkap in kozijnkleur",
  verdekt: "Verdekte afwatering aan de onderkant van de onderregel",
  geen: "Geen afwatering (bewust weggelaten)",
};

// ---------------------------------------------------------------------------
// Bediening: krukken, grepen en trekkers
// ---------------------------------------------------------------------------

/**
 * Wat er per vleugel aan de binnen- en buitenzijde zit.
 *
 * Dit hoort niet bij het kozijn maar bij de vleugel: in één element kan een
 * draaikiepraam een gewone kruk hebben terwijl de deur ernaast een greep met
 * cilinder krijgt. De leverancier vraagt het ook zo uit — kruk binnen, kruk
 * buiten, cilinder — per vleugel.
 */
export const KRUKKEN: Kruk[] = [
  {
    id: "kruk-standaard",
    naam: "Raamkruk",
    voorInvullingen: ["draaikiep", "valraam"],
    zijde: "binnen",
    metCilinder: false,
    omschrijving: "De gewone draaikiepkruk aan de binnenzijde.",
  },
  {
    id: "kruk-afsluitbaar",
    naam: "Afsluitbare raamkruk",
    voorInvullingen: ["draaikiep", "valraam"],
    zijde: "binnen",
    metCilinder: true,
    omschrijving: "Kruk met slotje — inbraakwerend en kindveilig.",
  },
  {
    id: "deurkruk-binnen",
    naam: "Deurkruk binnen",
    voorInvullingen: ["deur"],
    zijde: "binnen",
    metCilinder: false,
    omschrijving: "Kruk op schild aan de binnenzijde van een deur.",
  },
  {
    id: "greep-hefschuif",
    naam: "Hefschuifgreep",
    voorInvullingen: ["schuifvleugel"],
    zijde: "binnen",
    metCilinder: false,
    omschrijving: "De greep die de vleugel optilt en over de rail laat rollen.",
  },
  {
    id: "deurkruk-buiten",
    naam: "Deurkruk buiten",
    voorInvullingen: ["deur"],
    zijde: "buiten",
    metCilinder: false,
    omschrijving: "Kruk aan de buitenzijde; de deur gaat dan met de kruk open.",
  },
  {
    id: "deurkruk-buiten-cilinder",
    naam: "Deurkruk buiten met cilinder",
    voorInvullingen: ["deur", "schuifvleugel"],
    zijde: "buiten",
    metCilinder: true,
    omschrijving: "Kruk met cilinder aan de buitenzijde — van buiten af te sluiten.",
  },
  {
    id: "trekker-buiten",
    naam: "Trekker buiten",
    voorInvullingen: ["deur", "schuifvleugel"],
    zijde: "buiten",
    metCilinder: false,
    omschrijving: "Vaste greep zonder bediening; de deur gaat alleen met de sleutel open.",
  },
];

export function krukOpId(id: string | null): Kruk | null {
  if (!id) return null;
  return KRUKKEN.find((k) => k.id === id) ?? null;
}

/** De bedieningen die op deze invulling passen, aan de gevraagde zijde. */
export function krukkenVoor(invulling: Invulling, zijde: "binnen" | "buiten"): Kruk[] {
  return KRUKKEN.filter((k) => k.zijde === zijde && k.voorInvullingen.includes(invulling));
}

/**
 * Een stapeldorpel: een extra dorpel onder één vleugel, om de drempel te
 * verhogen of om een hoogteverschil op te vangen.
 */
export const STAPELDORPEL = {
  hoogte: aanname(30, "Bouwhoogte stapeldorpel; bevestigen bij Rebu."),
  prijsPerMeter: 4200,
} as const;

// ---------------------------------------------------------------------------
// Afstandshouders
// ---------------------------------------------------------------------------

/**
 * De afstandshouder houdt de ruiten van een isolatieglaspakket uit elkaar. Hij
 * loopt langs de hele glasrand en is vanaf de glaslat zichtbaar — vandaar dat
 * hij een eigen keuze is en niet in het glastype verstopt zit.
 *
 * Aluminium is de standaard en zit in de glasprijs. Een warm edge-houder is van
 * kunststof of roestvast staal, geleidt veel minder koude naar de rand en gaat
 * daarmee condens op de glasrand tegen; hij kost per strekkende meter meer.
 */
export const AFSTANDSHOUDERS: Afstandshouder[] = [
  {
    id: "alu",
    naam: "Aluminium",
    hex: "#b9bec3",
    warmEdge: false,
    omschrijving: "De standaard afstandshouder; zilvergrijs zichtbaar in de glasrand.",
  },
  {
    id: "warm-edge-zwart",
    naam: "Warm edge zwart",
    hex: "#26292b",
    warmEdge: true,
    omschrijving: "Zwarte warm edge — betere randisolatie en een rustiger beeld langs de glaslat.",
  },
  {
    id: "warm-edge-grijs",
    naam: "Warm edge grijs",
    hex: "#7d8286",
    warmEdge: true,
    omschrijving: "Warm edge in grijs, voor wie de rand minder wil laten opvallen dan zwart.",
  },
];

export const STANDAARD_AFSTANDSHOUDER = AFSTANDSHOUDERS[0];

export function afstandshouderOpId(id: string | null): Afstandshouder | null {
  if (!id) return null;
  return AFSTANDSHOUDERS.find((a) => a.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Muuraansluiting en afkitwerk
// ---------------------------------------------------------------------------

/**
 * Hoe het kozijn op het metselwerk aansluit.
 *
 * Dit is iets anders dan de aanslag per zijde: de aanslag is een lip aan het
 * profiel zelf, de muuraansluiting is wat er tussen kozijn en muur zit. Beide
 * bestaan naast elkaar — je kunt een kozijn mét aanslag in een kalksponning
 * zetten. De keuze bepaalt de prijs en het aansluitdetail op de tekening.
 */
export const MUURAANSLUITINGEN: Muuraansluiting[] = [
  {
    id: "geen-sponning",
    naam: "Geen sponning",
    omschrijving: "Het kozijn sluit vlak op het metselwerk aan en wordt afgekit.",
    diepte: aanname(0, "Geen sponning, dus geen inkassing."),
    prijsPerMeter: 0,
  },
  {
    id: "kalksponning",
    naam: "Kalksponning",
    omschrijving:
      "De gangbare Nederlandse sponning: het metselwerk valt een stukje over het kozijn heen, wat de aansluiting wind- en waterdicht maakt.",
    diepte: aanname(20, "Diepte kalksponning; bevestigen bij Rebu."),
    prijsPerMeter: 850,
  },
  {
    id: "renovatiesponning",
    naam: "Renovatiesponning",
    omschrijving:
      "Voor vervanging binnen een bestaande sparing: het profiel dekt de oude aansluiting af, zodat er niet gehakt hoeft te worden.",
    diepte: aanname(30, "Diepte renovatiesponning; bevestigen bij Rebu."),
    prijsPerMeter: 1450,
  },
  {
    id: "spouwlat",
    naam: "Spouwlat",
    omschrijving:
      "Een lat in de spouw achter het kozijn, waarmee het kozijn vrij van het buitenblad blijft staan.",
    diepte: aanname(22, "Dikte spouwlat; bevestigen bij Rebu."),
    prijsPerMeter: 1150,
  },
];

export function muuraansluitingOpId(id: string | null): Muuraansluiting | null {
  if (!id) return null;
  return MUURAANSLUITINGEN.find((m) => m.id === id) ?? null;
}

/**
 * Afkitten van de aansluiting tussen kozijn en muur.
 *
 * Kit is werk én materiaal, en het is een keuze: bij een kalksponning wordt vaak
 * alleen binnen gekit, bij een vlakke aansluiting aan beide zijden. Wie het zelf
 * doet wil het er niet bij hebben — dan staat de lengte er nog steeds, zodat hij
 * weet hoeveel hij nodig heeft (regel 2).
 */
export const AFKITOPTIES: Afkitoptie[] = [
  {
    id: "geen",
    naam: "Niet afkitten",
    binnen: false,
    buiten: false,
    omschrijving: "U kit zelf. De strekkende meters staan wel op de order.",
  },
  {
    id: "binnen",
    naam: "Binnen afkitten",
    binnen: true,
    buiten: false,
    omschrijving: "Alleen aan de binnenzijde een kitvoeg; buiten sluit het metselwerk aan.",
  },
  {
    id: "buiten",
    naam: "Buiten afkitten",
    binnen: false,
    buiten: true,
    omschrijving: "Alleen aan de buitenzijde, tegen inwaaien van regen.",
  },
  {
    id: "beide",
    naam: "Binnen en buiten afkitten",
    binnen: true,
    buiten: true,
    omschrijving: "Aan beide zijden een kitvoeg — de meest voorkomende keuze.",
  },
];

export function afkitoptieOpId(id: string | null): Afkitoptie | null {
  if (!id) return null;
  return AFKITOPTIES.find((a) => a.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Bijprofielen
// ---------------------------------------------------------------------------

/**
 * Losse profielen die op een zijde van het kozijn worden gezet.
 *
 * Bij de leverancier staat dit naast Kader en Dorpel als 'Bijprofiel'. Het zijn
 * de profielen die je nodig hebt om een kozijn passend te maken of aan iets
 * anders te koppelen: een verbreding wanneer de sparing groter is dan het
 * kozijn, een koppelprofiel wanneer er twee elementen naast elkaar komen, of een
 * waterslag onder de onderregel.
 *
 * Ze veranderen de kozijnmaat niet — je bestelt het kozijn op maat en het
 * bijprofiel komt erbij — maar ze tellen wel mee in de stelmaat en in de prijs.
 */
export const BIJPROFIELEN: Bijprofiel[] = [
  {
    id: "verbreding-20",
    naam: "Verbredingsprofiel 20 mm",
    hoogte: aanname(20, "Gangbare verbredingsmaat; bevestigen bij Rebu."),
    voorZijden: ["boven", "onder", "links", "rechts"],
    prijsPerMeter: 950,
    omschrijving: "Vult de ruimte tussen kozijn en sparing wanneer het gat groter is dan het kozijn.",
  },
  {
    id: "verbreding-40",
    naam: "Verbredingsprofiel 40 mm",
    hoogte: aanname(40, "Gangbare verbredingsmaat; bevestigen bij Rebu."),
    voorZijden: ["boven", "onder", "links", "rechts"],
    prijsPerMeter: 1250,
    omschrijving: "Zelfde functie, voor een groter hoogteverschil.",
  },
  {
    id: "koppelprofiel",
    naam: "Koppelprofiel",
    hoogte: aanname(30, "Bouwhoogte koppelprofiel; bevestigen bij Rebu."),
    voorZijden: ["links", "rechts", "boven"],
    prijsPerMeter: 1850,
    omschrijving:
      "Verbindt dit kozijn met het element ernaast of erboven, zodat ze samen één gevelvlak vormen.",
  },
  {
    id: "waterslag",
    naam: "Waterslag",
    hoogte: aanname(35, "Bouwhoogte waterslag; bevestigen bij Rebu."),
    voorZijden: ["onder"],
    prijsPerMeter: 1450,
    omschrijving: "Voert het water onder het kozijn vandaan, weg van het metselwerk.",
  },
];

export function bijprofielOpId(id: string | null): Bijprofiel | null {
  if (!id) return null;
  return BIJPROFIELEN.find((b) => b.id === id) ?? null;
}

/** De bijprofielen die op deze zijde gezet kunnen worden. */
export function bijprofielenVoor(zijde: Kozijnzijde): Bijprofiel[] {
  return BIJPROFIELEN.filter((b) => b.voorZijden.includes(zijde));
}
