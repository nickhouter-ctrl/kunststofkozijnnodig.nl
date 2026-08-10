/**
 * Tests op regel 6 (klantofferte en fabrieksorder strikt gescheiden) en op de
 * order-lock uit hoofdstuk 18.2.
 */
import { describe, expect, it } from "vitest";
import { bereken } from "../engine";
import {
  FabrieksorderZonderKostprijsFout,
  KostprijsInKlantdocumentFout,
  REBU_BRANDING,
  berekenLeverweek,
  fabrieksorder,
  klantofferte,
} from "../engine/documenten";
import type { Profielkaart } from "../types";
import { orderLock } from "../engine/orderlock";
import { standaardConfiguratie } from "../data/standaard";
import type { Documentgegevens } from "../engine/documenten";

const AANNEMER = { context: "aannemer" as const, aannemersmarge: 0.25 };
const REBU = { context: "aannemer" as const, aannemersmarge: 0.25, toonKostprijs: true };

const GEGEVENS: Documentgegevens = {
  nummer: "OF-2026-0001",
  datum: "27 juli 2026",
  klantnaam: "Fam. De Vries",
  projectadres: "Dorpsstraat 12, Utrecht",
  leverweek: "week 40 van 2026",
};

describe("regel 6 — strikt gescheiden documenten", () => {
  it("weigert een klantofferte te maken uit een berekening mét inkoopprijs", () => {
    const metInkoop = bereken(standaardConfiguratie(), REBU);
    expect(() => klantofferte(metInkoop, GEGEVENS, REBU_BRANDING)).toThrow(
      KostprijsInKlantdocumentFout
    );
  });

  it("weigert een fabrieksorder te maken zonder inkoopprijs", () => {
    const zonderInkoop = bereken(standaardConfiguratie(), AANNEMER);
    expect(() => fabrieksorder(zonderInkoop, GEGEVENS)).toThrow(FabrieksorderZonderKostprijsFout);
  });

  it("laat geen enkel inkoopbedrag in de klantofferte terechtkomen", () => {
    const b = bereken(standaardConfiguratie(), AANNEMER);
    const rebu = bereken(standaardConfiguratie(), REBU);
    const html = klantofferte(b, GEGEVENS, REBU_BRANDING);

    // De inkoopprijs van dezelfde configuratie mag nergens in de tekst staan.
    const kostprijsEuro = (rebu.prijs.kostprijsPerStuk! / 100).toFixed(2).replace(".", ",");
    expect(html).not.toContain(kostprijsEuro);
    expect(html.toLowerCase()).not.toContain("kostprijs");
  });

  it("zet de verkoopprijs juist niet in de fabrieksorder", () => {
    const rebu = bereken(standaardConfiguratie(), REBU);
    const html = fabrieksorder(rebu, GEGEVENS);
    const verkoopEuro = (rebu.prijs.klantprijsTotaalInclBtw / 100).toFixed(2).replace(".", ",");
    expect(html).not.toContain(verkoopEuro);
  });

  it("baseert beide documenten op dezelfde maatvoering", () => {
    const klant = bereken(standaardConfiguratie(), AANNEMER);
    const fabriek = bereken(standaardConfiguratie(), REBU);
    const offerteHtml = klantofferte(klant, GEGEVENS, REBU_BRANDING);
    const orderHtml = fabrieksorder(fabriek, GEGEVENS);

    for (const vak of klant.vakken) {
      const glasmaat = `${vak.glasBreedte} × ${vak.glasHoogte}`;
      expect(offerteHtml).toContain(glasmaat);
      expect(orderHtml).toContain(glasmaat);
    }
    expect(offerteHtml).toContain(klant.cilindermaat.notatie);
    expect(orderHtml).toContain(fabriek.cilindermaat.notatie);
  });

  it("vermeldt in beide documenten de maten van niet-meegeleverde onderdelen", () => {
    const c = standaardConfiguratie();
    c.glas = { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" };
    c.beslag = { beslagId: null, cilinderMeegeleverd: false };
    c.hortypeId = null;

    const offerteHtml = klantofferte(bereken(c, AANNEMER), GEGEVENS, REBU_BRANDING);
    const orderHtml = fabrieksorder(bereken(c, REBU), GEGEVENS);

    expect(offerteHtml).toContain("Glas niet meegeleverd — vereiste glasmaat");
    expect(offerteHtml).toContain("Cilinder niet meegeleverd");
    expect(offerteHtml).toContain("Hor niet meegeleverd");
    expect(orderHtml).toContain("NEE");
  });

  it("neemt in beide documenten de verplichte detailtekeningen op", () => {
    const offerteHtml = klantofferte(bereken(standaardConfiguratie(), AANNEMER), GEGEVENS, REBU_BRANDING);
    const orderHtml = fabrieksorder(bereken(standaardConfiguratie(), REBU), GEGEVENS);
    for (const html of [offerteHtml, orderHtml]) {
      for (const detail of ["Detail A", "Detail B", "Detail C", "Detail D", "Detail E", "Detail G"]) {
        expect(html).toContain(detail);
      }
      expect(html).toContain("<svg");
    }
  });
});

describe("profielgegevens per uitvoering in de documenten", () => {
  it("toont de per-uitvoering maten ook in de klantofferte", () => {
    const b = bereken(standaardConfiguratie(), AANNEMER);
    const html = klantofferte(b, GEGEVENS, REBU_BRANDING);

    // De maten die per uitvoering verschillen (PROFIELGEGEVENS-EKO4U.md) horen
    // zichtbaar te zijn voor de klant, niet alleen in de fabrieksorder.
    expect(html).toContain(`${b.profiel.inbouwdiepte.waarde} mm`);
    expect(html).toContain(`${b.profiel.kamers.waarde} kamers`);
    expect(html).toContain(`Maximale glasdikte`);
    expect(html).toContain(`${b.profiel.maxGlasdikte.waarde} mm`);
    expect(html).toContain(b.profiel.uitvoeringLabel);
  });

  it("toont de maximale glasdikte van de uitvoering in de fabrieksorder", () => {
    const b = bereken(standaardConfiguratie(), REBU);
    const html = fabrieksorder(b, GEGEVENS);
    expect(html).toContain(`Maximale glasdikte`);
    expect(html).toContain(`${b.profiel.maxGlasdikte.waarde} mm`);
  });

  it("toont de profielkaartvelden zodra de uitvoering ze heeft", () => {
    const b = bereken(standaardConfiguratie(), AANNEMER);
    const kaart: Profielkaart = {
      profielklasse: "B",
      afdichtingen: 2,
      staal: "standaard open staal 1,5 mm",
      antiInbraak: "twee anti-inbraakpunten aan de vleugel",
    };
    const html = klantofferte(
      { ...b, profiel: { ...b.profiel, profielkaart: kaart } },
      GEGEVENS,
      REBU_BRANDING
    );

    expect(html).toContain("Profielklasse");
    expect(html).toContain("2 afdichtingen");
    expect(html).toContain("standaard open staal 1,5 mm");
    expect(html).toContain("twee anti-inbraakpunten aan de vleugel");
  });

  it("laat de profielkaartrijen weg zolang de uitvoering geen kaart heeft", () => {
    // Gealan heeft (nog) geen catalogusblad in het datamodel; aluplast wél.
    const b = bereken(standaardConfiguratie("gealan-s9000-aanslag"), AANNEMER);
    const html = klantofferte(b, GEGEVENS, REBU_BRANDING);
    // Geen lege rijen of 'undefined' in het document wanneer de data ontbreekt.
    expect(html).not.toContain("Profielklasse");
    expect(html).not.toContain("undefined");
  });

  it("toont nooit 'null' wanneer de catalogus een kaartveld niet noemt", () => {
    const b = bereken(standaardConfiguratie("gealan-s9000-aanslag"), AANNEMER);
    const kaart: Profielkaart = {
      profielklasse: null,
      afdichtingen: 2,
      staal: null,
      antiInbraak: null,
      hfl: null,
    };
    const html = klantofferte(
      { ...b, profiel: { ...b.profiel, profielkaart: kaart } },
      GEGEVENS,
      REBU_BRANDING
    );

    expect(html).toContain("2 afdichtingen");
    expect(html).not.toContain("null");
    expect(html).not.toContain("HFL");
  });
});

describe("leverweek", () => {
  it("rekent voor een deur een langere levertijd", () => {
    const raam = standaardConfiguratie();
    const deur = standaardConfiguratie();
    deur.kozijnType = "voordeur";

    const start = new Date("2026-01-05T00:00:00Z");
    const weekRaam = berekenLeverweek(start, bereken(raam, AANNEMER));
    const weekDeur = berekenLeverweek(start, bereken(deur, AANNEMER));
    expect(weekRaam).toMatch(/^week \d+ van \d{4}$/);
    expect(weekDeur).not.toBe(weekRaam);
  });
});

describe("order-lock", () => {
  it("laat een geldige configuratie door", () => {
    const resultaat = orderLock(bereken(standaardConfiguratie(), REBU));
    expect(resultaat.magBevestigen).toBe(true);
    expect(resultaat.gefaald).toHaveLength(0);
    expect(resultaat.controles.length).toBeGreaterThanOrEqual(6);
  });

  it("blokkeert een order met een blokkerende bevinding", () => {
    const c = standaardConfiguratie();
    c.breedte = 6000;
    const resultaat = orderLock(bereken(c, REBU));
    expect(resultaat.magBevestigen).toBe(false);
    expect(resultaat.gefaald.some((x) => x.id === "maten-binnen-tolerantie")).toBe(true);
  });

  it("blokkeert een order zonder marge", () => {
    const resultaat = orderLock(
      bereken(standaardConfiguratie(), { context: "aannemer", aannemersmarge: 0, toonKostprijs: true })
    );
    expect(resultaat.magBevestigen).toBe(false);
    expect(resultaat.gefaald.some((x) => x.id === "marge-positief")).toBe(true);
  });

  it("blokkeert een order zonder naam", () => {
    const c = standaardConfiguratie();
    c.naam = "   ";
    const resultaat = orderLock(bereken(c, REBU));
    expect(resultaat.gefaald.some((x) => x.id === "naam-ingevuld")).toBe(true);
  });

  it("keurt een configuratie zonder glas, cilinder en hor gewoon goed", () => {
    // Dit mág: de maten zijn er, alleen de producten niet (regel 2).
    const c = standaardConfiguratie();
    c.glas = { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" };
    c.beslag = { beslagId: null, cilinderMeegeleverd: false };
    c.hortypeId = null;
    const resultaat = orderLock(bereken(c, REBU));
    expect(resultaat.magBevestigen).toBe(true);
  });
});
