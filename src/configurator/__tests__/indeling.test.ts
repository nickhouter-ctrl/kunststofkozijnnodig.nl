/**
 * Tests op de indelingsboom: stijlen, roosters tussen stijlen, schuifpuien en
 * de geometrie waar zowel de tekening als het bewerkvlak op tekenen.
 */
import { describe, expect, it, vi } from "vitest";
import { bereken } from "../engine";
import { berekenGeometrie } from "../engine/maten";
import {
  PUISCHEMAS,
  SCHUIFPUI_STIJL,
  STIJL_STANDAARD,
  blancoIndeling,
  knoopOpId,
  kopieerIndeling,
  maakSchuifpui,
  nieuwVak,
  splitsingenVan,
  vakkenVan,
  verwijderKnoop,
  voegRoosterBovenToe,
  voegStijlenToe,
  wijzigVak,
  zoekOuder,
} from "../engine/indeling";
import { profielOpId } from "../data/profielen";
import { standaardConfiguratie } from "../data/standaard";
import type { Configuratie, Indeling, Splitsing } from "../types";

const AANNEMER = { context: "aannemer" as const, aannemersmarge: 0.25 };
const PROFIEL = profielOpId("aluplast-ideal-7000-aanslag")!;

function metIndeling(indeling: Indeling, patch: Partial<Configuratie> = {}): Configuratie {
  return { ...standaardConfiguratie(), indeling, ...patch };
}

describe("stijlen toevoegen", () => {
  it("begint blanco met één vak vast glas", () => {
    const indeling = blancoIndeling();
    expect(indeling.soort).toBe("vak");
    expect(vakkenVan(indeling)).toHaveLength(1);
    expect(vakkenVan(indeling)[0].invulling).toBe("vast");
  });

  it("maakt met één stijl twee vakken en met drie stijlen vier vakken", () => {
    const basis = blancoIndeling();
    expect(vakkenVan(voegStijlenToe(basis, basis.id, "kolommen", 1))).toHaveLength(2);
    expect(vakkenVan(voegStijlenToe(basis, basis.id, "kolommen", 3))).toHaveLength(4);
  });

  it("zet extra vakken in dezelfde splitsing in plaats van te nesten", () => {
    const basis = blancoIndeling();
    const twee = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const vakken = vakkenVan(twee);
    const drie = voegStijlenToe(twee, vakken[1].id, "kolommen", 1);

    // Eén splitsing met drie kinderen, niet twee geneste splitsingen.
    expect(splitsingenVan(drie)).toHaveLength(1);
    expect(vakkenVan(drie)).toHaveLength(3);
  });

  it("nest wél wanneer de as verschilt", () => {
    const basis = blancoIndeling();
    const kolommen = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const gemengd = voegStijlenToe(kolommen, vakkenVan(kolommen)[0].id, "rijen", 1);

    expect(splitsingenVan(gemengd)).toHaveLength(2);
    expect(vakkenVan(gemengd)).toHaveLength(3);
  });

  it("heft de splitsing op wanneer er één vak overblijft", () => {
    const basis = blancoIndeling();
    const twee = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const terug = verwijderKnoop(twee, vakkenVan(twee)[1].id);

    expect(terug.soort).toBe("vak");
    expect(vakkenVan(terug)).toHaveLength(1);
  });

  it("laat de wortel niet verwijderen", () => {
    const basis = blancoIndeling();
    expect(verwijderKnoop(basis, basis.id)).toBe(basis);
  });
});

describe("geometrie", () => {
  it("trekt per stijl de stijlbreedte af en houdt de som exact", () => {
    const basis = blancoIndeling();
    const c = metIndeling(voegStijlenToe(basis, basis.id, "kolommen", 2), {
      breedte: 3000,
      hoogte: 1500,
    });
    const geo = berekenGeometrie(c, PROFIEL);

    expect(geo.vakken).toHaveLength(3);
    expect(geo.stijlen).toHaveLength(2);

    const vakBreedte = geo.vakken.reduce((s, v) => s + v.gebied.breedte, 0);
    const stijlBreedte = geo.stijlen.reduce((s, v) => s + v.breedte, 0);
    expect(vakBreedte + stijlBreedte).toBe(3000 - 2 * PROFIEL.geometrie.kozijnZichtbreedte.waarde);
    expect(stijlBreedte).toBe(2 * STIJL_STANDAARD);
  });

  it("verdeelt rijen van boven naar beneden", () => {
    const basis = blancoIndeling();
    const c = metIndeling(voegStijlenToe(basis, basis.id, "rijen", 1), {
      breedte: 1200,
      hoogte: 2000,
    });
    const geo = berekenGeometrie(c, PROFIEL);
    expect(geo.vakken).toHaveLength(2);
    expect(geo.vakken[0].gebied.onderkant).toBeLessThan(geo.vakken[1].gebied.topLinks);
    expect(geo.stijlen[0].as).toBe("rijen");
  });

  it("levert altijd vier klikbare kozijnlijsten", () => {
    const geo = berekenGeometrie(standaardConfiguratie(), PROFIEL);
    expect(geo.kozijndelen.map((k) => k.zijde).sort()).toEqual(
      ["boven", "links", "onder", "rechts"].sort()
    );
  });

  it("houdt een vaste maat vast en laat de rest opvullen", () => {
    const basis = blancoIndeling();
    let indeling = voegStijlenToe(basis, basis.id, "kolommen", 1);
    indeling = wijzigVak(indeling, vakkenVan(indeling)[0].id, { vasteMaat: 500 });

    for (const breedte of [1400, 2000, 2600]) {
      const geo = berekenGeometrie(metIndeling(indeling, { breedte }), PROFIEL);
      expect(geo.vakken[0].gebied.breedte).toBe(500);
    }
  });
});

describe("rooster tussen stijlen", () => {
  it("zet een roostervak boven het vak met een stijl ertussen", () => {
    const basis = blancoIndeling();
    const met = voegRoosterBovenToe(basis, basis.id, "rooster-standaard", 60);

    const vakken = vakkenVan(met);
    expect(vakken).toHaveLength(2);
    expect(vakken[0].invulling).toBe("rooster");
    expect(vakken[0].roosterId).toBe("rooster-standaard");
    // Het rooster heeft een vaste bouwhoogte en schaalt niet mee met het glas.
    expect(vakken[0].vasteMaat).toBe(60);
    // Er zit een horizontale stijl direct onder.
    expect(zoekOuder(met, vakken[0].id)?.as).toBe("rijen");
  });

  it("houdt de bouwhoogte van het roostervak vast bij een hoger kozijn", () => {
    const basis = blancoIndeling();
    const indeling = voegRoosterBovenToe(basis, basis.id, "rooster-standaard", 60);

    for (const hoogte of [1200, 1800, 2400]) {
      const geo = berekenGeometrie(metIndeling(indeling, { hoogte }), PROFIEL);
      const rooster = geo.vakken[0];
      expect(rooster.gebied.onderkant - rooster.gebied.topLinks).toBe(60);
    }
  });

  it("rekent voor een roostervak een vulmaat uit, geen glasgewicht", () => {
    const basis = blancoIndeling();
    const c = metIndeling(voegRoosterBovenToe(basis, basis.id, "rooster-standaard", 60));
    const b = bereken(c, AANNEMER);

    const rooster = b.vakken.find((v) => v.vulsoort === "rooster")!;
    expect(rooster.glasBreedte).toBeGreaterThan(0);
    expect(rooster.glasHoogte).toBeGreaterThan(0);
    expect(rooster.glasGewichtKg).toBeNull();
    // De hormaat blijft ook op een roostervak berekend (regel 2).
    expect(rooster.horBreedte).toBeGreaterThan(0);
  });
});

