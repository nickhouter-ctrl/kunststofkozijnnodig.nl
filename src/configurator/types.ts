/**
 * Domeinmodel van de kozijnconfigurator.
 *
 * Dit bestand is de enige plaats waar de vorm van een configuratie is
 * vastgelegd (regel 1 uit het functioneel ontwerp: single source of truth).
 * Configurator, regelmotor, prijsengine, tekeningenengine en documentgenerator
 * lezen allemaal uit exact dit model.
 */

/** Alle maten in het systeem zijn millimeters, tenzij expliciet anders benoemd. */
export type Millimeter = number;

/** Prijzen zijn eurocenten (integer) — nooit floats, om afrondingsdrift te voorkomen. */
export type Eurocent = number;

// ---------------------------------------------------------------------------
// Productdatabase
// ---------------------------------------------------------------------------

export type MerkId = "aluplast" | "gealan" | "kommerling";

/**
 * Herkomst van een technische constante. Elke waarde in de productdatabase
 * draagt zijn bron, zodat zichtbaar is wat geverifieerd is en wat nog niet.
 */
export type Bron =
  /** Overgenomen uit het functioneel ontwerp (PDF), met hoofdstuknummer. */
  | { soort: "functioneel-ontwerp"; hoofdstuk: string }
  /** Overgenomen van de fabrikant of een leveranciersblad. */
  | { soort: "fabrikant"; url: string }
  /** Aanname die Rebu vóór livegang moet bevestigen. */
  | { soort: "aanname"; toelichting: string };

/** Een technische constante mét herkomst. */
export interface Constante<T = number> {
  waarde: T;
  bron: Bron;
}

export type KozijnType =
  | "vast"
  | "draaikiep"
  | "valraam"
  | "voordeur"
  | "achterdeur"
  | "schuifpui"
  | "stelkozijn"
  | "renovatiekozijn";

export type Vorm = "recht" | "schuin";

/**
 * Hoe de profielen in de hoek op elkaar aansluiten.
 *
 *   verstek   — 45°-verstek, gelast: de klassieke kunststofhoek
 *   houtlook  — haakse verbinding zoals bij een houten kozijn: de horizontale
 *               profielen lopen door en de stijlen sluiten er haaks tegenaan
 *
 * Dit is geen detail dat alleen in de fabriek speelt: het verschil is in het
 * aanzicht te zien en bepaalt hoe het kozijn eruitziet.
 */
export type Hoekverbinding = "verstek" | "houtlook";

/**
 * Uitvoering van een profielsysteem. Bepaalt de zichtbreedtes en daarmee de
 * hele maatketen. In Nederland is 'aanslag' (blokprofiel) de meest gebruikte.
 */
export type Uitvoering = "aanslag" | "vlak" | "verdiept";

/**
 * Hoe het regenwater uit de onderste sponning naar buiten loopt.
 *
 *   zichtbaar — open afwateringssleuven in de buitenwand; de standaard
 *   afdekkap  — dezelfde sleuven, maar weggewerkt achter een afdekkapje in
 *               de kleur van het kozijn (esthetisch, meerprijs)
 *   verdekt   — de sleuven zitten aan de ónderkant van de onderregel, zodat er
 *               in het aanzicht niets van te zien is. Dit kan alleen wanneer het
 *               kozijn vrij op een dorpel of stelkozijn staat, zodat het water
 *               daar weg kan.
 *   geen      — bewust weggelaten, bijvoorbeeld bij een binnenkozijn of een
 *               stelkozijn dat nog wordt afgetimmerd
 *
 * Een buitenkozijn zónder afwatering houdt water in de sponning vast; de
 * regelmotor meldt dat dan ook.
 */
export type Afwatering = "zichtbaar" | "afdekkap" | "verdekt" | "geen";

/**
 * Waar het rooster in het vak zit.
 *
 * De leverancier vraagt dit als positie uit: boven in de beglazing, onder in de
 * beglazing, of in het kozijn boven het vak. Niet elke positie kan overal — in
 * een schuivende vleugel kan er niets boven, want die moet langs de rail.
 */
export type Roosterpositie = "boven-in-glas" | "onder-in-glas" | "boven-in-kozijn";

/**
 * Roeden: de sierlatten die een ruit optisch in vakjes verdelen.
 *
 * In de praktijk zijn dit meestal opgeplakte of in de spouw gemonteerde roeden;
 * het glas blijft één ruit. De glasmaat verandert er dus niet door — alleen het
 * aanzicht, en de prijs, want ze worden per strekkende meter gerekend.
 */
export interface Roeden {
  /** Aantal verticale roeden (delen de ruit in de breedte). */
  verticaal: number;
  /** Aantal horizontale roeden. */
  horizontaal: number;
  /** Zichtbreedte van de roede in mm. */
  breedte: Millimeter;
}

/**
 * De bediening van één vleugel: waarmee je hem opent, en wat er aan de
 * buitenzijde zit. Dat verschilt per vleugel — een draaikiepraam krijgt een
 * kruk, een deur een greep met cilinder, een hefschuif een hefschuifgreep — dus
 * het hoort bij het vak en niet bij het hele kozijn.
 */
