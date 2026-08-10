/**
 * Productdatabase — profielsystemen (hoofdstuk 3 en 4 van het functioneel ontwerp).
 *
 * BELANGRIJK OVER DE HERKOMST VAN GETALLEN
 * Elke technische constante draagt een `bron`. Er zijn drie soorten:
 *
 *   fabrikant            — geverifieerd op een fabrikants- of leverancierspagina
 *   functioneel-ontwerp  — overgenomen uit het PDF, met hoofdstuknummer
 *   aanname              — nog NIET geverifieerd; Rebu moet dit bevestigen
 *
 * De zichtbreedtes (kozijn, vleugel, aanslag, tussenstijl) staan nu als aanname
 * in de database. Ze bepalen rechtstreeks de glasmaat en moeten daarom vóór
 * livegang uit de leverancierstekeningen worden overgenomen. Het adminscherm
 * toont ze als 'te bevestigen' zolang de bron een aanname is.
 */
import type {
  Constante,
  Geometrie,
  PerUitvoering,
  Profiel,
  ProfielCombinatie,
  Profielkaart,
  Uitvoering,
} from "../types";

const fabrikant = (waarde: number, url: string): Constante => ({
  waarde,
  bron: { soort: "fabrikant", url },
});

const ontwerp = (waarde: number, hoofdstuk: string): Constante => ({
  waarde,
  bron: { soort: "functioneel-ontwerp", hoofdstuk },
});

const aanname = (waarde: number, toelichting: string): Constante => ({
  waarde,
  bron: { soort: "aanname", toelichting },
});

/** Geverifieerde bron voor de zichtbreedte van een profiel. */
const geijkt = (waarde: number, toelichting: string): Constante => ({
  waarde,
  bron: { soort: "fabrikant", url: toelichting },
});

/**
 * De maatketen per uitvoering.
 *
 * De zichtbreedte is de enige waarde die de glasmaat bepaalt, en die is voor de
 * aanslaguitvoering van twee systemen geijkt tegen een echte calculatie. Voor de
 * overige uitvoeringen is hij afgeleid en dus nog een aanname.
 */
function geometrieVoor(
  uitvoering: Uitvoering,
  basis: {
    /**
     * De zichtbreedte per uitvoering. Wat er niet in staat wordt afgeleid van
     * de wél bekende variant en blijft dus een aanname — elke uitvoering is een
     * ander profiel met een eigen zichtbreedte.
     */
    kozijnZicht: Partial<Record<Uitvoering, Constante>>;
    vleugelZicht: Constante;
    /** Het zwaardere deurprofiel bij ditzelfde kader, als de fabrikant dat levert. */
    deurVleugelZicht?: Constante;
    vleugelOverslag: Constante;
    /**
     * Eigen aanslagmaat van dit systeem, los van de uitvoering. Een hefschuifpui
     * staat stomp in de sparing, maar er is een klik-aanslag als toebehoren die
     * er alsnog overheen valt — die zet je per zijde aan.
     */
    aanslag?: Constante;
    tussenstijl: number;
    glasinleg: number;
    /**
     * De stijlen van een hefschuifpui: de puistijl tussen een vast deel en een
     * vleugel, en de ontmoetingsstijl waar twee vleugels elkaar ontmoeten.
     * Alleen hefschuifsystemen vullen deze; bij een raamsysteem blijven ze weg.
     */
    puistijl?: Constante;
    ontmoetingsstijl?: Constante;
  }
): Geometrie {
  const bekend = basis.kozijnZicht[uitvoering];
  const referentie =
    basis.kozijnZicht.aanslag ?? basis.kozijnZicht.vlak ?? basis.kozijnZicht.verdiept;
  const zicht =
    bekend ??
    aanname(
      (referentie?.waarde ?? 70) + (uitvoering === "vlak" ? -8 : uitvoering === "verdiept" ? 6 : 8),
      `Zichtbreedte van de ${uitvoering}-uitvoering is afgeleid van een andere variant. Overnemen uit de technische catalogus.`
    );

  return {
    kozijnZichtbreedte: zicht,
    vleugelZichtbreedte: basis.vleugelZicht,
    deurVleugelZichtbreedte: basis.deurVleugelZicht ?? null,
    aanslag:
      basis.aanslag ??
      (uitvoering === "aanslag"
        ? geijkt(
            20,
            "EKO4U toont bij Ideal 7000 NL Blockprofiel 1000 → 960 stelmaat, dus 20 mm aanslag over het metselwerk."
          )
        : aanname(0, "Vlakke/verdiepte uitvoering heeft geen aanslag over het metselwerk.")),
    // De vleugeloverslag hangt aan het profielsysteem, niet aan de uitvoering:
    // ook de standaarduitvoering van IDEAL 4000 — zonder aanslag over het
    // metselwerk — heeft een vleugel die 28 mm over het kozijn valt.
    vleugelOverslag: basis.vleugelOverslag,
    tussenstijlBreedte: aanname(
      basis.tussenstijl,
      "Breedte van de tussenstijl. Overnemen uit de technische catalogus."
    ),
    glasinleg: aanname(
      basis.glasinleg,
      "Glasinleg onder de glaslat. Wordt gebruikt voor de daglichtmaat en detail D."
    ),
    puistijlBreedte: basis.puistijl ?? null,
    ontmoetingsstijlBreedte: basis.ontmoetingsstijl ?? null,
  };
}

