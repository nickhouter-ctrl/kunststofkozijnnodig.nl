/**
 * Het aanzicht van een kozijn.
 *
 * Dit is de gedeelde tekenlaag onder zowel de technische tekening als het
 * klikbare bewerkvlak in de configurator. Beide tekenen precies dezelfde
 * geometrie (regel 1) — het verschil zit alleen in de maatlijnen en de
 * klikvlakken die eroverheen komen.
 *
 * Wat er getekend wordt, van buiten naar binnen:
 *   1. de kozijnlijst, met zijn werkelijke zichtbreedte
 *   2. per vak de vleugel, die met de aanslag óver het kozijn valt — dat is de
 *      verbinding die zichtbaar hoort te zijn
 *   3. het glaslat-vlak en daarbinnen het glas
 *   4. de stijlen tussen de vakken
 *
 * De profielvlakken worden gevuld met de daadwerkelijk gekozen folie: de
 * swatch-afbeelding uit de kleurencatalogus, als patroon. Zo zie je meteen dat
 * een kozijn antraciet met houtnerf wordt, niet alleen dat er 'AP03' staat.
 */
import { berekenGeometrie, type KozijnDeel, type StijlMaten } from "./maten";
import { maatHorizontaal, maatVerticaal, stijlVoor } from "./svg";
import { esc, lijn, rechthoek, tekst } from "./svg";
import { BEWEEGBAAR } from "./indeling";
import {
  AFWATERING,
  STANDAARD_PANEEL,
  aantalAfwateringssleuven,
  glastypeOpId,
  paneeltypeOpId,
  roosterOpId,
} from "../data/onderdelen";
import { kleurOpId } from "../data/kleuren";
import type { Berekening, Kleur, Millimeter, VakMaten, Zijdeafwerking } from "../types";

export type Zijde = "binnen" | "buiten";

const LIJN = "#2a2f2c";
const LIJN_FIJN = "#7b817d";
/** Lijnkleuren voor op een donkere folie; een zwarte lijn valt daar weg. */
const LIJN_LICHT = "#f4f3ef";
const LIJN_FIJN_LICHT = "#b9beb9";

/**
 * Is deze folie zo donker dat een zwarte contourlijn erin verdwijnt?
 *
 * De hex is de gemiddelde kleur van de swatch (zie scripts/kleur-gemiddelde.mjs).
 * Bij antraciet, zwart of dennengroen komt die ruim onder de grens en tekent de
 * hele constructie — stijlen, vleugels, roosters — met een lichte lijn.
 */
function isDonkereFolie(kleur: Kleur | null): boolean {
  const hex = kleur?.hex;
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
}
const GLAS = "#d7e6ec";
const GLAS_LEEG = "#f2f2ef";
/** Een aparte onderdorpel wordt donker getekend; zo is hij meteen te herkennen. */
const DORPEL = "#4a4f4c";

/** Een klikbaar gebied in het bewerkvlak. */
export type Klikvlak =
  | { soort: "vak"; id: string; naam: string; x: number; y: number; breedte: number; hoogte: number }
  | {
      soort: "stijl";
      splitsingId: string;
      as: StijlMaten["as"];
      index: number;
      x: number;
      y: number;
      breedte: number;
      hoogte: number;
      /** Maat van het deel vóór en ná de stijl — nodig om te kunnen slepen. */
      vorigeMaat: number;
      volgendeMaat: number;
    }
  | {
      soort: "binnenvak";
      /** Het vak (de vleugel) waar dit deelvak in zit. */
      vakId: string;
      id: string;
      naam: string;
      x: number;
      y: number;
      breedte: number;
      hoogte: number;
    }
  | { soort: "kozijn"; zijde: KozijnDeel["zijde"]; x: number; y: number; breedte: number; hoogte: number };

export interface AanzichtOpties {
  /** Maatlijnen meetekenen, inclusief de hartmaten van de stijlen. */
  maten?: boolean;
}

/** De ruimte rondom de tekening die de maatlijnen nodig hebben. */
export interface Marges {
  links: number;
  rechts: number;
  boven: number;
  onder: number;
}

/**
 * Een maat die in de tekening staat en die je daar ook kunt aanpassen.
 * `doel` beschrijft wát er verandert als je de waarde overtypt.
 */
export type Maatlabel = {
  /** Positie van het label in tekencoördinaten. */
  x: number;
  y: number;
  waarde: number;
  /** Alleen bij een hartmaat, om het label te onderscheiden. */
  prefix?: string;
} & (
  | {
      doel: "hart";
      splitsingId: string;
      index: number;
      /** Vanaf welke kozijnrand deze hartmaat gemeten is. */
      vanaf: "links" | "rechts" | "boven" | "onder";
    }
  | { doel: "totaalBreedte" }
  | { doel: "totaalHoogte" }
  | { doel: "hoogteLaag" }
);

export interface AanzichtResultaat {
  /** De tekening zelf, zonder <svg>-omhulsel. */
  inhoud: string;
  /** Patroondefinities voor de foliekleuren. */
  defs: string;
  /** Alle aanklikbare gebieden, in tekencoördinaten (mm). */
  klikvlakken: Klikvlak[];
  /** De bounding box van het kozijn. */
  breedte: Millimeter;
  hoogte: Millimeter;
  /** Hoeveel ruimte de maatlijnen rondom de tekening innemen. */
  marges: Marges;
  /** De maten die in de tekening staan, met wat ze aansturen. */
  maatlabels: Maatlabel[];
}

/** Bouwt een SVG-patroon van de swatch-afbeelding van een folie. */
function foliePatroon(id: string, kleur: Kleur | null, schaal: number): string {
  if (!kleur) return "";
  if (kleur.swatch) {
    // De swatch is een foto van de folie; op ware grootte herhaalt hij te vaak,
    // dus hij wordt geschaald naar iets dat op een profiel realistisch oogt.
    const maat = 240 * schaal;
    // Onder de swatch ligt een effen vlak. Kan de afbeelding even niet geladen
    // worden, dan blijft het profiel gewoon gevuld in plaats van dat er een
    // raster van lege plekken in de tekening verschijnt.
    return `<pattern id="${id}" width="${maat}" height="${maat}" patternUnits="userSpaceOnUse">
      <rect width="${maat}" height="${maat}" fill="${esc(kleur.hex ?? "#ece9e1")}"/>
      <image href="${esc(kleur.swatch)}" x="0" y="0" width="${maat}" height="${maat}" preserveAspectRatio="xMidYMid slice"/>
    </pattern>`;
  }
  if (kleur.hex) {
    return `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${esc(kleur.hex)}"/></pattern>`;
  }
  return "";
}