export interface Kruk {
  id: string;
  naam: string;
  /** Waar deze bediening op past. */
  voorInvullingen: Invulling[];
  /** Zit deze aan de binnen- of de buitenzijde? */
  zijde: "binnen" | "buiten";
  /** Hoort er een cilinder bij? */
  metCilinder: boolean;
  omschrijving: string;
}

/**
 * De afstandshouder in de glasrand: het profiel dat de twee ruiten uit elkaar
 * houdt. Hij zit in het zicht — je kijkt er langs de glaslat tegenaan — en is
 * daarom een echte keuze en geen detail. Aluminium is de standaard; een warm
 * edge-houder isoleert de rand beter en oogt rustiger.
 */
export interface Afstandshouder {
  id: string;
  naam: string;
  /** Kleur zoals hij in de glasrand te zien is. */
  hex: string;
  /** Verbetert de randisolatie (warm edge)? */
  warmEdge: boolean;
  omschrijving: string;
}

/**
 * De aansluiting tussen kozijn en metselwerk.
 *
 * Niet te verwarren met de aanslag: die zit aan het profiel, dit zit ertussen.
 * De keuze bepaalt of er gehakt moet worden, hoe de aansluiting dicht is en wat
 * het kost — en hij komt per strekkende meter omtrek op de order.
 */
export interface Muuraansluiting {
  id: string;
  naam: string;
  omschrijving: string;
  /** Hoe diep de aansluiting over of achter het kozijn valt, in mm. */
  diepte: Constante;
  /** Prijs per strekkende meter, in eurocent. */
  prijsPerMeter: Eurocent;
}

/**
 * Een los profiel dat op een zijde van het kozijn komt: een verbreding, een
 * koppelprofiel of een waterslag. Het verandert de kozijnmaat niet, maar telt
 * wel mee in de stelmaat en in de prijs.
 */
export interface Bijprofiel {
  id: string;
  naam: string;
  /** Bouwhoogte in mm — zoveel komt er aan die zijde bij. */
  hoogte: Constante;
  voorZijden: Kozijnzijde[];
  prijsPerMeter: Eurocent;
  omschrijving: string;
}

/** Aan welke zijden de aansluiting wordt afgekit. */
export interface Afkitoptie {
  id: string;
  naam: string;
  binnen: boolean;
  buiten: boolean;
  omschrijving: string;
}

/** De vier zijden van de kozijnlijst, zoals je ze in het aanzicht aanklikt. */
export type Kozijnzijde = "boven" | "onder" | "links" | "rechts";

/**
 * Een los profiel dat op een zijde van het kozijn komt: een verbreding, een
 * koppelprofiel of een waterslag. Het verandert de kozijnmaat niet, maar telt
 * wel mee in de stelmaat en in de prijs.
 */
export interface Bijprofiel {
  id: string;
  naam: string;
  /** Bouwhoogte in mm — zoveel komt er aan die zijde bij. */
  hoogte: Constante;
  voorZijden: Kozijnzijde[];
  prijsPerMeter: Eurocent;
  omschrijving: string;
}

/**
 * Hoe één zijde van het kozijn op het metselwerk aansluit.
 *
 * De aanslag is de lip die over het metselwerk valt: hij maakt de sparing
 * winddicht en bepaalt de stelmaat (buitenmaat − aanslag per zijde met lip).
 * Niet elke zijde krijgt er een — tegen een bestaand kozijn, een dorpel of een
 * tweede element aan wordt de aanslag weggelaten en sluit het profiel vlak aan.
 *
 * Het aanslagrubber zit ín die lip en drukt tegen het metselwerk. Het is een
 * losse keuze: een aanslag zonder rubber komt voor bij een gestelde sponning
 * die met kit wordt afgewerkt.
 */
export interface Zijdeafwerking {
  aanslag: boolean;
  rubber: boolean;
  /** Los profiel op deze zijde; `null` betekent geen. */
  bijprofielId: string | null;
}

/**
 * De maatketen van een profieluitvoering, in millimeters per zijde.
 *
 * DEZE KETEN IS GEIJKT OP TWEE ECHTE SYSTEMEN
 *
 *   EKO4U — Aluplast Ideal 7000 NL Blockprofiel, 1000 × 1000 vast
 *     kaderprofiel 170054 'kader NL met aanslag', diepte 120 mm, hoogte 84 mm
 *     → glasmaat 832 × 832  =  1000 − 2 × 84
 *
 *   AKUGT — Gealan S 9000 NL, 2000 breed, vast
 *     profiel 6802 Aanslag
 *     → glasmaat 1868  =  2000 − 2 × 66
 *
 * De regel is dus eenvoudiger dan hij oogt: bij een vast vak is de glasmaat de
 * buitenmaat minus twee keer de zichtbreedte van het kozijnprofiel. De glasinleg
 * en de speling zitten al ín dat gepubliceerde getal verwerkt; die apart optellen
 * en aftrekken zou dubbeltellen.
 *
 *   kozijn buitenmaat
 *     − 2 × kozijnZichtbreedte              → vakopening = GLASMAAT bij vast glas
 *     − 2 × vleugelZichtbreedte             → GLASMAAT bij een vak met vleugel
 *
 * Bij meerdere vakken wordt er per stijl de halve stijlbreedte afgetrokken; alle
 * maten lopen dan van hart tot hart, precies zoals op een werktekening.
 */