/** Basisspecificatie van een profielsysteem, los van de uitvoering. */
interface Systeem {
  id: string;
  merk: Profiel["merk"];
  merkLabel: string;
  naam: string;
  toepassing: string;
  inbouwdiepte: Constante;
  kamers: Constante;
  uWaarde: Constante;
  vleugeldikte: Constante;
  horAansluitmaat: Constante;
  maxGlasdikte: Constante;
  /**
   * Inbouwdiepte en maximale glasdikte per uitvoering.
   *
   * Deze twee hangen niet aan het systeem maar aan het profiel zelf: het NL
   * blokprofiel mét aanslag van IDEAL 7000 is 120 mm diep en neemt glas tot
   * 41 mm, terwijl het basissysteem 85 mm is. Staat een uitvoering hier niet in,
   * dan geldt de waarde van het systeem.
   */
  dieptePerUitvoering?: PerUitvoering;
  maxGlasPerUitvoering?: PerUitvoering;
  /**
   * De cataloguskaart per uitvoering. Alleen uitvoeringen waarvan het blad uit
   * de technische catalogus is overgenomen krijgen er een.
   */
  kaartPerUitvoering?: PerUitvoering<Profielkaart>;
  /**
   * De kader × vleugel-combinaties per uitvoering. Het kader hoort bij de
   * uitvoering (170054 ís het kader mét aanslag), dus de combinaties ook.
   */
  combinatiesPerUitvoering?: PerUitvoering<ProfielCombinatie[]>;
  grenzen: Profiel["grenzen"];
  toegestaneTypes: Profiel["toegestaneTypes"];
  toegestaneGlastypes: string[];
  toegestaanBeslag: string[];
  /** Welke uitvoeringen dit systeem kent. */
  uitvoeringen: Uitvoering[];
  zicht: Parameters<typeof geometrieVoor>[1];
}

/**
 * De technische catalogus met alle aluplast-doorsneden per profielcombinatie.
 * Elk blad noemt de kader- en vleugelmaat expliciet ("NL kader: 84 mm").
 */
const EKOOKNA_CATALOGUS_URL =
  "https://benefit.ekookna.com/nl/technische-catalogus?filters%5BSystemodawca%5D%5B0%5D=ALUPLAST";

const ALUPLAST_4000_URL = "https://www.aluplast.net/nl/produkte/kunststofffenster-systeme/ideal-4000.php";
const ALUPLAST_7000_URL = "https://www.aluplast.net/eng-us/product/window/ideal/ideal-7000/";
const GEALAN_S9000_URL = "https://www.gealan.de/nl/systemen/s-9000-nl";
const KOMMERLING_URL =
  "https://www.koemmerling.com/be/nl/producten/ramen-en-deur-systemen/76-mm-systeem/ad/koemmerling-k-vision/";