/** Het openingssymbool: de punt van de driehoek wijst naar de scharnierzijde. */
function openingssymbool(
  vak: VakMaten,
  dikte: number,
  streep: string,
  LIJN: string,
  naarKijker: boolean
): string {
  if (!BEWEEGBAAR.includes(vak.invulling)) return "";

  const x = vak.x;
  const b = vak.breedte;
  const yBoven = Math.min(vak.topLinks, vak.topRechts);
  const h = vak.onderkant - yBoven;
  const delen: string[] = [];

  if (vak.invulling === "schuifvleugel") {
    // Een schuifvleugel krijgt een pijl in de schuifrichting, geen driehoek.
    const y = yBoven + h / 2;
    const naarLinks = vak.draairichting === "links";
    const van = naarLinks ? x + b * 0.75 : x + b * 0.25;
    const naar = naarLinks ? x + b * 0.25 : x + b * 0.75;
    const punt = naarLinks ? -b * 0.08 : b * 0.08;
    delen.push(lijn(van, y, naar, y, { kleur: LIJN, dikte }));
    delen.push(
      `<path d="M ${naar} ${y} l ${punt} ${-b * 0.05} l 0 ${b * 0.1} z" fill="${LIJN}"/>`
    );
    return delen.join("");
  }

  const draaibaar = vak.invulling === "draaikiep" || vak.invulling === "deur";
  const kiepbaar = vak.invulling === "draaikiep" || vak.invulling === "valraam";
  /**
   * De tekenafspraak: draait de vleugel naar de kijker toe, dan zijn de
   * openingslijnen doorgetrokken; draait hij van de kijker af, dan gestreept.
   * Zo lees je uit één blik of een deur naar binnen of naar buiten opengaat.
   */
  const lijnStreep = naarKijker ? undefined : streep;

  if (draaibaar && vak.draairichting !== "geen") {
    const scharnierX = vak.draairichting === "links" ? x : x + b;
    const krukX = vak.draairichting === "links" ? x + b : x;
    delen.push(lijn(krukX, yBoven, scharnierX, yBoven + h / 2, { kleur: LIJN, dikte, streep: lijnStreep }));
    delen.push(
      lijn(krukX, vak.onderkant, scharnierX, yBoven + h / 2, { kleur: LIJN, dikte, streep: lijnStreep })
    );
  }
  if (kiepbaar) {
    /*
     * De kiepdriehoek wijst met zijn punt naar bóven. Het scharnier zit onderin
     * — daar blijft de vleugel vastzitten — en de bovenkant komt naar binnen.
     * De twee lijnen lopen daarom van de onderhoeken naar het midden van de
     * bovenregel, zoals op een werktekening.
     */
    const midden = x + b / 2;
    delen.push(lijn(x, vak.onderkant, midden, yBoven, { kleur: LIJN, dikte, streep: lijnStreep }));
    delen.push(
      lijn(x + b, vak.onderkant, midden, yBoven, { kleur: LIJN, dikte, streep: lijnStreep })
    );
  }
  return delen.join("");
}

/**
 * Het pad van een vlak waarvan de bovenrand schuin mag lopen: van `topLinks`
 * bij x naar `topRechts` bij x + breedte. De onderrand is altijd horizontaal.
 */
function vlakPad(
  x: number,
  breedte: number,
  topLinks: number,
  topRechts: number,
  onderkant: number
): string {
  return `M ${x} ${topLinks} L ${x + breedte} ${topRechts} L ${x + breedte} ${onderkant} L ${x} ${onderkant} Z`;
}

