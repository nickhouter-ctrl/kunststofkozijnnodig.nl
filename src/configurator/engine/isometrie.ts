/**
 * Het kozijn in 3D.
 *
 * De technische tekening is een plat vooraanzicht — precies wat de fabriek nodig
 * heeft, maar het laat niet zien hoe diep een kozijn is, hoe de vleugel over het
 * kader valt en hoe ver hij opendraait. Deze weergave doet dat wel.
 *
 * Hoe het werkt: elk profieldeel is een balk in de ruimte (x naar rechts, y naar
 * beneden, z naar achteren). Die balken worden geroteerd om de verticale as —
 * dat is het draaien — en daarna orthografisch geprojecteerd met een lichte
 * neerwaartse kijkhoek. Orthografisch en niet in perspectief, want dan blijven
 * evenwijdige lijnen evenwijdig en blijft het beeld rustig.
 *
 * Een openslaande vleugel draait om zijn scharnieras: alle punten van die
 * vleugel worden vóór de projectie om een verticale lijn gedraaid. Zo klopt de
 * beweging met het beslag in plaats van dat er een plaatje wordt gekanteld.
 *
 * De geometrie komt uit dezelfde bron als het vooraanzicht en de technische
 * tekening (regel 1): wat je hier ziet is wat er gemaakt wordt.
 */
import { berekenGeometrie } from "./maten";
import { esc, svgDocument } from "./svg";
import { BEWEEGBAAR } from "./indeling";
import { kleurOpId } from "../data/kleuren";
import type { Berekening, Kleur, Millimeter } from "../types";

const LIJN = "#2a2f2c";
const LIJN_FIJN = "#8b918d";
const GLAS = "#cfe0e8";

/** De vaste kijkhoek van bovenaf. Genoeg om diepte te zien, niet zo veel dat het kantelt. */
const KIJKHOEK_GRADEN = 12;

export interface IsometrieOpties {
  /** Draaiing om de verticale as in graden; 0 is recht van voren. */
  draaiing?: number;
  /** Hoe ver de beweegbare vleugels openstaan, 0 tot 1. */
  opening?: number;
  /** Kijkhoek van bovenaf in graden; negatief kijkt van onderaf. */
  kijkhoek?: number;
}

export interface IsometrieResultaat {
  svg: string;
  breedte: Millimeter;
  hoogte: Millimeter;
}

/** Een punt in de ruimte: x naar rechts, y naar beneden, z naar achteren. */
export type Punt3 = { x: number; y: number; z: number };
/** Een vlak met zijn kleur en de diepte waarop het geschilderd wordt. */
type Vlak = { punten: [number, number][]; vul: string; lijn: string; dikte: number; diepte: number };

/**
 * Roteert een punt om een verticale as door (asX, asZ).
 *
 * Dit is een échte rotatie — afstanden tot de as blijven behouden. Dat klinkt
 * vanzelfsprekend, maar dit is precies waar een openstaande vleugel eerder
 * vervormde: de dz·sin-term was weggevallen en de z-term miste zijn cosinus,
 * waardoor de "rotatie" een afschuiving was die de vleugel uitrekte.
 *
 * Tekenafspraak: positieve hoek draait een punt rechts van de as naar de
 * kijker toe (z omlaag). De y blijft onaangeroerd: de as is verticaal.
 */
export function roteerOmVerticaleAs(p: Punt3, asX: number, asZ: number, hoek: number): Punt3 {
  const dx = p.x - asX;
  const dz = p.z - asZ;
  const cos = Math.cos(hoek);
  const sin = Math.sin(hoek);
  return { x: asX + dx * cos + dz * sin, y: p.y, z: asZ + dz * cos - dx * sin };
}