export interface Geometrie {
  /**
   * Zichtbreedte van het kozijnprofiel: van de buitenkant van het kozijn tot de
   * glasrand. Dit ís de glasaftrek per zijde bij een vast vak.
   */
  kozijnZichtbreedte: Constante;
  /**
   * Extra zichtbreedte wanneer er een vleugel in het vak zit — het vleugelprofiel
   * eet nog een stuk van de glasopening op.
   */
  vleugelZichtbreedte: Constante;
  /**
   * De zichtbreedte van het zwaardere deurprofiel.
   *
   * Bij hetzelfde kader levert de fabrikant meerdere vleugels: aluplast zet op
   * kader 170054 zowel een raamvleugel van 77 mm als een deurvleugel van 96 mm.
   * Een deur krijgt dus minder glas dan een raam van dezelfde maat. Ontbreekt
   * deze waarde, dan gebruikt een deur het raamprofiel.
   */
  deurVleugelZichtbreedte: Constante | null;
  /**
   * De aanslag van het kozijn óver het metselwerk. Dit is NIET de overlap van de
   * vleugel over het kozijn; het bepaalt de stelmaat: buitenmaat − 2 × aanslag is
   * het gat dat de metselaar moet uitsparen.
   */
  aanslag: Constante;
  /** Hoeveel de vleugel over het kozijn valt — bepaalt alleen het aanzicht. */
  vleugelOverslag: Constante;
  /** Breedte van een tussenstijl. De glasaftrek is daarvan de helft per zijde. */
  tussenstijlBreedte: Constante;
  /**
   * Glasinleg: hoe diep het glas onder de glaslat valt. Wordt gebruikt voor de
   * daglichtmaat en detail D, en zit al verwerkt in de zichtbreedte hierboven.
   */
  glasinleg: Constante;
}

/** Een profielsysteem in een specifieke uitvoering, zoals Aluplast IDEAL 7000 NL blok. */
export interface Profiel {
  id: string;
  systeemId: string;
  merk: MerkId;
  merkLabel: string;
  naam: string;
  uitvoering: Uitvoering;
  uitvoeringLabel: string;
  toepassing: string;

  /** Inbouwdiepte van het kozijn in mm. */
  inbouwdiepte: Constante;
  /** Aantal kamers in het profiel. */
  kamers: Constante;
  /** Uf-waarde in W/m²K. */
  uWaarde: Constante;

  /** De volledige maatketen van deze uitvoering. */
  geometrie: Geometrie;

  /**
   * Vleugel-/deurdikte in mm — de basis van de cilindermaatberekening
   * (hoofdstuk 6.2). Niet gelijk aan de inbouwdiepte van het kozijn.
   */
  vleugeldikte: Constante;
  /** Aansluitmaat voor horren per zijde in mm (hoofdstuk 7.2). */
  horAansluitmaat: Constante;

  /** Toegestane totale glasdikte in mm. */
  maxGlasdikte: Constante;

  /** Harde maatgrenzen. */
  grenzen: {
    minBreedte: Constante;
    maxBreedte: Constante;
    minHoogte: Constante;
    maxHoogte: Constante;
    /** Maximale breedte van één draaikiepvleugel. */
    maxVleugelBreedteDraaikiep: Constante;
    /** Maximale hoogte van één draaikiepvleugel. */
    maxVleugelHoogteDraaikiep: Constante;
    /** Vanaf dit vleugeloppervlak (m²) is staalversterking verplicht. */
    staalversterkingVanafM2: Constante;
    /** Boven dit vleugeloppervlak (m²) is geen ventilatierooster toegestaan. */
    geenRoosterBovenM2: Constante;
    /** Vanaf dit vleugeloppervlak (m²) is triple glas verplicht. */
    tripleVerplichtVanafM2: Constante | null;
    /** Maximaal glasgewicht per vleugel in kg zonder extra beslag. */
    maxGlasgewichtPerVleugelKg: Constante;
  };

  /** Kozijntypes die op dit profiel geleverd kunnen worden. */
  toegestaneTypes: KozijnType[];
  /** Glastype-ids die op dit profiel toegestaan zijn. */
  toegestaneGlastypes: string[];
  /** Beslag-ids die op dit profiel passen. */
  toegestaanBeslag: string[];
}

/** Een glastype uit hoofdstuk 5.1. */
export interface Glastype {
  id: string;
  naam: string;
  /** Totale pakketdikte in mm. */
  dikte: number;
  /** Gewicht in kg per m². */
  gewichtPerM2: number;
  /** Ug-waarde in W/m²K. */
  uWaarde: number;
  /** Is dit een triple-opbouw? */
  triple: boolean;
  /**
   * Doorzicht-belemmerend glas: matglas, figuurglas of gezandstraald. Het
   * aanzicht tekent zo'n ruit met een matte structuur in plaats van helder, want
   * op de tekening wil je zien wélke ruit ondoorzichtig wordt.
   */
  mat: boolean;
  /**
   * Is dit letselveilig glas — gelaagd of gehard?
   *
   * Onder de 70 cm vanaf de vloer is dat verplicht: daar kun je ertegenaan
   * vallen. In een schuifpui geldt dat altijd, want die begint op de vloer.
   */
  veilig: boolean;
  /** Komt in aanmerking voor ISDE-subsidie (hoofdstuk 4.3). */
  subsidiabel: boolean;
  /** Maximale ruitmaat (breedte × hoogte in mm) voor dit glastype. */
  maxRuitBreedte: number;
  maxRuitHoogte: number;
  omschrijving: string;
}