export function tekenAanzicht(
  b: Berekening,
  zijde: Zijde = "binnen",
  opties: AanzichtOpties = {}
): AanzichtResultaat {
  const c = b.configuratie;
  const g = b.profiel.geometrie;
  const ruweGeometrie = berekenGeometrie(c, b.profiel);

  /**
   * Het buitenaanzicht is de spiegeling van het binnenaanzicht. Niet alleen het
   * draaisymbool klapt om: het hele kozijn draait. Een vak dat van binnen links
   * zit, zit van buiten gezien rechts, en een linksdraaiende vleugel draait van
   * buiten gezien rechtsom.
   *
   * Daarom wordt hier de geométrie gespiegeld en niet alleen de tekening — dan
   * klopt ook de maatvoering, want die wordt uit dezelfde posities afgeleid.
   */
  const spiegelen = zijde === "buiten";
  const spiegelX = (x: number, breedte: number) => (spiegelen ? c.breedte - x - breedte : x);

  const geometrie = spiegelen
    ? {
        ...ruweGeometrie,
        vakken: ruweGeometrie.vakken.map((v) => ({
          ...v,
          gebied: {
            ...v.gebied,
            x: spiegelX(v.gebied.x, v.gebied.breedte),
            topLinks: v.gebied.topRechts,
            topRechts: v.gebied.topLinks,
          },
        })),
        stijlen: ruweGeometrie.stijlen.map((st) => ({
          ...st,
          x: spiegelX(st.x, st.breedte),
        })),
        kozijndelen: ruweGeometrie.kozijndelen.map((k) => ({
          ...k,
          x: spiegelX(k.x, k.breedte),
          zijde:
            k.zijde === "links" ? ("rechts" as const) : k.zijde === "rechts" ? ("links" as const) : k.zijde,
        })),
      }
    : ruweGeometrie;

  /** De vakmaten in de weergaverichting; de maten zelf blijven ongewijzigd. */
  const vakken: VakMaten[] = spiegelen
    ? b.vakken.map((v) => ({
        ...v,
        x: spiegelX(v.x, v.breedte),
        topLinks: v.topRechts,
        topRechts: v.topLinks,
        // Een linksdraaiende vleugel draait van buiten gezien rechtsom.
        draairichting:
          v.draairichting === "links" ? "rechts" : v.draairichting === "rechts" ? "links" : "geen",
        binnenVakken: v.binnenVakken.map((d) => ({
          ...d,
          x: spiegelX(d.x, d.breedte),
          topLinks: d.topRechts,
          topRechts: d.topLinks,
        })),
      }))
    : b.vakken;

  const schaal = Math.max(c.breedte, c.hoogte) / 1400;
  const lijnDik = Math.max(1.2, 2.4 * schaal);
  const lijnFijn = Math.max(0.6, 1.2 * schaal);
  const streep = `${16 * schaal},${11 * schaal}`;
  const tekstMaat = Math.max(14, 26 * schaal);

  const kleur = zijde === "binnen" ? b.kleurBinnen : b.kleurBuiten;
  const patroonId = `folie-${zijde}`;
  let defs = foliePatroon(patroonId, kleur, schaal);
  const profielVulling = defs ? `url(#${patroonId})` : "#ece9e1";

  /**
   * De vleugel kan een andere folie hebben dan het kader — een zwart deurblad
   * in een wit kozijn is een gangbare keuze. Is de kleur gelijk, dan wordt
   * hetzelfde patroon hergebruikt zodat de tekening niet onnodig groeit.
   */
  const vleugelKleur = zijde === "binnen" ? b.vleugelKleurBinnen : b.vleugelKleurBuiten;
  let vleugelVulling = profielVulling;
  if (vleugelKleur && vleugelKleur.id !== kleur?.id) {
    const vleugelPatroonId = `folie-vleugel-${zijde}`;
    const patroon = foliePatroon(vleugelPatroonId, vleugelKleur, schaal);
    if (patroon) {
      defs += patroon;
      vleugelVulling = `url(#${vleugelPatroonId})`;
    }
  }

  /**
   * Panelen krijgen standaard dezelfde folie als het kozijn — een paneel is
   * immers hetzelfde materiaal. Alleen wanneer er bewust een afwijkende kleur is
   * gekozen krijgt het paneel een eigen patroon.
   */
  const paneelPatronen = new Map<string, string>();
  for (const vak of [...b.vakken, ...b.vakken.flatMap((v) => v.binnenVakken)]) {
    if (vak.vulsoort !== "paneel" || !vak.paneelKleurId) continue;
    if (paneelPatronen.has(vak.paneelKleurId)) continue;
    const paneelKleur = kleurOpId(vak.paneelKleurId);
    const id = `paneel-${zijde}-${paneelPatronen.size}`;
    const patroon = foliePatroon(id, paneelKleur, schaal);
    if (patroon) {
      defs += patroon;
      paneelPatronen.set(vak.paneelKleurId, `url(#${id})`);
    }
  }
  /**
   * Zonder eigen paneelkleur volgt het paneel het profiel waarin het zit: in
   * een vleugel de vleugelkleur, in een vast vak de kaderkleur.
   */
  const paneelVulling = (paneelKleurId: string | null, basis: string) =>
    (paneelKleurId ? paneelPatronen.get(paneelKleurId) : undefined) ?? basis;

  /**
   * Een ventilatierooster wordt vaak in een andere kleur geleverd dan het
   * kozijn — bij de leverancier kies je hem los, buiten en binnen. Is er niets
   * gekozen, dan volgt hij gewoon de folie van het profiel eromheen.
   */
  const roosterPatronen = new Map<string, string>();
  for (const vak of [...b.vakken, ...b.vakken.flatMap((v) => v.binnenVakken)]) {
    const id = zijde === "binnen" ? vak.roosterKleurBinnenId : vak.roosterKleurBuitenId;
    if (!id || roosterPatronen.has(id)) continue;
    const patroonId = `rooster-${zijde}-${roosterPatronen.size}`;
    const patroon = foliePatroon(patroonId, kleurOpId(id), schaal);
    if (patroon) {
      defs += patroon;
      roosterPatronen.set(id, `url(#${patroonId})`);
    }
  }
  const roosterVulling = (vak: VakMaten, basis: string) => {
    const id = zijde === "binnen" ? vak.roosterKleurBinnenId : vak.roosterKleurBuitenId;
    return (id ? roosterPatronen.get(id) : undefined) ?? basis;
  };

  // De contour past zich aan de folie aan: op een donker kozijn een lichte lijn,
  // op een licht kozijn de gewone donkere. Zo blijft de constructie altijd te
  // lezen, ook bij antraciet of zwart.
  const kaderDonker = isDonkereFolie(kleur);
  const kaderLijn = kaderDonker ? LIJN_LICHT : LIJN;
  const kaderLijnFijn = kaderDonker ? LIJN_FIJN_LICHT : LIJN_FIJN;
  const vleugelDonker = isDonkereFolie(vleugelKleur ?? kleur);
  const vleugelLijn = vleugelDonker ? LIJN_LICHT : LIJN;
  const vleugelLijnFijn = vleugelDonker ? LIJN_FIJN_LICHT : LIJN_FIJN;

  /**
   * Matglas krijgt een eigen arcering. Op een tekening moet je in één oogopslag
   * zien wélke ruit ondoorzichtig wordt — het toilet en de badkamer zijn juist
   * de ruiten waar dat misgaat als het alleen in de tekst staat.
   */
  const matId = "glas-mat";
  defs += `<pattern id="${matId}" width="${9 * schaal}" height="${9 * schaal}" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="${9 * schaal}" height="${9 * schaal}" fill="${GLAS}"/>
    <line x1="0" y1="0" x2="0" y2="${9 * schaal}" stroke="#ffffff" stroke-width="${2.4 * schaal}"/>
  </pattern>`;

  /** De vulling van een ruit: helder, mat of leeg wanneer het glas niet meegaat. */
  const glasVullingVoor = (glastypeId: string | null): string => {
    if (!c.glas.meegeleverd) return GLAS_LEEG;
    const soort = glastypeOpId(glastypeId) ?? b.glastype;
    return soort?.mat ? `url(#${matId})` : GLAS;
  };

  /**
   * Roeden: sierlatten óver de ruit. Het glas blijft één ruit — de glasmaat
   * verandert er dus niet door — maar in het aanzicht deelt hij de ruit op.
   */
  const roedenVan = (vak: VakMaten, x: number, breedte: number, boven: number, onder: number): string => {
    const r = vak.roeden;
    if (!r || (r.verticaal <= 0 && r.horizontaal <= 0)) return "";
    const stukken: string[] = [];
    const vulling = vak.binnenVakken.length > 0 ? profielVulling : profielVulling;
    for (let i = 1; i <= r.verticaal; i++) {
      const xx = x + (breedte * i) / (r.verticaal + 1) - r.breedte / 2;
      stukken.push(
        rechthoek(xx, boven, r.breedte, onder - boven, { vul: vulling, lijn: LIJN_FIJN, dikte: lijnFijn * 0.8 })
      );
    }
    for (let i = 1; i <= r.horizontaal; i++) {
      const yy = boven + ((onder - boven) * i) / (r.horizontaal + 1) - r.breedte / 2;
      stukken.push(
        rechthoek(x, yy, breedte, r.breedte, { vul: vulling, lijn: LIJN_FIJN, dikte: lijnFijn * 0.8 })
      );
    }
    return stukken.join("");
  };

  /**
   * Een hefschuifpui tekent anders dan een gewoon kozijn. Elk deel — ook het
   * vaste — is een op zichzelf staand omkaderd vlak, en waar twee delen elkaar
   * raken staan twee profielen naast elkaar in plaats van één gedeelde stijl.
   * Zo toont de leverancier hem ook: je ziet meteen wat er langs elkaar schuift.
   */
  const isPui = c.kozijnType === "schuifpui";

  const delen: string[] = [];
  const klikvlakken: Klikvlak[] = [];

  // ---- 1. Kozijnlijst -----------------------------------------------------
  const schuin = c.vorm === "schuin" && c.hoogteLaag !== null;
  const buitenTopLinks = schuin ? c.hoogte - (c.hoogteLaag as number) : 0;
  const buitenTopRechts = 0;

  const zicht = g.kozijnZichtbreedte.waarde;
  const binnenLinks = zicht;
  const binnenRechts = c.breedte - zicht;
  const binnenOnder = c.hoogte - zicht;
  const binnenBovenL = buitenTopLinks + zicht;
  const binnenBovenR = buitenTopRechts + zicht;

  /**
   * De vier kozijnlijsten worden als losse profielen getekend. De hoekverbinding
   * ontstaat dan uit hun vórm — bij verstek zijn de lijsten trapeziums die
   * schuin op elkaar aansluiten, bij houtlook lopen de regels door over de volle
   * breedte en passen de stijlen er tussen. Er zijn dus geen losse naadlijnen
   * nodig, wat een veel rustiger tekening geeft.
   */
  const lijst = (punten: [number, number][]) =>
    `<path d="M ${punten.map(([x, y]) => `${x} ${y}`).join(" L ")} Z" fill="${profielVulling}" stroke="${kaderLijn}" stroke-width="${lijnDik}" stroke-linejoin="miter"/>`;

  if (c.hoekverbinding === "verstek") {
    // Verstek: elke lijst loopt in de hoek onder 45° dood op de volgende.
    delen.push(
      lijst([
        [0, buitenTopLinks],
        [c.breedte, buitenTopRechts],
        [binnenRechts, binnenBovenR],
        [binnenLinks, binnenBovenL],
      ])
    );
    delen.push(
      lijst([
        [0, c.hoogte],
        [binnenLinks, binnenOnder],
        [binnenRechts, binnenOnder],
        [c.breedte, c.hoogte],
      ])
    );
    delen.push(
      lijst([
        [0, buitenTopLinks],
        [binnenLinks, binnenBovenL],
        [binnenLinks, binnenOnder],
        [0, c.hoogte],
      ])
    );
    delen.push(
      lijst([
        [c.breedte, buitenTopRechts],
        [c.breedte, c.hoogte],
        [binnenRechts, binnenOnder],
        [binnenRechts, binnenBovenR],
      ])
    );
  } else {
    // Houtlook: de boven- en onderregel lopen door over de volle breedte; de
    // stijlen staan er haaks tussen. Dat is de houten uitstraling.
    delen.push(
      lijst([
        [0, buitenTopLinks],
        [c.breedte, buitenTopRechts],
        [c.breedte, binnenBovenR],
        [0, binnenBovenL],
      ])
    );
    delen.push(
      lijst([
        [0, binnenOnder],
        [c.breedte, binnenOnder],
        [c.breedte, c.hoogte],
        [0, c.hoogte],
      ])
    );
    delen.push(
      lijst([
        [0, binnenBovenL],
        [binnenLinks, binnenBovenL],
        [binnenLinks, binnenOnder],
        [0, binnenOnder],
      ])
    );
    delen.push(
      lijst([
        [binnenRechts, binnenBovenR],
        [c.breedte, binnenBovenR],
        [c.breedte, binnenOnder],
        [binnenRechts, binnenOnder],
      ])
    );
  }

  for (const deel of geometrie.kozijndelen) {
    // De onderregel loopt door tot onder de dorpel, zodat je op de dorpel zelf
    // kunt klikken om hem te kiezen of te wijzigen.
    const extra = deel.zijde === "onder" ? (b.dorpel?.hoogte.waarde ?? 0) : 0;
    klikvlakken.push({
      soort: "kozijn",
      zijde: deel.zijde,
      x: deel.x,
      y: deel.y,
      breedte: deel.breedte,
      hoogte: deel.hoogte + extra,
    });
  }

  // Een aparte onderdorpel zit ónder het kozijn en krijgt zijn eigen band.
  const dorpelHoogte = b.dorpel?.hoogte.waarde ?? 0;
  if (dorpelHoogte > 0) {
    delen.push(
      rechthoek(0, c.hoogte, c.breedte, dorpelHoogte, {
        vul: DORPEL,
        lijn: kaderLijn,
        dikte: lijnDik,
      })
    );
  }

  // ---- 1a. Aanslag en rubber ----------------------------------------------
  /**
   * De aanslag is de lip die over het metselwerk valt. Hij is precies zo breed
   * als de profielconstante en hoort zichtbaar te zijn: de lijn die hij trekt is
   * de stelmaat, de maat waarop de sparing gemaakt moet worden. Per zijde kan de
   * lip weggelaten zijn — dan sluit het profiel daar vlak aan.
   *
   * Het rubber zit ín de lip en drukt tegen het metselwerk; dat wordt als
   * stippellijn in de band getekend.
   */
  const aanslagBreedte = g.aanslag.waarde;
  if (aanslagBreedte > 0) {
    // Een configuratie van vóór deze functie kent de zijden nog niet; die had
    // toen feitelijk rondom aanslag. De tekening mag daar nooit op stuklopen.
    const rondom = { aanslag: true, rubber: true };
    const zijden = c.kozijnzijden ?? {
      boven: rondom,
      onder: rondom,
      links: rondom,
      rechts: rondom,
    };
    // Van buiten gezien wisselen links en rechts van plaats.
    const links = spiegelen ? zijden.rechts : zijden.links;
    const rechts = spiegelen ? zijden.links : zijden.rechts;
    const a = aanslagBreedte;

    const band = (x: number, y: number, breedte: number, hoogte: number, afwerking: Zijdeafwerking) => {
      if (!afwerking.aanslag) return;
      delen.push(
        rechthoek(x, y, breedte, hoogte, {
          vul: kaderDonker ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.07)",
          lijn: kaderLijnFijn,
          dikte: lijnFijn,
        })
      );
      if (!afwerking.rubber) return;
      // Het rubber loopt in de lengte van de lip, midden in de band.
      const horizontaal = breedte > hoogte;
      const streepje = `${6 * schaal},${5 * schaal}`;
      if (horizontaal) {
        const yy = y + hoogte / 2;
        delen.push(lijn(x, yy, x + breedte, yy, { kleur: kaderLijnFijn, dikte: lijnFijn * 1.8, streep: streepje }));
      } else {
        const xx = x + breedte / 2;
        delen.push(lijn(xx, y, xx, y + hoogte, { kleur: kaderLijnFijn, dikte: lijnFijn * 1.8, streep: streepje }));
      }
    };

    band(0, Math.min(buitenTopLinks, buitenTopRechts), a, c.hoogte - Math.min(buitenTopLinks, buitenTopRechts), links);
    band(c.breedte - a, Math.min(buitenTopLinks, buitenTopRechts), a, c.hoogte - Math.min(buitenTopLinks, buitenTopRechts), rechts);
    band(0, Math.min(buitenTopLinks, buitenTopRechts), c.breedte, a, zijden.boven);
    band(0, c.hoogte - a, c.breedte, a, zijden.onder);
  }

  // ---- 1b. Afwatering -----------------------------------------------------
  /**
   * De afwateringssleuven zitten in de buitenwand van de onderregel. Ze zijn
   * dus alleen van buiten te zien — aan de binnenzijde is er niets van te
   * merken. Met een afdekkap blijft de sleuf even groot maar zit hij achter een
   * kapje in de kozijnkleur; dat wordt als omlijnd kapje getekend.
   */
  // Verdekte afwatering zit aan de ónderkant van de regel; in het aanzicht is
  // daar per definitie niets van te zien. Detail B tekent hem wel.
  if (zijde === "buiten" && (c.afwatering === "zichtbaar" || c.afwatering === "afdekkap")) {
    const aantal = aantalAfwateringssleuven(c.breedte);
    const sleufB = AFWATERING.sleufBreedte.waarde;
    const sleufH = AFWATERING.sleufHoogte.waarde;
    const band = c.hoogte - binnenOnder;
    const y = binnenOnder + band / 2 - sleufH / 2;
    const kap = c.afwatering === "afdekkap";
    for (let i = 0; i < aantal; i++) {
      const x = zicht + ((c.breedte - 2 * zicht) * (i + 0.5)) / aantal - sleufB / 2;
      delen.push(
        rechthoek(x, kap ? y - sleufH * 0.6 : y, sleufB, kap ? sleufH * 2.2 : sleufH, {
          vul: kap ? profielVulling : kaderDonker ? "#0f1210" : "#3a3f3c",
          lijn: kaderLijn,
          dikte: lijnFijn,
        })
      );
    }
  }

  // ---- 2. De stijlen ------------------------------------------------------
  // Eerst de stijlen, daarna pas de vakken: een vleugel valt met zijn aanslag
  // óver de stijl heen, precies zoals in werkelijkheid. Andersom zou de stijl
  // over de vleugels heen liggen en dat oogt als een losse band in het midden.
  for (const stijl of geometrie.stijlen) {
    delen.push(
      rechthoek(stijl.x, stijl.y, stijl.breedte, stijl.hoogte, {
        vul: profielVulling,
        lijn: kaderLijn,
        dikte: lijnDik,
      })
    );
    if (isPui && stijl.as === "kolommen") {
      // Twee profielen die langs elkaar lopen: de naad ertussen hoort zichtbaar
      // te zijn, want dáár schuift de vleugel voorbij.
      const naad = stijl.x + stijl.breedte / 2;
      delen.push(
        lijn(naad, stijl.y, naad, stijl.y + stijl.hoogte, { kleur: kaderLijnFijn, dikte: lijnFijn })
      );
    }
    klikvlakken.push({
      soort: "stijl",
      splitsingId: stijl.splitsingId,
      as: stijl.as,
      index: stijl.index,
      x: stijl.x,
      y: stijl.y,
      breedte: stijl.breedte,
      hoogte: stijl.hoogte,
      vorigeMaat: stijl.vorigeMaat,
      volgendeMaat: stijl.volgendeMaat,
    });
  }

  // ---- 3. De vakken -------------------------------------------------------
  for (const vak of vakken) {
    const heeftVleugel = BEWEEGBAAR.includes(vak.invulling);

    // De sponningopening waarin het vak valt. Een rooster in de beglazing
    // verkleint de vleugel niet — die houdt zijn volle maat; het rooster komt
    // straks bínnen het glasvlak te staan.
    const rooster = roosterOpId(vak.roosterId);
    const roosterInGlas = vak.vulsoort !== "rooster" && rooster !== null;
    const roosterHoogte = roosterInGlas ? rooster.bouwhoogte.waarde : 0;
    const topL = vak.topLinks;
    const topR = vak.topRechts;

    if (heeftVleugel) {
      // 2a. De vleugel valt met de aanslag óver het kozijn heen. Die overlap is
      // de verbinding tussen kozijn en vleugel en hoort zichtbaar te zijn.
      const aanslag = g.vleugelOverslag.waarde;
      delen.push(
        `<path d="${vlakPad(vak.x - aanslag, vak.breedte + 2 * aanslag, topL - aanslag, topR - aanslag, vak.onderkant + aanslag)}" fill="${vleugelVulling}" stroke="${vleugelLijn}" stroke-width="${lijnDik}"/>`
      );
      // De aanslagnaad zelf: de lijn waar de vleugel het kozijn raakt.
      delen.push(
        `<path d="${vlakPad(vak.x, vak.breedte, topL, topR, vak.onderkant)}" fill="none" stroke="${vleugelLijnFijn}" stroke-width="${lijnFijn}"/>`
      );
    }

    // 2b. Het glasvlak (of paneel, of rooster).
    // Het glasvlak begint bij een vleugel achter het vleugelprofiel; bij een
    // vast vak valt het glas direct in het kozijn en is er geen extra inzet.
    const inzet = heeftVleugel ? g.vleugelZichtbreedte.waarde - g.vleugelOverslag.waarde : 0;
    // Alles binnen dit vak zit in de vleugel wanneer die er is; daarbuiten in het kader.
    const vakVulling = heeftVleugel ? vleugelVulling : profielVulling;

    // Alles binnen dit vak volgt de contour van het profiel waarin het zit.
    const vakLijn = heeftVleugel ? vleugelLijn : kaderLijn;
    const vakLijnFijn = heeftVleugel ? vleugelLijnFijn : kaderLijnFijn;

    /**
     * In een pui is elk deel een eigen element met een eigen profiel eromheen —
     * ook het vaste deel, dat daar in een eigen kader staat en niet rechtstreeks
     * in de sponning. Dat profiel is de rand die je in het aanzicht ziet.
     */
    if (isPui) {
      const puiKader = Math.max(28, g.tussenstijlBreedte.waarde * 0.28);
      delen.push(
        `<path d="${vlakPad(vak.x, vak.breedte, topL, topR, vak.onderkant)}" fill="${vakVulling}" stroke="${vakLijn}" stroke-width="${lijnDik}"/>`
      );
      delen.push(
        `<path d="${vlakPad(vak.x + puiKader, vak.breedte - 2 * puiKader, topL + puiKader, topR + puiKader, vak.onderkant - puiKader)}" fill="none" stroke="${vakLijnFijn}" stroke-width="${lijnFijn}"/>`
      );
    }

    const vx = vak.x + inzet;
    const vb = Math.max(0, vak.breedte - 2 * inzet);
    const vtl = topL + inzet;
    const vtr = topR + inzet;
    const vo = vak.onderkant - inzet;
    // Zit het rooster bovenin, dan begint het glas eronder; zit het onderin,
    // dan begint het glas gewoon bovenaan en eindigt het eerder.
    const roosterOnderin = roosterInGlas && vak.roosterpositie === "onder-in-glas";
    const gtl = roosterOnderin ? vtl : vtl + roosterHoogte;
    const gtr = roosterOnderin ? vtr : vtr + roosterHoogte;
    const glasOnder = roosterOnderin ? vo - roosterHoogte : vo;

    if (vb > 0 && vo > Math.max(vtl, vtr)) {
      // Een rooster in de beglazing staat bovenin het glasvlak van de vleugel,
      // binnen de glaslat — niet erboven en niet buiten de vleugel.
      if (roosterInGlas) {
        // Het rooster zit boven- of onderin het glasvlak, afhankelijk van de
        // gekozen positie. De glasmaat is er al op aangepast.
        const onderin = vak.roosterpositie === "onder-in-glas";
        const boven = onderin ? vo - roosterHoogte : Math.max(vtl, vtr);
        const onder = onderin ? vo : Math.max(vtl, vtr) + roosterHoogte;
        delen.push(
          `<path d="${vlakPad(vx, vb, boven, boven, onder)}" fill="${roosterVulling(vak, vakVulling)}" stroke="${vakLijn}" stroke-width="${lijnFijn}"/>`
        );
        for (let i = 1; i < 4; i++) {
          const y = boven + (roosterHoogte * i) / 4;
          delen.push(
            lijn(vx + 4, y, vx + vb - 4, y, { kleur: vakLijnFijn, dikte: lijnFijn * 0.7 })
          );
        }
      }

      if (vak.vulsoort === "rooster") {
        delen.push(
          `<path d="${vlakPad(vx, vb, vtl, vtr, vo)}" fill="${roosterVulling(vak, vakVulling)}" stroke="${vakLijn}" stroke-width="${lijnFijn}"/>`
        );
        const stroken = Math.max(3, Math.round((vo - vtl) / 14));
        for (let i = 1; i < stroken; i++) {
          const y = vtl + ((vo - vtl) * i) / stroken;
          delen.push(lijn(vx + 3, y, vx + vb - 3, y, { kleur: vakLijnFijn, dikte: lijnFijn * 0.7 }));
        }
      } else if (vak.vulsoort === "paneel") {
        delen.push(
          `<path d="${vlakPad(vx, vb, gtl, gtr, glasOnder)}" fill="${paneelVulling(vak.paneelKleurId, vakVulling)}" stroke="${vakLijn}" stroke-width="${lijnFijn}"/>`
        );
      } else if (vak.invulling === "geen") {
        // Bewust leeg: een kruis, zoals op een bouwtekening. De maat staat er
        // wel bij, want die heeft de klant nodig om er iets in te zetten.
        delen.push(
          `<path d="${vlakPad(vx, vb, gtl, gtr, glasOnder)}" fill="none" stroke="${vakLijn}" stroke-width="${lijnFijn}" stroke-dasharray="${streep}"/>`
        );
        delen.push(lijn(vx, gtl, vx + vb, glasOnder, { kleur: vakLijnFijn, dikte: lijnFijn }));
        delen.push(lijn(vx + vb, gtl, vx, glasOnder, { kleur: vakLijnFijn, dikte: lijnFijn }));
      } else {
        const glasVulling = glasVullingVoor(vak.glastypeId);
        delen.push(
          `<path d="${vlakPad(vx, vb, gtl, gtr, glasOnder)}" fill="${glasVulling}" stroke="${vakLijn}" stroke-width="${lijnFijn}"${
            c.glas.meegeleverd ? "" : ` stroke-dasharray="${streep}"`
          }/>`
        );
        // De afstandshouder loopt als zichtbare rand net binnen de glaslat.
        if (c.glas.meegeleverd && b.afstandshouder) {
          const rand = Math.max(6, 12 * schaal);
          delen.push(
            `<path d="${vlakPad(vx + rand, vb - 2 * rand, gtl + rand, gtr + rand, vo - rand)}" fill="none" stroke="${esc(b.afstandshouder.hex)}" stroke-width="${Math.max(1.4, 5 * schaal)}"/>`
          );
        }
        delen.push(roedenVan(vak, vx, vb, Math.max(gtl, gtr), glasOnder));
      }
    }

    // Stijlen bínnen de vleugel: de deur- of raamvakken met glas of paneel.
    if (vak.binnenVakken.length > 0) {
      for (const deel of vak.binnenVakken) {
        const vulling =
          deel.vulsoort === "paneel"
            ? paneelVulling(deel.paneelKleurId, vakVulling)
            : glasVullingVoor(deel.glastypeId);
        delen.push(
          `<path d="${vlakPad(deel.x, deel.breedte, deel.topLinks, deel.topRechts, deel.onderkant)}" fill="${vulling}" stroke="${vakLijn}" stroke-width="${lijnFijn}"/>`
        );
        if (deel.vulsoort === "glas") {
          delen.push(
            roedenVan(
              deel,
              deel.x,
              deel.breedte,
              Math.max(deel.topLinks, deel.topRechts),
              deel.onderkant
            )
          );
        }
        klikvlakken.push({
          soort: "binnenvak",
          vakId: vak.id,
          id: deel.id,
          naam: deel.naam,
          x: deel.x,
          y: Math.min(deel.topLinks, deel.topRechts),
          breedte: deel.breedte,
          hoogte: deel.onderkant - Math.min(deel.topLinks, deel.topRechts),
        });
      }
      // De stijlen ertussen krijgen de folie van de vleugel. Ze komen recht uit
      // de indelingsboom, dus ook een vleugel met zowel rijen als kolommen
      // klopt — daar ging de oude afleiding uit de vakposities de mist in.
      for (const st of vak.binnenStijlen) {
        delen.push(
          rechthoek(st.x, st.y, st.breedte, st.hoogte, {
            vul: vakVulling,
            lijn: vakLijn,
            dikte: lijnFijn * 1.2,
          })
        );
      }
    }

    delen.push(
      openingssymbool(
        vak,
        lijnFijn * 1.4,
        streep,
        vakLijn,
        zijde === "binnen" ? !vak.naarBuitenDraaiend : vak.naarBuitenDraaiend
      )
    );

    klikvlakken.push({
      soort: "vak",
      id: vak.id,
      naam: vak.naam,
      x: vak.x,
      y: Math.min(vak.topLinks, vak.topRechts),
      breedte: vak.breedte,
      hoogte: vak.onderkant - Math.min(vak.topLinks, vak.topRechts),
    });
  }

  // ---- 4. Vaknamen en vulling ---------------------------------------------
  /**
   * In elke ruit staat wát erin zit. Bovenaan kies je het glas voor het hele
   * kozijn; wijkt één vak daarvan af, dan lees je dat hier meteen af — precies
   * zoals op een werktekening, waar per ruit staat wat de glaszetter moet
   * leveren. Bij een paneel staat de dikte erbij.
   */
  const vulTekst = (vak: VakMaten): string | null => {
    if (vak.vulsoort === "rooster") return null;
    if (vak.invulling === "geen") return "geen vulling";
    if (vak.vulsoort === "paneel") {
      const paneel = paneeltypeOpId(vak.paneeltypeId) ?? STANDAARD_PANEEL;
      return paneel.naam;
    }
    if (!c.glas.meegeleverd) return "glas door u zelf";
    const soort = glastypeOpId(vak.glastypeId) ?? b.glastype;
    return soort ? soort.naam : null;
  };

  const labelVak = (vak: VakMaten, tekstGrootte: number) => {
    // De loopdeur van een pui staat er met zoveel woorden bij: dat is de vleugel
    // die daadwerkelijk als deur gebruikt wordt.
    const isLoopdeur = vak.invulling === "schuifvleugel" && vak.naam.startsWith("Loopdeur");
    const midX = vak.x + vak.breedte / 2;
    const topGem = (vak.topLinks + vak.topRechts) / 2;
    const midY = (topGem + vak.onderkant) / 2;
    const hoogte = vak.onderkant - Math.max(vak.topLinks, vak.topRechts);
    if (vak.breedte < tekstGrootte * 3) return;

    const vulling = vulTekst(vak);
    // Past het label er niet onder, dan wint de naam: die is het belangrijkst.
    const beide = vulling !== null && hoogte > tekstGrootte * 3.2;
    delen.push(
      tekst(midX, beide ? midY - tekstGrootte * 0.35 : midY, vak.naam, {
        grootte: tekstGrootte,
        kleur: "#3d423f",
      })
    );
    if (beide) {
      delen.push(
        tekst(midX, midY + tekstGrootte * 0.85, vulling as string, {
          grootte: tekstGrootte * 0.78,
          kleur: "#5c6360",
        })
      );
    }
    if (isLoopdeur && hoogte > tekstGrootte * 6) {
      delen.push(
        tekst(midX, midY + tekstGrootte * 3, "LOOPDEUR", {
          grootte: tekstGrootte * 0.8,
          kleur: "#3d423f",
          vet: true,
        })
      );
    }
  };

  for (const vak of vakken) {
    if (vak.binnenVakken.length > 0) {
      // Zit er een indeling in de vleugel, dan hoort het label bij de ruiten zelf.
      for (const deel of vak.binnenVakken) labelVak(deel, tekstMaat * 0.85);
      continue;
    }
    labelVak(vak, tekstMaat);
  }

  // ---- 5. Maatlijnen ------------------------------------------------------
  const marges: Marges = opties.maten
    ? {
        links: Math.max(220, c.breedte * 0.2),
        rechts: Math.max(60, c.breedte * 0.05),
        boven: Math.max(60, c.hoogte * 0.05),
        // De dorpel steekt onder het kozijn uit; die ruimte moet erbij.
        onder: Math.max(240, c.hoogte * 0.22) + dorpelHoogte,
      }
    : { links: 0, rechts: 0, boven: dorpelHoogte > 0 ? 0 : 0, onder: dorpelHoogte };

  const maatlabels: Maatlabel[] = [];
  if (opties.maten) {
    delen.push(
      maatlijnen(
        b,
        vakken,
        geometrie.stijlen,
        marges,
        stijlVoor(c.breedte + marges.links, c.hoogte + marges.onder),
        maatlabels
      )
    );
  }

  return {
    inhoud: delen.join(""),
    defs,
    klikvlakken,
    breedte: c.breedte,
    hoogte: c.hoogte,
    marges,
    maatlabels,
  };
}

