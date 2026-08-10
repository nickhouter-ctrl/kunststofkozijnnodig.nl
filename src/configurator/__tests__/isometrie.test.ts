/**
 * Tests op de 3D-weergave (isometrie).
 *
 * De 3D-weergave deelt zijn geometrie met het vooraanzicht (regel 1), maar
 * voegt er de diepte aan toe. Drie dingen moeten daarbij kloppen:
 *
 *   1. de scharnierrotatie is een échte rotatie — een openstaande vleugel
 *      houdt zijn maat en vervormt niet;
 *   2. de diepte volgt de inbouwdiepte van de gekozen uitvoering — een
 *      NL-blokprofiel van 120 mm oogt dieper dan een vlak profiel van 85 mm,
 *      en een hefschuifpui toont zijn volle opbouw;
 *   3. een hefschuifvleugel schuift in zijn eigen loopvlak, evenwijdig aan
 *      het vaste deel — hij komt niet uit de pui naar voren.
 */
import { describe, expect, it } from "vitest";
import { bereken } from "../engine";
import {
  tekenIsometrie,
  roteerOmVerticaleAs,
  schuifVerplaatsing,
  hefschuifLagen,
} from "../engine/isometrie";
import { standaardConfiguratie } from "../data/standaard";
import { PROFIELEN } from "../data/profielen";
import { vakkenVan, wijzigVak, voegStijlenToe } from "../engine/indeling";
import type { Berekening, Millimeter } from "../types";

const AANNEMER = { context: "aannemer" as const, aannemersmarge: 0.25 };

/** Dezelfde berekening, maar met een andere inbouwdiepte op de uitvoering. */
function metDiepte(b: Berekening, diepte: Millimeter): Berekening {
  return {
    ...b,
    profiel: {
      ...b.profiel,
      inbouwdiepte: { ...b.profiel.inbouwdiepte, waarde: diepte },
    },
  };
}

/** Een berekening met minstens één draaikiepvleugel. */
function metDraaikiep(): Berekening {
  const c = standaardConfiguratie();
  c.indeling = wijzigVak(c.indeling, vakkenVan(c.indeling)[0].id, {
    invulling: "draaikiep",
  });
  return bereken(c, AANNEMER);
}

/** Een hefschuifpui met een schuifvleugel, op het eerste profiel dat dat kan. */
function schuifpui(): Berekening {
  const profiel = PROFIELEN.find((p) => p.toegestaneTypes.includes("schuifpui"));
  expect(profiel, "geen profiel met schuifpui gevonden").toBeDefined();
  const b = bereken(standaardConfiguratie(profiel!.id, "schuifpui"), AANNEMER);
  expect(
    b.vakken.some((v) => v.invulling === "schuifvleugel"),
    "standaard schuifpui heeft geen schuifvleugel"
  ).toBe(true);
  return b;
}

describe("roteerOmVerticaleAs", () => {
  it("behoudt de afstand tot de as: een rotatie rekt niets uit", () => {
    // Dit is de wiskundige kern van het openzetten: elke schijnbare
    // vervorming van een openstaande vleugel begint bij een rotatie die
    // geen isometrie is.
    const as = { x: 350, z: 40 };
    const punten = [
      { x: 1350, y: 200, z: 0 },
      { x: 350, y: 0, z: 120 },
      { x: -80, y: 999, z: -35 },
    ];
    for (const p of punten) {
      for (const hoek of [0.3, Math.PI / 2, -1.1, Math.PI]) {
        const r = roteerOmVerticaleAs(p, as.x, as.z, hoek);
        const voor = Math.hypot(p.x - as.x, p.z - as.z);
        const na = Math.hypot(r.x - as.x, r.z - as.z);
        expect(na).toBeCloseTo(voor, 6);
        expect(r.y).toBe(p.y);
      }
    }
  });

  it("draait een kwartslag precies van de x-richting naar de z-richting", () => {
    // Tekenafspraak van de engine: positieve hoek draait een punt rechts van
    // de as naar de kijker toe (z omlaag).
    const r = roteerOmVerticaleAs({ x: 100, y: 5, z: 0 }, 0, 0, Math.PI / 2);
    expect(r.x).toBeCloseTo(0, 6);
    expect(r.z).toBeCloseTo(-100, 6);

    // En de diepte-offset van de vleugel draait mee het beeld in — dit is
    // precies de term die verloren gaat wanneer de rotatie tot een afschuiving
    // versimpeld wordt.
    const dik = roteerOmVerticaleAs({ x: 100, y: 5, z: 60 }, 0, 0, Math.PI / 2);
    expect(dik.x).toBeCloseTo(60, 6);
    expect(dik.z).toBeCloseTo(-100, 6);
  });

  it("laat een punt op de as staan", () => {
    const r = roteerOmVerticaleAs({ x: 12, y: 34, z: 56 }, 12, 56, 2.1);
    expect(r.x).toBeCloseTo(12, 9);
    expect(r.z).toBeCloseTo(56, 9);
  });
});