export type SkgKlasse = "SKG*" | "SKG**" | "SKG***";

/** Een beslagvariant uit hoofdstuk 6.1. */
export interface Beslag {
  id: string;
  naam: string;
  soort: "draaikiep" | "meerpuntssluiting" | "deurbeslag";
  skg: SkgKlasse;
  /** Dikte van het binnenschild/rozet in mm. */
  binnenschild: Constante;
  /** Dikte van het buitenschild/rozet in mm. */
  buitenschild: Constante;
  /**
   * Overlap-constante per zijde in mm uit de cilinderformule (hoofdstuk 6.2).
   * Dit is de fabrieksconstante die Rebu zelf moet kunnen bijstellen.
   */
  overlapBinnen: Constante;
  overlapBuiten: Constante;
  /** Voor welke kozijntypes dit beslag bedoeld is. */
  voorTypes: KozijnType[];
}

/** Een hortype uit hoofdstuk 7.1. */
export interface Hortype {
  id: string;
  naam: string;
  /** Extra aftrek bovenop de hor-aansluitmaat van het profiel, per zijde. */
  extraAftrek: Constante;
  voorTypes: KozijnType[];
}

/** Een ventilatierooster. */
export interface Rooster {
  id: string;
  naam: string;
  /** Bouwhoogte in mm; gaat af van de beschikbare glashoogte. */
  bouwhoogte: Constante;
  /** Capaciteit in dm³/s per meter. */
  capaciteit: number;
  /**
   * Vlakke uitvoering: het rooster ligt in het vlak van het glas in plaats van
   * als een bak op de vleugel. In een hefschuifpui is dat de enige mogelijkheid
   * — een opbouwrooster zou de vleugel niet meer langs de rail laten lopen.
   */
  vlak: boolean;
}

/**
 * Een dicht paneel. De dikte bepaalt of het paneel in dezelfde sponning past
 * als het glas — een 24 mm paneel valt in een glassponning, een 40 mm paneel
 * vraagt een ander profiel of een opdikking.
 */
export interface Paneeltype {
  id: string;
  naam: string;
  /** Totale dikte in mm. */
  dikte: number;
  /** Gewicht in kg per m². */
  gewichtPerM2: number;
  /** Ud-waarde in W/m²K. */
  uWaarde: number;
  omschrijving: string;
}

/** Een dorpel onder een deur of kozijn. */
export interface Dorpel {
  id: string;
  naam: string;
  hoogte: Constante;
  voorTypes: KozijnType[];
}

/** Een kleur uit de kleurencatalogi. */
export interface Kleur {
  id: string;
  merk: MerkId;
  merkLabel: string;
  code: string;
  naam: string;
  ral: string | null;
  /** De structuurtekst zoals de catalogus hem geeft, bv. 'Zandstructuur / Glad'. */
  structuur: string | null;
  /** Genormaliseerd oppervlak. `null` = de catalogus vermeldt het niet. */
  oppervlak: "nerf" | "brush" | "zandstructuur" | "print" | "glad" | "overig" | null;
  /**
   * Heeft deze folie een houtnerfreliëf?
   *
   * `null` betekent dat de catalogus er niets over zegt — niet dat er geen nerf
   * is. Alleen Aluplast levert deze gegevens aan; bij Gealan en Kömmerling moet
   * Rebu het nog aanvullen.
   */
  houtnerf: boolean | null;
  familie: string;
  /** Presentatiegroep in de kleurselector. */
  groep: "effen" | "metallic" | "houtlook";
  leverancierscode: string | null;
  catalogusgroep: string | null;
  /** Publiek pad naar de swatch-afbeelding. */
  swatch: string | null;
  hex: string | null;
}

// ---------------------------------------------------------------------------
// Configuratie — de invoer van de gebruiker
// ---------------------------------------------------------------------------

/**
 * Wat er in een vak zit.
 *
 * `rooster` is een volwaardige invulling: een ventilatierooster tussen stijlen
 * in, met een eigen vak. Dat is iets anders dan een rooster ín de beglazing —
 * daarvoor zet je `roosterId` op een glasvak.
 */
export type Invulling =
  | "vast"
  | "draaikiep"
  | "valraam"
  | "deur"
  /** Een deurblad dat niet opengaat: hetzelfde profiel, maar vast in het kozijn. */
  | "vastedeur"
  | "schuifvleugel"
  | "paneel"
  | "rooster"
  /**
   * Bewust leeg: het kozijn wordt zonder vulling geleverd, bijvoorbeeld omdat er
   * later een element van iemand anders in komt. De maat wordt gewoon berekend
   * en meegeleverd (regel 2), er zit alleen niets in.
   */
  | "geen";