describe("schuifpui", () => {
  it("levert de schema's die de fabrikant voert", () => {
    // Aluplast HST 85 kent zeven schema's; per schema ligt vast welk deel
    // schuift en welke kant het op gaat. Wij voeren ze allemaal, plus de
    // 4-delige met twee schuivende vleugels in het midden.
    expect(PUISCHEMAS.length).toBeGreaterThanOrEqual(7);

    for (const schema of PUISCHEMAS) {
      const basis = blancoIndeling();
      const vakkenIn = vakkenVan(maakSchuifpui(basis, basis.id, schema.id));
      expect(vakkenIn).toHaveLength(schema.delen.length);

      schema.delen.forEach((deel, i) => {
        if (deel.soort === "vast") {
          expect(vakkenIn[i].invulling).toBe("vast");
        } else {
          expect(vakkenIn[i].invulling).toBe("schuifvleugel");
          expect(vakkenIn[i].draairichting).toBe(deel.naar);
        }
      });

      // Elk schema wijst precies één loopdeur aan.
      expect(schema.delen.filter((d) => d.soort === "schuift" && d.loopdeur)).toHaveLength(1);
    }
  });

  it("geeft elke schuifpui zijn eigen, zwaardere stijlen", () => {
    const basis = blancoIndeling();
    const pui = maakSchuifpui(basis, basis.id, "4-midden-actief");

    const splitsingen = splitsingenVan(pui);
    expect(splitsingen).toHaveLength(1);
    expect(splitsingen[0].scheidingBreedte).toBe(SCHUIFPUI_STIJL);
    expect(splitsingen[0].scheidingBreedte).toBeGreaterThan(STIJL_STANDAARD);
    expect(vakkenVan(pui)).toHaveLength(4);
  });

  it("zet vaste en schuivende panelen volgens het schema", () => {
    const basis = blancoIndeling();
    const pui = maakSchuifpui(basis, basis.id, "4-midden-actief");
    const vakken = vakkenVan(pui);

    expect(vakken.map((v) => v.invulling)).toEqual([
      "vast",
      "schuifvleugel",
      "schuifvleugel",
      "vast",
    ]);
    expect(vakken[1].draairichting).toBe("links");
    expect(vakken[2].draairichting).toBe("rechts");
  });

  it("rekent voor elke schuifvleugel een glasmaat uit", () => {
    const basis = blancoIndeling();
    const c = metIndeling(maakSchuifpui(basis, basis.id, "3-midden-actief"), {
      breedte: 4000,
      hoogte: 2300,
      kozijnType: "schuifpui",
    });
    const b = bereken(c, AANNEMER);

    expect(b.vakken).toHaveLength(3);
    for (const vak of b.vakken) {
      expect(vak.glasBreedte).toBeGreaterThan(0);
      expect(vak.glasHoogte).toBeGreaterThan(0);
    }
    // De schuivende vleugel valt met de aanslag over het kozijn: breder dan de sponning.
    const schuivend = b.vakken[1];
    expect(schuivend.vleugelBreedte).toBeGreaterThan(schuivend.sponningBreedte);
  });
});

describe("dupliceren", () => {
  it("geeft de kopie eigen id's, zodat hij niet meebeweegt", () => {
    const basis = voegStijlenToe(blancoIndeling(), blancoIndeling().id, "kolommen", 1);
    const enkel = nieuwVak("Los");
    const kopie = kopieerIndeling(enkel);
    expect(kopie.id).not.toBe(enkel.id);
    expect(basis).toBeDefined();
  });

  it("kopieert een hele boom met nieuwe id's", () => {
    const basis = blancoIndeling();
    const boom = voegStijlenToe(basis, basis.id, "kolommen", 2);
    const kopie = kopieerIndeling(boom);

    const origineleIds = new Set([
      ...vakkenVan(boom).map((v) => v.id),
      ...splitsingenVan(boom).map((s) => s.id),
    ]);
    for (const vak of vakkenVan(kopie)) expect(origineleIds.has(vak.id)).toBe(false);
    for (const spl of splitsingenVan(kopie)) expect(origineleIds.has(spl.id)).toBe(false);
    expect(vakkenVan(kopie)).toHaveLength(vakkenVan(boom).length);
  });
});

describe("volledigheid over samengestelde indelingen", () => {
  it("houdt regel 2 overeind bij een genest kozijn met rooster en schuifpui", () => {
    // Bovenlicht met rooster, daaronder een 3-delige schuifpui.
    const basis = blancoIndeling();
    let indeling = voegRoosterBovenToe(basis, basis.id, "rooster-standaard", 60);
    const onderste = vakkenVan(indeling)[1];
    indeling = maakSchuifpui(indeling, onderste.id, "3-midden-actief");

    const c = metIndeling(indeling, {
      breedte: 4200,
      hoogte: 2400,
      kozijnType: "schuifpui",
      glas: { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" },
      beslag: { beslagId: null, cilinderMeegeleverd: false },
      hortypeId: null,
    });
    const b = bereken(c, AANNEMER);

    expect(b.vakken).toHaveLength(4);
    for (const vak of b.vakken) {
      expect(Number.isInteger(vak.glasBreedte)).toBe(true);
      expect(vak.glasBreedte).toBeGreaterThan(0);
      expect(vak.glasHoogte).toBeGreaterThan(0);
      expect(vak.horBreedte).toBeGreaterThan(0);
      expect(vak.horHoogte).toBeGreaterThan(0);
    }
    expect(b.cilindermaat.binnen).toBeGreaterThan(0);
  });
});

describe("hoekverbinding", () => {
  it("tekent bij houtlook doorlopende regels en bij verstek diagonale naden", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const basis = standaardConfiguratie();

    const houtlook = tekenAanzicht(bereken({ ...basis, hoekverbinding: "houtlook" }, AANNEMER));
    const verstek = tekenAanzicht(bereken({ ...basis, hoekverbinding: "verstek" }, AANNEMER));

    // De twee aanzichten zijn aantoonbaar verschillend: de hoek is zichtbaar.
    expect(houtlook.inhoud).not.toBe(verstek.inhoud);

    const zicht = PROFIEL.geometrie.kozijnZichtbreedte.waarde;
    const b = basis.breedte;

    // Bij houtlook loopt de bovenregel door over de VOLLE breedte: de lijst
    // gaat van 0 tot de volle breedte op de binnenkant van de regel.
    expect(houtlook.inhoud).toContain(`M 0 0 L ${b} 0 L ${b} ${zicht} L 0 ${zicht} Z`);

    // Bij verstek versmalt diezelfde regel juist naar de binnenhoeken toe.
    expect(verstek.inhoud).toContain(`M 0 0 L ${b} 0 L ${b - zicht} ${zicht} L ${zicht} ${zicht} Z`);
    expect(verstek.inhoud).not.toContain(`M 0 0 L ${b} 0 L ${b} ${zicht} L 0 ${zicht} Z`);
  });

  it("past detail C aan op de gekozen hoekverbinding", async () => {
    const { genereerTekeningen } = await import("../engine/tekening");
    const basis = standaardConfiguratie();

    const houtlook = genereerTekeningen(bereken({ ...basis, hoekverbinding: "houtlook" }, AANNEMER)).find(
      (t) => t.id === "C"
    )!;
    const verstek = genereerTekeningen(bereken({ ...basis, hoekverbinding: "verstek" }, AANNEMER)).find(
      (t) => t.id === "C"
    )!;

    expect(houtlook.svg).toContain("houtlook");
    expect(verstek.svg).toContain("verstek 45");
  });
});

describe("kleuren en houtnerf", () => {
  it("houdt houtnerf en zandstructuur strikt uit elkaar", async () => {
    const { KLEUREN } = await import("../data/kleuren");
    const aluplast = KLEUREN.filter((k) => k.merk === "aluplast");

    // 'Nerf' is een houtnerfreliëf; 'Zandstructuur / Glad' juist niet.
    const nerf = aluplast.filter((k) => k.structuur === "Nerf");
    const zand = aluplast.filter((k) => k.structuur === "Zandstructuur / Glad");
    expect(nerf.length).toBeGreaterThan(0);
    expect(zand.length).toBeGreaterThan(0);
    expect(nerf.every((k) => k.houtnerf === true)).toBe(true);
    expect(zand.every((k) => k.houtnerf === false)).toBe(true);

    // Ook de varianten op 'nerf' tellen als houtnerf.
    for (const k of aluplast) {
      const heeftNerfInTekst = /nerf/i.test(k.structuur ?? "");
      expect(k.houtnerf).toBe(heeftNerfInTekst);
    }
  });

  it("markeert onbekende structuur als null, niet als 'geen nerf'", async () => {
    const { KLEUREN, isBasiskleur } = await import("../data/kleuren");
    // Gealan en Kömmerling leveren de structuur van hun folies niet aan. Van de
    // ongefolieerde basiskleuren weten we het wél: die zijn glad.
    for (const merk of ["gealan", "kommerling"] as const) {
      const folies = KLEUREN.filter((k) => k.merk === merk && !isBasiskleur(k));
      expect(folies.length).toBeGreaterThan(0);
      expect(folies.every((k) => k.houtnerf === null)).toBe(true);
    }
  });

  it("geeft elke Aluplast-folie een AP-code", async () => {
    const { KLEUREN, isBasiskleur } = await import("../data/kleuren");
    const folies = KLEUREN.filter((k) => k.merk === "aluplast" && !isBasiskleur(k));
    expect(folies).toHaveLength(66);
    for (const k of folies) expect(k.code).toMatch(/^AP\d+$/);
  });

  it("begint met wit RAL 9016 zonder folie, en rekent daar geen folietoeslag voor", async () => {
    const { standaardKleur, isBasiskleur, kleurenVanMerk } = await import("../data/kleuren");

    for (const merk of ["aluplast", "gealan", "kommerling"] as const) {
      const standaard = standaardKleur(merk);
      expect(standaard.ral).toBe("RAL 9016");
      expect(isBasiskleur(standaard)).toBe(true);
      // Crèmewit staat er direct naast, ook zonder folie.
      expect(kleurenVanMerk(merk).some((k) => k.ral === "RAL 9001" && isBasiskleur(k))).toBe(true);
    }

    // Standaard wit: geen folieregel op de offerte.
    const wit = bereken(standaardConfiguratie(), AANNEMER);
    expect(wit.prijs.regels.some((r) => r.omschrijving.startsWith("Folie"))).toBe(false);

    // Zodra er een folie op gaat, komt de toeslag er wél bij.
    const folie = kleurenVanMerk(PROFIEL.merk).find((k) => k.swatch !== null)!;
    const gefolied = bereken(
      { ...standaardConfiguratie(), kleurBuitenId: folie.id },
      AANNEMER
    );
    expect(gefolied.prijs.regels.some((r) => r.omschrijving.startsWith("Folie"))).toBe(true);
    expect(gefolied.prijs.klantprijsTotaalInclBtw).toBeGreaterThan(wit.prijs.klantprijsTotaalInclBtw);
  });

  it("zet de kleurcode én de structuur op de fabrieksorder", async () => {
    const { fabrieksorder } = await import("../engine/documenten");
    const b = bereken(standaardConfiguratie(), {
      context: "aannemer",
      aannemersmarge: 0.25,
      toonKostprijs: true,
    });
    const html = fabrieksorder(b, {
      nummer: "FO-TEST",
      datum: "27 juli 2026",
      klantnaam: "Test",
      projectadres: "Test",
      leverweek: "week 40 van 2026",
    });
    expect(html).toContain(b.kleurBinnen!.code);
    expect(html).toContain(b.kleurBinnen!.structuur!);
  });
});