const SYSTEMEN: Systeem[] = [
  {
    id: "aluplast-ideal-4000",
    merk: "aluplast",
    merkLabel: "Aluplast",
    naam: "IDEAL 4000",
    toepassing: "Standaard kozijn, budgetsegment",
    inbouwdiepte: fabrikant(70, ALUPLAST_4000_URL),
    kamers: fabrikant(5, ALUPLAST_4000_URL),
    uWaarde: fabrikant(1.3, ALUPLAST_4000_URL),
    vleugeldikte: ontwerp(70, "6.2 voorbeeldberekening"),
    horAansluitmaat: aanname(12, "Hor-aansluitmaat overgenomen van IDEAL 7000; per systeem bevestigen."),
    maxGlasdikte: fabrikant(41, ALUPLAST_4000_URL),
    /*
     * Het catalogusblad 'Ideal 4000 Vin 20 mm' (artikel 140041) — de uitvoering
     * met de 20 mm aanslagvin — geeft beglazing tot 42 mm. Voor het vlakke
     * standaardkader staat dezelfde 42 mm op het EKO4U-blad.
     */
    maxGlasPerUitvoering: {
      aanslag: fabrikant(42, "Ideal 4000 Vin 20 mm (140041) — beglazing met een breedte tot 42 mm."),
      vlak: fabrikant(42, "Ideal 4000 Vin 20 mm (140041) — beglazing met een breedte tot 42 mm."),
    },
    kaartPerUitvoering: {
      aanslag: {
        profielklasse: "B",
        afdichtingen: 2,
        staal: "standaard open staal 1,5 mm",
        antiInbraak: "twee anti-inbraakpunten aan de vleugel",
        hfl: null,
        bron: { soort: "fabrikant", url: EKOOKNA_CATALOGUS_URL },
      },
    },
    combinatiesPerUitvoering: {
      vlak: [
        {
          id: "aluplast-4000-140001-140020",
          label: "Kader standard 65 mm × vleugel recht 77 mm",
          toepassing: "raam",
          kaderArtikel: "140001",
          vleugelArtikel: "140020",
          kaderZichtbreedte: geijkt(
            65,
            "EKO4U, kaderprofiel 140001 'Raam kader standard' (diep 70 mm, hoog 65 mm)."
          ),
          vleugelZichtbreedte: geijkt(77, "EKO4U, vleugelprofiel 140020 'vleugel RECHT 77mm'."),
          inbouwdiepte: null,
          maxGlasdikte: null,
          doorsnedeSvg: null,
        },
      ],
    },
    grenzen: {
      minBreedte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxBreedte: aanname(3000, "Bovengrens per element; bevestigen bij Rebu."),
      minHoogte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxHoogte: aanname(2500, "Bovengrens per element; bevestigen bij Rebu."),
      maxVleugelBreedteDraaikiep: aanname(1100, "Iets krapper dan IDEAL 7000 vanwege 70 mm bouwdiepte."),
      maxVleugelHoogteDraaikiep: aanname(2100, "Bevestigen bij Rebu."),
      staalversterkingVanafM2: aanname(1.5, "Strenger dan IDEAL 7000 vanwege lichtere opbouw."),
      geenRoosterBovenM2: aanname(2.0, "Bevestigen bij Rebu."),
      tripleVerplichtVanafM2: null,
      maxGlasgewichtPerVleugelKg: aanname(80, "Grens standaardbeslag; bevestigen bij beslagleverancier."),
    },
    toegestaneTypes: ["vast", "draaikiep", "valraam", "achterdeur", "stelkozijn", "renovatiekozijn"],
    toegestaneGlastypes: [
      "hr-plus-plus-11",
      "hr-plus-plus-10",
      "hr-plus-plus-11-mat",
      "gelaagd-binnen",
      "gelaagd-binnen-mat",
      "veiligheidsglas",
      "zonwerend",
    ],
    toegestaanBeslag: ["draaikiep-skg2", "meerpunt-skg2", "deurbeslag-skg2"],
    uitvoeringen: ["aanslag", "vlak"],
    zicht: {
      kozijnZicht: {
        // Geijkt: EKO4U toont voor 'Aluplast Ideal 4000' kaderprofiel
        // 140001 'Raam kader standard (diep 70 mm, hoog 65 mm)' en geeft bij
        // 1000 × 1000 een glasmaat van 870 × 870.
        vlak: geijkt(
          65,
          "EKO4U, kaderprofiel 140001 'Raam kader standard' (diep 70 mm, hoog 65 mm). 1000 × 1000 vast → glasmaat 870 × 870."
        ),
      },
      // Geijkt: vleugelprofiel 140020 'vleugel RECHT 77mm'; met die vleugel
      // geeft EKO4U bij 1000 × 1000 een glasmaat van 772 × 772.
      vleugelZicht: geijkt(
        77,
        "EKO4U, vleugelprofiel 140020 'vleugel RECHT 77mm'. 1000 × 1000 met deze vleugel → glasmaat 772 × 772."
      ),
      vleugelOverslag: geijkt(
        28,
        "Volgt uit 65 + 77 − 114: 28 mm overslag. Zelfde waarde als bij IDEAL 7000 NL, dus systeembreed bij Aluplast."
      ),
      tussenstijl: 94,
      glasinleg: 16,
    },
  },
  {
    id: "aluplast-ideal-7000",
    merk: "aluplast",
    merkLabel: "Aluplast",
    naam: "IDEAL 7000 NL",
    toepassing: "Premium kozijn, extra isolatiewaarde",
    inbouwdiepte: fabrikant(85, ALUPLAST_7000_URL),
    kamers: fabrikant(6, ALUPLAST_7000_URL),
    uWaarde: fabrikant(1.0, ALUPLAST_7000_URL),
    vleugeldikte: ontwerp(78, "3.3 voorbeeldregel"),
    horAansluitmaat: ontwerp(12, "3.3 voorbeeldregel"),
    maxGlasdikte: fabrikant(52, ALUPLAST_7000_URL),
    /*
     * De 85 mm hierboven is de bouwdiepte van het basissysteem. Het NL
     * blokprofiel mét aanslag is een ander, dieper profiel: 120 mm, met glas tot
     * 41 mm. Dat staat zo in de technische catalogus, mét doorsnede.
     */
    dieptePerUitvoering: {
      aanslag: fabrikant(120, "IDEAL 7000 NL BLOKPROFIEL 84 mm (met aanslag) — kozijndiepte 120 mm."),
    },
    maxGlasPerUitvoering: {
      aanslag: fabrikant(41, "IDEAL 7000 NL BLOKPROFIEL 84 mm — beglazing tot 41 mm mogelijk."),
    },
    kaartPerUitvoering: {
      aanslag: {
        profielklasse: "B",
        afdichtingen: 2,
        staal: null,
        antiInbraak: null,
        hfl: true,
        bron: { soort: "fabrikant", url: EKOOKNA_CATALOGUS_URL },
      },
    },
    combinatiesPerUitvoering: {
      aanslag: [
        {
          id: "aluplast-7000-170054-170020",
          label: "NL kader 84 mm × raamvleugel 77 mm",
          toepassing: "raam",
          kaderArtikel: "170054",
          vleugelArtikel: "170020",
          kaderZichtbreedte: geijkt(
            84,
            "EKO4U, kaderprofiel 170054 'kader NL met aanslag' (diepte 120 mm, hoogte 84 mm)."
          ),
          vleugelZichtbreedte: geijkt(77, "EKO4U, vleugelprofiel 170020 'vleugel RECHT 77mm'."),
          inbouwdiepte: fabrikant(120, "Catalogusblad 170054 × 170020 — 144 breed, 120 diep, 133 hoog."),
          maxGlasdikte: fabrikant(41, "IDEAL 7000 NL BLOKPROFIEL 84 mm — beglazing tot 41 mm."),
          doorsnedeSvg: "/configurator/profielen/aluplast-ideal-7000-nl-kader84-vleugel77.svg",
        },
        {
          /*
           * Hetzelfde kader 170054 draagt ook de zware deurvleugel 170033: in
           * doorsnede 96 mm in plaats van 57, totaal 172 mm. Een deur krijgt dus
           * minder glas dan een raam van dezelfde maat.
           */
          id: "aluplast-7000-170054-170033",
          label: "NL kader 84 mm × deurvleugel 96 mm",
          toepassing: "deur",
          kaderArtikel: "170054",
          vleugelArtikel: "170033",
          kaderZichtbreedte: geijkt(
            84,
            "EKO4U, kaderprofiel 170054 'kader NL met aanslag' (diepte 120 mm, hoogte 84 mm)."
          ),
          vleugelZichtbreedte: fabrikant(
            96,
            "ALUPLAST IDEAL 7000 NL 170x54 - 170x33 — deurvleugel, doorsnede 96 mm."
          ),
          inbouwdiepte: fabrikant(120, "Zelfde kader 170054, dus dezelfde diepte van 120 mm."),
          maxGlasdikte: fabrikant(41, "IDEAL 7000 NL BLOKPROFIEL 84 mm — beglazing tot 41 mm."),
          doorsnedeSvg: "/configurator/profielen/aluplast-ideal-7000-nl-17054-17033-deur.svg",
        },
        {
          id: "aluplast-7000-170053-170030",
          label: "Kader 170053 × vleugel 170030",
          toepassing: "raam",
          kaderArtikel: "170053",
          vleugelArtikel: "170030",
          kaderZichtbreedte: aanname(
            84,
            "Zichtbreedte van kader 170053 nog niet van het catalogusblad overgenomen."
          ),
          vleugelZichtbreedte: aanname(
            77,
            "Zichtbreedte van vleugel 170030 nog niet van het catalogusblad overgenomen."
          ),
          inbouwdiepte: null,
          maxGlasdikte: null,
          doorsnedeSvg: "/configurator/profielen/aluplast-ideal-7000-nl-17053-17030.svg",
        },
      ],
    },
    grenzen: {
      minBreedte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxBreedte: aanname(3200, "Bovengrens per element; bevestigen bij Rebu."),
      minHoogte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxHoogte: ontwerp(2300, "3.3 voorbeeldregel"),
      maxVleugelBreedteDraaikiep: ontwerp(1200, "3.3 voorbeeldregel"),
      maxVleugelHoogteDraaikiep: ontwerp(2300, "3.3 voorbeeldregel"),
      staalversterkingVanafM2: ontwerp(1.8, "3.3 voorbeeldregel"),
      geenRoosterBovenM2: ontwerp(2.2, "3.3 voorbeeldregel"),
      tripleVerplichtVanafM2: ontwerp(1.8, "3.3 voorbeeldregel — triple glas verplicht boven 1,8 m²"),
      maxGlasgewichtPerVleugelKg: aanname(100, "Grens standaardbeslag; bevestigen bij beslagleverancier."),
    },
    toegestaneTypes: [
      "vast",
      "draaikiep",
      "valraam",
      "voordeur",
      "achterdeur",
      "stelkozijn",
      "renovatiekozijn",
    ],
    toegestaneGlastypes: [
      "hr-plus-plus-11",
      "hr-plus-plus-10",
      "hr-plus-plus-11-mat",
      "gelaagd-binnen-mat",
      "triple-07",
      "triple-06",
      "gelaagd-binnen",
      "gelaagd-buiten",
      "zonwerend",
      "veiligheidsglas",
    ],
    toegestaanBeslag: [
      "draaikiep-skg2",
      "meerpunt-skg2",
      "meerpunt-skg3",
      "deurbeslag-skg2",
      "deurbeslag-skg3",
      "hefschuif-skg2",
    ],
    uitvoeringen: ["aanslag", "vlak", "verdiept"],
    zicht: {
      // Geijkt: EKO4U geeft bij 1000 × 1000 vast een glasmaat van 832 × 832.
      kozijnZicht: {
        aanslag: geijkt(
          84,
          "EKO4U, kaderprofiel 170054 'kader NL met aanslag' (diepte 120 mm, hoogte 84 mm). 1000 × 1000 vast → glasmaat 832 × 832."
        ),
      },
      // Geijkt: profiel 170020 'vleugel RECHT 77 mm'. Met die vleugel geeft
      // EKO4U bij 1000 × 1000 een glasmaat van 734 × 734, dus 133 mm aftrek per
      // zijde: 84 kozijn + 77 vleugel − 28 overslag.
      vleugelZicht: geijkt(
        77,
        "EKO4U, vleugelprofiel 170020 'vleugel RECHT 77mm'. 1000 × 1000 met deze vleugel → glasmaat 734 × 734."
      ),
      // Op hetzelfde kader 170054 levert aluplast ook een zwaardere deurvleugel
      // (170033): in doorsnede 96 mm hoog in plaats van 57, totaal 172 mm.
      deurVleugelZicht: fabrikant(
        96,
        "ALUPLAST IDEAL 7000 NL 170x54 - 170x33 — deurvleugel, doorsnede 96 mm."
      ),
      vleugelOverslag: geijkt(
        28,
        "Volgt uit 84 + 77 − 133: de vleugel valt 28 mm per zijde over het kozijn. Geijkt op EKO4U."
      ),
      tussenstijl: 102,
      glasinleg: 18,
    },
  },
  {
    id: "gealan-s9000",
    merk: "gealan",
    merkLabel: "Gealan",
    naam: "S 9000 NL",
    toepassing: "Standaard/premium kozijn",
    inbouwdiepte: fabrikant(82.5, GEALAN_S9000_URL),
    /*
     * De 82,5 mm is de bouwdiepte van het basissysteem; het NL-kozijnprofiel met
     * aanslag meet in doorsnede 120 mm (52,5 + 67,5).
     */
    dieptePerUitvoering: {
      aanslag: fabrikant(120, "Gealan S 9000 NL Base kozijnprofiel — doorsnede 120 mm (52,5 + 67,5)."),
    },
    kamers: fabrikant(6, GEALAN_S9000_URL),
    uWaarde: fabrikant(0.89, GEALAN_S9000_URL),
    vleugeldikte: aanname(76, "Vleugeldikte afgeleid van 82,5 mm bouwdiepte; bevestigen bij Gealan."),
    horAansluitmaat: aanname(12, "Bevestigen bij Rebu."),
    maxGlasdikte: fabrikant(52, GEALAN_S9000_URL),
    grenzen: {
      minBreedte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxBreedte: aanname(3200, "Bovengrens per element; bevestigen bij Rebu."),
      minHoogte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxHoogte: aanname(2500, "Bevestigen bij Rebu."),
      maxVleugelBreedteDraaikiep: aanname(1200, "Bevestigen bij Gealan."),
      maxVleugelHoogteDraaikiep: aanname(2300, "Bevestigen bij Gealan."),
      staalversterkingVanafM2: aanname(1.8, "Bevestigen bij Rebu."),
      geenRoosterBovenM2: aanname(2.2, "Bevestigen bij Rebu."),
      tripleVerplichtVanafM2: null,
      maxGlasgewichtPerVleugelKg: aanname(110, "S 9000 met STV-verlijming draagt meer; bevestigen."),
    },
    toegestaneTypes: [
      "vast",
      "draaikiep",
      "valraam",
      "voordeur",
      "achterdeur",
      "stelkozijn",
      "renovatiekozijn",
    ],
    toegestaneGlastypes: [
      "hr-plus-plus-11",
      "hr-plus-plus-10",
      "hr-plus-plus-11-mat",
      "gelaagd-binnen-mat",
      "triple-07",
      "triple-06",
      "gelaagd-binnen",
      "gelaagd-buiten",
      "zonwerend",
      "veiligheidsglas",
    ],
    toegestaanBeslag: [
      "draaikiep-skg2",
      "meerpunt-skg2",
      "meerpunt-skg3",
      "deurbeslag-skg2",
      "deurbeslag-skg3",
      "hefschuif-skg2",
    ],
    uitvoeringen: ["aanslag", "vlak", "verdiept"],
    zicht: {
      // Geijkt: AKUGT geeft bij 2000 breed een glasmaat van 1868.
      kozijnZicht: {
        aanslag: geijkt(
          66,
          "AKUGT ExtraNet, profiel 6802 Aanslag. 2000 breed vast → glasmaat 1868; 1945 hoog → 1813."
        ),
      },
      vleugelZicht: aanname(77, "Zichtbreedte vleugelprofiel Gealan S 9000 NL. Nog niet geijkt."),
      vleugelOverslag: aanname(28, "Overslag overgenomen van IDEAL 7000 NL; bevestigen bij Gealan."),
      tussenstijl: 100,
      glasinleg: 20,
    },
  },
  {
    id: "kommerling-kvision",
    merk: "kommerling",
    merkLabel: "Kömmerling",
    naam: "K-VISION 76",
    toepassing: "Speciaal voor de Nederlandse markt ontwikkeld",
    inbouwdiepte: fabrikant(76, KOMMERLING_URL),
    kamers: fabrikant(5, KOMMERLING_URL),
    uWaarde: fabrikant(1.4, KOMMERLING_URL),
    vleugeldikte: aanname(76, "Vleugeldikte gelijk aan de 76 mm systeemdiepte; bevestigen bij Kömmerling."),
    horAansluitmaat: aanname(12, "Bevestigen bij Rebu."),
    maxGlasdikte: fabrikant(52, KOMMERLING_URL),
    grenzen: {
      minBreedte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxBreedte: aanname(3000, "Bovengrens per element; bevestigen bij Rebu."),
      minHoogte: aanname(300, "Ondergrens productie; bevestigen bij Rebu."),
      maxHoogte: aanname(2400, "Bevestigen bij Rebu."),
      maxVleugelBreedteDraaikiep: aanname(1150, "Bevestigen bij Kömmerling."),
      maxVleugelHoogteDraaikiep: aanname(2200, "Bevestigen bij Kömmerling."),
      staalversterkingVanafM2: aanname(1.6, "5-kamersysteem met stalen kern; bevestigen."),
      geenRoosterBovenM2: aanname(2.0, "Bevestigen bij Rebu."),
      tripleVerplichtVanafM2: null,
      maxGlasgewichtPerVleugelKg: aanname(90, "Bevestigen bij beslagleverancier."),
    },
    toegestaneTypes: [
      "vast",
      "draaikiep",
      "valraam",
      "voordeur",
      "achterdeur",
      "stelkozijn",
      "renovatiekozijn",
    ],
    toegestaneGlastypes: [
      "hr-plus-plus-11",
      "hr-plus-plus-10",
      "hr-plus-plus-11-mat",
      "gelaagd-binnen-mat",
      "triple-07",
      "triple-06",
      "gelaagd-binnen",
      "veiligheidsglas",
      "zonwerend",
    ],
    toegestaanBeslag: [
      "draaikiep-skg2",
      "meerpunt-skg2",
      "meerpunt-skg3",
      "deurbeslag-skg2",
      "deurbeslag-skg3",
      "hefschuif-skg2",
    ],
    // Bij K-Vision is het verdiepte kader 120 mm; dat is een eigen uitvoering.
    uitvoeringen: ["aanslag", "vlak", "verdiept"],
    zicht: {
      kozijnZicht: {
        aanslag: aanname(
          76,
          "Zichtbreedte K-VISION 76. Nog niet geijkt; overnemen uit de technische catalogus."
        ),
      },
      vleugelZicht: aanname(76, "Zichtbreedte vleugelprofiel K-VISION 76. Nog niet geijkt."),
      vleugelOverslag: aanname(28, "Overslag overgenomen van IDEAL 7000 NL; bevestigen bij Kömmerling."),
      tussenstijl: 98,
      glasinleg: 17,
    },
  },
  {
    /**
     * De hefschuifpui is een eigen profielsysteem, geen variant van het
     * raamprofiel. Zo staat hij ook in het bestelsysteem van de leverancier:
     * naast 'S9000NL Basis', 'Haaks' en 'Vlak' staat 'S9000NL Hef-schuif' als
     * losse keuze, met zijn eigen kader (stomp, dus zónder aanslag over het
     * metselwerk), zijn eigen zwaardere vleugels en een rail als onderdorpel.
     */
    id: "gealan-s9000-hefschuif",
    merk: "gealan",
    merkLabel: "Gealan",
    naam: "Schuifpui",
    toepassing: "Hefschuifpui",
    inbouwdiepte: aanname(194, "Bouwdiepte hefschuifkader; bevestigen bij Gealan."),
    kamers: aanname(5, "Bevestigen bij Gealan."),
    uWaarde: aanname(1.3, "Uf hefschuifprofiel; bevestigen bij Gealan."),
    vleugeldikte: aanname(70, "Vleugeldikte hefschuif; bevestigen bij Gealan."),
    horAansluitmaat: aanname(12, "Bevestigen bij Rebu."),
    maxGlasdikte: aanname(52, "Bevestigen bij Gealan."),
    grenzen: {
      minBreedte: aanname(1400, "Een pui van minder dan twee delen bestaat niet; bevestigen."),
      maxBreedte: aanname(6500, "Bovengrens hefschuif; bevestigen bij Gealan."),
      minHoogte: aanname(1200, "Bevestigen bij Rebu."),
      maxHoogte: aanname(2700, "Bevestigen bij Gealan."),
      maxVleugelBreedteDraaikiep: aanname(1800, "Maximale vleugelbreedte hefschuif; bevestigen."),
      maxVleugelHoogteDraaikiep: aanname(2700, "Bevestigen bij Gealan."),
      staalversterkingVanafM2: aanname(2.5, "Bevestigen bij Rebu."),
      geenRoosterBovenM2: aanname(3.5, "Bevestigen bij Rebu."),
      tripleVerplichtVanafM2: null,
      maxGlasgewichtPerVleugelKg: aanname(200, "Hefschuifbeslag draagt fors meer; bevestigen."),
    },
    toegestaneTypes: ["schuifpui"],
    toegestaneGlastypes: [
      "hr-plus-plus-11",
      "hr-plus-plus-10",
      "hr-plus-plus-11-mat",
      "gelaagd-binnen",
      "gelaagd-binnen-mat",
      "gelaagd-buiten",
      "triple-07",
      "triple-06",
      "zonwerend",
      "veiligheidsglas",
    ],
    toegestaanBeslag: ["hefschuif-skg2"],
    // Alleen stomp: een hefschuifkader heeft geen aanslag over het metselwerk.
    uitvoeringen: ["vlak"],
    zicht: {
      kozijnZicht: {
        // Geijkt: AKUGT, 2-delige hefschuif van 2000 breed, delen 1000 + 1000,
        // geeft in beide vakken een glasmaat van 758. Dat is 121 mm per zijde.
        // Geijkt op twee puien uit AKUGT, met dezelfde constanten sluitend:
        //   2-delig, 2000 breed:  177 + 758 + 130 + 758 + 177 = 2000
        //   4-delig, 4000 breed:  177 + 776 + 130 + 789 + 256 + 789 + 130 + 776 + 177 = 4000
        vlak: geijkt(
          177,
          "AKUGT ExtraNet, Gealan S9000NL Hef-schuif (profiel 6362, kader 6360 stomp). 2-delig 2000 → glasmaat 758; 4-delig 4000 → 776/789/789/776."
        ),
      },
      // De vleugelprofielen zitten al verwerkt in het kader (177) en in de
      // puistijlen (130 gewoon, 256 tussen twee vleugels); een extra aftrek zou
      // dubbeltellen. Beide geijkte puien komen daarmee exact uit.
      vleugelZicht: geijkt(0, "Volgt uit de twee geijkte puien; zie de kaderzichtbreedte hierboven."),
      vleugelOverslag: aanname(0, "Zit verwerkt in de kaderzichtbreedte hierboven; nog te ijken."),
      /**
       * De klik-aanslag: een los profiel dat over het metselwerk valt. Een pui
       * wordt standaard stomp geleverd — daarom staat hij per zijde uit — maar
       * hij is per zijde bij te zetten.
       */
      aanslag: aanname(20, "Klik-aanslag hefschuif, 20 mm; bevestigen bij Rebu."),
      tussenstijl: 130,
      glasinleg: 20,
      puistijl: geijkt(
        130,
        "AKUGT ExtraNet — de stijl tussen vast deel en vleugel, geijkt op de 2- en 4-delige pui."
      ),
      ontmoetingsstijl: geijkt(
        256,
        "AKUGT ExtraNet — de stijl tussen twee vleugels in de 4-delige pui van 4000: 256 mm."
      ),
    },
  },
  {
    /**
     * Ook bij dit merk is de hefschuif een eigen profielsysteem. De HST 85 staat
     * sinds de catalogusdoorsneden op zijn eigen maten (schema C en de
     * standaarddoorsnede 170080 × 170081); wat daar niet op staat is nog van het
     * geijkte Gealan-profiel overgenomen.
     */
    id: "aluplast-hst85",
    merk: "aluplast",
    merkLabel: "Aluplast",
    naam: "Schuifpui",
    toepassing: "Hefschuifpui",
    inbouwdiepte: fabrikant(
      197,
      "ALUPLAST HST 85 standaarddoorsnede 170080 × 170081 — totale opbouw 197 mm: 112 mm vast deel + 85 mm vleugel."
    ),
    kamers: aanname(5, "Bevestigen bij Gealan."),
    uWaarde: aanname(1.3, "Uf hefschuifprofiel; bevestigen bij Gealan."),
    vleugeldikte: aanname(70, "Vleugeldikte hefschuif; bevestigen bij Gealan."),
    horAansluitmaat: aanname(12, "Bevestigen bij Rebu."),
    maxGlasdikte: aanname(52, "Bevestigen bij Gealan."),
    grenzen: {
      minBreedte: aanname(1400, "Een pui van minder dan twee delen bestaat niet; bevestigen."),
      maxBreedte: aanname(6500, "Bovengrens hefschuif; bevestigen bij Gealan."),
      minHoogte: aanname(1200, "Bevestigen bij Rebu."),
      maxHoogte: aanname(2700, "Bevestigen bij Gealan."),
      maxVleugelBreedteDraaikiep: aanname(1800, "Maximale vleugelbreedte hefschuif; bevestigen."),
      maxVleugelHoogteDraaikiep: aanname(2700, "Bevestigen bij Gealan."),
      staalversterkingVanafM2: aanname(2.5, "Bevestigen bij Rebu."),
      geenRoosterBovenM2: aanname(3.5, "Bevestigen bij Rebu."),
      tripleVerplichtVanafM2: null,
      maxGlasgewichtPerVleugelKg: aanname(200, "Hefschuifbeslag draagt fors meer; bevestigen."),
    },
    toegestaneTypes: ["schuifpui"],
    toegestaneGlastypes: [
      "hr-plus-plus-11",
      "hr-plus-plus-10",
      "hr-plus-plus-11-mat",
      "gelaagd-binnen",
      "gelaagd-binnen-mat",
      "gelaagd-buiten",
      "triple-07",
      "triple-06",
      "zonwerend",
      "veiligheidsglas",
    ],
    toegestaanBeslag: ["hefschuif-skg2"],
    // Alleen stomp: een hefschuifkader heeft geen aanslag over het metselwerk.
    uitvoeringen: ["vlak"],
    combinatiesPerUitvoering: {
      vlak: [
        {
          id: "aluplast-hst85-170080-170081",
          label: "HST 85 kader 170080 × vleugel 170081",
          toepassing: "hefschuif",
          kaderArtikel: "170080",
          vleugelArtikel: "170081",
          kaderZichtbreedte: fabrikant(
            100,
            "HST 85 schema C — schuifraam links, rechts en boven: 100 mm."
          ),
          vleugelZichtbreedte: fabrikant(
            100,
            "HST 85 standaarddoorsnede — vleugelhoogte 100 mm (zichtmaat 80/100)."
          ),
          inbouwdiepte: fabrikant(
            197,
            "HST 85 standaarddoorsnede — 197 mm totale opbouw: 112 mm vast deel + 85 mm vleugel; rail 163/178."
          ),
          maxGlasdikte: null,
          doorsnedeSvg: "/configurator/profielen/aluplast-hst85-standard-170x80-170x81.svg",
        },
      ],
    },
    zicht: {
      kozijnZicht: {
        /*
         * Schema C van de HST 85-catalogus geeft de zichtmaten rechtstreeks:
         * schuifraam links, rechts en boven 100 mm. Daarmee vervalt de van
         * Gealan overgenomen 177 mm.
         */
        vlak: fabrikant(
          100,
          "ALUPLAST HST 85 schema C, horizontale doorsnede — schuifraam links, rechts en boven: 100 mm."
        ),
      },
      vleugelZicht: aanname(0, "Zit verwerkt in de kaderzichtbreedte; nog te ijken."),
      vleugelOverslag: aanname(0, "Zit verwerkt in de kaderzichtbreedte hierboven; nog te ijken."),
      /**
       * De klik-aanslag: een los profiel dat over het metselwerk valt. Een pui
       * wordt standaard stomp geleverd — daarom staat hij per zijde uit — maar
       * hij is per zijde bij te zetten.
       */
      aanslag: aanname(20, "Klik-aanslag hefschuif, 20 mm; bevestigen bij Rebu."),
      tussenstijl: 100,
      glasinleg: 20,
      puistijl: fabrikant(
        100,
        "ALUPLAST HST 85 schema C — de stijl tussen vast deel en vleugel meet dezelfde 100 mm als het kader rondom."
      ),
      ontmoetingsstijl: fabrikant(
        63,
        "ALUPLAST HST 85 schema C, horizontale doorsnede — schuifraam (ontmoetingsstijl): 63 mm."
      ),
    },
  },
  {
    /**
     * Ook bij dit merk is de hefschuif een eigen profielsysteem. De maten
     * hieronder zijn overgenomen van het geijkte Gealan-hefschuifprofiel en dus
     * nog een aanname; overnemen uit de technische catalogus van Kömmerling.
     */
    id: "kommerling-premislide",
    merk: "kommerling",
    merkLabel: "Kömmerling",
    naam: "Schuifpui",
    toepassing: "Hefschuifpui",
    inbouwdiepte: aanname(194, "Bouwdiepte hefschuifkader; bevestigen bij Gealan."),
    kamers: aanname(5, "Bevestigen bij Gealan."),
    uWaarde: aanname(1.3, "Uf hefschuifprofiel; bevestigen bij Gealan."),
    vleugeldikte: aanname(70, "Vleugeldikte hefschuif; bevestigen bij Gealan."),
    horAansluitmaat: aanname(12, "Bevestigen bij Rebu."),
    maxGlasdikte: aanname(52, "Bevestigen bij Gealan."),
    grenzen: {
      minBreedte: aanname(1400, "Een pui van minder dan twee delen bestaat niet; bevestigen."),
      maxBreedte: aanname(6500, "Bovengrens hefschuif; bevestigen bij Gealan."),
      minHoogte: aanname(1200, "Bevestigen bij Rebu."),
      maxHoogte: aanname(2700, "Bevestigen bij Gealan."),
      maxVleugelBreedteDraaikiep: aanname(1800, "Maximale vleugelbreedte hefschuif; bevestigen."),
      maxVleugelHoogteDraaikiep: aanname(2700, "Bevestigen bij Gealan."),
      staalversterkingVanafM2: aanname(2.5, "Bevestigen bij Rebu."),
      geenRoosterBovenM2: aanname(3.5, "Bevestigen bij Rebu."),
      tripleVerplichtVanafM2: null,
      maxGlasgewichtPerVleugelKg: aanname(200, "Hefschuifbeslag draagt fors meer; bevestigen."),
    },
    toegestaneTypes: ["schuifpui"],
    toegestaneGlastypes: [
      "hr-plus-plus-11",
      "hr-plus-plus-10",
      "hr-plus-plus-11-mat",
      "gelaagd-binnen",
      "gelaagd-binnen-mat",
      "gelaagd-buiten",
      "triple-07",
      "triple-06",
      "zonwerend",
      "veiligheidsglas",
    ],
    toegestaanBeslag: ["hefschuif-skg2"],
    // Alleen stomp: een hefschuifkader heeft geen aanslag over het metselwerk.
    uitvoeringen: ["vlak"],
    zicht: {
      kozijnZicht: {
        // Geijkt: AKUGT, 2-delige hefschuif van 2000 breed, delen 1000 + 1000,
        // geeft in beide vakken een glasmaat van 758. Dat is 121 mm per zijde.
        vlak: aanname(
          177,
          "Overgenomen van het geijkte Gealan-hefschuifkader; overnemen uit de technische catalogus van Kömmerling."
        ),
      },
      vleugelZicht: aanname(0, "Zit verwerkt in de kaderzichtbreedte; nog te ijken."),
      vleugelOverslag: aanname(0, "Zit verwerkt in de kaderzichtbreedte hierboven; nog te ijken."),
      /**
       * De klik-aanslag: een los profiel dat over het metselwerk valt. Een pui
       * wordt standaard stomp geleverd — daarom staat hij per zijde uit — maar
       * hij is per zijde bij te zetten.
       */
      aanslag: aanname(20, "Klik-aanslag hefschuif, 20 mm; bevestigen bij Rebu."),
      tussenstijl: 130,
      glasinleg: 20,
      puistijl: aanname(
        130,
        "Overgenomen van het geijkte Gealan-hefschuifprofiel; overnemen uit de technische catalogus van Kömmerling."
      ),
      ontmoetingsstijl: aanname(
        256,
        "Overgenomen van het geijkte Gealan-hefschuifprofiel; overnemen uit de technische catalogus van Kömmerling."
      ),
    },
  },
];

