/**
 * Tests op de productdatabase: de profielgegevens uit PROFIELGEGEVENS-EKO4U.md.
 *
 * De fabrikantwaarden uit de technische catalogus gaan vóór op onze eigen
 * aannames. Deze tests leggen die waarden vast, zodat een latere aanpassing van
 * de database nooit ongemerkt van de catalogus kan afwijken.
 */
import { describe, expect, it } from "vitest";
import { PROFIELEN, profielOpId } from "../data/profielen";

const verplicht = <T>(x: T | null | undefined, label: string): T => {
  expect(x, label).toBeTruthy();
  return x as T;
};

describe("inbouwdiepte en maxGlasdikte per uitvoering", () => {
  it("IDEAL 7000 NL blokprofiel (aanslag): 120 mm diep, glas tot 41 mm", () => {
    const blok = verplicht(profielOpId("aluplast-ideal-7000-aanslag"), "7000 NL aanslag");
    expect(blok.inbouwdiepte.waarde).toBe(120);
    expect(blok.inbouwdiepte.bron.soort).toBe("fabrikant");
    expect(blok.maxGlasdikte.waarde).toBe(41);
    expect(blok.maxGlasdikte.bron.soort).toBe("fabrikant");
  });

  it("IDEAL 7000 NL vlak houdt de bouwdiepte van het basissysteem (85 mm)", () => {
    const vlak = verplicht(profielOpId("aluplast-ideal-7000-vlak"), "7000 NL vlak");
    expect(vlak.inbouwdiepte.waarde).toBe(85);
    expect(vlak.maxGlasdikte.waarde).toBe(52);
  });

  it("Ideal 4000: 70 mm diep, 5 kamers, glas tot 42 mm (Vin 20 mm, artikel 140041)", () => {
    const aanslag = verplicht(profielOpId("aluplast-ideal-4000-aanslag"), "4000 aanslag");
    expect(aanslag.inbouwdiepte.waarde).toBe(70);
    expect(aanslag.kamers.waarde).toBe(5);
    expect(aanslag.maxGlasdikte.waarde).toBe(42);
  });

  it("Gealan S 9000 NL kozijnprofiel (aanslag): 120 mm diep", () => {
    const s9000 = verplicht(profielOpId("gealan-s9000-aanslag"), "S9000 aanslag");
    expect(s9000.inbouwdiepte.waarde).toBe(120);
    expect(s9000.inbouwdiepte.bron.soort).toBe("fabrikant");
  });
});

describe("kader/vleugel-combinaties", () => {
  it("7000 NL: kader 84 mm draagt zowel de raamvleugel 77 als de zware vleugel 96", () => {
    const blok = verplicht(profielOpId("aluplast-ideal-7000-aanslag"), "7000 NL aanslag");
    const combinaties = verplicht(blok.combinaties, "combinaties 7000 NL");

    const raam = verplicht(
      combinaties.find((c) => c.toepassing === "raam" && c.vleugelZichtbreedte.waarde === 77),
      "kader 84 × raamvleugel 77"
    );
    expect(raam.kaderZichtbreedte.waarde).toBe(84);
    expect(raam.kaderArtikel).toBe("170054");
    expect(raam.vleugelArtikel).toBe("170020");
    expect(raam.doorsnedeSvg).toBe(
      "/configurator/profielen/aluplast-ideal-7000-nl-kader84-vleugel77.svg"
    );

    const deur = verplicht(
      combinaties.find((c) => c.toepassing === "deur"),
      "kader 84 × deurvleugel 96"
    );
    expect(deur.kaderZichtbreedte.waarde).toBe(84);
    expect(deur.vleugelZichtbreedte.waarde).toBe(96);
    expect(deur.vleugelArtikel).toBe("170033");
    expect(deur.doorsnedeSvg).toBe(
      "/configurator/profielen/aluplast-ideal-7000-nl-17054-17033-deur.svg"
    );
  });

  it("HST 85: combinatie 170080 × 170081 met de fabrikantsdoorsnede", () => {
    const hst = verplicht(profielOpId("aluplast-hst85-vlak"), "HST 85");
    const combinatie = verplicht(
      hst.combinaties?.find((c) => c.toepassing === "hefschuif"),
      "HST 85 hefschuifcombinatie"
    );
    expect(combinatie.kaderArtikel).toBe("170080");
    expect(combinatie.vleugelArtikel).toBe("170081");
    expect(combinatie.doorsnedeSvg).toBe(
      "/configurator/profielen/aluplast-hst85-standard-170x80-170x81.svg"
    );
  });
});

