/**
 * De regelmotor (hoofdstuk 4 van het functioneel ontwerp).
 *
 * Drie reactietypen:
 *   blokkade      — technisch onmogelijk; opslaan wordt geweigerd
 *   waarschuwing  — mogelijk maar risicovol; gebruiker moet bevestigen
 *   escalatie     — valt buiten alle standaardgrenzen; door naar een mens
 *
 * Deze module draait ongewijzigd op de client (voor de directe pop-up) én op de
 * server (borgingslaag 3: de server herhaalt elke controle onafhankelijk).
 * Er zit daarom geen enkele browser- of Node-specifieke code in.
 */
import {
  beslagOpId,
  dorpelOpId,
  glastypeOpId,
  hortypeOpId,
  paneeltypeOpId,
  roosterOpId,
} from "../data/onderdelen";
import { kleurOpId } from "../data/kleuren";
import { BEWEEGBAAR } from "./indeling";
import type {
  Bevinding,
  Configuratie,
  Glastype,
  Indeling,
  Profiel,
  VakMaten,
} from "../types";

/** Context die elke regel meekrijgt. */
export interface RegelContext {
  configuratie: Configuratie;
  profiel: Profiel;
  glastype: Glastype | null;
  vakken: VakMaten[];
  totaalGlasGewichtKg: number | null;
}

interface Regel {
  id: string;
  /** Geeft nul of meer bevindingen terug. */
  evalueer: (ctx: RegelContext) => Bevinding[];
}

const geen: Bevinding[] = [];

/**
 * Vanaf welke hoogte boven de vloer gewoon glas is toegestaan. Daaronder kun je
 * er tegenaan vallen en is gelaagd of gehard glas verplicht. Opgegeven door Rebu.
 */
export const VEILIGHEIDSGLAS_VANAF = 700;

/** De vakken die daadwerkelijk een vulling krijgen, ook binnen een vleugel. */
function vullingsVakkenVan(vakken: VakMaten[]): VakMaten[] {
  return vakken.flatMap((v) => (v.binnenVakken.length > 0 ? v.binnenVakken : [v]));
}

/**
 * Alle vakken die van het kozijnglas afwijken, inclusief de ruiten bínnen een
 * deur of vleugel. De regelmotor leest de indeling zelf, zodat een afwijkend
 * glas nooit ongecontroleerd door de configurator glipt.
 */
function vakkenMetEigenGlas(configuratie: Configuratie): { naam: string; glastypeId: string | null }[] {
  const uit: { naam: string; glastypeId: string | null }[] = [];
  const loop = (knoop: Indeling): void => {
    if (knoop.soort === "splitsing") {
      knoop.kinderen.forEach(loop);
      return;
    }
    if (knoop.glastypeId) uit.push({ naam: knoop.naam, glastypeId: knoop.glastypeId });
    if (knoop.binnenIndeling) loop(knoop.binnenIndeling);
  };
  loop(configuratie.indeling);
  return uit;
}

function blokkade(
  regelId: string,
  stap: number,
  kop: string,
  uitleg: string,
  alternatief: string | null = null
): Bevinding {
  return { regelId, type: "blokkade", kop, uitleg, alternatief, stap };
}

function waarschuwing(
  regelId: string,
  stap: number,
  kop: string,
  uitleg: string,
  alternatief: string | null = null
): Bevinding {
  return { regelId, type: "waarschuwing", kop, uitleg, alternatief, stap };
}

function escalatie(regelId: string, stap: number, kop: string, uitleg: string): Bevinding {
  return { regelId, type: "escalatie", kop, uitleg, alternatief: null, stap };
}

// ---------------------------------------------------------------------------
// De regels
// ---------------------------------------------------------------------------

