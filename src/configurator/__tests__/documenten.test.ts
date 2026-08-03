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