describe("hefschuifmaten HST 85 (schema C en standaarddoorsnede)", () => {
  it("aluplast HST 85 staat op zijn eigen maten: 100 rondom, 63 ontmoetingsstijl, opbouw 197 = 112 + 85", () => {
    const hst = verplicht(profielOpId("aluplast-hst85-vlak"), "HST 85");
    expect(hst.geometrie.kozijnZichtbreedte.waarde).toBe(100);
    expect(hst.geometrie.kozijnZichtbreedte.bron.soort).toBe("fabrikant");
    expect(hst.geometrie.puistijlBreedte?.waarde).toBe(100);
    expect(hst.geometrie.ontmoetingsstijlBreedte?.waarde).toBe(63);
    expect(hst.geometrie.ontmoetingsstijlBreedte?.bron.soort).toBe("fabrikant");
    // De totale opbouw van 197 mm (112 vast + 85 vleugel) is de inbouwdiepte.
    expect(hst.inbouwdiepte.waarde).toBe(197);
    expect(hst.inbouwdiepte.bron.soort).toBe("fabrikant");
  });

  it("Gealan hefschuif houdt de geijkte AKUGT-maten: 177 kader, 130 puistijl, 256 ontmoetingsstijl", () => {
    const gealan = verplicht(profielOpId("gealan-s9000-hefschuif-vlak"), "Gealan hefschuif");
    expect(gealan.geometrie.kozijnZichtbreedte.waarde).toBe(177);
    expect(gealan.geometrie.puistijlBreedte?.waarde).toBe(130);
    expect(gealan.geometrie.ontmoetingsstijlBreedte?.waarde).toBe(256);
  });

  it("raamsystemen hebben geen puistijlen", () => {
    const raam = verplicht(profielOpId("aluplast-ideal-7000-aanslag"), "7000 NL aanslag");
    expect(raam.geometrie.puistijlBreedte).toBeNull();
    expect(raam.geometrie.ontmoetingsstijlBreedte).toBeNull();
  });
});

describe("profielkaart", () => {
  it("7000 NL blokprofiel: klasse B, 2 afdichtingen, HFL mogelijk", () => {
    const blok = verplicht(profielOpId("aluplast-ideal-7000-aanslag"), "7000 NL aanslag");
    const kaart = verplicht(blok.profielkaart, "profielkaart 7000 NL blok");
    expect(kaart.profielklasse).toBe("B");
    expect(kaart.afdichtingen).toBe(2);
    expect(kaart.hfl).toBe(true);
  });

  it("Ideal 4000 Vin 20 mm: klasse B, 2 afdichtingen, staal 1,5 mm, twee anti-inbraakpunten", () => {
    const vin = verplicht(profielOpId("aluplast-ideal-4000-aanslag"), "4000 aanslag");
    const kaart = verplicht(vin.profielkaart, "profielkaart Ideal 4000");
    expect(kaart.profielklasse).toBe("B");
    expect(kaart.afdichtingen).toBe(2);
    expect(kaart.staal).toContain("1,5 mm");
    expect(kaart.antiInbraak).toContain("anti-inbraakpunten");
  });

  it("blijft weg waar de catalogus nog geen kaart geeft", () => {
    const s9000 = verplicht(profielOpId("gealan-s9000-aanslag"), "S9000 aanslag");
    expect(s9000.profielkaart).toBeUndefined();
  });
});

describe("bestaand gedrag blijft staan", () => {
  it("elk profiel houdt zijn volledige maatketen en grenzen", () => {
    for (const profiel of PROFIELEN) {
      expect(profiel.geometrie.kozijnZichtbreedte.waarde).toBeGreaterThanOrEqual(0);
      expect(profiel.geometrie.vleugelZichtbreedte.waarde).toBeGreaterThanOrEqual(0);
      expect(profiel.grenzen.maxBreedte.waarde).toBeGreaterThan(0);
      expect(profiel.inbouwdiepte.waarde).toBeGreaterThan(0);
      expect(profiel.maxGlasdikte.waarde).toBeGreaterThan(0);
    }
  });

  it("de geijkte zichtbreedtes veranderen niet door de nieuwe velden", () => {
    expect(profielOpId("aluplast-ideal-7000-aanslag")?.geometrie.kozijnZichtbreedte.waarde).toBe(84);
    expect(profielOpId("gealan-s9000-aanslag")?.geometrie.kozijnZichtbreedte.waarde).toBe(66);
    expect(profielOpId("gealan-s9000-hefschuif-vlak")?.geometrie.kozijnZichtbreedte.waarde).toBe(177);
  });
});