/**
 * De verplaatsing van een hefschuifvleugel bij een gegeven openingsstand.
 *
 * Een hefschuifvleugel draait niet en komt ook niet naar voren: het beslag
 * tilt hem een paar millimeter van zijn afdichting en dan glijdt hij opzij,
 * evenwijdig aan het vaste deel, in zijn eigen loopvlak. Vandaar dz = 0 —
 * elke dieptecomponent zou de vleugel uit de pui tekenen.
 *
 * `draairichting` betekent hier: de kant waar de vleugel naartoe openschuift.
 */
export function schuifVerplaatsing(
  vak: { breedte: Millimeter; draairichting: "links" | "rechts" | "geen" },
  opening: number
): { dx: number; dy: number; dz: number } {
  const stand = Math.max(0, Math.min(1, opening));
  if (stand === 0 || vak.draairichting === "geen") return { dx: 0, dy: 0, dz: 0 };
  const kant = vak.draairichting === "links" ? -1 : 1;
  return {
    // Tot ruim een halve vakbreedte opzij: de vleugel komt voor het vaste
    // deel te hangen maar blijft binnen de pui.
    dx: vak.breedte * 0.6 * stand * kant,
    // Het hefje: zodra de vleugel van het slot is, staat hij een paar
    // millimeter hoger op zijn loopwagens. Omhoog is negatieve y.
    dy: -8 * Math.min(1, stand * 4),
    dz: 0,
  };
}

/**
 * De twee loopvlakken van een hefschuifpui, verdeeld over de inbouwdiepte.
 *
 * Uit de HST 85-doorsnede (PROFIELGEGEVENS-EKO4U.md): totale opbouw 197 mm,
 * waarvan 112 mm vast deel en 85 mm vleugelloopvlak. Die verhouding houden we
 * aan en schalen we mee met de opbouwdiepte van de gekozen uitvoering, zodat
 * ook de Gealan-pui (194 mm) zijn eigen maat volgt. De vleugel loopt aan de
 * binnenzijde (z = 0), het vaste deel zit daarachter.
 */
export function hefschuifLagen(diepte: Millimeter): {
  vleugel: { z0: number; z1: number };
  vast: { z0: number; z1: number };
} {
  const vastAandeel = 112 / 197;
  const grens = diepte * (1 - vastAandeel);
  return {
    vleugel: { z0: 0, z1: grens },
    vast: { z0: grens, z1: diepte },
  };
}

/**
 * Maakt een kleur donkerder of lichter. De zijkanten van een profiel vangen
 * minder licht dan de voorkant; zonder dat verschil oogt de tekening plat.
 */
function schaduw(hex: string, factor: number): string {
  const schoon = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#e6e3dc";
  const kanaal = (i: number) => {
    const waarde = parseInt(schoon.slice(1 + i * 2, 3 + i * 2), 16);
    return Math.max(0, Math.min(255, Math.round(waarde * factor)));
  };
  return `#${[0, 1, 2].map((i) => kanaal(i).toString(16).padStart(2, "0")).join("")}`;
}

/** De basiskleur van een folie: de gemiddelde kleur van de swatch. */
function folieKleur(kleur: Kleur | null): string {
  return kleur?.hex && /^#[0-9a-f]{6}$/i.test(kleur.hex) ? kleur.hex : "#e6e3dc";
}