const UITVOERING_LABEL: Record<Uitvoering, string> = {
  aanslag: "Aanslag / blokprofiel (20 mm)",
  vlak: "Vlak / stomp",
  verdiept: "Verdiept",
};

/** Alle profielen: elk systeem × elke uitvoering die het systeem kent. */
export const PROFIELEN: Profiel[] = SYSTEMEN.flatMap((s) =>
  s.uitvoeringen.map((uitvoering): Profiel => ({
    id: `${s.id}-${uitvoering}`,
    systeemId: s.id,
    merk: s.merk,
    merkLabel: s.merkLabel,
    naam: s.naam,
    uitvoering,
    uitvoeringLabel: UITVOERING_LABEL[uitvoering],
    toepassing: s.toepassing,
    inbouwdiepte: s.dieptePerUitvoering?.[uitvoering] ?? s.inbouwdiepte,
    kamers: s.kamers,
    uWaarde: s.uWaarde,
    geometrie: geometrieVoor(uitvoering, s.zicht),
    vleugeldikte: s.vleugeldikte,
    horAansluitmaat: s.horAansluitmaat,
    maxGlasdikte: s.maxGlasPerUitvoering?.[uitvoering] ?? s.maxGlasdikte,
    // De kaart en de combinaties horen bij de uitvoering; uitvoeringen zonder
    // catalogusblad krijgen er bewust geen, zodat de documenten de kaartrijen
    // kunnen weglaten in plaats van lege velden te tonen.
    profielkaart: s.kaartPerUitvoering?.[uitvoering],
    combinaties: s.combinatiesPerUitvoering?.[uitvoering],
    grenzen: s.grenzen,
    toegestaneTypes: s.toegestaneTypes,
    toegestaneGlastypes: s.toegestaneGlastypes,
    toegestaanBeslag: s.toegestaanBeslag,
  }))
);