describe("maten in de tekening", () => {
  it("levert voor elke maat een label mét wat het aanstuurt", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const basis = blancoIndeling();
    const c = metIndeling(voegStijlenToe(basis, basis.id, "kolommen", 1), {
      breedte: 1000,
      hoogte: 1200,
    });
    const aanzicht = tekenAanzicht(bereken(c, AANNEMER), "binnen", { maten: true });

    const doelen = aanzicht.maatlabels.map((m) => m.doel);
    // Alleen hartmaten en totaalmaten; losse vakmaten maken de tekening druk.
    expect(doelen).toContain("hart");
    expect(doelen).toContain("totaalBreedte");
    expect(doelen).toContain("totaalHoogte");
    expect(doelen).not.toContain("vakmaat");

    // Elke stijl wordt vanaf béide zijden bemaat.
    const harten = aanzicht.maatlabels.filter((m) => m.doel === "hart");
    expect(harten.map((m) => (m.doel === "hart" ? m.vanaf : null)).sort()).toEqual([
      "links",
      "rechts",
    ]);
    // Samen vormen ze de volle breedte.
    expect(harten[0].waarde + harten[1].waarde).toBe(1000);

    // De totaalmaten dragen de werkelijke kozijnmaat.
    expect(aanzicht.maatlabels.find((m) => m.doel === "totaalBreedte")!.waarde).toBe(1000);
    expect(aanzicht.maatlabels.find((m) => m.doel === "totaalHoogte")!.waarde).toBe(1200);

    // De hartmaat ligt bij twee gelijke vakken exact in het midden.
    expect(aanzicht.maatlabels.find((m) => m.doel === "hart")!.waarde).toBe(500);
  });

  it("verschuift de stijl wanneer de hartmaat wordt overgetypt", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { wijzigSplitsing } = await import("../engine/indeling");

    const basis = blancoIndeling();
    const start = metIndeling(voegStijlenToe(basis, basis.id, "kolommen", 1), {
      breedte: 1000,
      hoogte: 1200,
    });
    const geo = berekenGeometrie(start, PROFIEL);
    const stijl = geo.stijlen[0];

    // Dit is de rekenstap die het bewerkvlak uitvoert bij een nieuwe hartmaat:
    // de maat van het vak ervóór vastzetten zodat het hart uitkomt op 700.
    const gewenstHart = 700;
    const beginVak = stijl.x - stijl.vorigeMaat;
    const nieuweVakmaat = Math.round(gewenstHart - beginVak - stijl.breedte / 2);

    const splitsing = start.indeling;
    if (splitsing.soort !== "splitsing") throw new Error("verwacht een splitsing");
    const kinderen = splitsing.kinderen.map((kind, i) =>
      i === 0 ? { ...kind, vasteMaat: nieuweVakmaat } : { ...kind, vasteMaat: null }
    );
    const na = { ...start, indeling: wijzigSplitsing(start.indeling, splitsing.id, { kinderen }) };

    const labels = tekenAanzicht(bereken(na, AANNEMER), "binnen", { maten: true }).maatlabels;
    const vanafLinks = labels.find((m) => m.doel === "hart" && m.vanaf === "links");
    expect(vanafLinks!.waarde).toBe(gewenstHart);
  });
});

describe("vaste maten passen altijd binnen het kozijn", () => {
  it("laat de buurman meebewegen als je een vakmaat typt", async () => {
    const { zetVasteMaat } = await import("../engine/indeling");
    const basis = blancoIndeling();
    let indeling = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const [vak1, vak2] = vakkenVan(indeling);

    // Eerst vak 1 vastzetten, daarna vak 2 — vak 1 moet dan loslaten.
    indeling = zetVasteMaat(indeling, vak1.id, 581);
    indeling = zetVasteMaat(indeling, vak2.id, 500);

    const na = vakkenVan(indeling);
    expect(na[1].vasteMaat).toBe(500);
    expect(na[0].vasteMaat).toBeNull();
  });

  it("houdt de som exact gelijk aan de beschikbare ruimte", () => {
    const basis = blancoIndeling();
    const indeling = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const c = metIndeling(indeling, { breedte: 1000, hoogte: 1200 });
    const geo = berekenGeometrie(c, PROFIEL);

    const beschikbaar = 1000 - 2 * PROFIEL.geometrie.kozijnZichtbreedte.waarde;
    const som =
      geo.vakken.reduce((s, v) => s + v.gebied.breedte, 0) +
      geo.stijlen.reduce((s, v) => s + v.breedte, 0);
    expect(som).toBe(beschikbaar);
  });

  it("loopt nooit buiten het kozijn, ook niet bij onmogelijke vaste maten", () => {
    // Beide vakken bewust op een maat die samen niet past.
    const basis = blancoIndeling();
    let indeling = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const [vak1, vak2] = vakkenVan(indeling);
    indeling = wijzigVak(indeling, vak1.id, { vasteMaat: 900 });
    indeling = wijzigVak(indeling, vak2.id, { vasteMaat: 900 });

    const c = metIndeling(indeling, { breedte: 1000, hoogte: 1200 });
    const geo = berekenGeometrie(c, PROFIEL);
    const zicht = PROFIEL.geometrie.kozijnZichtbreedte.waarde;

    // Geen enkel vak steekt buiten de sponningopening van het kozijn uit.
    for (const { gebied } of geo.vakken) {
      expect(gebied.x).toBeGreaterThanOrEqual(zicht);
      expect(gebied.x + gebied.breedte).toBeLessThanOrEqual(1000 - zicht);
    }
    const som =
      geo.vakken.reduce((s, v) => s + v.gebied.breedte, 0) +
      geo.stijlen.reduce((s, v) => s + v.breedte, 0);
    expect(som).toBe(1000 - 2 * zicht);
  });
});