/**
 * Eén vak in de indeling — een blad in de indelingsboom.
 *
 * Een vak is de kleinste eenheid die glas, een paneel of een beweegbare vleugel
 * bevat. Alles wat aan een opening hangt (rooster, hor) hoort bij één vak en
 * niet bij het hele kozijn: een ventilatierooster zit in de bovenlicht, niet
 * over de volle breedte van het element.
 */
export interface VakInvoer {
  soort: "vak";
  id: string;
  /** Vrij te kiezen naam, bv. 'Bovenlicht links'. */
  naam: string;
  /**
   * Relatief gewicht binnen de splitsing waar dit vak in zit. Twee vakken met
   * gewicht 1 en 1 zijn even groot; 2 en 1 maakt het eerste twee keer zo groot.
   * Wordt genegeerd zodra `vasteMaat` is ingevuld.
   */
  gewicht: number;
  /**
   * Vaste sponningmaat van dit vak in mm, in de richting van de splitsing
   * waar het in zit (breedte bij kolommen, hoogte bij rijen). `null` betekent:
   * meebewegen met de rest volgens `gewicht`. Zo kun je een bovenlicht op
   * precies 400 mm zetten en de rest laten opvullen.
   */
  vasteMaat: Millimeter | null;
  invulling: Invulling;
  /** Draairichting, alleen zinvol bij een beweegbaar vak. */
  draairichting: "links" | "rechts" | "geen";
  /**
   * Het gekozen rooster. Bij `invulling: "rooster"` vult het rooster dit hele
   * vak; bij een glasvak zit het rooster in de beglazing.
   */
  roosterId: string | null;
  /** Waar het rooster in dit vak zit. */
  roosterpositie: Roosterpositie;
  /** Hor op dít vak. De hormaat wordt hoe dan ook berekend (regel 2). */
  horMeegeleverd: boolean;
  /**
   * Glastype voor dít vak. `null` betekent: het glastype van het hele kozijn.
   * Zo kan één vak bijvoorbeeld gelaagd glas krijgen en de rest HR++.
   */
  glastypeId: string | null;
  /**
   * Kleur van een dicht paneel in dit vak. `null` betekent: dezelfde folie als
   * het kozijn. Een paneel in een afwijkende kleur is een gangbare wens bij
   * voordeuren.
   */
  paneelKleurId: string | null;
  /**
   * De dikte van een dicht paneel in dit vak. `null` betekent de standaarddikte.
   * Panelen komen in verschillende diktes; een dikker paneel isoleert beter maar
   * vraagt een profiel met voldoende sponningdiepte.
   */
  paneeltypeId: string | null;
  /** Roeden in de ruit; `null` betekent een ongedeelde ruit. */
  roeden: Roeden | null;
  /**
   * De bediening van deze vleugel. `null` betekent: niets aan die zijde — een
   * deur zonder buitenkruk heeft daar alleen een trekker of niets.
   */
  krukBinnenId: string | null;
  krukBuitenId: string | null;
  /**
   * Een stapeldorpel onder deze vleugel: een extra dorpel waarop de vleugel
   * staat, gangbaar bij deuren en puien om de drempel te verhogen.
   */
  stapeldorpel: boolean;
  /**
   * Kleur van het ventilatierooster in dit vak. `null` betekent: dezelfde folie
   * als het kozijn. Een rooster wordt vaak in een afwijkende kleur geleverd.
   */
  roosterKleurBuitenId: string | null;
  roosterKleurBinnenId: string | null;
  /**
   * Draait deze vleugel naar buiten open in plaats van naar binnen?
   *
   * In Nederland draait vrijwel alles naar binnen; een naar buiten draaiende
   * deur komt voor bij vluchtwegen en bij bergingen waar binnen geen ruimte is.
   * Op de tekening is het verschil zichtbaar: de openingslijnen zijn doorgetrokken
   * wanneer de vleugel naar de kijker toe draait en gestreept wanneer hij van de
   * kijker af draait — dat wisselt dus tussen binnen- en buitenaanzicht.
   */
  naarBuitenDraaiend: boolean;
  /**
   * Indeling bínnen de vleugel: stijlen in de deur of het raam zelf, met glas
   * of dichte panelen in de vakken die daardoor ontstaan. `null` betekent één
   * doorlopend glasvlak.
   *
   * Dit is iets anders dan een stijl in het kozijn: die splitst het kozijn in
   * losse vleugels. Een stijl hierbinnen zit ín één vleugel en deelt dus de
   * aanslag en het beslag van die vleugel.
   */
  binnenIndeling: Indeling | null;
}

/**
 * Een splitsing — een knoop in de indelingsboom.
 *
 * `kolommen` verdeelt de ruimte naast elkaar, gescheiden door verticale
 * tussenstijlen. `rijen` verdeelt boven elkaar, gescheiden door horizontale
 * tussenregels (kalven). Splitsingen mogen genest worden, zodat bijvoorbeeld
 * een bovenlicht over de volle breedte boven twee deuren kan liggen.
 */