const REGELS: Regel[] = [
  {
    id: "type-toegestaan",
    evalueer: ({ configuratie, profiel }) => {
      if (profiel.toegestaneTypes.includes(configuratie.kozijnType)) return geen;
      return [
        blokkade(
          "type-toegestaan",
          1,
          "Dit kozijntype kan niet in dit profiel",
          `Het profiel ${profiel.merkLabel} ${profiel.naam} wordt niet geleverd als ${configuratie.kozijnType}.`,
          `Kies een ander profiel, of kies een van de wél leverbare types: ${profiel.toegestaneTypes.join(", ")}.`
        ),
      ];
    },
  },

  {
    id: "maat-binnen-grenzen",
    evalueer: ({ configuratie, profiel }) => {
      const uit: Bevinding[] = [];
      const g = profiel.grenzen;
      const naam = `${profiel.merkLabel} ${profiel.naam}`;

      if (configuratie.breedte < g.minBreedte.waarde) {
        uit.push(
          blokkade(
            "maat-binnen-grenzen",
            2,
            "Kozijn is te smal",
            `De minimale breedte voor ${naam} is ${g.minBreedte.waarde} mm; uw invoer was ${configuratie.breedte} mm.`,
            `Verhoog de breedte naar minimaal ${g.minBreedte.waarde} mm.`
          )
        );
      }
      if (configuratie.breedte > g.maxBreedte.waarde) {
        uit.push(
          blokkade(
            "maat-binnen-grenzen",
            2,
            "Kozijn is te breed",
            `De maximale breedte voor ${naam} is ${g.maxBreedte.waarde} mm; uw invoer was ${configuratie.breedte} mm.`,
            `Verlaag de breedte naar maximaal ${g.maxBreedte.waarde} mm, of splits het kozijn op in twee elementen.`
          )
        );
      }
      if (configuratie.hoogte < g.minHoogte.waarde) {
        uit.push(
          blokkade(
            "maat-binnen-grenzen",
            2,
            "Kozijn is te laag",
            `De minimale hoogte voor ${naam} is ${g.minHoogte.waarde} mm; uw invoer was ${configuratie.hoogte} mm.`,
            `Verhoog de hoogte naar minimaal ${g.minHoogte.waarde} mm.`
          )
        );
      }
      if (configuratie.hoogte > g.maxHoogte.waarde) {
        uit.push(
          blokkade(
            "maat-binnen-grenzen",
            2,
            "Kozijn is te hoog",
            `De maximale hoogte voor ${naam} is ${g.maxHoogte.waarde} mm; uw invoer was ${configuratie.hoogte} mm.`,
            `Verlaag de hoogte naar maximaal ${g.maxHoogte.waarde} mm.`
          )
        );
      }
      return uit;
    },
  },

  {
    id: "schuine-hoogte-geldig",
    evalueer: ({ configuratie, profiel }) => {
      if (configuratie.vorm !== "schuin") return geen;
      if (configuratie.hoogteLaag === null) {
        return [
          blokkade(
            "schuine-hoogte-geldig",
            2,
            "Lage zijde ontbreekt",
            "Bij een schuin kozijn moet u naast de hoge zijde ook de hoogte van de lage zijde opgeven.",
            "Vul de hoogte van de lage zijde in."
          ),
        ];
      }
      if (configuratie.hoogteLaag >= configuratie.hoogte) {
        return [
          blokkade(
            "schuine-hoogte-geldig",
            2,
            "Lage zijde is niet lager",
            `De lage zijde (${configuratie.hoogteLaag} mm) moet kleiner zijn dan de hoge zijde (${configuratie.hoogte} mm).`,
            "Verlaag de lage zijde, of kies vorm 'recht' als beide zijden gelijk zijn."
          ),
        ];
      }
      if (configuratie.hoogteLaag < profiel.grenzen.minHoogte.waarde) {
        return [
          blokkade(
            "schuine-hoogte-geldig",
            2,
            "Lage zijde is te kort",
            `Ook de lage zijde moet minimaal ${profiel.grenzen.minHoogte.waarde} mm zijn; uw invoer was ${configuratie.hoogteLaag} mm.`,
            `Verhoog de lage zijde naar minimaal ${profiel.grenzen.minHoogte.waarde} mm.`
          ),
        ];
      }
      return geen;
    },
  },

  {
    id: "vak-past-in-kozijn",
    evalueer: ({ vakken, configuratie }) => {
      const uit: Bevinding[] = [];
      for (const vak of vakken) {
        if (vak.sponningBreedte <= 0 || vak.sponningHoogte <= 0) {
          uit.push(
            blokkade(
              "vak-past-in-kozijn",
              3,
              `Vak '${vak.naam}' past niet`,
              `Na aftrek van de profielbreedtes blijft er voor vak '${vak.naam}' geen ruimte over (${vak.sponningBreedte} × ${vak.sponningHoogte} mm).`,
              `Maak het kozijn breder of hoger, of haal een stijl weg (nu ${vakken.length} vakken).`
            )
          );
        } else if (vak.glasBreedte <= 0 || vak.glasHoogte <= 0) {
          uit.push(
            blokkade(
              "vak-past-in-kozijn",
              3,
              `Geen glasmaat mogelijk in vak '${vak.naam}'`,
              `Er blijft na aftrek van de profielen geen glasopening over in vak '${vak.naam}'.`,
              "Maak het vak groter of verlaag het aantal vakken."
            )
          );
        }
      }
      return uit;
    },
  },

  {
    id: "vleugel-binnen-grenzen",
    evalueer: ({ vakken, profiel }) => {
      const uit: Bevinding[] = [];
      const g = profiel.grenzen;
      for (const vak of vakken) {
        if (vak.invulling !== "draaikiep") continue;
        if (vak.vleugelBreedte > g.maxVleugelBreedteDraaikiep.waarde) {
          uit.push(
            blokkade(
              "vleugel-binnen-grenzen",
              3,
              `Draaikiepvleugel '${vak.naam}' is te breed`,
              `Maximale breedte voor dit profiel is ${g.maxVleugelBreedteDraaikiep.waarde} mm bij een draaikiepvleugel; deze vleugel wordt ${vak.vleugelBreedte} mm.`,
              `Verdeel het kozijn in meer vakken, of maak dit vak smaller dan ${g.maxVleugelBreedteDraaikiep.waarde} mm.`
            )
          );
        }
        if (vak.vleugelHoogte > g.maxVleugelHoogteDraaikiep.waarde) {
          uit.push(
            blokkade(
              "vleugel-binnen-grenzen",
              3,
              `Draaikiepvleugel '${vak.naam}' is te hoog`,
              `Maximale vleugelhoogte voor dit profiel is ${g.maxVleugelHoogteDraaikiep.waarde} mm; deze vleugel wordt ${vak.vleugelHoogte} mm.`,
              `Verlaag de kozijnhoogte of voeg een bovenlicht toe zodat de vleugel korter wordt.`
            )
          );
        }
      }
      return uit;
    },
  },

  {
    id: "draairichting-verplicht",
    evalueer: ({ vakken }) => {
      const uit: Bevinding[] = [];
      for (const vak of vakken) {
        if (!BEWEEGBAAR.includes(vak.invulling)) continue;
        if (vak.draairichting === "geen") {
          uit.push(
            blokkade(
              "draairichting-verplicht",
              3,
              `Draairichting ontbreekt bij '${vak.naam}'`,
              "Een beweegbaar vak moet een draairichting hebben, anders kan de fabriek het beslag niet plaatsen.",
              "Kies links of rechts draaiend voor dit vak."
            )
          );
        }
      }
      return uit;
    },
  },

  {
    id: "glastype-toegestaan",
    evalueer: ({ configuratie, profiel, glastype }) => {
      if (!configuratie.glas.meegeleverd) return geen;
      if (!glastype) {
        return [
          blokkade(
            "glastype-toegestaan",
            5,
            "Geen glastype gekozen",
            "U heeft aangegeven dat glas wordt meegeleverd, maar er is nog geen glastype geselecteerd.",
            "Kies een glastype, of zet glas op 'niet meegeleverd' — de glasmaat blijft dan gewoon berekend."
          ),
        ];
      }
      const uit: Bevinding[] = [];
      if (!profiel.toegestaneGlastypes.includes(glastype.id)) {
        uit.push(
          blokkade(
            "glastype-toegestaan",
            5,
            "Dit glas past niet in dit profiel",
            `${glastype.naam} is niet toegestaan in ${profiel.merkLabel} ${profiel.naam}.`,
            "Kies een ander glastype of een profiel met meer sponningdiepte."
          )
        );
      }

      // Vakken met een eigen glassoort tellen even hard mee als het kozijnglas.
      for (const vak of vakkenMetEigenGlas(configuratie)) {
        const eigen = glastypeOpId(vak.glastypeId);
        if (!eigen) continue;
        if (!profiel.toegestaneGlastypes.includes(eigen.id)) {
          uit.push(
            blokkade(
              "glastype-toegestaan",
              5,
              `Het glas in '${vak.naam}' past niet in dit profiel`,
              `${eigen.naam} is niet toegestaan in ${profiel.merkLabel} ${profiel.naam}.`,
              "Kies een ander glastype voor dit vak, of zet het terug op het glas van het kozijn."
            )
          );
        }
        // De glasdikte wordt in 'glasdikte-past-in-sponning' bewaakt — óók
        // wanneer het kozijnglas niet wordt meegeleverd.
      }
      return uit;
    },
  },

  {
    /**
     * De maximale glasdikte hangt aan de gekozen uitvoering (het blokprofiel
     * van IDEAL 7000 neemt 41 mm, de vlakke uitvoering 52 mm). Deze regel
     * draait daarom altijd — ook wanneer het glas niet wordt meegeleverd:
     * een eerder gekozen glastype mag nooit stilletjes blijven staan wanneer
     * het door een wissel van uitvoering niet meer in de sponning past.
     */
    id: "glasdikte-past-in-sponning",
    evalueer: ({ configuratie, profiel, glastype }) => {
      const uit: Bevinding[] = [];
      const grens = profiel.maxGlasdikte.waarde;

      if (glastype && glastype.dikte > grens) {
        uit.push(
          blokkade(
            "glasdikte-past-in-sponning",
            5,
            "Glas is te dik voor de sponning",
            `${glastype.naam} is ${glastype.dikte} mm dik; ${profiel.merkLabel} ${profiel.naam} neemt maximaal ${grens} mm.`,
            `Kies een dunner glaspakket, of stap over op een profiel met een diepere sponning.`
          )
        );
      }

      // Vakken met een eigen glassoort tellen even hard mee als het kozijnglas.
      for (const vak of vakkenMetEigenGlas(configuratie)) {
        const eigen = glastypeOpId(vak.glastypeId);
        if (!eigen || eigen.dikte <= grens) continue;
        uit.push(
          blokkade(
            "glasdikte-past-in-sponning",
            5,
            `Het glas in '${vak.naam}' is te dik voor de sponning`,
            `${eigen.naam} is ${eigen.dikte} mm dik; ${profiel.merkLabel} ${profiel.naam} neemt maximaal ${grens} mm.`,
            "Kies een dunner glaspakket voor dit vak."
          )
        );
      }
      return uit;
    },
  },

  {
    id: "ruitmaat-binnen-glasgrens",
    evalueer: ({ vakken, glastype }) => {
      if (!glastype) return geen;
      const uit: Bevinding[] = [];
      for (const vak of vakken) {
        if (vak.vulsoort !== "glas") continue;
        if (vak.glasBreedte > glastype.maxRuitBreedte || vak.glasHoogte > glastype.maxRuitHoogte) {
          uit.push(
            blokkade(
              "ruitmaat-binnen-glasgrens",
              5,
              `Ruit in '${vak.naam}' is te groot voor dit glastype`,
              `${glastype.naam} wordt geleverd tot ${glastype.maxRuitBreedte} × ${glastype.maxRuitHoogte} mm; deze ruit wordt ${vak.glasBreedte} × ${vak.glasHoogte} mm.`,
              "Verdeel het vak in tweeën of kies een glastype dat in grotere maten leverbaar is."
            )
          );
        }
      }
      return uit;
    },
  },

  {
    /**
     * Letselveilig glas onder de 70 cm.
     *
     * Begint het glas lager dan 700 mm boven de vloer, dan kun je ertegenaan
     * vallen en moet het gelaagd of gehard zijn. Een schuifpui en een
     * openslaande deur beginnen per definitie op de vloer, dus daar geldt het
     * altijd. De grens van 700 mm is door Rebu opgegeven.
     */
    id: "veiligheidsglas-verplicht",
    evalueer: ({ configuratie, glastype, vakken }) => {
      if (!configuratie.glas.meegeleverd) return geen;

      const opDeVloer =
        configuratie.kozijnType === "schuifpui" ||
        configuratie.kozijnType === "voordeur" ||
        configuratie.kozijnType === "achterdeur";
      const laag = configuratie.borstweringHoogte < VEILIGHEIDSGLAS_VANAF;
      if (!opDeVloer && !laag) return geen;

      const reden = opDeVloer
        ? `Een ${configuratie.kozijnType} begint op de vloer`
        : `Het glas begint ${configuratie.borstweringHoogte} mm boven de vloer`;

      const uit: Bevinding[] = [];
      for (const vak of vullingsVakkenVan(vakken)) {
        if (vak.vulsoort !== "glas") continue;
        const soort = glastypeOpId(vak.glastypeId) ?? glastype;
        if (!soort || soort.veilig) continue;
        uit.push(
          blokkade(
            "veiligheidsglas-verplicht",
            5,
            `In '${vak.naam}' is letselveilig glas verplicht`,
            `${reden}; onder ${VEILIGHEIDSGLAS_VANAF} mm moet het glas gelaagd of gehard zijn. ${soort.naam} is dat niet.`,
            "Kies gelaagd glas of veiligheidsglas (gehard) voor dit vak."
          )
        );
      }
      return uit;
    },
  },

  {
    id: "triple-verplicht",
    evalueer: ({ profiel, glastype, vakken, configuratie }) => {
      const grens = profiel.grenzen.tripleVerplichtVanafM2;
      if (!grens || !configuratie.glas.meegeleverd || !glastype || glastype.triple) return geen;
      const teGroot = vakken.filter((v) => v.vleugelOppervlakM2 > grens.waarde);
      if (teGroot.length === 0) return geen;
      return [
        blokkade(
          "triple-verplicht",
          5,
          "Triple glas is hier verplicht",
          `Bij ${profiel.merkLabel} ${profiel.naam} is triple glas verplicht boven ${grens.waarde} m² vleugeloppervlak. ${teGroot
            .map((v) => `'${v.naam}' is ${v.vleugelOppervlakM2} m²`)
            .join(", ")}.`,
          "Kies Triple 0.7 of Triple 0.6, of maak de vleugels kleiner."
        ),
      ];
    },
  },

  {
    id: "glasgewicht-per-vleugel",
    evalueer: ({ profiel, vakken, configuratie }) => {
      const grens = profiel.grenzen.maxGlasgewichtPerVleugelKg.waarde;
      const uit: Bevinding[] = [];
      for (const vak of vakken) {
        if (!BEWEEGBAAR.includes(vak.invulling) || vak.glasGewichtKg === null) continue;
        if (vak.glasGewichtKg > grens * 1.25) {
          uit.push(
            blokkade(
              "glasgewicht-per-vleugel",
              5,
              `Glas in '${vak.naam}' is te zwaar`,
              `De ruit weegt ${vak.glasGewichtKg} kg; het beslag van dit profiel draagt maximaal ${grens} kg per vleugel, ook met versteviging.`,
              "Kies een lichter glaspakket of maak de vleugel kleiner."
            )
          );
        } else if (vak.glasGewichtKg > grens) {
          uit.push(
            waarschuwing(
              "glasgewicht-per-vleugel",
              5,
              `Zwaar glas in '${vak.naam}'`,
              `De ruit weegt ${vak.glasGewichtKg} kg, boven de grens van ${grens} kg voor standaardbeslag.${
                configuratie.staalversterking
                  ? " Met de gekozen staalversterking is dit uitvoerbaar."
                  : ""
              }`,
              configuratie.staalversterking
                ? null
                : "Zet staalversterking aan bij stap 6, of kies een lichter glaspakket."
            )
          );
        }
      }
      return uit;
    },
  },

  {
    id: "staalversterking-verplicht",
    evalueer: ({ profiel, vakken, configuratie }) => {
      const grens = profiel.grenzen.staalversterkingVanafM2.waarde;
      const groot = vakken.filter((v) => v.vleugelOppervlakM2 > grens);
      if (groot.length === 0 || configuratie.staalversterking) return geen;
      return [
        waarschuwing(
          "staalversterking-verplicht",
          6,
          "Staalversterking nodig",
          `Boven ${grens} m² vleugeloppervlak schrijft dit profiel staalversterking voor. ${groot
            .map((v) => `'${v.naam}' is ${v.vleugelOppervlakM2} m²`)
            .join(", ")}.`,
          "Zet staalversterking aan — het systeem rekent die dan automatisch mee in de prijs."
        ),
      ];
    },
  },

  {
    id: "rooster-toegestaan",
    evalueer: ({ profiel, vakken }) => {
      const uit: Bevinding[] = [];
      const grens = profiel.grenzen.geenRoosterBovenM2.waarde;

      for (const vak of vakken) {
        if (!vak.roosterId) continue;
        if (!roosterOpId(vak.roosterId)) {
          uit.push(
            blokkade(
              "rooster-toegestaan",
              3,
              `Onbekend rooster in '${vak.naam}'`,
              "Het gekozen rooster staat niet in de productdatabase.",
              "Kies een rooster uit de lijst."
            )
          );
          continue;
        }
        // Een rooster ín de beglazing kan niet boven een bepaald vleugeloppervlak.
        // Een rooster als eigen vak tussen stijlen heeft die beperking niet.
        if (vak.vulsoort !== "rooster" && vak.vleugelOppervlakM2 > grens) {
          uit.push(
            blokkade(
              "rooster-toegestaan",
              3,
              `Rooster in het glas niet toegestaan bij deze maat`,
              `Bij ${profiel.merkLabel} ${profiel.naam} mag er geen rooster in de beglazing boven ${grens} m² vleugeloppervlak; '${vak.naam}' is ${vak.vleugelOppervlakM2} m².`,
              "Zet het rooster als eigen vak tussen stijlen, of laat het weg."
            )
          );
        }
      }
      return uit;
    },
  },

  {
    id: "paneeldikte-past-in-sponning",
    evalueer: ({ profiel, vakken }) => {
      const uit: Bevinding[] = [];
      const grens = profiel.maxGlasdikte.waarde;

      const alle = vakken.flatMap((v) => [v, ...v.binnenVakken]);
      for (const vak of alle) {
        if (vak.vulsoort !== "paneel") continue;
        const paneel = paneeltypeOpId(vak.paneeltypeId);
        if (!paneel || paneel.dikte <= grens) continue;
        uit.push(
          blokkade(
            "paneeldikte-past-in-sponning",
            3,
            `Paneel in '${vak.naam}' is te dik`,
            `${paneel.naam} is ${paneel.dikte} mm; ${profiel.merkLabel} ${profiel.naam} neemt maximaal ${grens} mm in de sponning.`,
            "Kies een dunner paneel, of een profiel met een diepere sponning."
          )
        );
      }
      return uit;
    },
  },

  {
    /**
     * In een hefschuifpui kan een ventilatierooster alleen in de twee buitenste
     * vakken — dat zijn de vaste delen. Boven een schuivende vleugel kan het
     * niet: daar moet de vleugel langs kunnen lopen. En het rooster moet een
     * vlakke uitvoering zijn; een opbouwrooster steekt uit en zit de vleugel in
     * de weg.
     */
    id: "rooster-in-pui",
    evalueer: ({ configuratie, vakken }) => {
      if (configuratie.kozijnType !== "schuifpui") return geen;
      const uit: Bevinding[] = [];

      vakken.forEach((vak, i) => {
        if (!vak.roosterId) return;
        const buitenste = i === 0 || i === vakken.length - 1;
        if (!buitenste) {
          uit.push(
            blokkade(
              "rooster-in-pui",
              6,
              `In '${vak.naam}' kan geen rooster`,
              "In een schuifpui kan een ventilatierooster alleen in de twee buitenste vakken; dat zijn de vaste delen. Boven een schuivende vleugel is er geen ruimte, want die moet er langs kunnen lopen.",
              "Zet het rooster in het linker- of rechterbuitenvak."
            )
          );
          return;
        }
        if (vak.roosterpositie === "boven-in-kozijn" && vak.invulling === "schuifvleugel") {
          uit.push(
            blokkade(
              "rooster-in-pui",
              6,
              `Het rooster in '${vak.naam}' kan niet boven in het kozijn`,
              "Boven een schuivende vleugel zit de rail; daar is geen ruimte voor een rooster.",
              "Zet het rooster in de beglazing."
            )
          );
        }
        const rooster = roosterOpId(vak.roosterId);
        if (rooster && !rooster.vlak) {
          uit.push(
            blokkade(
              "rooster-in-pui",
              6,
              `Het rooster in '${vak.naam}' moet vlak zijn`,
              `${rooster.naam} is een opbouwrooster; dat steekt uit en dan loopt de schuivende vleugel er niet meer langs.`,
              "Kies het vlakke rooster, dat in de beglazing ligt."
            )
          );
        }
      });
      return uit;
    },
  },

  {
    id: "roostervak-heeft-rooster",
    evalueer: ({ vakken }) => {
      const zonder = vakken.filter((v) => v.vulsoort === "rooster" && !v.roosterId);
      if (zonder.length === 0) return geen;
      return [
        blokkade(
          "roostervak-heeft-rooster",
          3,
          "Roostervak zonder rooster",
          `De vakken ${zonder.map((v) => `'${v.naam}'`).join(", ")} zijn als rooster ingedeeld, maar er is geen roostertype gekozen.`,
          "Kies een roostertype, of geef het vak een andere invulling."
        ),
      ];
    },
  },

  {
    id: "beslag-compatibel",
    evalueer: ({ configuratie, profiel }) => {
      if (!configuratie.beslag.beslagId) return geen;
      const beslag = beslagOpId(configuratie.beslag.beslagId);
      if (!beslag) {
        return [
          blokkade("beslag-compatibel", 6, "Onbekend beslag", "Het gekozen beslag staat niet in de productdatabase.", "Kies beslag uit de lijst."),
        ];
      }
      const uit: Bevinding[] = [];
      if (!profiel.toegestaanBeslag.includes(beslag.id)) {
        uit.push(
          blokkade(
            "beslag-compatibel",
            6,
            "Dit beslag past niet op dit profiel",
            `${beslag.naam} is niet compatibel met ${profiel.merkLabel} ${profiel.naam}.`,
            "Kies beslag dat wel bij dit profiel hoort."
          )
        );
      }
      if (!beslag.voorTypes.includes(configuratie.kozijnType)) {
        uit.push(
          blokkade(
            "beslag-compatibel",
            6,
            "Dit beslag hoort niet bij dit kozijntype",
            `${beslag.naam} is bedoeld voor: ${beslag.voorTypes.join(", ")}. U configureert een ${configuratie.kozijnType}.`,
            "Kies beslag dat bij dit kozijntype past."
          )
        );
      }
      return uit;
    },
  },

  {
    id: "cilinder-vereist-beslag",
    evalueer: ({ configuratie }) => {
      // Een cilinder wordt geleverd ín een sluiting. Zonder gekozen beslag is
      // 'cilinder meeleveren' niet uit te voeren, en zou de offerte de klant
      // beloven wat de fabrieksorder niet kan produceren.
      if (!configuratie.beslag.cilinderMeegeleverd || configuratie.beslag.beslagId !== null) {
        return geen;
      }
      return [
        blokkade(
          "cilinder-vereist-beslag",
          6,
          "Cilinder meeleveren kan niet zonder beslag",
          "Een cilinder wordt geleverd in een sluiting. Zolang er geen beslag is gekozen, kan de fabriek de cilinder niet plaatsen.",
          "Kies beslag, of zet de cilinder op 'eigen cilinder' — de cilindermaat blijft dan gewoon berekend."
        ),
      ];
    },
  },

  {
    id: "hor-compatibel",
    evalueer: ({ configuratie, vakken }) => {
      const metHor = vakken.filter((v) => v.horMeegeleverd);
      if (metHor.length === 0) return geen;

      if (!configuratie.hortypeId) {
        return [
          blokkade(
            "hor-compatibel",
            6,
            "Geen hortype gekozen",
            `Op ${metHor.map((v) => `'${v.naam}'`).join(", ")} gaat een hor mee, maar er is nog geen hortype geselecteerd.`,
            "Kies een hortype, of zet de hor uit — de hormaat blijft dan gewoon berekend."
          ),
        ];
      }
      const hor = hortypeOpId(configuratie.hortypeId);
      if (!hor) return geen;
      if (!hor.voorTypes.includes(configuratie.kozijnType)) {
        return [
          blokkade(
            "hor-compatibel",
            6,
            "Deze hor past niet bij dit kozijntype",
            `${hor.naam} wordt geleverd voor: ${hor.voorTypes.join(", ")}.`,
            "Kies een ander hortype."
          ),
        ];
      }
      return geen;
    },
  },

  {
    id: "dorpel-compatibel",
    evalueer: ({ configuratie }) => {
      if (!configuratie.dorpelId) return geen;
      const dorpel = dorpelOpId(configuratie.dorpelId);
      if (!dorpel) return geen;
      if (!dorpel.voorTypes.includes(configuratie.kozijnType)) {
        return [
          blokkade(
            "dorpel-compatibel",
            6,
            "Deze dorpel past niet bij dit kozijntype",
            `${dorpel.naam} wordt geleverd voor: ${dorpel.voorTypes.join(", ")}.`,
            "Kies een dorpel die bij dit kozijntype hoort."
          ),
        ];
      }
      return geen;
    },
  },

  {
    id: "kleur-leverbaar",
    evalueer: ({ configuratie, profiel }) => {
      const uit: Bevinding[] = [];
      const binnen = kleurOpId(configuratie.kleurBinnenId);
      const buiten = kleurOpId(configuratie.kleurBuitenId);

      for (const [zijde, kleur, id] of [
        ["binnenzijde", binnen, configuratie.kleurBinnenId],
        ["buitenzijde", buiten, configuratie.kleurBuitenId],
      ] as const) {
        if (!kleur) {
          uit.push(
            blokkade(
              "kleur-leverbaar",
              4,
              `Onbekende kleur aan de ${zijde}`,
              `De kleur '${id}' staat niet in de kleurencatalogus.`,
              "Kies een kleur uit de catalogus."
            )
          );
        } else if (kleur.merk !== profiel.merk) {
          uit.push(
            blokkade(
              "kleur-leverbaar",
              4,
              `Kleur aan de ${zijde} hoort bij een ander merk`,
              `${kleur.naam} komt uit de ${kleur.merkLabel}-catalogus, maar u configureert een ${profiel.merkLabel}-profiel. Folies zijn merkgebonden.`,
              `Kies een kleur uit de ${profiel.merkLabel}-catalogus.`
            )
          );
        }
      }
      return uit;
    },
  },

  {
    id: "vleugelkleur-leverbaar",
    evalueer: ({ configuratie, profiel }) => {
      const uit: Bevinding[] = [];
      for (const [zijde, id] of [
        ["binnenzijde", configuratie.vleugelKleurBinnenId],
        ["buitenzijde", configuratie.vleugelKleurBuitenId],
      ] as const) {
        // Geen eigen vleugelkleur is de normale situatie: de vleugel volgt het kader.
        if (id === null) continue;
        const kleur = kleurOpId(id);
        if (!kleur) {
          uit.push(
            blokkade(
              "vleugelkleur-leverbaar",
              4,
              `Onbekende vleugelkleur aan de ${zijde}`,
              `De kleur '${id}' staat niet in de kleurencatalogus.`,
              "Kies een kleur uit de catalogus of laat de vleugel de kozijnkleur volgen."
            )
          );
        } else if (kleur.merk !== profiel.merk) {
          uit.push(
            blokkade(
              "vleugelkleur-leverbaar",
              4,
              `Vleugelkleur aan de ${zijde} hoort bij een ander merk`,
              `${kleur.naam} komt uit de ${kleur.merkLabel}-catalogus, maar u configureert een ${profiel.merkLabel}-profiel.`,
              `Kies een kleur uit de ${profiel.merkLabel}-catalogus.`
            )
          );
        }
      }
      return uit;
    },
  },

  {
    /**
     * De onderste sponning vangt al het water dat langs het glas naar beneden
     * loopt. Zonder afwatering blijft dat staan. Dat is geen blokkade — een
     * binnenkozijn of een stelkozijn dat nog afgetimmerd wordt heeft die sleuven
     * niet nodig — maar het mag nooit ongemerkt gebeuren.
     */
    id: "afwatering-aanwezig",
    evalueer: ({ configuratie }) => {
      if (configuratie.afwatering !== "geen") return geen;
      const binnentoepassing =
        configuratie.kozijnType === "stelkozijn" || configuratie.kozijnType === "renovatiekozijn";
      return [
        waarschuwing(
          "afwatering-aanwezig",
          6,
          "Dit kozijn wordt zonder afwatering geleverd",
          binnentoepassing
            ? "Bij dit type kan dat kloppen, bijvoorbeeld wanneer het kozijn binnen staat of nog wordt afgetimmerd. Staat het in de buitengevel, dan blijft er water in de onderste sponning staan."
            : "Er komen geen afwateringssleuven in de onderregel. Water dat langs het glas naar beneden loopt kan dan niet weg en blijft in de sponning staan.",
          "Kies zichtbare sleuven, of sleuven met een afdekkap in de kozijnkleur."
        ),
      ];
    },
  },

  {
    id: "subsidie-indicatie",
    evalueer: ({ configuratie, glastype }) => {
      if (!configuratie.glas.meegeleverd || !glastype || !glastype.subsidiabel) return geen;
      return [
        waarschuwing(
          "subsidie-indicatie",
          5,
          "Mogelijk subsidiabel",
          `${glastype.naam} (U = ${glastype.uWaarde} W/m²K) valt vermoedelijk binnen de ISDE-regeling voor glasisolatie. De definitieve toekenning hangt af van het aantal m² en de overige maatregelen in de woning.`,
          "Laat de eindklant dit vóór opdracht controleren op rvo.nl."
        ),
      ];
    },
  },

  {
    id: "aantal-plausibel",
    evalueer: ({ configuratie }) => {
      if (configuratie.aantal >= 1 && Number.isInteger(configuratie.aantal)) return geen;
      return [
        blokkade(
          "aantal-plausibel",
          8,
          "Ongeldig aantal",
          `Het aantal moet een heel getal van 1 of meer zijn; nu staat er ${configuratie.aantal}.`,
          "Vul een aantal van minimaal 1 in."
        ),
      ];
    },
  },

  // -------------------------------------------------------------------------
  // Escalatie naar mens (regel 4 uit hoofdstuk 1)
  // -------------------------------------------------------------------------
  {
    id: "escalatie-buiten-grenzen",
    evalueer: ({ configuratie, profiel, vakken }) => {
      const g = profiel.grenzen;
      const redenen: string[] = [];

      // Fors buiten de maatgrenzen: dan is aanpassen binnen de configurator
      // geen realistische route meer.
      if (configuratie.breedte > g.maxBreedte.waarde * 1.15) {
        redenen.push(`breedte ${configuratie.breedte} mm ver boven het maximum van ${g.maxBreedte.waarde} mm`);
      }
      if (configuratie.hoogte > g.maxHoogte.waarde * 1.15) {
        redenen.push(`hoogte ${configuratie.hoogte} mm ver boven het maximum van ${g.maxHoogte.waarde} mm`);
      }
      // Een pui heeft van nature meer vakken; die grens ligt daar dus hoger.
      const maxVakken = configuratie.kozijnType === "schuifpui" ? 8 : 6;
      if (vakken.length > maxVakken) {
        redenen.push(`${vakken.length} vakken in één element`);
      }
      /*
       * Boven een bepaald oppervlak wordt een element te zwaar en te kwetsbaar
       * om zonder overleg door te rekenen. Bij een pui ligt die grens veel
       * hoger: een hefschuif van 5000 × 2300 is 11,5 m² en volstrekt gangbaar —
       * het gewicht zit daar in de vleugels, en die hebben hun eigen grens.
       */
      const oppervlak = (configuratie.breedte * configuratie.hoogte) / 1_000_000;
      const grensM2 = configuratie.kozijnType === "schuifpui" ? 20 : 8;
      if (oppervlak > grensM2) {
        redenen.push(`totaal oppervlak ${Math.round(oppervlak * 10) / 10} m²`);
      }
      const zeerSmal = vakken.filter((v) => v.sponningBreedte > 0 && v.sponningBreedte < 200);
      if (zeerSmal.length > 0) {
        redenen.push(`zeer smalle vakken (${zeerSmal.map((v) => `${v.naam}: ${v.sponningBreedte} mm`).join(", ")})`);
      }

      if (redenen.length === 0) return geen;
      return [
        escalatie(
          "escalatie-buiten-grenzen",
          2,
          "Deze situatie valt buiten onze standaardmogelijkheden",
          `Wat u wilt maken kan technisch best kunnen, maar valt buiten wat de configurator zelfstandig kan doorrekenen: ${redenen.join("; ")}. Neem contact op — wij kijken er persoonlijk naar en sturen uw configuratie mee.`
        ),
      ];
    },
  },
];

/**
 * Draait alle regels en geeft de bevindingen terug, gesorteerd op ernst
 * (blokkades eerst) en daarbinnen op configuratorstap.
 */
export function evalueerRegels(ctx: RegelContext): Bevinding[] {
  const bevindingen = REGELS.flatMap((regel) => regel.evalueer(ctx));
  const ernst = { blokkade: 0, escalatie: 1, waarschuwing: 2 } as const;
  return bevindingen.sort((a, b) => ernst[a.type] - ernst[b.type] || a.stap - b.stap);
}

/** Kortweg: mag deze configuratie opgeslagen worden? */
export function heeftBlokkade(bevindingen: Bevinding[]): boolean {
  return bevindingen.some((b) => b.type === "blokkade");
}

/** Valt deze configuratie buiten alle standaardgrenzen? */
export function heeftEscalatie(bevindingen: Bevinding[]): boolean {
  return bevindingen.some((b) => b.type === "escalatie");
}

/** Alle regel-ids, voor de regressietest en het adminscherm. */
export const REGEL_IDS = REGELS.map((r) => r.id);