describe("paneeldiktes", () => {
  it("kent meerdere diktes met eigen isolatiewaarde", async () => {
    const { PANEELTYPES } = await import("../data/onderdelen");
    expect(PANEELTYPES.map((p) => p.dikte)).toEqual([24, 28, 40, 48]);
    // Dikker isoleert beter: de U-waarde loopt op elke stap omlaag.
    for (let i = 1; i < PANEELTYPES.length; i++) {
      expect(PANEELTYPES[i].uWaarde).toBeLessThan(PANEELTYPES[i - 1].uWaarde);
    }
  });

  it("blokkeert een paneel dat niet in de sponning past", async () => {
    const { wijzigVak } = await import("../engine/indeling");
    // IDEAL 4000 neemt maximaal 41 mm; een paneel van 48 mm past daar niet in.
    const basis = standaardConfiguratie("aluplast-ideal-4000-aanslag");
    const vak = vakkenVan(basis.indeling)[0];
    const c: Configuratie = {
      ...basis,
      indeling: wijzigVak(basis.indeling, vak.id, {
        invulling: "paneel",
        paneeltypeId: "paneel-48",
      }),
    };

    const b = bereken(c, AANNEMER);
    const bevinding = b.bevindingen.find((x) => x.regelId === "paneeldikte-past-in-sponning");
    expect(bevinding?.type).toBe("blokkade");
    expect(bevinding!.uitleg).toContain("48 mm");
  });

  it("rekent een dikker paneel duurder", async () => {
    const { wijzigVak } = await import("../engine/indeling");
    const REBU = { context: "aannemer" as const, aannemersmarge: 0.25, toonKostprijs: true };
    const basis = standaardConfiguratie();
    const vak = vakkenVan(basis.indeling)[0];

    const prijsVan = (paneeltypeId: string) =>
      bereken(
        {
          ...basis,
          indeling: wijzigVak(basis.indeling, vak.id, { invulling: "paneel", paneeltypeId }),
        },
        REBU
      ).prijs.kostprijsPerStuk!;

    expect(prijsVan("paneel-48")).toBeGreaterThan(prijsVan("paneel-24"));
  });
});

describe("paneelkleur in de tekening", () => {
  it("geeft een paneel dezelfde folie als het kozijn zolang er geen kleur is gekozen", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { wijzigVak } = await import("../engine/indeling");

    const basis = standaardConfiguratie();
    const vak = vakkenVan(basis.indeling)[0];
    const c: Configuratie = {
      ...basis,
      indeling: wijzigVak(basis.indeling, vak.id, { invulling: "paneel", paneelKleurId: null }),
    };
    const aanzicht = tekenAanzicht(bereken(c, AANNEMER));

    // Het paneel wordt met hetzelfde foliepatroon gevuld als de kozijnlijsten.
    const patroonGebruik = aanzicht.inhoud.match(/url\(#folie-binnen\)/g) ?? [];
    expect(patroonGebruik.length).toBeGreaterThan(4);
    // En nergens meer de oude, vaste paneelkleur.
    expect(aanzicht.inhoud).not.toContain("#ddd9d0");
  });

  it("geeft een paneel een eigen patroon zodra er een afwijkende kleur is gekozen", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { wijzigVak } = await import("../engine/indeling");
    const { kleurenVanMerk } = await import("../data/kleuren");

    const afwijkend = kleurenVanMerk("aluplast").find((k) => k.familie === "antraciet")!;
    const basis = standaardConfiguratie();
    const vak = vakkenVan(basis.indeling)[0];
    const c: Configuratie = {
      ...basis,
      indeling: wijzigVak(basis.indeling, vak.id, {
        invulling: "paneel",
        paneelKleurId: afwijkend.id,
      }),
    };
    const aanzicht = tekenAanzicht(bereken(c, AANNEMER));

    expect(aanzicht.defs).toContain("paneel-binnen-0");
    expect(aanzicht.inhoud).toContain("url(#paneel-binnen-0)");
  });
});

// ---------------------------------------------------------------------------
// Vleugelkleur en afwatering
// ---------------------------------------------------------------------------

describe("vleugelkleur", () => {
  it("laat de vleugel de kozijnkleur volgen zolang er geen eigen kleur is gekozen", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const c = standaardConfiguratie(PROFIEL.id, "draaikiep");
    const b = bereken(c, AANNEMER);

    expect(b.vleugelKleurBinnen?.id).toBe(b.kleurBinnen?.id);
    // Zonder eigen kleur komt er ook geen tweede patroon in de tekening.
    const aanzicht = tekenAanzicht(b, "binnen");
    expect(aanzicht.defs).not.toContain("folie-vleugel-binnen");
  });

  it("geeft de vleugel een eigen patroon zodra er een andere kleur is gekozen", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { kleurenVanMerk } = await import("../data/kleuren");

    const basis = standaardConfiguratie(PROFIEL.id, "draaikiep");
    const anders = kleurenVanMerk(PROFIEL.merk).find((k) => k.id !== basis.kleurBinnenId)!;
    const b = bereken({ ...basis, vleugelKleurBinnenId: anders.id }, AANNEMER);

    expect(b.vleugelKleurBinnen?.id).toBe(anders.id);
    // Het kader houdt zijn eigen kleur.
    expect(b.kleurBinnen?.id).toBe(basis.kleurBinnenId);

    const aanzicht = tekenAanzicht(b, "binnen");
    expect(aanzicht.defs).toContain("folie-vleugel-binnen");
    expect(aanzicht.inhoud).toContain("url(#folie-vleugel-binnen)");
  });

  it("blokkeert een vleugelkleur van een ander merk", () => {
    const basis = standaardConfiguratie(PROFIEL.id, "draaikiep");
    const b = bereken({ ...basis, vleugelKleurBuitenId: "gealan:g01" }, AANNEMER);
    expect(b.bevindingen.some((x) => x.regelId === "vleugelkleur-leverbaar")).toBe(true);
  });
});

describe("afwatering", () => {
  it("tekent de sleuven alleen in het buitenaanzicht", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { aantalAfwateringssleuven } = await import("../data/onderdelen");

    const c = standaardConfiguratie();
    const b = bereken(c, AANNEMER);
    const binnen = tekenAanzicht(b, "binnen");
    const buiten = tekenAanzicht(b, "buiten");

    // De sleuven zitten in de buitenwand van de onderregel; van binnen zie je ze niet.
    expect(buiten.inhoud).toContain("#3a3f3c");
    expect(binnen.inhoud).not.toContain("#3a3f3c");
    expect(aantalAfwateringssleuven(c.breedte)).toBeGreaterThanOrEqual(2);
  });

  it("laat het aantal sleuven meegroeien met de breedte", async () => {
    const { aantalAfwateringssleuven, AFWATERING } = await import("../data/onderdelen");
    const smal = aantalAfwateringssleuven(800);
    const breed = aantalAfwateringssleuven(800 + 4 * AFWATERING.maxTussenafstand.waarde);
    expect(breed).toBeGreaterThan(smal);
  });

  it("waarschuwt wanneer er bewust geen afwatering is gekozen", () => {
    const c = { ...standaardConfiguratie(), afwatering: "geen" as const };
    const b = bereken(c, AANNEMER);
    const melding = b.bevindingen.find((x) => x.regelId === "afwatering-aanwezig");
    expect(melding?.type).toBe("waarschuwing");
    // Het mag nooit een blokkade zijn: een binnenkozijn heeft ze niet nodig.
    expect(b.blokkeert).toBe(false);
  });

  it("zet de afwatering in de documenten", async () => {
    const { REBU_BRANDING, klantofferte } = await import("../engine/documenten");
    const b = bereken(standaardConfiguratie(), AANNEMER);
    const html = klantofferte(
      b,
      {
        nummer: "OF-TEST",
        datum: "1 januari 2026",
        klantnaam: "Test",
        projectadres: "Teststraat 1",
        leverweek: "week 1",
      },
      REBU_BRANDING
    );
    expect(html).toContain("Afwatering");
    expect(html).toContain("Zichtbare afwateringssleuven");
  });
});