/**
 * De maatvoering rondom het aanzicht.
 *
 * Naast de totaalmaten en de vakmaten staat hier de HARTMAAT van elke stijl:
 * de afstand van de buitenkant van het kozijn tot het hart van de stijl. Dat is
 * de maat waarmee in de fabriek wordt afgetekend, dus die hoort er altijd op.
 */
function maatlijnen(
  b: Berekening,
  vakken: VakMaten[],
  stijlen: StijlMaten[],
  marges: Marges,
  stijl: ReturnType<typeof stijlVoor>,
  labels: Maatlabel[]
): string {
  const c = b.configuratie;
  const delen: string[] = [];

  /**
   * De maatvoering bestaat uit hartmaten en totaalmaten. Losse vakmaten staan
   * er bewust niet bij: de fabriek tekent af op het hart van de stijl, en twee
   * maatreeksen door elkaar maakt de tekening alleen maar drukker.
   *
   * Elke stijl wordt vanaf béide zijden bemaat — vanaf links én rechts, en bij
   * horizontale stijlen vanaf boven én onder. Zo hoeft niemand op de bouw te
   * gaan rekenen.
   */
  const verticaleStijlen = stijlen.filter((x) => x.as === "kolommen");
  const horizontaleStijlen = stijlen.filter((x) => x.as === "rijen");

  // --- Breedtes onder de tekening ---
  const yLinks = c.hoogte + marges.onder * 0.24;
  const yRechts = c.hoogte + marges.onder * 0.5;
  const yTotaal = c.hoogte + marges.onder * 0.78;

  for (const st of verticaleStijlen) {
    const hart = Math.round(st.x + st.breedte / 2);
    delen.push(maatHorizontaal(0, hart, yLinks, `${hart}`, stijl, c.hoogte));
    labels.push({
      x: hart / 2,
      y: yLinks,
      waarde: hart,
      doel: "hart",
      splitsingId: st.splitsingId,
      index: st.index,
      vanaf: "links",
    });

    const vanafRechts = c.breedte - hart;
    delen.push(maatHorizontaal(hart, c.breedte, yRechts, `${vanafRechts}`, stijl, c.hoogte));
    labels.push({
      x: hart + vanafRechts / 2,
      y: yRechts,
      waarde: vanafRechts,
      doel: "hart",
      splitsingId: st.splitsingId,
      index: st.index,
      vanaf: "rechts",
    });
  }

  /**
   * Bij een hefschuifpui hoort er nog een maatreeks bij: de dekkende maat van
   * elke schuivende vleugel — hoeveel breedte hij afsluit als hij dicht staat.
   * Dat is de maat waar de aannemer op stelt, en de leverancier tekent hem ook.
   * Hij loopt van hart tot hart van de stijlen waar de vleugel tussen valt.
   */
  if (c.kozijnType === "schuifpui") {
    const yDekkend = c.hoogte + marges.onder * 0.64;
    for (const [i, vak] of vakken.entries()) {
      if (vak.invulling !== "schuifvleugel") continue;
      const vorige = verticaleStijlen[i - 1];
      const volgende = verticaleStijlen[i];
      const van = vorige ? Math.round(vorige.x + vorige.breedte / 2) : 0;
      const tot = volgende ? Math.round(volgende.x + volgende.breedte / 2) : c.breedte;
      delen.push(maatHorizontaal(van, tot, yDekkend, `${tot - van}`, stijl, c.hoogte));
    }
  }

  delen.push(maatHorizontaal(0, c.breedte, yTotaal, `${c.breedte} mm`, stijl, c.hoogte));
  labels.push({ x: c.breedte / 2, y: yTotaal, waarde: c.breedte, doel: "totaalBreedte" });

  // --- Hoogtes links van de tekening ---
  const xBoven = -marges.links * 0.24;
  const xOnder = -marges.links * 0.5;
  const xTotaal = -marges.links * 0.78;

  for (const st of horizontaleStijlen) {
    const hart = Math.round(st.y + st.hoogte / 2);
    delen.push(maatVerticaal(0, hart, xBoven, `${hart}`, stijl, 0));
    labels.push({
      x: xBoven,
      y: hart / 2,
      waarde: hart,
      doel: "hart",
      splitsingId: st.splitsingId,
      index: st.index,
      vanaf: "boven",
    });

    const vanafOnder = c.hoogte - hart;
    delen.push(maatVerticaal(hart, c.hoogte, xOnder, `${vanafOnder}`, stijl, 0));
    labels.push({
      x: xOnder,
      y: hart + vanafOnder / 2,
      waarde: vanafOnder,
      doel: "hart",
      splitsingId: st.splitsingId,
      index: st.index,
      vanaf: "onder",
    });
  }

  delen.push(maatVerticaal(0, c.hoogte, xTotaal, `${c.hoogte} mm`, stijl, 0));
  labels.push({ x: xTotaal, y: c.hoogte / 2, waarde: c.hoogte, doel: "totaalHoogte" });

  // De onderdorpel wordt apart bemaat: hij zit onder het kozijn en telt niet
  // mee in de kozijnhoogte.
  const dorpel = b.dorpel?.hoogte.waarde ?? 0;
  if (dorpel > 0) {
    delen.push(
      maatVerticaal(c.hoogte, c.hoogte + dorpel, c.breedte + marges.rechts * 0.5, `${dorpel}`, stijl, c.breedte)
    );
  }

  if (c.vorm === "schuin" && c.hoogteLaag !== null) {
    delen.push(
      maatVerticaal(
        c.hoogte - c.hoogteLaag,
        c.hoogte,
        -marges.links * 0.96,
        `${c.hoogteLaag} (laag)`,
        stijl,
        0
      )
    );
  }

  return delen.join("");
}