describe("diepte per uitvoering", () => {
  it("tekent een diepere uitvoering breder zodra je eromheen kijkt", () => {
    // Hetzelfde kozijn, alleen de inbouwdiepte van de uitvoering verschilt:
    // 85 mm basissysteem tegenover 120 mm NL-blok en 197 mm HST-opbouw. Bij
    // een gedraaide kijkhoek loopt die diepte het beeld in, dus het getekende
    // vlak wordt er aantoonbaar breder van.
    const b = bereken(standaardConfiguratie(), AANNEMER);
    const smal = tekenIsometrie(metDiepte(b, 85), "binnen", { draaiing: 40 });
    const blok = tekenIsometrie(metDiepte(b, 120), "binnen", { draaiing: 40 });
    const hst = tekenIsometrie(metDiepte(b, 197), "binnen", { draaiing: 40 });
    expect(blok.breedte).toBeGreaterThan(smal.breedte);
    expect(hst.breedte).toBeGreaterThan(blok.breedte);
  });
});

describe("hefschuif in 3D", () => {
  it("schuift de vleugel evenwijdig aan het vaste deel, in zijn eigen loopvlak", () => {
    // Een hefschuifvleugel tilt op en glijdt opzij — hij komt niet naar voren
    // uit de pui. De verplaatsing heeft dus geen dieptecomponent, alleen een
    // zijwaartse slag (binnen de eigen vakbreedte) en een klein hefje omhoog.
    for (const opening of [0.25, 0.5, 1]) {
      for (const draairichting of ["links", "rechts"] as const) {
        const v = schuifVerplaatsing({ breedte: 1400, draairichting }, opening);
        expect(v.dz).toBe(0);
        expect(Math.abs(v.dx)).toBeLessThanOrEqual(1400);
        expect(Math.abs(v.dx)).toBeGreaterThan(0);
        expect(v.dy).toBeLessThanOrEqual(0);
        expect(v.dy).toBeGreaterThanOrEqual(-15);
        // Links betekent: de vleugel schuift naar links open.
        expect(Math.sign(v.dx)).toBe(draairichting === "links" ? -1 : 1);
      }
    }
    // Dicht is dicht: geen restverplaatsing.
    const dicht = schuifVerplaatsing({ breedte: 1400, draairichting: "links" }, 0);
    expect(dicht.dx).toBe(0);
    expect(dicht.dy).toBe(0);
    expect(dicht.dz).toBe(0);
  });

  it("verdeelt de opbouw in twee loopvlakken volgens de HST 85-verhouding", () => {
    // HST 85: totale opbouw 197 mm = 112 mm vast deel + 85 mm vleugelloopvlak
    // (PROFIELGEGEVENS-EKO4U.md). De vleugel loopt aan de binnenzijde, het
    // vaste deel zit daarachter; samen vullen ze de inbouwdiepte.
    const lagen = hefschuifLagen(197);
    expect(lagen.vleugel.z1 - lagen.vleugel.z0).toBeCloseTo(85, 0);
    expect(lagen.vast.z1 - lagen.vast.z0).toBeCloseTo(112, 0);
    // Binnenzijde is z = 0: het vleugelloopvlak ligt vóór het vaste deel.
    expect(lagen.vleugel.z0).toBeGreaterThanOrEqual(0);
    expect(lagen.vleugel.z1).toBeLessThanOrEqual(lagen.vast.z0);
    expect(lagen.vast.z1).toBeLessThanOrEqual(197);

    // En de verhouding schaalt mee met een andere opbouwdiepte (Gealan 194).
    const gealan = hefschuifLagen(194);
    expect(gealan.vleugel.z1).toBeLessThanOrEqual(gealan.vast.z0);
    expect(gealan.vast.z1).toBeLessThanOrEqual(194);
  });

  it("tekent het openen als een andere stand van hetzelfde beeld", () => {
    // Integratieproef: openen verandert de tekening, maar de pui zelf blijft
    // staan — de bounding box groeit niet doordat de vleugel eruit valt.
    const b = schuifpui();
    const dicht = tekenIsometrie(b, "binnen", { draaiing: 24 });
    const open = tekenIsometrie(b, "binnen", { draaiing: 24, opening: 1 });
    expect(open.svg).not.toBe(dicht.svg);
    expect(open.breedte).toBeLessThan(dicht.breedte * 1.02);
    expect(open.hoogte).toBeLessThan(dicht.hoogte * 1.02);
  });

  it("zet een draaivleugel bij het openen juist wél buiten het kozijnvlak", () => {
    // De tegenproef: een draaikiepvleugel zwaait het beeld in, dus bij
    // dezelfde gedraaide kijkhoek als hierboven hoort het getekende vlak bij
    // het openen aanzienlijk te groeien.
    const b = metDraaikiep();
    const dicht = tekenIsometrie(b, "binnen", { draaiing: 48 });
    const open = tekenIsometrie(b, "binnen", { draaiing: 48, opening: 1 });
    expect(open.breedte).toBeGreaterThan(dicht.breedte * 1.05);
  });
});