describe("schaalVasteMaten", () => {
  it("laat een vastgezet vak zijn verhouding houden als het kozijn breder wordt", async () => {
    const { schaalVasteMaten, zetVasteMaat } = await import("../engine/indeling");

    // Kozijn van 1000 met twee vakken; het rechtervak wordt op 250 vastgezet.
    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const gesplitst = voegStijlenToe(basis.indeling, vak.id, "kolommen", 1);
    const rechts = vakkenVan(gesplitst)[1];
    const vastgezet = zetVasteMaat(gesplitst, rechts.id, 250);

    const smal = bereken({ ...basis, breedte: 1000, indeling: vastgezet }, AANNEMER);
    expect(smal.vakken[1].sponningBreedte).toBe(250);

    // Anderhalf keer zo breed: het vastgezette vak groeit evenredig mee.
    const geschaald = schaalVasteMaten(vastgezet, { breedte: 1500 / 1000, hoogte: 1 });
    const breed = bereken({ ...basis, breedte: 1500, indeling: geschaald }, AANNEMER);
    expect(breed.vakken[1].sponningBreedte).toBe(375);

    // En het buurvak vangt dus niet het hele verschil op.
    expect(breed.vakken[0].sponningBreedte - smal.vakken[0].sponningBreedte).toBeLessThan(500);
  });

  it("raakt de hoogtes niet aan bij een breedtewijziging", async () => {
    const { schaalVasteMaten, zetVasteMaat } = await import("../engine/indeling");

    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const gesplitst = voegStijlenToe(basis.indeling, vak.id, "rijen", 1);
    const onder = vakkenVan(gesplitst)[1];
    const vastgezet = zetVasteMaat(gesplitst, onder.id, 400);

    // Alleen de breedte verandert: een vastgezette hoogte blijft 400.
    const geschaald = schaalVasteMaten(vastgezet, { breedte: 2, hoogte: 1 });
    const b = bereken({ ...basis, breedte: 2000, indeling: geschaald }, AANNEMER);
    expect(b.vakken[1].sponningHoogte).toBe(400);
  });

  it("laat de indeling binnen een vleugel meeschalen", async () => {
    const { schaalVasteMaten, voegBinnenStijlenToe, zetVasteMaat } = await import("../engine/indeling");

    // Een deur met twee vakken erin; het bovenste vak ligt op 300 mm vast.
    const basis = standaardConfiguratie(PROFIEL.id, "voordeur");
    const deurvak = vakkenVan(basis.indeling).find((v) => v.invulling === "deur")!;
    const metBinnen = voegBinnenStijlenToe(basis.indeling, deurvak.id, "rijen", 1);
    const knoop = knoopOpId(metBinnen, deurvak.id);
    const binnen = knoop && knoop.soort === "vak" ? knoop.binnenIndeling : null;
    expect(binnen?.soort).toBe("splitsing");

    const vast = zetVasteMaat(binnen!, (binnen as Splitsing).kinderen[0].id, 300);
    const boom = wijzigVak(metBinnen, deurvak.id, { binnenIndeling: vast });

    // Twee keer zo hoog: ook binnen de vleugel groeit de vaste maat mee.
    const geschaald = schaalVasteMaten(boom, { breedte: 1, hoogte: 2 });
    const na = knoopOpId(geschaald, deurvak.id);
    const naBinnen = na && na.soort === "vak" ? na.binnenIndeling : null;
    expect(naBinnen?.soort === "splitsing" ? naBinnen.kinderen[0].vasteMaat : null).toBe(600);
  });
});

describe("schuifpui", () => {
  it("wisselt naar het hefschuifprofiel en rekent meteen door", async () => {
    const { wisselKozijnType } = await import("../data/standaard");

    // Een hefschuif is een eigen profielsysteem, geen variant van het raamprofiel:
    // van type wisselen wisselt dus ook het profiel.
    const c = wisselKozijnType(standaardConfiguratie(PROFIEL.id, "vast"), "schuifpui");
    const profiel = profielOpId(c.profielId)!;
    expect(profiel.toegestaneTypes).toEqual(["schuifpui"]);
    expect(profiel.merk).toBe(PROFIEL.merk);

    const b = bereken(c, AANNEMER);
    expect(b.bevindingen.filter((x) => x.type === "blokkade")).toEqual([]);
    expect(b.vakken.some((v) => v.invulling === "schuifvleugel")).toBe(true);
    expect(b.prijs.klantprijsTotaalInclBtw).toBeGreaterThan(0);

    // En terug naar een gewoon kozijn pakt hij het raamprofiel weer op.
    const terug = wisselKozijnType(c, "draaikiep");
    expect(profielOpId(terug.profielId)!.toegestaneTypes).toContain("draaikiep");
  });

  it("is er voor elk merk, en blijft bij het merk waar je vandaan komt", async () => {
    const { wisselKozijnType } = await import("../data/standaard");
    const { PROFIELEN } = await import("../data/profielen");

    const merken = [...new Set(PROFIELEN.map((p) => p.merk))];
    expect(merken.length).toBeGreaterThanOrEqual(3);

    for (const merk of merken) {
      // Elk merk heeft een schuifpui, en die heet bij alle drie gewoon zo.
      const pui = PROFIELEN.filter((p) => p.merk === merk && p.toegestaneTypes.includes("schuifpui"));
      expect(pui.length).toBeGreaterThan(0);
      expect(pui[0].naam).toBe("Schuifpui");

      // Vanuit een raamprofiel van dat merk kom je op de pui van hetzelfde merk uit.
      const raam = PROFIELEN.find((p) => p.merk === merk && p.toegestaneTypes.includes("draaikiep"))!;
      const c = wisselKozijnType(standaardConfiguratie(raam.id, "draaikiep"), "schuifpui");
      const gekozen = profielOpId(c.profielId)!;
      expect(gekozen.merk).toBe(merk);
      expect(gekozen.toegestaneTypes).toEqual(["schuifpui"]);

      const b = bereken({ ...c, breedte: 3000, hoogte: 2200 }, AANNEMER);
      expect(b.bevindingen.filter((x) => x.type === "blokkade")).toEqual([]);
      expect(b.vakken.some((v) => v.invulling === "schuifvleugel")).toBe(true);
    }
  });

  it("staat stomp in de sparing: geen aanslag over het metselwerk", async () => {
    const { wisselKozijnType } = await import("../data/standaard");
    const { berekenStelmaat } = await import("../engine/maten");

    const c = wisselKozijnType(standaardConfiguratie(PROFIEL.id, "vast"), "schuifpui");
    expect(Object.values(c.kozijnzijden).every((z) => !z.aanslag)).toBe(true);
    // Zonder aanslag is de stelmaat gelijk aan de buitenmaat.
    const stelmaat = berekenStelmaat(c, profielOpId(c.profielId)!);
    expect(stelmaat).toEqual({ breedte: c.breedte, hoogte: c.hoogte });
  });

  it("loopt op een rail in plaats van een dorpel", async () => {
    const { wisselKozijnType } = await import("../data/standaard");
    const c = wisselKozijnType(standaardConfiguratie(PROFIEL.id, "vast"), "schuifpui");
    expect(c.dorpelId).toBe("dorpel-hefschuif-rail");
  });

  it("markeert bij een 4-delige pui welke vleugel de loopdeur is", () => {
    const basis = blancoIndeling();
    const links = vakkenVan(maakSchuifpui(basis, basis.id, "4-midden-actief"));
    const rechts = vakkenVan(maakSchuifpui(blancoIndeling(), blancoIndeling().id, "4-midden-actief"));

    expect(links.map((v) => v.invulling)).toEqual(["vast", "schuifvleugel", "schuifvleugel", "vast"]);
    // De twee middelste schuiven naar buiten open, elk een andere kant op.
    expect(links[1].draairichting).toBe("links");
    expect(links[2].draairichting).toBe("rechts");
    expect(links[1].naam.startsWith("Loopdeur")).toBe(true);
    expect(rechts.length === 4 || rechts.length === 1).toBe(true);
  });

  it("krijgt hefschuifbeslag in plaats van een kruk", async () => {
    const { wisselKozijnType } = await import("../data/standaard");
    const c = wisselKozijnType(standaardConfiguratie(PROFIEL.id, "vast"), "schuifpui");
    expect(c.beslag.beslagId).toBe("hefschuif-skg2");
  });
});

describe("hor", () => {
  it("valt weg zodra een vak vast glas of een paneel wordt", () => {
    const basis = standaardConfiguratie(PROFIEL.id, "draaikiep");
    const vak = vakkenVan(basis.indeling)[0];
    const metHor = wijzigVak(basis.indeling, vak.id, { horMeegeleverd: true });
    expect(vakkenVan(metHor)[0].horMeegeleverd).toBe(true);

    // Een hor hangt vóór iets dat opengaat; vast glas heeft er geen.
    const naVast = wijzigVak(metHor, vak.id, { invulling: "vast" });
    expect(vakkenVan(naVast)[0].horMeegeleverd).toBe(false);
  });
});

describe("glas per vak", () => {
  it("laat één vak van het kozijnglas afwijken, met eigen gewicht en prijsregel", async () => {
    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const gesplitst = voegStijlenToe(basis.indeling, vak.id, "kolommen", 1);
    const [links, rechts] = vakkenVan(gesplitst);

    const gelijk = bereken({ ...basis, indeling: gesplitst }, AANNEMER);
    const afwijkend = bereken(
      {
        ...basis,
        indeling: wijzigVak(gesplitst, rechts.id, { glastypeId: "triple-07" }),
      },
      AANNEMER
    );

    // Triple weegt meer: het totaalgewicht van het element gaat omhoog.
    expect(afwijkend.totaalGlasGewichtKg!).toBeGreaterThan(gelijk.totaalGlasGewichtKg!);
    // En het staat als eigen regel op de specificatie.
    const regels = afwijkend.prijs.regels.map((r) => r.omschrijving);
    expect(regels.some((r) => r.startsWith("Triple 0.7"))).toBe(true);
    expect(regels.some((r) => r.startsWith("HR++ 1.1"))).toBe(true);
    expect(links.glastypeId).toBeNull();
  });

  it("zet de glassoort in de ruit op de tekening", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const b = bereken(standaardConfiguratie(PROFIEL.id, "vast"), AANNEMER);
    expect(tekenAanzicht(b, "binnen").inhoud).toContain("HR++ 1.1");
  });

  it("blokkeert een vakglas dat niet in het profiel past", () => {
    const basis = standaardConfiguratie("aluplast-ideal-4000-vlak", "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const b = bereken(
      { ...basis, indeling: wijzigVak(basis.indeling, vak.id, { glastypeId: "triple-06" }) },
      AANNEMER
    );
    expect(b.bevindingen.some((x) => x.regelId === "glastype-toegestaan" && x.type === "blokkade")).toBe(
      true
    );
  });

  it("tekent matglas met een eigen arcering", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const b = bereken(
      { ...basis, indeling: wijzigVak(basis.indeling, vak.id, { glastypeId: "hr-plus-plus-11-mat" }) },
      AANNEMER
    );
    expect(tekenAanzicht(b, "binnen").inhoud).toContain("url(#glas-mat)");
  });
});