export function profielOpId(id: string): Profiel | null {
  return PROFIELEN.find((p) => p.id === id) ?? null;
}

/** Alle constanten die nog een aanname zijn — het adminscherm toont deze lijst. */
export function openstaandeAannames(profiel: Profiel): { veld: string; waarde: number; toelichting: string }[] {
  const uit: { veld: string; waarde: number; toelichting: string }[] = [];
  const bekijk = (veld: string, c: Constante) => {
    if (c.bron.soort === "aanname") {
      uit.push({ veld, waarde: c.waarde, toelichting: c.bron.toelichting });
    }
  };
  bekijk("Inbouwdiepte", profiel.inbouwdiepte);
  bekijk("Vleugeldikte", profiel.vleugeldikte);
  bekijk("Hor-aansluitmaat", profiel.horAansluitmaat);
  bekijk("Max. glasdikte", profiel.maxGlasdikte);
  // Sommige geometrievelden zijn nullable (deurvleugel, puistijlen); die slaan
  // we over — een ontbrekende waarde is geen openstaande aanname.
  for (const [naam, c] of Object.entries(profiel.geometrie)) {
    if (c) bekijk(naam, c as Constante);
  }
  for (const [naam, c] of Object.entries(profiel.grenzen)) {
    if (c) bekijk(naam, c as Constante);
  }
  for (const combinatie of profiel.combinaties ?? []) {
    bekijk(`${combinatie.label} — kader`, combinatie.kaderZichtbreedte);
    bekijk(`${combinatie.label} — vleugel`, combinatie.vleugelZichtbreedte);
  }
  return uit;
}