describe("robuustheid van de 3D-weergave", () => {
  it("levert geldige SVG zonder kale waarden, voor elk profiel en elke stand", () => {
    for (const profiel of PROFIELEN) {
      const kozijnType = profiel.toegestaneTypes[0];
      const b = bereken(standaardConfiguratie(profiel.id, kozijnType), AANNEMER);
      for (const zijde of ["binnen", "buiten"] as const) {
        for (const opties of [
          {},
          { draaiing: -70, opening: 1, kijkhoek: -25 },
          { draaiing: 70, opening: 0.5, kijkhoek: 45 },
        ]) {
          const naam = `${profiel.id}/${kozijnType}/${zijde}`;
          const { svg, breedte, hoogte } = tekenIsometrie(b, zijde, opties);
          expect(svg.startsWith("<svg"), naam).toBe(true);
          expect(svg, naam).not.toContain("NaN");
          expect(svg, naam).not.toContain("undefined");
          expect(svg, naam).not.toContain("Infinity");
          expect(Number.isFinite(breedte), naam).toBe(true);
          expect(Number.isFinite(hoogte), naam).toBe(true);
        }
      }
    }
  });

  it("blijft overeind met dorpel, rooster en meerdere vakken", () => {
    const c = standaardConfiguratie();
    c.breedte = 2400;
    c.hoogte = 1400;
    const eerste = vakkenVan(c.indeling)[0];
    c.indeling = voegStijlenToe(c.indeling, eerste.id, "kolommen", 1);
    const vakken = vakkenVan(c.indeling);
    c.indeling = wijzigVak(c.indeling, vakken[0].id, { invulling: "draaikiep" });
    c.indeling = wijzigVak(c.indeling, vakken[1].id, { roosterId: "rooster-standaard" });
    const b = bereken(c, AANNEMER);
    const { svg } = tekenIsometrie(b, "buiten", { draaiing: 30, opening: 0.7 });
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("NaN");
  });
});