describe("roeden", () => {
  it("verandert de glasmaat niet maar komt wel in de prijs", () => {
    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const zonder = bereken(basis, AANNEMER);
    const met = bereken(
      {
        ...basis,
        indeling: wijzigVak(basis.indeling, vak.id, {
          roeden: { verticaal: 1, horizontaal: 2, breedte: 26 },
        }),
      },
      AANNEMER
    );

    expect(met.vakken[0].glasBreedte).toBe(zonder.vakken[0].glasBreedte);
    expect(met.vakken[0].glasHoogte).toBe(zonder.vakken[0].glasHoogte);
    expect(met.prijs.regels.some((r) => r.omschrijving.startsWith("Roeden"))).toBe(true);
    expect(met.prijs.klantprijsTotaalInclBtw).toBeGreaterThan(zonder.prijs.klantprijsTotaalInclBtw);
  });
});

describe("stijl in een vleugel", () => {
  it("verschuift door de maat van een vulling vast te zetten", async () => {
    const { voegBinnenStijlenToe, zetVasteMaat, wijzigVak } = await import("../engine/indeling");

    const basis = standaardConfiguratie(PROFIEL.id, "voordeur");
    const deurvak = vakkenVan(basis.indeling).find((v) => v.invulling === "deur")!;
    const metBinnen = voegBinnenStijlenToe(basis.indeling, deurvak.id, "rijen", 1);
    const vleugel = knoopOpId(metBinnen, deurvak.id);
    const binnen = vleugel && vleugel.soort === "vak" ? vleugel.binnenIndeling : null;
    expect(binnen?.soort).toBe("splitsing");

    const bovenste = (binnen as Splitsing).kinderen[0];
    const vast = wijzigVak(metBinnen, deurvak.id, {
      binnenIndeling: zetVasteMaat(binnen!, bovenste.id, 400),
    });

    const b = bereken({ ...basis, indeling: vast }, AANNEMER);
    const deur = b.vakken.find((v) => v.invulling === "deur")!;
    const eerste = deur.binnenVakken[0];
    expect(Math.round(eerste.onderkant - Math.min(eerste.topLinks, eerste.topRechts))).toBe(400);
  });

  it("laat de breedte van de stijl in de vleugel aanpassen", async () => {
    const { voegBinnenStijlenToe, wijzigBinnenSplitsing } = await import("../engine/indeling");

    const basis = standaardConfiguratie(PROFIEL.id, "voordeur");
    const deurvak = vakkenVan(basis.indeling).find((v) => v.invulling === "deur")!;
    const metBinnen = voegBinnenStijlenToe(basis.indeling, deurvak.id, "rijen", 1);
    const vleugel = knoopOpId(metBinnen, deurvak.id);
    const binnen = vleugel && vleugel.soort === "vak" ? vleugel.binnenIndeling : null;

    const breed = wijzigBinnenSplitsing(metBinnen, deurvak.id, binnen!.id, { scheidingBreedte: 200 });
    const smal = bereken({ ...basis, indeling: metBinnen }, AANNEMER);
    const dik = bereken({ ...basis, indeling: breed }, AANNEMER);

    const hoogteVan = (b: typeof smal) => {
      const deur = b.vakken.find((v) => v.invulling === "deur")!;
      const deel = deur.binnenVakken[0];
      return deel.onderkant - Math.min(deel.topLinks, deel.topRechts);
    };
    // Een dikkere stijl laat minder ruimte over voor de vullingen.
    expect(hoogteVan(dik)).toBeLessThan(hoogteVan(smal));
  });
});

describe("geneste indeling in een vleugel", () => {
  it("tekent de stijlen op de juiste plek als er rijen én kolommen in zitten", async () => {
    const { voegBinnenStijlenToe } = await import("../engine/indeling");

    // Een deur met eerst een horizontale stijl, en in het bovenste deel nog
    // twee verticale. Dit ging eerder mis: de stijlen werden uit de posities van
    // de vullingen afgeleid en dan zweefde er een balk in de tekening.
    const basis = standaardConfiguratie(PROFIEL.id, "voordeur");
    const deurvak = vakkenVan(basis.indeling).find((v) => v.invulling === "deur")!;
    const rijen = voegBinnenStijlenToe(basis.indeling, deurvak.id, "rijen", 1);
    const knoop = knoopOpId(rijen, deurvak.id);
    const binnen = knoop && knoop.soort === "vak" ? knoop.binnenIndeling : null;
    const bovenste = (binnen as Splitsing).kinderen[0];
    const genest = voegBinnenStijlenToe(rijen, deurvak.id, "kolommen", 2, bovenste.id);

    const b = bereken({ ...basis, indeling: genest }, AANNEMER);
    const deur = b.vakken.find((v) => v.invulling === "deur")!;

    // Eén horizontale stijl over de volle breedte, twee verticale in de bovenste rij.
    expect(deur.binnenVakken.length).toBe(4);
    expect(deur.binnenStijlen.filter((st) => st.as === "rijen").length).toBe(1);
    expect(deur.binnenStijlen.filter((st) => st.as === "kolommen").length).toBe(2);

    // Elke verticale stijl staat volledig binnen de rij waar hij bij hoort.
    const rijStijl = deur.binnenStijlen.find((st) => st.as === "rijen")!;
    for (const st of deur.binnenStijlen.filter((x) => x.as === "kolommen")) {
      expect(st.y + st.hoogte).toBeLessThanOrEqual(rijStijl.y + 0.5);
    }
  });
});

describe("bediening per vleugel", () => {
  it("geeft elke vleugel de bediening die bij zijn soort hoort", () => {
    const raam = standaardConfiguratie(PROFIEL.id, "draaikiep");
    expect(vakkenVan(raam.indeling)[0].krukBinnenId).toBe("kruk-standaard");

    const deur = standaardConfiguratie(PROFIEL.id, "voordeur");
    expect(vakkenVan(deur.indeling).find((v) => v.invulling === "deur")!.krukBinnenId).toBe(
      "deurkruk-binnen"
    );

    // Een vast vak heeft niets te bedienen.
    const vast = standaardConfiguratie(PROFIEL.id, "vast");
    expect(vakkenVan(vast.indeling)[0].krukBinnenId).toBeNull();
  });

  it("zet elke bediening als eigen regel op de offerte", () => {
    const basis = standaardConfiguratie(PROFIEL.id, "draaikiep");
    const vak = vakkenVan(basis.indeling)[0];
    const b = bereken(
      {
        ...basis,
        indeling: wijzigVak(basis.indeling, vak.id, {
          krukBinnenId: "kruk-afsluitbaar",
          krukBuitenId: null,
        }),
      },
      AANNEMER
    );
    const regels = b.prijs.regels.map((r) => r.omschrijving);
    expect(regels.some((r) => r.startsWith("Afsluitbare raamkruk"))).toBe(true);
  });

  it("rekent een stapeldorpel per strekkende meter", () => {
    const basis = standaardConfiguratie(PROFIEL.id, "achterdeur");
    const vak = vakkenVan(basis.indeling)[0];
    const zonder = bereken(basis, AANNEMER);
    const met = bereken(
      { ...basis, indeling: wijzigVak(basis.indeling, vak.id, { stapeldorpel: true }) },
      AANNEMER
    );
    expect(met.prijs.regels.some((r) => r.omschrijving.startsWith("Stapeldorpel"))).toBe(true);
    expect(met.prijs.klantprijsTotaalInclBtw).toBeGreaterThan(zonder.prijs.klantprijsTotaalInclBtw);
  });

  it("tekent een rooster in zijn eigen kleur", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { kleurenVanMerk } = await import("../data/kleuren");

    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const anders = kleurenVanMerk(PROFIEL.merk).find((k) => k.id !== basis.kleurBinnenId)!;
    const b = bereken(
      {
        ...basis,
        indeling: wijzigVak(basis.indeling, vak.id, {
          roosterId: "rooster-standaard",
          roosterKleurBinnenId: anders.id,
        }),
      },
      AANNEMER
    );

    const aanzicht = tekenAanzicht(b, "binnen");
    expect(aanzicht.defs).toContain("rooster-binnen-0");
    expect(aanzicht.inhoud).toContain("url(#rooster-binnen-0)");
  });
});