export interface Splitsing {
  soort: "splitsing";
  id: string;
  /**
   * `kolommen` verdeelt naast elkaar, gescheiden door verticale stijlen.
   * `rijen` verdeelt boven elkaar, gescheiden door horizontale stijlen.
   */
  as: "kolommen" | "rijen";
  /** Dikte van de stijl in mm. */
  scheidingBreedte: Millimeter;
  /**
   * Vaste correctie per kind op de verdeling, in mm; de som is altijd nul.
   *
   * Nodig bij een hefschuifpui: waar twee vleugels elkaar ontmoeten grijpen hun
   * profielen in elkaar, waardoor die vleugels meer glas krijgen dan de vaste
   * delen ernaast. De leverancier rekent daar ook mee.
   */
  maatCorrecties?: Millimeter[];
  /**
   * Afwijkende dikte per scheiding, van links naar rechts (of boven naar onder).
   * Nodig bij een hefschuifpui: de stijl waar twee vleugels elkaar ontmoeten is
   * breder dan de stijl tussen een vast deel en een vleugel. Ontbreekt een
   * waarde, dan geldt `scheidingBreedte`.
   */
  scheidingBreedtes?: Millimeter[];
  /** Relatief gewicht binnen de splitsing waar deze splitsing zelf in zit. */
  gewicht: number;
  /** Vaste maat, net als bij een vak. `null` = meebewegen. */
  vasteMaat: Millimeter | null;
  kinderen: Indeling[];
}

/** De indeling van een kozijn: een boom van splitsingen met vakken als bladeren. */
export type Indeling = VakInvoer | Splitsing;

/**
 * De volledige invoer voor één kozijn. Dit is wat de gebruiker samenstelt en
 * wat als snapshot wordt vastgelegd.
 */
export interface Configuratie {
  /** Vrij te kiezen naam, bv. 'Achtergevel raam 2' (hoofdstuk 8.4). */
  naam: string;

  profielId: string;
  kozijnType: KozijnType;
  vorm: Vorm;
  /** Verstek (45°) of houtlook (haaks). Zichtbaar in het aanzicht. */
  hoekverbinding: Hoekverbinding;

  /** Buitenwerkse breedte en hoogte van het kozijn. */
  breedte: Millimeter;
  hoogte: Millimeter;
  /**
   * Bij een schuin kozijn: de hoogte aan de lage zijde. De `hoogte` is dan de
   * hoge zijde. Bij een recht kozijn genegeerd.
   */
  hoogteLaag: Millimeter | null;

  /** De indeling: een boom van splitsingen met vakken als bladeren. */
  indeling: Indeling;

  /** Kleur van de kozijnlijst (het kader). */
  kleurBinnenId: string;
  kleurBuitenId: string;
  /**
   * Kleur van de vleugels en deurbladen. `null` betekent: dezelfde folie als
   * het kader aan diezelfde zijde — dat is verreweg het meest gekozen. Een
   * afwijkende vleugelkleur komt voor bij deuren (zwart blad in wit kozijn).
   */
  vleugelKleurBinnenId: string | null;
  vleugelKleurBuitenId: string | null;

  /** Afwatering van de onderste sponning naar buiten. */
  afwatering: Afwatering;

  /** Per zijde: valt er een aanslag over het metselwerk, en zit er rubber in? */
  kozijnzijden: Record<Kozijnzijde, Zijdeafwerking>;

  /** Hoe het kozijn op het metselwerk aansluit. */
  muuraansluitingId: string;
  /** Aan welke zijden de aansluiting wordt afgekit. */
  afkitoptieId: string;

  /** Glas — `null` betekent bewust geen glas meegeleverd (regel 2). */
  glas: {
    meegeleverd: boolean;
    glastypeId: string | null;
    /** De afstandshouder in de glasrand; geldt voor al het glas in dit kozijn. */
    afstandshouderId: string | null;
  };

  /** Beslag en cilinder — cilinder kan bewust worden uitgesloten (regel 2). */
  beslag: {
    beslagId: string | null;
    cilinderMeegeleverd: boolean;
  };

  /**
   * Hortype voor het hele element. Of er per vak daadwerkelijk een hor
   * meegaat staat in het vak zelf; de hormaat wordt hoe dan ook berekend.
   */
  hortypeId: string | null;

  /** Onderdorpel onder het hele kozijn. Dorpels op een kalf staan in de indeling. */
  dorpelId: string | null;

  /**
   * Hoe hoog het metselwerk onder dit kozijn is, gemeten vanaf de vloer.
   *
   * Nul betekent: het kozijn begint op de vloer, zoals bij een pui of een
   * openslaande deur. Onder de 70 cm is letselveilig glas verplicht — je kunt er
   * dan tegenaan vallen.
   */
  borstweringHoogte: Millimeter;

  /** Aantal identieke exemplaren van dit kozijn. */
  aantal: number;

  /** Handmatig geforceerde staalversterking (los van de automatische regel). */
  staalversterking: boolean;
}

// ---------------------------------------------------------------------------
// Berekende uitkomsten
// ---------------------------------------------------------------------------

/** Een stijl zoals hij in het kozijn staat. Klik- en sleepbaar in het bewerkvlak. */
export interface StijlMaten {
  /** Id van de splitsing waar deze stijl bij hoort. */
  splitsingId: string;
  as: Splitsing["as"];
  /** De hoeveelste scheiding binnen die splitsing, 0-gebaseerd. */
  index: number;
  x: Millimeter;
  y: Millimeter;
  breedte: Millimeter;
  hoogte: Millimeter;
  /**
   * De maat van het deel vóór deze stijl, in de richting van de splitsing.
   * Slepen aan de stijl zet dit als vaste maat op dat deel, zodat de stijl
   * blijft staan waar de gebruiker hem neerzet.
   */
  vorigeMaat: Millimeter;
  /** De maat van het deel ná deze stijl — de ondergrens bij het slepen. */
  volgendeMaat: Millimeter;
}