export function tekenIsometrie(
  b: Berekening,
  zijde: "binnen" | "buiten",
  opties: IsometrieOpties = {}
): IsometrieResultaat {
  const c = b.configuratie;
  const g = b.profiel.geometrie;
  const geometrie = berekenGeometrie(c, b.profiel);
  const diepte = b.profiel.inbouwdiepte.waarde;

  /*
   * Van buiten kijk je écht van de andere kant: de camera gaat een halve slag om
   * het kozijn heen. Daardoor klopt alles vanzelf — links en rechts wisselen, je
   * ziet de buitenzijde van het profiel, en een naar binnen draaiende vleugel
   * zwaait van je áf in plaats van naar je toe.
   */
  const basisDraai = zijde === "binnen" ? 22 : 180 - 22;
  const yaw = (((opties.draaiing ?? 0) + basisDraai) * Math.PI) / 180;
  const pitch = ((opties.kijkhoek ?? KIJKHOEK_GRADEN) * Math.PI) / 180;
  const opening = Math.max(0, Math.min(1, opties.opening ?? 0));

  // Om het kozijn heen draaien in plaats van om de linkerhoek: dat houdt het
  // beeld gecentreerd terwijl je sleept.
  const midX = c.breedte / 2;
  const midZ = diepte / 2;

  /** Projecteert een punt in de ruimte naar het platte vlak. */
  const projecteer = (p: Punt3): [number, number] => {
    const r = roteerOmVerticaleAs(p, midX, midZ, yaw);
    return [r.x, p.y * Math.cos(pitch) - (r.z - midZ) * Math.sin(pitch)];
  };

  /**
   * De diepte van een punt: bepaalt wat er vóór wat komt. De kijkhoek telt
   * mee — kijk je van boven, dan ligt wat lager zit ook verder van je af.
   * Zonder die term klopte de stapelvolgorde alleen bij een horizontale blik.
   */
  const dieptevan = (p: Punt3): number => {
    const r = roteerOmVerticaleAs(p, midX, midZ, yaw);
    return p.y * Math.sin(pitch) + (r.z - midZ) * Math.cos(pitch);
  };

  const vlakken: Vlak[] = [];
  const lijnDik = Math.max(1, Math.max(c.breedte, c.hoogte) / 900);

  /**
   * De lichtbron staat vast in de ruimte, links-boven-vóór het kozijn. Draai je
   * het kozijn, dan verschuiven de schaduwen mee — dat is wat een tekening
   * ruimtelijk maakt. Zou de belichting met het object meedraaien, dan blijft
   * elk vlak even licht en oogt het weer plat.
   */
  const licht = { x: -0.45, y: -0.72, z: -0.53 };

  /** De normaal van een vlak, ná de draaiing om de verticale as. */
  const normaalNa = (punten: Punt3[]) => {
    // Voor de normaal doen alleen de onderlinge verschillen ertoe, dus de
    // rotatie mag om hetzelfde middelpunt als de projectie.
    const [a, b2, c2] = punten.map((p) => roteerOmVerticaleAs(p, midX, midZ, yaw));
    const u = { x: b2.x - a.x, y: b2.y - a.y, z: b2.z - a.z };
    const v = { x: c2.x - a.x, y: c2.y - a.y, z: c2.z - a.z };
    const n = {
      x: u.y * v.z - u.z * v.y,
      y: u.z * v.x - u.x * v.z,
      z: u.x * v.y - u.y * v.x,
    };
    const lengte = Math.hypot(n.x, n.y, n.z) || 1;
    return { x: n.x / lengte, y: n.y / lengte, z: n.z / lengte };
  };

  const voegVlakToe = (punten: Punt3[], vul: string, dikte = lijnDik, belicht = true) => {
    let kleur = vul;
    if (belicht && punten.length >= 3) {
      const n = normaalNa(punten);
      // Hoe schuiner het vlak van het licht af staat, hoe donkerder.
      const inval = Math.abs(n.x * licht.x + n.y * licht.y + n.z * licht.z);
      kleur = schaduw(vul, 0.74 + 0.34 * inval);
    }
    vlakken.push({
      punten: punten.map(projecteer),
      vul: kleur,
      lijn: dikte > lijnDik * 0.8 ? LIJN : LIJN_FIJN,
      dikte,
      diepte: punten.reduce((som, p) => som + dieptevan(p), 0) / punten.length,
    });
  };

  /**
   * Een balk in de ruimte. Alleen de vlakken die naar de kijker toe wijzen
   * worden getekend; de rest zit toch achter het profiel.
   */
  const balk = (
    x: number,
    y: number,
    breedte: number,
    hoogte: number,
    z0: number,
    z1: number,
    vulling: string,
    draai?: (p: Punt3) => Punt3
  ) => {
    const p = (px: number, py: number, pz: number): Punt3 => {
      const punt = { x: px, y: py, z: pz };
      return draai ? draai(punt) : punt;
    };
    const a = p(x, y, z0);
    const bb = p(x + breedte, y, z0);
    const cc = p(x + breedte, y + hoogte, z0);
    const d = p(x, y + hoogte, z0);
    const e = p(x, y, z1);
    const f = p(x + breedte, y, z1);
    const gg = p(x + breedte, y + hoogte, z1);
    const h = p(x, y + hoogte, z1);

    // Alle zes de vlakken, ook de achterkant. Die leek overbodig, maar de
    // buitenaanzicht-camera staat een halve slag verderop en een openstaande
    // vleugel draait zijn rug naar de kijker — zonder achtervlak kijk je dan
    // een holle doos in. De schildersvolgorde legt vanzelf het juiste vlak
    // bovenop.
    voegVlakToe([a, bb, cc, d], vulling);
    voegVlakToe([e, f, gg, h], vulling);
    voegVlakToe([a, bb, f, e], vulling, lijnDik * 0.6);
    voegVlakToe([d, cc, gg, h], vulling, lijnDik * 0.6);
    voegVlakToe([a, d, h, e], vulling, lijnDik * 0.6);
    voegVlakToe([bb, cc, gg, f], vulling, lijnDik * 0.6);
  };

  const kader = folieKleur(zijde === "binnen" ? b.kleurBinnen : b.kleurBuiten);
  const vleugelKleur = folieKleur(
    zijde === "binnen"
      ? (b.vleugelKleurBinnen ?? b.kleurBinnen)
      : (b.vleugelKleurBuiten ?? b.kleurBuiten)
  );

  // ---- Het kader ----------------------------------------------------------
  /**
   * Een kozijnprofiel is geen blok maar een getrapte vorm. Drie dingen maken het
   * herkenbaar en die tekenen we los:
   *
   *   1. de aanslag — de lip die achteraan over het metselwerk valt, alleen aan
   *      de zijden waar hij gekozen is
   *   2. het profiellichaam — het deel dat je van binnen ziet
   *   3. de glaslat — het smalle profiel dat vooraan tegen het glas klemt
   *
   * Daarmee zie je in één oogopslag of er een aanslag zit en hoe diep de
   * sponning is, zonder dat er een volledige doorsnede aan te pas komt.
   */
  const zicht = g.kozijnZichtbreedte.waarde;
  const aanslagMm = g.aanslag.waarde;
  const glaslat = Math.max(8, zicht * 0.28);

  const kaderdeel = (
    x: number,
    y: number,
    breedte: number,
    hoogte: number,
    zijde: "boven" | "onder" | "links" | "rechts"
  ) => {
    const afwerking = c.kozijnzijden[zijde];
    const heeftAanslag = afwerking.aanslag && aanslagMm > 0;
    const horizontaal = zijde === "boven" || zijde === "onder";

    /*
     * 1. De aanslaglip.
     *
     * Het profiellichaam gaat de sparing in; de lip blijft daar buiten en valt
     * zijwaarts over het metselwerk. Je ziet hem dus als een randje dat aan de
     * buitenkant van het kozijn uitsteekt, aan de achterzijde — precies wat de
     * stelmaat 20 mm per zijde kleiner maakt dan de kozijnmaat.
     */
    const lip = heeftAanslag ? Math.min(aanslagMm, breedte / 2, hoogte / 2) : 0;
    if (lip > 0) {
      // Alleen het buitenste randje van het profiel, en maar een paar
      // centimeter diep: het is een lipje dat over het metselwerk valt, geen
      // tweede stijl. De rest van het profiel steekt de sparing in.
      const lipDiepte = Math.min(diepte * 0.22, 24);
      const lx = zijde === "rechts" ? x + breedte - lip : x;
      const ly = zijde === "onder" ? y + hoogte - lip : y;
      balk(
        lx,
        ly,
        horizontaal ? breedte : lip,
        horizontaal ? lip : hoogte,
        diepte - lipDiepte,
        diepte,
        kader
      );
    }

    /*
     * 2. Het profiellichaam, ingezet met de aanslag: dít deel steekt in de
     *    sparing en is dus smaller dan het kozijn zelf.
     */
    const bx = zijde === "links" ? x + lip : x;
    const by = zijde === "boven" ? y + lip : y;
    const bb = horizontaal ? breedte : breedte - lip;
    const bh = horizontaal ? hoogte - lip : hoogte;
    balk(bx, by, Math.max(1, bb), Math.max(1, bh), 0, diepte * 0.66, kader);

    // 3. De glaslat, vooraan aan de binnenzijde van het profiel.
    const gx = zijde === "links" ? x + breedte - glaslat : x;
    const gy = zijde === "boven" ? y + hoogte - glaslat : y;
    balk(
      horizontaal ? x : gx,
      horizontaal ? gy : y,
      horizontaal ? breedte : glaslat,
      horizontaal ? glaslat : hoogte,
      -glaslat * 0.35,
      glaslat * 0.5,
      schaduw(kader, 1.04)
    );
  };

  kaderdeel(0, 0, c.breedte, zicht, "boven");
  kaderdeel(0, c.hoogte - zicht, c.breedte, zicht, "onder");
  kaderdeel(0, zicht, zicht, c.hoogte - 2 * zicht, "links");
  kaderdeel(c.breedte - zicht, zicht, zicht, c.hoogte - 2 * zicht, "rechts");

  // ---- De stijlen ---------------------------------------------------------
  for (const stijl of geometrie.stijlen) {
    // Een tussenstijl heeft aan beide zijden een glaslat: hij houdt links en
    // rechts (of boven en onder) een ruit vast.
    balk(stijl.x, stijl.y, stijl.breedte, stijl.hoogte, 0, diepte * 0.66, kader);
    if (stijl.as === "kolommen") {
      balk(stijl.x, stijl.y, glaslat * 0.6, stijl.hoogte, -glaslat * 0.35, glaslat * 0.5, kader);
      balk(
        stijl.x + stijl.breedte - glaslat * 0.6,
        stijl.y,
        glaslat * 0.6,
        stijl.hoogte,
        -glaslat * 0.35,
        glaslat * 0.5,
        kader
      );
    } else {
      balk(stijl.x, stijl.y, stijl.breedte, glaslat * 0.6, -glaslat * 0.35, glaslat * 0.5, kader);
      balk(
        stijl.x,
        stijl.y + stijl.hoogte - glaslat * 0.6,
        stijl.breedte,
        glaslat * 0.6,
        -glaslat * 0.35,
        glaslat * 0.5,
        kader
      );
    }
  }

  // ---- De dorpel ----------------------------------------------------------
  // Een aparte onderdorpel zit ónder het kozijn en steekt naar buiten uit.
  if (b.dorpel) {
    const dh = b.dorpel.hoogte.waarde;
    balk(-dh * 0.4, c.hoogte, c.breedte + dh * 0.8, dh, -dh * 0.5, diepte, schaduw(kader, 0.72));
  }

  // ---- De vakken ----------------------------------------------------------
  /*
   * Een hefschuifpui heeft twee evenwijdige loopvlakken achter elkaar: de
   * vleugel loopt aan de binnenzijde, het vaste deel zit daarachter. Alle
   * z-posities van schuifdelen komen uit deze verdeling, zodat vleugel en
   * vast deel elkaar nooit doorsnijden.
   */
  const lagen = hefschuifLagen(diepte);

  for (const vak of b.vakken) {
    const top = Math.min(vak.topLinks, vak.topRechts);
    const hoogte = vak.onderkant - top;
    const isVleugel = BEWEEGBAAR.includes(vak.invulling);
    const isSchuif = vak.invulling === "schuifvleugel";
    const heeftBlad = isVleugel || vak.invulling === "vastedeur";

    /**
     * De beweging van deze vleugel. Een schuifvleugel tilt en glijdt in zijn
     * loopvlak; een draaiende vleugel roteert om zijn scharnieras.
     */
    let draai: ((p: Punt3) => Punt3) | undefined;
    if (isVleugel && opening > 0) {
      if (isSchuif) {
        const v = schuifVerplaatsing(vak, opening);
        draai = (p) => ({ x: p.x + v.dx, y: p.y + v.dy, z: p.z + v.dz });
      } else if (vak.draairichting !== "geen") {
        /*
         * Een draaiende vleugel scharniert aan de buitenrand van de vleugel zelf,
         * niet aan de rand van het vak — anders draait hij dwars door het kader.
         * En hij komt eerst een stukje uit de sponning voordat hij zwaait, zoals
         * het beslag hem ook optilt: zonder dat schuurt hij door het kozijn.
         */
        const overslag = g.vleugelOverslag.waarde;
        const scharnierX =
          vak.draairichting === "links" ? vak.x - overslag : vak.x + vak.breedte + overslag;
        const teken = vak.draairichting === "links" ? 1 : -1;
        const naarBuiten = vak.naarBuitenDraaiend ? -1 : 1;
        const hoek = ((opening * 62) * Math.PI) / 180 * teken * naarBuiten;
        const uitDeSponning = diepte * 0.22 * Math.min(1, opening * 3) * naarBuiten;
        draai = (p) =>
          roteerOmVerticaleAs({ x: p.x, y: p.y, z: p.z - uitDeSponning }, scharnierX, 0, hoek);
      }
    }

    if (heeftBlad) {
      const vleugelZicht =
        (vak.invulling === "deur" || vak.invulling === "vastedeur") &&
        g.deurVleugelZichtbreedte !== null
          ? g.deurVleugelZichtbreedte.waarde
          : g.vleugelZichtbreedte.waarde;
      const overslag = g.vleugelOverslag.waarde;
      const vx = vak.x - overslag;
      const vy = top - overslag;
      const vb = vak.breedte + 2 * overslag;
      const vh = hoogte + 2 * overslag;
      const rand = Math.max(1, vleugelZicht - overslag);
      /*
       * Een draaiende vleugel steekt naar voren uit het kader; dat is precies
       * wat je in 3D wél ziet en in het vooraanzicht niet. Een schuifvleugel
       * niet: die blijft binnen zijn eigen loopvlak, met een kleine speling
       * zodat hij het vaste deel net niet raakt.
       */
      const z0 = isSchuif ? lagen.vleugel.z0 + 2 : -overslag;
      const z1 = isSchuif ? lagen.vleugel.z1 - 2 : diepte * 0.72;

      balk(vx, vy, vb, rand, z0, z1, vleugelKleur, draai);
      balk(vx, vy + vh - rand, vb, rand, z0, z1, vleugelKleur, draai);
      balk(vx, vy + rand, rand, vh - 2 * rand, z0, z1, vleugelKleur, draai);
      balk(vx + vb - rand, vy + rand, rand, vh - 2 * rand, z0, z1, vleugelKleur, draai);
    }

    /*
     * De kruk zit op de vleugelstijl tegenover het scharnier — niet in het glas.
     * Hij steekt naar de kijker toe uit, dus je ziet meteen aan welke kant de
     * vleugel opengaat, en hij draait mee als je hem openzet.
     */
    if (isVleugel && vak.krukBinnenId && vak.draairichting !== "geen") {
      const overslag = g.vleugelOverslag.waarde;
      const stijlBreedte = Math.max(1, g.vleugelZichtbreedte.waarde - overslag);
      // Links draaiend betekent scharnier links, dus de kruk zit rechts.
      const krukX =
        vak.draairichting === "links"
          ? vak.x + vak.breedte + overslag - stijlBreedte
          : vak.x - overslag;
      const kh = Math.min(120, hoogte * 0.14);
      // De hefschuifgreep zit óp de vleugel en steekt dus uit vóór diens eigen
      // loopvlak; een kruk op een draaivleugel steekt uit voor het kozijn.
      const krukZ1 = isSchuif ? lagen.vleugel.z0 - 4 : -diepte * 0.02;
      balk(
        krukX + stijlBreedte * 0.2,
        top + hoogte / 2 - kh / 2,
        stijlBreedte * 0.6,
        kh,
        krukZ1 - Math.min(28, diepte * 0.16),
        krukZ1,
        "#9aa0a5",
        draai
      );
    }

    /*
     * Het ventilatierooster. Bij een rooster in de beglazing zit hij boven- of
     * onderin het glasvlak en heeft hij de glashoogte al verkleind; is het hele
     * vak een rooster, dan vult hij de opening. Hij krijgt zijn eigen kleur en
     * een paar lamellen, zodat je hem herkent en niet voor een paneel aanziet.
     */
    const roosterKleur = folieKleur(
      kleurOpId(zijde === "binnen" ? vak.roosterKleurBinnenId : vak.roosterKleurBuitenId) ??
        (zijde === "binnen" ? b.kleurBinnen : b.kleurBuiten)
    );
    if (vak.roosterId && (vak.roosterHoogte > 0 || vak.vulsoort === "rooster")) {
      const rh = vak.vulsoort === "rooster" ? hoogte : vak.roosterHoogte;
      const rx = vak.x;
      const rb = vak.breedte;
      const ry =
        vak.vulsoort === "rooster"
          ? top
          : vak.roosterpositie === "onder-in-glas"
            ? vak.onderkant - rh
            : top;
      const rz0 = isSchuif
        ? lagen.vleugel.z0 + (lagen.vleugel.z1 - lagen.vleugel.z0) * 0.3
        : heeftBlad
          ? diepte * 0.28
          : diepte * 0.42;
      balk(rx, ry, rb, rh, rz0, rz0 + Math.min(rh, diepte * 0.3), roosterKleur, draai);

      // De lamellen: een paar horizontale ribbels over de volle breedte.
      const lamellen = Math.max(2, Math.min(6, Math.round(rh / 22)));
      for (let i = 1; i < lamellen; i++) {
        const ly = ry + (rh * i) / lamellen;
        balk(
          rx + rb * 0.02,
          ly - rh * 0.03,
          rb * 0.96,
          Math.max(2, rh * 0.06),
          rz0 - 1,
          rz0,
          schaduw(roosterKleur, 0.72),
          draai
        );
      }
    }

    // Het glas ligt achterin het profiel.
    if (vak.glasBreedte > 0 && vak.glasHoogte > 0 && vak.invulling !== "rooster") {
      const gx = vak.x + (vak.breedte - vak.glasBreedte) / 2;
      const gy = top + (hoogte - vak.glasHoogte) / 2;
      // In een hefschuifpui volgt het glas het loopvlak van zijn deel: het
      // vleugelglas vooraan, het vaste glas in het achterste loopvlak.
      const gz = isSchuif
        ? (lagen.vleugel.z0 + lagen.vleugel.z1) / 2
        : c.kozijnType === "schuifpui"
          ? lagen.vast.z0 + (lagen.vast.z1 - lagen.vast.z0) * 0.3
          : heeftBlad
            ? diepte * 0.34
            : diepte * 0.5;
      const hoeken: Punt3[] = [
        { x: gx, y: gy, z: gz },
        { x: gx + vak.glasBreedte, y: gy, z: gz },
        { x: gx + vak.glasBreedte, y: gy + vak.glasHoogte, z: gz },
        { x: gx, y: gy + vak.glasHoogte, z: gz },
      ].map((p) => (draai ? draai(p) : p));

      const vulling =
        vak.vulsoort === "paneel"
          ? schaduw(vleugelKleur, 0.94)
          : vak.invulling === "geen"
            ? "none"
            : GLAS;
      voegVlakToe(hoeken, vulling, lijnDik * 0.7, vak.vulsoort === "paneel");

      // Een streep licht over het glas — daar herken je glas aan.
      if (vak.vulsoort === "glas" && vak.invulling !== "geen") {
        const streep: Punt3[] = [
          { x: gx + vak.glasBreedte * 0.12, y: gy + vak.glasHoogte * 0.9, z: gz },
          { x: gx + vak.glasBreedte * 0.56, y: gy + vak.glasHoogte * 0.06, z: gz },
          { x: gx + vak.glasBreedte * 0.8, y: gy + vak.glasHoogte * 0.06, z: gz },
          { x: gx + vak.glasBreedte * 0.36, y: gy + vak.glasHoogte * 0.9, z: gz },
        ].map((p) => (draai ? draai(p) : p));
        vlakken.push({
          punten: streep.map(projecteer),
          vul: "rgba(255,255,255,0.3)",
          lijn: "none",
          dikte: 0,
          diepte: streep.reduce((som, p) => som + dieptevan(p), 0) / streep.length - 0.5,
        });
      }
    }
  }

  /*
   * Een zachte schaduw op de grond. Zonder dat zweeft het kozijn in het niets;
   * met een vlek eronder staat het ergens. Hij ligt achteraan in de stapel, dus
   * alles wordt eroverheen getekend.
   */
  const schaduwHoogte = Math.max(c.breedte, c.hoogte) * 0.05;
  vlakken.push({
    punten: [
      { x: -schaduwHoogte, y: c.hoogte + (b.dorpel?.hoogte.waarde ?? 0), z: 0 },
      { x: c.breedte + schaduwHoogte, y: c.hoogte + (b.dorpel?.hoogte.waarde ?? 0), z: 0 },
      { x: c.breedte + schaduwHoogte, y: c.hoogte + (b.dorpel?.hoogte.waarde ?? 0), z: diepte },
      { x: -schaduwHoogte, y: c.hoogte + (b.dorpel?.hoogte.waarde ?? 0), z: diepte },
    ].map(projecteer),
    vul: "rgba(20,25,23,0.10)",
    lijn: "none",
    dikte: 0,
    diepte: Number.POSITIVE_INFINITY,
  });

  // Wat het verst weg ligt eerst: zo dekt wat vooraan staat het af.
  vlakken.sort((a, z) => z.diepte - a.diepte);

  const inhoud = vlakken
    .map(
      (v) =>
        `<path d="M ${v.punten
          .map(([x, y]) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`)
          .join(" L ")} Z" fill="${esc(v.vul)}"${
          v.lijn === "none"
            ? ""
            : ` stroke="${v.lijn}" stroke-width="${Math.round(v.dikte * 100) / 100}" stroke-linejoin="round"`
        }/>`
    )
    .join("");

  // De tekening past zich aan wat er daadwerkelijk in beeld staat: bij een open
  // vleugel of een flinke draaiing steekt het kozijn buiten zijn eigen maat uit.
  const alleX = vlakken.flatMap((v) => v.punten.map(([x]) => x));
  const alleY = vlakken.flatMap((v) => v.punten.map(([, y]) => y));
  const marge = Math.max(c.breedte, c.hoogte) * 0.05;
  const minX = Math.min(...alleX) - marge;
  const minY = Math.min(...alleY) - marge;
  const breedte = Math.max(...alleX) - minX + marge;
  const hoogte = Math.max(...alleY) - minY + marge;

  return {
    svg: svgDocument({ x: minX, y: minY, breedte, hoogte }, inhoud),
    breedte,
    hoogte,
  };
}