describe("muuraansluiting, afkitten en de nieuwe invullingen", () => {
  it("rekent de muuraansluiting en de kitvoeg per strekkende meter omtrek", () => {
    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const b = bereken({ ...basis, breedte: 1000, hoogte: 1000 }, AANNEMER);

    // Omtrek is 4 m: kalksponning 4 × € 8,50, kit aan twee zijden 8 × € 6,75.
    const regels = b.prijs.regels.map((r) => r.omschrijving);
    expect(regels.some((r) => r.startsWith("Kalksponning — 4 m"))).toBe(true);
    expect(regels.some((r) => r.startsWith("Binnen en buiten afkitten — 8 m"))).toBe(true);

    // Zonder sponning en zonder kit vervallen beide regels.
    const kaal = bereken(
      { ...basis, muuraansluitingId: "geen-sponning", afkitoptieId: "geen" },
      AANNEMER
    );
    expect(kaal.prijs.regels.some((r) => r.omschrijving.includes("sponning"))).toBe(false);
    expect(kaal.prijs.regels.some((r) => r.omschrijving.includes("afkitten"))).toBe(false);
    expect(kaal.prijs.klantprijsTotaalInclBtw).toBeLessThan(b.prijs.klantprijsTotaalInclBtw);
  });

  it("zet de aansluiting en het kitwerk op de offerte", async () => {
    const { REBU_BRANDING, klantofferte } = await import("../engine/documenten");
    const html = klantofferte(
      bereken(standaardConfiguratie(), AANNEMER),
      {
        nummer: "OF-TEST",
        datum: "1 januari 2026",
        klantnaam: "Test",
        projectadres: "Teststraat 1",
        leverweek: "week 1",
      },
      REBU_BRANDING
    );
    expect(html).toContain("Muuraansluiting");
    expect(html).toContain("Kalksponning");
    expect(html).toContain("Afkitten");
  });

  it("geeft een vaste deur het deurprofiel maar laat hem niet opengaan", () => {
    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];

    const deur = bereken(
      { ...basis, indeling: wijzigVak(basis.indeling, vak.id, { invulling: "deur" }) },
      AANNEMER
    );
    const vasteDeur = bereken(
      { ...basis, indeling: wijzigVak(basis.indeling, vak.id, { invulling: "vastedeur" }) },
      AANNEMER
    );

    // Zelfde glasmaat als een draaiende deur: het is hetzelfde profiel.
    expect(vasteDeur.vakken[0].glasBreedte).toBe(deur.vakken[0].glasBreedte);
    // Maar hij draait niet.
    expect(vasteDeur.vakken[0].draairichting).toBe("geen");
  });

  it("laat een vak bewust leeg, met de maat er wel bij", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const basis = standaardConfiguratie(PROFIEL.id, "vast");
    const vak = vakkenVan(basis.indeling)[0];
    const b = bereken(
      { ...basis, indeling: wijzigVak(basis.indeling, vak.id, { invulling: "geen" }) },
      AANNEMER
    );

    // De maat wordt gewoon berekend (regel 2), er zit alleen niets in.
    expect(b.vakken[0].glasBreedte).toBeGreaterThan(0);
    expect(b.prijs.regels.some((r) => r.omschrijving.startsWith("HR++"))).toBe(false);
    expect(tekenAanzicht(b, "binnen").inhoud).toContain("geen vulling");
  });
});

describe("positie van het rooster", () => {
  it("zet het rooster onderin en past de glasmaat daarop aan", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const basis = standaardConfiguratie(PROFIEL.id, "draaikiep");
    const vak = vakkenVan(basis.indeling)[0];

    const boven = bereken(
      { ...basis, indeling: wijzigVak(basis.indeling, vak.id, { roosterId: "rooster-standaard" }) },
      AANNEMER
    );
    const onder = bereken(
      {
        ...basis,
        indeling: wijzigVak(basis.indeling, vak.id, {
          roosterId: "rooster-standaard",
          roosterpositie: "onder-in-glas",
        }),
      },
      AANNEMER
    );

    // De plek verandert niets aan de glasmaat: het rooster neemt evenveel weg.
    expect(onder.vakken[0].glasHoogte).toBe(boven.vakken[0].glasHoogte);
    // Maar de tekening zet hem wel op een andere plek.
    expect(tekenAanzicht(onder, "binnen").inhoud).not.toBe(
      tekenAanzicht(boven, "binnen").inhoud
    );
  });

  it("weigert een rooster boven in het kozijn bij een schuivende vleugel", async () => {
    const { blancoIndeling, maakSchuifpui } = await import("../engine/indeling");
    const { wisselKozijnType } = await import("../data/standaard");

    const start = wisselKozijnType(standaardConfiguratie(PROFIEL.id, "vast"), "schuifpui");
    const basis = blancoIndeling("Pui");
    const pui = maakSchuifpui(basis, basis.id, "4-midden-actief");
    const vleugel = vakkenVan(pui).find((v) => v.invulling === "schuifvleugel")!;

    const b = bereken(
      {
        ...start,
        breedte: 4000,
        hoogte: 2300,
        indeling: wijzigVak(pui, vleugel.id, {
          roosterId: "rooster-vlak",
          roosterpositie: "boven-in-kozijn",
        }),
      },
      AANNEMER
    );
    expect(b.bevindingen.some((x) => x.regelId === "rooster-in-pui" && x.type === "blokkade")).toBe(
      true
    );
  });
});

describe("aanzicht per profielcombinatie", () => {
  /**
   * Bij hetzelfde kader levert de fabrikant meerdere vleugels: aluplast zet op
   * kader 170054 zowel een raamvleugel van 77 mm als een zware deurvleugel van
   * 96 mm. De maatketen rekent daar al mee; het aanzicht moet dezelfde inzet
   * tekenen, anders toont de tekening een ander profiel dan er besteld wordt.
   */
  it("geeft een deur de inzet van de zware deurvleugel en een raam die van de raamvleugel", async () => {
    const { vleugelInzet } = await import("../engine/aanzicht");
    const basis = blancoIndeling();
    let indeling = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const [eerste, tweede] = vakkenVan(indeling);
    indeling = wijzigVak(indeling, eerste.id, { invulling: "draaikiep" });
    indeling = wijzigVak(indeling, tweede.id, { invulling: "deur" });

    const b = bereken(metIndeling(indeling, { breedte: 1000, hoogte: 2100 }), AANNEMER);
    const [raam, deur] = b.vakken;

    const g = PROFIEL.geometrie;
    expect(vleugelInzet(raam)).toBe(g.vleugelZichtbreedte.waarde - g.vleugelOverslag.waarde);
    expect(vleugelInzet(deur)).toBe(
      g.deurVleugelZichtbreedte!.waarde - g.vleugelOverslag.waarde
    );
    // De deur eet dus meer glas op dan het raam — bij aluplast 19 mm per zijde.
    expect(vleugelInzet(deur)).toBeGreaterThan(vleugelInzet(raam));
  });

  it("tekent het glas van de deur op de inzet van het deurprofiel", async () => {
    const { tekenAanzicht, vleugelInzet } = await import("../engine/aanzicht");
    const basis = blancoIndeling();
    let indeling = voegStijlenToe(basis, basis.id, "kolommen", 1);
    const [eerste, tweede] = vakkenVan(indeling);
    indeling = wijzigVak(indeling, eerste.id, { invulling: "draaikiep" });
    indeling = wijzigVak(indeling, tweede.id, { invulling: "deur" });

    const b = bereken(metIndeling(indeling, { breedte: 1000, hoogte: 2100 }), AANNEMER);
    const deur = b.vakken[1];
    const aanzicht = tekenAanzicht(b, "binnen");

    // Het glasvlak begint op vak-x plus de inzet van het deurprofiel.
    const x = deur.x + vleugelInzet(deur);
    const y = deur.topLinks + vleugelInzet(deur);
    expect(aanzicht.inhoud).toContain(`M ${x} ${y}`);
  });

  it("tekent een vaste deur als deurblad met het glas erin, niet als vast glas", async () => {
    const { tekenAanzicht, vleugelInzet } = await import("../engine/aanzicht");
    const basis = blancoIndeling();
    const indeling = wijzigVak(basis, basis.id, { invulling: "vastedeur" });

    const b = bereken(metIndeling(indeling, { breedte: 1000, hoogte: 2100 }), AANNEMER);
    const vak = b.vakken[0];

    // De maatketen geeft de vaste deur de glasaftrek van het deurprofiel...
    const g = PROFIEL.geometrie;
    expect(vleugelInzet(vak)).toBe(g.deurVleugelZichtbreedte!.waarde - g.vleugelOverslag.waarde);

    // ...en het aanzicht tekent het glas ook op die inzet.
    const aanzicht = tekenAanzicht(b, "binnen");
    const x = vak.x + vleugelInzet(vak);
    const y = vak.topLinks + vleugelInzet(vak);
    expect(aanzicht.inhoud).toContain(`M ${x} ${y}`);
  });

  it("tekent de stijlen exact zoals de maatketen ze oplevert", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const basis = blancoIndeling();
    const indeling = voegStijlenToe(basis, basis.id, "kolommen", 2);
    const c = metIndeling(indeling, { breedte: 3000, hoogte: 1500 });

    const geo = berekenGeometrie(c, PROFIEL);
    const aanzicht = tekenAanzicht(bereken(c, AANNEMER), "binnen");
    const getekend = aanzicht.klikvlakken.filter((v) => v.soort === "stijl");

    // Eén-op-één: elke stijl uit de maatketen staat op precies die plek in het
    // aanzicht. Zo landen profielspecifieke stijlbreedtes (zoals de 63 mm
    // ontmoetingsstijl van de HST 85) automatisch in de tekening.
    expect(getekend.map((v) => [v.x, v.breedte])).toEqual(
      geo.stijlen.map((s) => [s.x, s.breedte])
    );
  });
});