/** De afgeleide maten van één vak. Altijd gevuld, ook zonder product (regel 2). */
export interface VakMaten {
  id: string;
  naam: string;
  invulling: Invulling;
  draairichting: VakInvoer["draairichting"];

  /**
   * De sponningopening van dit vak, gemeten vanaf de linkerbovenhoek van het
   * kozijn. Bij een schuin kozijn loopt de bovenrand van `topLinks` naar
   * `topRechts`; bij een recht kozijn zijn die gelijk. Zowel de tekeningenengine
   * als het klikbare bewerkvlak in de configurator tekenen op deze rechthoek.
   */
  x: Millimeter;
  breedte: Millimeter;
  topLinks: Millimeter;
  topRechts: Millimeter;
  onderkant: Millimeter;

  /** Wat dit vak vult: glas, een dicht paneel of een ventilatierooster. */
  vulsoort: "glas" | "paneel" | "rooster";
  /**
   * De vakken bínnen deze vleugel, als er stijlen in de deur of het raam zelf
   * zitten. Leeg wanneer de vleugel één doorlopend glasvlak heeft.
   *
   * Staan hier vakken in, dan zijn dát de vullingen die besteld en geproduceerd
   * worden; de glasmaat van het vak zelf is dan de totale sponningmaat van de
   * vleugel.
   */
  binnenVakken: VakMaten[];
  /**
   * De stijlen tússen die vakken, zoals de indelingsboom ze oplevert. De
   * tekening leest deze lijst; ze uit de posities van de vakken afleiden gaat
   * mis zodra er in een vleugel zowel rijen als kolommen zitten.
   */
  binnenStijlen: StijlMaten[];
  /** Het glastype van dit vak, als dat afwijkt van het kozijn. */
  glastypeId: string | null;
  /** De kleur van een dicht paneel, als die afwijkt van het kozijn. */
  paneelKleurId: string | null;
  /** De paneeldikte van dit vak. */
  paneeltypeId: string | null;
  /** Roeden in de ruit; `null` betekent een ongedeelde ruit. */
  roeden: Roeden | null;
  /** De bediening van deze vleugel, binnen en buiten. */
  krukBinnenId: string | null;
  krukBuitenId: string | null;
  /** Staat deze vleugel op een stapeldorpel? */
  stapeldorpel: boolean;
  /** Kleur van het rooster in dit vak; `null` = dezelfde folie als het kozijn. */
  roosterKleurBuitenId: string | null;
  roosterKleurBinnenId: string | null;
  /** Draait deze vleugel naar buiten open? */
  naarBuitenDraaiend: boolean;
  /** Rooster in dit vak, `null` als er geen zit. */
  roosterId: string | null;
  /** Waar het rooster in dit vak zit. */
  roosterpositie: Roosterpositie;
  /** Bouwhoogte die een in het glas geplaatst rooster van de vakhoogte afneemt. */
  roosterHoogte: Millimeter;
  /** Gaat er een hor mee op dit vak? De hormaat staat er los van (regel 2). */
  horMeegeleverd: boolean;

  /** Sponningopening in het kozijn waar de vleugel in valt. */
  sponningBreedte: Millimeter;
  sponningHoogte: Millimeter;

  /** Buitenmaat van de vleugel (bij een vast vak gelijk aan de sponningmaat). */
  vleugelBreedte: Millimeter;
  vleugelHoogte: Millimeter;

  /** Zichtbare glasopening — wat de eindklant daadwerkelijk aan licht ziet. */
  daglichtBreedte: Millimeter;
  daglichtHoogte: Millimeter;

  /** Sponningmaat van de glassponning, vóór aftrek van de speling. */
  glasSponningBreedte: Millimeter;
  glasSponningHoogte: Millimeter;

  /** Glasmaat — ALTIJD gevuld, ook wanneer glas niet wordt meegeleverd. */
  glasBreedte: Millimeter;
  glasHoogte: Millimeter;
  /** Werkelijke glasinleg per zijde na aftrek van de speling (controlewaarde). */
  effectieveGlasinleg: Millimeter;
  /** Glasoppervlak in m². */
  glasOppervlakM2: number;
  /** Glasgewicht in kg, `null` als er geen glastype gekozen is. */
  glasGewichtKg: number | null;

  /** Hormaat — ALTIJD gevuld, ook wanneer geen hor wordt meegeleverd. */
  horBreedte: Millimeter;
  horHoogte: Millimeter;

  /** Vleugeloppervlak in m². */
  vleugelOppervlakM2: number;

  /** Hoogte van de borstwering onder dit vak, 0 als er geen is. */
  borstweringHoogte: Millimeter;

