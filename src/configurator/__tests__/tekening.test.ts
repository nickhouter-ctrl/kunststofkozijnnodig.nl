/**
 * Tests op regel 5: elke tekening bevat automatisch de verplichte
 * detailtekeningen. Dit is een systeeminstelling, geen keuze van de gebruiker.
 */
import { describe, expect, it } from "vitest";
import { bereken } from "../engine";
import { genereerTekeningen, verplichteDetails } from "../engine/tekening";
import { standaardConfiguratie } from "../data/standaard";
import { PROFIELEN } from "../data/profielen";
import { standaardKleur } from "../data/kleuren";
import { vakkenVan, wijzigVak } from "../engine/indeling";

const AANNEMER = { context: "aannemer" as const, aannemersmarge: 0.25 };

describe("tekeningenengine", () => {
  it("levert altijd de hoofdtekening plus de verplichte details", () => {
    const tekeningen = genereerTekeningen(bereken(standaardConfiguratie(), AANNEMER));
    expect(tekeningen[0].id).toBe("hoofd");
    // Het buitenaanzicht hoort er standaard bij: draairichting en folie zien er
    // van buiten gezien anders uit.
    expect(tekeningen[1].id).toBe("buitenaanzicht");
    const ids = tekeningen.map((t) => t.id);
    for (const verplicht of ["A", "B", "C", "D", "E", "G"]) {
      expect(ids, `detail ${verplicht} ontbreekt`).toContain(verplicht);
    }
  });

  it("voegt detail F alleen toe wanneer er een rooster is gekozen", () => {
    const zonder = genereerTekeningen(bereken(standaardConfiguratie(), AANNEMER));
    expect(zonder.map((t) => t.id)).not.toContain("F");

    const c = standaardConfiguratie();
    c.indeling = wijzigVak(c.indeling, vakkenVan(c.indeling)[0].id, { roosterId: "rooster-standaard" });
    c.breedte = 1600;
    c.hoogte = 1200;
    const met = genereerTekeningen(bereken(c, AANNEMER));
    expect(met.map((t) => t.id)).toContain("F");
  });

  it("genereert detail D, E en G ook zonder glas, cilinder en hor", () => {
    const c = standaardConfiguratie();
    c.glas = { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" };
    c.beslag = { beslagId: null, cilinderMeegeleverd: false };
    c.hortypeId = null;

    const b = bereken(c, AANNEMER);
    const tekeningen = genereerTekeningen(b);

    const d = tekeningen.find((t) => t.id === "D")!;
    const e = tekeningen.find((t) => t.id === "E")!;
    const gTek = tekeningen.find((t) => t.id === "G")!;

    // De maten staan er letterlijk in, mét de melding dat het product niet
    // wordt meegeleverd (regel 2).
    expect(d.svg).toContain(`${b.vakken[0].glasBreedte}`);
    expect(d.svg).toContain("GLASMAAT");
    expect(d.svg).toContain("NIET meegeleverd");
    expect(e.svg).toContain(b.cilindermaat.notatie);
    expect(e.svg).toContain("NIET meegeleverd");
    expect(gTek.svg).toContain(`${b.vakken[0].horBreedte}`);
    expect(gTek.svg).toContain("NIET meegeleverd");
  });

  it("produceert geldige, niet-lege SVG voor elk profiel", () => {
    for (const profiel of PROFIELEN) {
      const c = standaardConfiguratie(profiel.id);
      c.kleurBinnenId = standaardKleur(profiel.merk).id;
      c.kleurBuitenId = standaardKleur(profiel.merk).id;
      c.glas = { meegeleverd: true, glastypeId: profiel.toegestaneGlastypes[0], afstandshouderId: "alu" };
      c.beslag = { beslagId: null, cilinderMeegeleverd: false };

      for (const tekening of genereerTekeningen(bereken(c, AANNEMER))) {
        expect(tekening.svg.startsWith("<svg"), `${profiel.id}/${tekening.id}`).toBe(true);
        expect(tekening.svg.endsWith("</svg>")).toBe(true);
        // Geen onverwerkte waarden in de output.
        expect(tekening.svg).not.toContain("NaN");
        expect(tekening.svg).not.toContain("undefined");
        expect(tekening.titel.length).toBeGreaterThan(3);
      }
    }
  });

  it("tekent een schuin kozijn met beide zijhoogtes", () => {
    const c = standaardConfiguratie();
    c.vorm = "schuin";
    c.hoogte = 1600;
    c.hoogteLaag = 1000;
    const tekeningen = genereerTekeningen(bereken(c, AANNEMER));
    const hoofd = tekeningen[0];
    expect(hoofd.svg).toContain("1000 (laag)");
    expect(hoofd.svg).not.toContain("NaN");
  });

  it("noemt de kleurcodes op de hoofdtekening", () => {
    const b = bereken(standaardConfiguratie(), AANNEMER);
    const hoofd = genereerTekeningen(b)[0];
    expect(hoofd.svg).toContain(b.kleurBinnen!.naam);
    expect(hoofd.svg).toContain("Details:");
  });

  it("houdt verplichteDetails en de gegenereerde set gelijk", () => {
    const c = standaardConfiguratie();
    c.indeling = wijzigVak(c.indeling, vakkenVan(c.indeling)[0].id, { roosterId: "rooster-zelfregelend" });
    c.breedte = 1800;
    c.hoogte = 1300;
    const b = bereken(c, AANNEMER);
    const gegenereerd = genereerTekeningen(b)
      .filter((t) => t.id !== "hoofd" && t.id !== "buitenaanzicht")
      .map((t) => t.id);
    expect(gegenereerd.sort()).toEqual(verplichteDetails(b).sort());
  });
});

describe("detail A — fabrikantsdoorsneden", () => {
  const detailA = (b: ReturnType<typeof bereken>) =>
    genereerTekeningen(b).find((t) => t.id === "A")!;

  it("gebruikt de fabrikant-SVG voor het IDEAL 7000 NL-blokprofiel", () => {
    // Het standaardprofiel ís aluplast-ideal-7000-aanslag: daarvoor staat de
    // echte doorsnede (kader 170054 × raamvleugel 170020) in het project.
    const a = detailA(bereken(standaardConfiguratie(), AANNEMER));
    expect(a.svg).toContain("/configurator/profielen/aluplast-ideal-7000-nl-kader84-vleugel77.svg");
    expect(a.svg).toContain("Fabrikantsdoorsnede");
    expect(a.svg).not.toContain("Parametrische doorsnede");
  });

  it("kiest de zware deurvleugel (96 mm) voor een deur op hetzelfde kader", () => {
    // Bij kader 170054 hoort voor deuren vleugel 170033 — een andere
    // combinatie, dus een andere doorsnede (PROFIELGEGEVENS-EKO4U.md).
    const a = detailA(bereken(standaardConfiguratie("aluplast-ideal-7000-aanslag", "voordeur"), AANNEMER));
    expect(a.svg).toContain("/configurator/profielen/aluplast-ideal-7000-nl-17054-17033-deur.svg");
  });

  it("gebruikt de HST 85-doorsnede voor de aluplast hefschuifpui", () => {
    const a = detailA(bereken(standaardConfiguratie("aluplast-hst85-vlak", "schuifpui"), AANNEMER));
    expect(a.svg).toContain("/configurator/profielen/aluplast-hst85-standard-170x80-170x81.svg");
  });

  it("valt terug op de parametrische doorsnede zonder passende fabrikant-SVG", () => {
    // Voor Gealan zijn (nog) geen catalogusdoorsneden opgehaald.
    const a = detailA(bereken(standaardConfiguratie("gealan-s9000-aanslag"), AANNEMER));
    expect(a.svg).toContain("Parametrische doorsnede");
    expect(a.svg).not.toContain("/configurator/profielen/");
  });

  it("valt terug voor uitvoeringen waar de doorsnede niet bij hoort", () => {
    // De kader84/vleugel77-doorsnede is van het NL-blokprofiel mét aanslag;
    // de vlakke uitvoering mag hem dus niet tonen.
    const a = detailA(bereken(standaardConfiguratie("aluplast-ideal-7000-vlak"), AANNEMER));
    expect(a.svg).toContain("Parametrische doorsnede");
    expect(a.svg).not.toContain("/configurator/profielen/");
  });

  it("voegt de fabrikant-SVG alleen als afbeelding in, nooit als markup", () => {
    // De doorsnede wordt via <image href> getoond: in die context voert de
    // browser geen scripts of externe verwijzingen uit het bestand uit.
    const a = detailA(bereken(standaardConfiguratie(), AANNEMER));
    expect(a.svg).toContain("<image ");
    expect(a.svg).not.toContain("<script");
  });
});

describe("perspectief", () => {
  it("tekent hetzelfde kozijn met diepte erbij", async () => {
    const { tekenIsometrie } = await import("../engine/isometrie");
    const { bereken } = await import("../engine");
    const { standaardConfiguratie } = await import("../data/standaard");
    const opties = { context: "aannemer" as const, aannemersmarge: 0.25 };

    const b = bereken(standaardConfiguratie(), opties);
    const binnen = tekenIsometrie(b, "binnen");

    // De tekening is breder dan het kozijn: dat is de diepte die wegloopt.
    expect(binnen.breedte).toBeGreaterThan(b.configuratie.breedte);
    expect(binnen.svg).toContain("<svg");

    // Van buiten gezien loopt de diepte de andere kant op, dus het beeld wijkt af.
    const buiten = tekenIsometrie(b, "buiten");
    expect(buiten.svg).not.toBe(binnen.svg);
  });

  it("zet de vleugel vóór het kader bij een draaikiepraam", async () => {
    const { tekenIsometrie } = await import("../engine/isometrie");
    const { bereken } = await import("../engine");
    const { standaardConfiguratie } = await import("../data/standaard");
    const opties = { context: "aannemer" as const, aannemersmarge: 0.25 };

    const vast = tekenIsometrie(bereken(standaardConfiguratie(), opties), "binnen");
    const raam = tekenIsometrie(
      bereken(standaardConfiguratie("aluplast-ideal-7000-aanslag", "draaikiep"), opties),
      "binnen"
    );

    // Een vleugel bestaat uit vier extra balken; die maken de tekening voller.
    expect(raam.svg.length).toBeGreaterThan(vast.svg.length);
  });
});

describe("3D vanaf de buitenzijde", () => {
  it("kijkt van de andere kant, zodat een naar binnen draaiende vleugel van je af zwaait", async () => {
    const { tekenIsometrie } = await import("../engine/isometrie");
    const { bereken } = await import("../engine");
    const { standaardConfiguratie } = await import("../data/standaard");
    const opties = { context: "aannemer" as const, aannemersmarge: 0.25 };

    const b = bereken(standaardConfiguratie("aluplast-ideal-7000-aanslag", "draaikiep"), opties);
    const binnen = tekenIsometrie(b, "binnen", { opening: 0.8 });
    const buiten = tekenIsometrie(b, "buiten", { opening: 0.8 });

    // Twee verschillende kanten van hetzelfde kozijn.
    expect(buiten.svg).not.toBe(binnen.svg);

    // Dicht en open verschillen aan beide zijden: de vleugel beweegt echt mee.
    const buitenDicht = tekenIsometrie(b, "buiten", { opening: 0 });
    expect(buiten.svg).not.toBe(buitenDicht.svg);
  });
});