describe("maten in het schuine kozijn", () => {
  it("levert een aanpasbaar label voor de lage zijde", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const c = metIndeling(blancoIndeling(), {
      vorm: "schuin",
      breedte: 1200,
      hoogte: 1600,
      hoogteLaag: 1100,
    });
    const labels = tekenAanzicht(bereken(c, AANNEMER), "binnen", { maten: true }).maatlabels;

    // De lage zijde is een echte maat: hij hoort net zo overtypbaar te zijn als
    // de totaalhoogte.
    const laag = labels.find((m) => m.doel === "hoogteLaag");
    expect(laag).toBeDefined();
    expect(laag!.waarde).toBe(1100);
  });
});

describe("bewerkvlak in het buitenaanzicht", () => {
  /**
   * Het buitenaanzicht is gespiegeld. De klikvlakken dragen schermcoördinaten,
   * maar de indelingsboom rekent in binnenaanzicht-volgorde; slepen en
   * hartmaten typen moeten daar expliciet tussen vertalen, anders beweegt de
   * stijl tegen de sleeprichting in.
   */
  it("keert het slepen van een verticale stijl om, en alleen dat", async () => {
    const { sleepDeltaNaarBoom } = await import("../engine/aanzicht");
    expect(sleepDeltaNaarBoom(50, "kolommen", "binnen")).toBe(50);
    expect(sleepDeltaNaarBoom(50, "kolommen", "buiten")).toBe(-50);
    // Boven blijft boven: horizontale stijlen spiegelen niet.
    expect(sleepDeltaNaarBoom(50, "rijen", "buiten")).toBe(50);
    expect(sleepDeltaNaarBoom(-30, "rijen", "binnen")).toBe(-30);
  });

  it("rekent een getypte hartmaat in het binnenaanzicht om zoals voorheen", async () => {
    const { hartmaatNaarVasteMaat } = await import("../engine/aanzicht");
    // Kozijn 1000 breed, kader 84, twee vakken van 365 rond een stijl van 102.
    const maat = hartmaatNaarVasteMaat({
      waarde: 600,
      vanaf: "links",
      zijde: "binnen",
      as: "kolommen",
      stijlPositie: 449,
      stijlBreedte: 102,
      vorigeMaat: 365,
      volgendeMaat: 365,
      totaal: 1000,
      minimum: 120,
    });
    // 600 − beginVak 84 − halve stijl 51 = 465.
    expect(maat).toBe(465);
  });

  it("rekent een hartmaat vanaf rechts eerst terug naar links", async () => {
    const { hartmaatNaarVasteMaat } = await import("../engine/aanzicht");
    const maat = hartmaatNaarVasteMaat({
      waarde: 300,
      vanaf: "rechts",
      zijde: "binnen",
      as: "kolommen",
      stijlPositie: 449,
      stijlBreedte: 102,
      vorigeMaat: 365,
      volgendeMaat: 365,
      totaal: 1000,
      minimum: 120,
    });
    // Vanaf rechts 300 is vanaf links 700; 700 − 84 − 51 = 565.
    expect(maat).toBe(565);
  });

  it("rekent een getypte hartmaat in het buitenaanzicht terug naar de boom", async () => {
    const { hartmaatNaarVasteMaat } = await import("../engine/aanzicht");
    /**
     * Zelfde kozijn, maar in de boom vak 1 = 200 en vak 2 = 530. In het
     * gespiegelde aanzicht staat de stijl dan op schermpositie
     * 1000 − 284 − 102 = 614. Wie daar 'hart op 600 vanaf links' typt bedoelt
     * de zichtbare linkerkant — in de boom is dat 400 vanaf links.
     */
    const maat = hartmaatNaarVasteMaat({
      waarde: 600,
      vanaf: "links",
      zijde: "buiten",
      as: "kolommen",
      stijlPositie: 614,
      stijlBreedte: 102,
      vorigeMaat: 200,
      volgendeMaat: 530,
      totaal: 1000,
      minimum: 120,
    });
    // Boomhart 400: 400 − beginVak 84 − halve stijl 51 = 265.
    expect(maat).toBe(265);
  });

  it("klemt de maat zodat de buurvakken hun minimum houden", async () => {
    const { hartmaatNaarVasteMaat } = await import("../engine/aanzicht");
    const maat = hartmaatNaarVasteMaat({
      waarde: 950,
      vanaf: "links",
      zijde: "binnen",
      as: "kolommen",
      stijlPositie: 449,
      stijlBreedte: 102,
      vorigeMaat: 365,
      volgendeMaat: 365,
      totaal: 1000,
      minimum: 120,
    });
    // Ruimte 730 − minimum 120 = maximaal 610.
    expect(maat).toBe(610);
  });
});

describe("id's blijven uniek na het herladen van een opgeslagen boom", () => {
  /**
   * Een opgeslagen configuratie draagt id's uit een eerdere sessie, waarin de
   * teller ook bij nul begon. Zou een nieuwe sessie blind dezelfde reeks
   * uitdelen, dan krijgt een toegevoegd vak een al bezet id — en vanaf dat
   * moment treffen selectie en bewerking het verkeerde vak.
   */
  /**
   * Bouwt een boom in de huidige sessie en levert hem daarna aan een verse
   * module — precies wat er gebeurt bij het openen van een opgeslagen offerte:
   * de boom draagt id's uit een eerdere sessie, terwijl de teller weer op nul
   * staat.
   */
  async function geladenBoom(): Promise<{
    boom: Indeling;
    vers: typeof import("../engine/indeling");
  }> {
    const basis = blancoIndeling();
    const boom = voegStijlenToe(basis, basis.id, "kolommen", 1);
    vi.resetModules();
    return { boom, vers: await import("../engine/indeling") };
  }

  it("deelt in een geladen boom geen bezet id opnieuw uit", async () => {
    const { boom, vers } = await geladenBoom();
    const eerste = vers.vakkenVan(boom)[0];

    const erbij = vers.voegStijlenToe(boom, eerste.id, "kolommen", 1);
    const ids = [
      ...vers.vakkenVan(erbij).map((v) => v.id),
      ...vers.splitsingenVan(erbij).map((s) => s.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("houdt ook de splitsing-id vrij bij het nesten in een geladen boom", async () => {
    const { boom, vers } = await geladenBoom();
    const eerste = vers.vakkenVan(boom)[0];

    // Een rijen-splitsing in het eerste vak nest een nieuwe splitsing in de boom.
    const genest = vers.voegStijlenToe(boom, eerste.id, "rijen", 1);
    const ids = [
      ...vers.vakkenVan(genest).map((v) => v.id),
      ...vers.splitsingenVan(genest).map((s) => s.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("geeft een gekopieerde geladen boom volledig eigen id's", async () => {
    const { boom, vers } = await geladenBoom();
    const kopie = vers.kopieerIndeling(boom);

    const origineel = new Set([
      ...vers.vakkenVan(boom).map((v) => v.id),
      ...vers.splitsingenVan(boom).map((s) => s.id),
    ]);
    for (const id of [
      ...vers.vakkenVan(kopie).map((v) => v.id),
      ...vers.splitsingenVan(kopie).map((s) => s.id),
    ]) {
      expect(origineel.has(id)).toBe(false);
    }
  });
});