  /**
   * Bij een schuin kozijn loopt de hoogte binnen één vak op. Dan zijn de
   * bovenstaande hoogtes de hóge zijde en staan hieronder de lage zijden.
   * Bij een recht kozijn zijn deze velden `null`.
   */
  schuin: boolean;
  sponningHoogteLaag: Millimeter | null;
  vleugelHoogteLaag: Millimeter | null;
  daglichtHoogteLaag: Millimeter | null;
  glasHoogteLaag: Millimeter | null;
}

/** De cilindermaat — ALTIJD gevuld, ook wanneer geen cilinder wordt meegeleverd. */
export interface Cilindermaat {
  /** Maat binnenzijde in mm. */
  binnen: Millimeter;
  /** Maat buitenzijde in mm. */
  buiten: Millimeter;
  /** Genoteerd als '32/42'. */
  notatie: string;
  /** Geadviseerde SKG-klasse (hoofdstuk 6.4). */
  skgAdvies: SkgKlasse;
  /** Rekenkundige maat vóór afronding naar een leverbare cilinderlengte. */
  ruwBinnen: number;
  ruwBuiten: number;
  /** Op welke aannames deze maat gebaseerd is als er geen beslag gekozen is. */
  gebaseerdOpFabrieksstandaard: boolean;
}

export type BevindingType = "blokkade" | "waarschuwing" | "escalatie";

/** Eén uitkomst van de regelmotor (hoofdstuk 4.2). */
export interface Bevinding {
  regelId: string;
  type: BevindingType;
  /** Korte kop voor de pop-up. */
  kop: string;
  /** Uitleg in gewone taal — nooit een generieke foutmelding (regel 3). */
  uitleg: string;
  /** Het dichtstbijzijnde wél haalbare alternatief, indien te bepalen. */
  alternatief: string | null;
  /** Naar welke configuratorstap de gebruiker moet om dit op te lossen. */
  stap: number;
}

export type Prijscontext = "publiek" | "aannemer";

/**
 * Prijsopbouw met drie niveaus. Welke velden gevuld zijn hangt af van de
 * context en van wie het opvraagt:
 *
 *   kostprijs      wat Rebu zelf betaalt — alleen zichtbaar voor Rebu
 *   aannemersprijs wat Rebu de aannemer factureert — de aannemer ziet dit
 *   klantprijs     wat de eindklant betaalt
 */
export interface Prijs {
  context: Prijscontext;

  /** Niveau 1 — kostprijs voor Rebu. Nooit gevuld richting aannemer of publiek. */
  kostprijsPerStuk: Eurocent | null;
  kostprijsTotaal: Eurocent | null;
  /** De marge die Rebu op zijn kostprijs legt, in procenten. Alleen voor Rebu. */
  rebuMargePercentage: number | null;

  /** Niveau 2 — wat Rebu de aannemer factureert, exclusief btw. */
  aannemersprijsPerStuk: Eurocent | null;
  aannemersprijsTotaal: Eurocent | null;
  aannemersprijsBtw: Eurocent | null;
  aannemersprijsTotaalInclBtw: Eurocent | null;

  /** Niveau 3 — wat de eindklant betaalt, exclusief btw. */
  klantprijsPerStuk: Eurocent;
  klantprijsTotaal: Eurocent;
  btwBedrag: Eurocent;
  klantprijsTotaalInclBtw: Eurocent;
  btwPercentage: number;

  /** De eigen marge van de aannemer, in procenten. Alleen in aannemerscontext. */
  aannemersmargePercentage: number | null;
  aannemersmargeBedrag: Eurocent | null;

  /** Opbouw voor de specificatieregel. Bedragen alleen gevuld voor Rebu. */
  regels: { omschrijving: string; bedrag: Eurocent }[];
  /** Bij publiek: expliciet gemarkeerd als richtprijs. */
  isRichtprijs: boolean;
}

/** Het volledige resultaat van één doorrekening. */
export interface Berekening {
  configuratie: Configuratie;
  profiel: Profiel;
  glastype: Glastype | null;
  afstandshouder: Afstandshouder | null;
  beslag: Beslag | null;
  hortype: Hortype | null;
  dorpel: Dorpel | null;
  muuraansluiting: Muuraansluiting | null;
  afkitoptie: Afkitoptie | null;
  kleurBinnen: Kleur | null;
  kleurBuiten: Kleur | null;
  /**
   * De vleugelkleur zoals hij daadwerkelijk geleverd wordt: is er geen eigen
   * vleugelkleur gekozen, dan staat hier de kaderkleur. Tekening, offerte en
   * fabrieksorder lezen alleen deze velden, zodat ze nooit uiteen kunnen lopen.
   */
  vleugelKleurBinnen: Kleur | null;
  vleugelKleurBuiten: Kleur | null;

  vakken: VakMaten[];
  cilindermaat: Cilindermaat;

  /** Totaal glasoppervlak van alle vakken samen in m². */
  totaalGlasOppervlakM2: number;
  /** Totaal glasgewicht in kg, `null` zonder gekozen glastype. */
  totaalGlasGewichtKg: number | null;
  /** Kozijnoppervlak in m². */
  kozijnOppervlakM2: number;

  /** Of staalversterking verplicht is volgens de regels. */
  staalversterkingVerplicht: boolean;

  bevindingen: Bevinding[];
  /** Kortweg: zijn er blokkades? */
  blokkeert: boolean;

  prijs: Prijs;
}
