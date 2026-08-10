/**
 * Testsuite voor de rekenkern.
 *
 * Dit is borgingslaag 7 uit hoofdstuk 24: referentieconfiguraties die bij elke
 * regelwijziging opnieuw doorgerekend worden. De belangrijkste tests zijn die
 * op regel 2 — glasmaat, cilindermaat en hormaat mogen onder GEEN ENKELE
 * omstandigheid ontbreken.
 */
import { describe, expect, it } from "vitest";
import { bereken } from "../engine";
import { berekenVakken, verdeelBreedte } from "../engine/maten";
import { PROFIELEN, profielOpId } from "../data/profielen";
import { GLASTYPES } from "../data/onderdelen";
import { standaardConfiguratie } from "../data/standaard";
import { STIJL_STANDAARD, nieuwVak, vakkenVan, voegStijlenToe, wijzigVak } from "../engine/indeling";
import { kleurenVanMerk, standaardKleur } from "../data/kleuren";
import type { Configuratie } from "../types";

const AANNEMER = { context: "aannemer" as const, aannemersmarge: 0.25 };

/** Bouwt een configuratie met alleen de opgegeven velden aangepast. */
function config(patch: Partial<Configuratie> = {}, profielId?: string): Configuratie {
  return { ...standaardConfiguratie(profielId), ...patch };
}

describe("verdeelBreedte", () => {
  it("verdeelt exact, zonder verlies van millimeters", () => {
    expect(verdeelBreedte(1000, [1, 1])).toEqual([500, 500]);
    expect(verdeelBreedte(1000, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(1000);
    expect(verdeelBreedte(901, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(901);
    expect(verdeelBreedte(1000, [2, 1])).toEqual([667, 333]);
  });

  it("houdt de som gelijk bij willekeurige verhoudingen", () => {
    for (let totaal = 300; totaal <= 3000; totaal += 137) {
      for (const verh of [[1], [1, 1], [3, 2], [1, 2, 1], [5, 3, 2, 1]]) {
        const delen = verdeelBreedte(totaal, verh);
        expect(delen.reduce((a, b) => a + b, 0)).toBe(totaal);
        expect(delen.every((d) => Number.isInteger(d))).toBe(true);
      }
    }
  });

  it("weigert verhoudingen die samen nul zijn", () => {
    expect(() => verdeelBreedte(1000, [0, 0])).toThrow();
  });
});

describe("de maatketen — geijkt op echte calculaties", () => {
  /**
   * IJKPUNT 1 — EKO4U, Aluplast Ideal 7000 NL Blockprofiel
   *
   * Kaderprofiel 170054 'kader NL met aanslag', diepte 120 mm, hoogte 84 mm.
   * Een vast kozijn van 1000 × 1000 geeft daar glasmaat 832 × 832.
   */
  it("komt bij Aluplast IDEAL 7000 NL uit op de glasmaat van EKO4U", () => {
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    expect(profiel.geometrie.kozijnZichtbreedte.waarde).toBe(84);

    const c = config(
      { breedte: 1000, hoogte: 1000, indeling: nieuwVak("Vast", "vast") },
      "aluplast-ideal-7000-aanslag"
    );
    const [vak] = berekenVakken(c, profiel, null);

    expect(vak.glasBreedte).toBe(832);
    expect(vak.glasHoogte).toBe(832);
  });

  /**
   * IJKPUNT 2 — AKUGT, Gealan S 9000 NL, profiel 6802 Aanslag.
   * 2000 breed geeft glasmaat 1868; 1945 hoog geeft 1813.
   */
  it("komt bij Gealan S 9000 NL uit op de glasmaat van AKUGT", () => {
    const profiel = profielOpId("gealan-s9000-aanslag")!;
    expect(profiel.geometrie.kozijnZichtbreedte.waarde).toBe(66);

    const c = config(
      { breedte: 2000, hoogte: 1945, indeling: nieuwVak("Vast", "vast") },
      "gealan-s9000-aanslag"
    );
    const [vak] = berekenVakken(c, profiel, null);

    expect(vak.glasBreedte).toBe(1868);
    expect(vak.glasHoogte).toBe(1813);
  });

  /**
   * IJKPUNT 4 en 5 — EKO4U, Aluplast Ideal 4000 (standaard, vlak).
   * Kaderprofiel 140001 (diep 70, hoog 65) → 1000 × 1000 vast geeft 870 × 870.
   * Met vleugelprofiel 140020 (77 mm) geeft datzelfde kozijn 772 × 772.
   */
  it("komt bij Aluplast IDEAL 4000 uit op de glasmaten van EKO4U", () => {
    const profiel = profielOpId("aluplast-ideal-4000-vlak")!;
    expect(profiel.geometrie.kozijnZichtbreedte.waarde).toBe(65);
    expect(profiel.geometrie.vleugelZichtbreedte.waarde).toBe(77);
    expect(profiel.geometrie.vleugelOverslag.waarde).toBe(28);

    const vast = berekenVakken(
      config({ breedte: 1000, hoogte: 1000, indeling: nieuwVak("Vast", "vast") }, "aluplast-ideal-4000-vlak"),
      profiel,
      null
    )[0];
    expect(vast.glasBreedte).toBe(870);
    expect(vast.glasHoogte).toBe(870);

    const metVleugel = berekenVakken(
      config(
        { breedte: 1000, hoogte: 1000, indeling: nieuwVak("Draaikiep", "draaikiep") },
        "aluplast-ideal-4000-vlak"
      ),
      profiel,
      null
    )[0];
    expect(metVleugel.glasBreedte).toBe(772);
    expect(metVleugel.glasHoogte).toBe(772);
  });

  it("hanteert bij Aluplast systeembreed dezelfde vleugel en overslag", () => {
    // Twee onafhankelijk gemeten systemen geven allebei 77 mm vleugel en 28 mm
    // overslag; alleen de kozijnzichtbreedte verschilt.
    for (const id of ["aluplast-ideal-4000-vlak", "aluplast-ideal-7000-aanslag"]) {
      const p = profielOpId(id)!;
      expect(p.geometrie.vleugelZichtbreedte.waarde).toBe(77);
      expect(p.geometrie.vleugelOverslag.waarde).toBe(28);
      expect(p.geometrie.vleugelZichtbreedte.bron.soort).toBe("fabrikant");
    }
  });

  it("houdt de regel eenvoudig: glasmaat = buitenmaat − 2 × zichtbreedte", () => {
    for (const profielId of ["aluplast-ideal-7000-aanslag", "gealan-s9000-aanslag"]) {
      const profiel = profielOpId(profielId)!;
      const zicht = profiel.geometrie.kozijnZichtbreedte.waarde;

      for (const [breedte, hoogte] of [
        [800, 900],
        [1500, 1200],
        [2400, 2000],
      ] as const) {
        const c = config({ breedte, hoogte, indeling: nieuwVak("Vast", "vast") }, profielId);
        const [vak] = berekenVakken(c, profiel, null);
        expect(vak.glasBreedte).toBe(breedte - 2 * zicht);
        expect(vak.glasHoogte).toBe(hoogte - 2 * zicht);
      }
    }
  });

  /**
   * IJKPUNT 3 — EKO4U, dezelfde 1000 × 1000 maar met vleugelprofiel
   * 170020 'vleugel RECHT 77 mm' → glasmaat 734 × 734.
   */
  it("komt met een vleugel uit op de glasmaat van EKO4U", () => {
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    expect(profiel.geometrie.vleugelZichtbreedte.waarde).toBe(77);
    expect(profiel.geometrie.vleugelOverslag.waarde).toBe(28);

    const c = config(
      { breedte: 1000, hoogte: 1000, indeling: nieuwVak("Draaikiep", "draaikiep") },
      "aluplast-ideal-7000-aanslag"
    );
    const [vak] = berekenVakken(c, profiel, null);

    expect(vak.glasBreedte).toBe(734);
    expect(vak.glasHoogte).toBe(734);
  });

  it("houdt de vleugelketen sluitend: opening → vleugel → glas", () => {
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    const c = config(
      { breedte: 1000, hoogte: 1000, indeling: nieuwVak("Draaikiep", "draaikiep") },
      "aluplast-ideal-7000-aanslag"
    );
    const [vak] = berekenVakken(c, profiel, null);

    // 1000 − 2×84 = 832 sponningopening
    expect(vak.sponningBreedte).toBe(832);
    // 832 + 2×28 = 888 vleugel buitenmaat; de vleugel valt over het kozijn
    expect(vak.vleugelBreedte).toBe(888);
    // 888 − 2×77 = 734 glasmaat
    expect(vak.glasBreedte).toBe(vak.vleugelBreedte - 2 * 77);
  });

  it("rekent bij meerdere vakken van hart tot hart", () => {
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    const basis = config({ breedte: 2000, hoogte: 1200 }, "aluplast-ideal-7000-aanslag");
    const c: Configuratie = {
      ...basis,
      indeling: voegStijlenToe(nieuwVak("Vak 1", "vast"), "x", "kolommen", 1),
    };
    // De boom hierboven kan niet gesplitst worden op een onbekende id; bouw hem
    // daarom op vanuit het echte startvak.
    const start = nieuwVak("Vak 1", "vast");
    const gesplitst: Configuratie = {
      ...basis,
      indeling: voegStijlenToe(start, start.id, "kolommen", 1),
    };
    void c;

    const vakken = berekenVakken(gesplitst, profiel, null);
    const stijl = STIJL_STANDAARD;

    // Beide ruiten samen plus de stijl vullen precies de opening.
    const som = vakken.reduce((s, v) => s + v.glasBreedte, 0) + stijl;
    expect(som).toBe(2000 - 2 * 84);

    // En elke ruit loopt van de kozijnrand tot het hart van de stijl.
    const hart = 84 + vakken[0].glasBreedte + stijl / 2;
    expect(hart).toBe(1000);
  });

  it("geeft de stelmaat: buitenmaat minus de aanslag over het metselwerk", () => {
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    // EKO4U toont bij 1000 breed een stelmaat van 960.
    expect(profiel.geometrie.aanslag.waarde).toBe(20);
    expect(1000 - 2 * profiel.geometrie.aanslag.waarde).toBe(960);
  });

  it("houdt bij een schuin kozijn beide zijhoogtes bij", () => {
    const c = config(
      { vorm: "schuin", hoogte: 1600, hoogteLaag: 1100, breedte: 1200 },
      "aluplast-ideal-7000-aanslag"
    );
    const gesplitst: Configuratie = {
      ...c,
      indeling: voegStijlenToe(c.indeling, c.indeling.id, "kolommen", 1),
    };
    const vakken = berekenVakken(gesplitst, profielOpId("aluplast-ideal-7000-aanslag")!, null);
    for (const vak of vakken) {
      expect(vak.schuin).toBe(true);
      expect(vak.glasHoogteLaag).not.toBeNull();
      expect(vak.glasHoogteLaag!).toBeLessThan(vak.glasHoogte);
    }
    expect(vakken[0].glasHoogte).toBeLessThan(vakken[1].glasHoogte);
  });
});

describe("regel 2 — componenten uitsluiten met behoud van maatvoering", () => {
  it("berekent de glasmaat óók wanneer glas niet wordt meegeleverd", () => {
    const met = bereken(config({ glas: { meegeleverd: true, glastypeId: "hr-plus-plus-11", afstandshouderId: "alu" } }), AANNEMER);
    const zonder = bereken(config({ glas: { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" } }), AANNEMER);

    for (const [i, vak] of zonder.vakken.entries()) {
      expect(vak.glasBreedte).toBeGreaterThan(0);
      expect(vak.glasHoogte).toBeGreaterThan(0);
      // De maat is identiek: wel of niet leveren verandert de maat niet.
      expect(vak.glasBreedte).toBe(met.vakken[i].glasBreedte);
      expect(vak.glasHoogte).toBe(met.vakken[i].glasHoogte);
    }
    // Zonder glas telt het glas niet mee in de prijs.
    expect(zonder.prijs.klantprijsTotaal).toBeLessThan(met.prijs.klantprijsTotaal);
  });

  it("berekent de cilindermaat óók zonder cilinder én zonder gekozen beslag", () => {
    const zonderCilinder = bereken(
      config({ beslag: { beslagId: "draaikiep-skg2", cilinderMeegeleverd: false } }),
      AANNEMER
    );
    const zonderBeslag = bereken(
      config({ beslag: { beslagId: null, cilinderMeegeleverd: false } }),
      AANNEMER
    );

    for (const b of [zonderCilinder, zonderBeslag]) {
      expect(b.cilindermaat.binnen).toBeGreaterThan(0);
      expect(b.cilindermaat.buiten).toBeGreaterThan(0);
      expect(b.cilindermaat.notatie).toMatch(/^\d+\/\d+$/);
      expect(b.cilindermaat.skgAdvies).toMatch(/^SKG\*{1,3}$/);
    }
    // Zonder gekozen beslag valt het systeem terug op de fabrieksstandaard.
    expect(zonderBeslag.cilindermaat.gebaseerdOpFabrieksstandaard).toBe(true);
    expect(zonderCilinder.cilindermaat.gebaseerdOpFabrieksstandaard).toBe(false);
  });

  it("berekent de hormaat óók wanneer geen hor wordt meegeleverd", () => {
    const zonder = bereken(config({ hortypeId: null }), AANNEMER);
    for (const vak of zonder.vakken) {
      expect(vak.horBreedte).toBeGreaterThan(0);
      expect(vak.horHoogte).toBeGreaterThan(0);
    }
  });

  it("levert alle drie de maten in één configuratie zonder glas, cilinder én hor", () => {
    // Dit is precies het acceptatiecriterium uit hoofdstuk 27.1.
    const kaal = bereken(
      config({
        glas: { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" },
        beslag: { beslagId: null, cilinderMeegeleverd: false },
        hortypeId: null,
      }),
      AANNEMER
    );
    expect(kaal.blokkeert).toBe(false);
    expect(kaal.cilindermaat.notatie).toBeTruthy();
    for (const vak of kaal.vakken) {
      expect(vak.glasBreedte).toBeGreaterThan(0);
      expect(vak.glasHoogte).toBeGreaterThan(0);
      expect(vak.horBreedte).toBeGreaterThan(0);
      expect(vak.horHoogte).toBeGreaterThan(0);
    }
  });
});

describe("volledigheidsgarantie over de hele productdatabase", () => {
  /**
   * De sterkste garantie die dit systeem kan geven: over elk profiel, elk
   * toegestaan kozijntype en een reeks maten mag geen enkele afgeleide maat
   * ontbreken, NaN zijn of oneindig worden.
   */
  it("levert voor elke combinatie volledig gevulde maatvelden", () => {
    let gecontroleerd = 0;

    for (const profiel of PROFIELEN) {
      for (const kozijnType of profiel.toegestaneTypes) {
        for (const [breedte, hoogte] of [
          [600, 800],
          [1200, 1400],
          [2400, 2200],
        ] as const) {
          const c = config({ kozijnType, breedte, hoogte }, profiel.id);
          // Bewust de zwaarste variant: niets meegeleverd.
          c.glas = { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" };
          c.beslag = { beslagId: null, cilinderMeegeleverd: false };
          c.hortypeId = null;
          c.kleurBinnenId = standaardKleur(profiel.merk).id;
          c.kleurBuitenId = standaardKleur(profiel.merk).id;

          const b = bereken(c, AANNEMER);
          expect(Number.isFinite(b.cilindermaat.binnen)).toBe(true);
          expect(Number.isFinite(b.cilindermaat.buiten)).toBe(true);

          for (const vak of b.vakken) {
            for (const veld of [
              "sponningBreedte",
              "sponningHoogte",
              "vleugelBreedte",
              "vleugelHoogte",
              "daglichtBreedte",
              "daglichtHoogte",
              "glasSponningBreedte",
              "glasSponningHoogte",
              "glasBreedte",
              "glasHoogte",
              "horBreedte",
              "horHoogte",
            ] as const) {
              const waarde = vak[veld];
              expect(Number.isFinite(waarde), `${profiel.id}/${kozijnType} ${veld}`).toBe(true);
              expect(Number.isInteger(waarde), `${profiel.id}/${kozijnType} ${veld}`).toBe(true);
            }
          }
          gecontroleerd++;
        }
      }
    }

    // Zorgt dat deze test niet stilletjes leeg draait.
    expect(gecontroleerd).toBeGreaterThan(50);
  });
});

describe("cilindermaat", () => {
  it("rondt af naar een leverbare cilinderlengte", () => {
    const b = bereken(config({ kozijnType: "voordeur" }, "aluplast-ideal-7000-aanslag"), AANNEMER);
    // ½ × 78 + 8 − 3 = 44 → eerstvolgende leverbare maat is 47.
    expect(b.cilindermaat.ruwBinnen).toBe(44);
    expect(b.cilindermaat.binnen).toBe(47);
    expect(b.cilindermaat.binnen).toBeGreaterThanOrEqual(b.cilindermaat.ruwBinnen);
  });

  it("adviseert SKG*** bij een voordeur", () => {
    const voordeur = bereken(
      config({ kozijnType: "voordeur", beslag: { beslagId: null, cilinderMeegeleverd: false } }),
      AANNEMER
    );
    expect(voordeur.cilindermaat.skgAdvies).toBe("SKG***");
  });
});

describe("regelmotor", () => {
  it("blokkeert een kozijn dat te breed is voor het profiel", () => {
    const b = bereken(config({ breedte: 5000 }), AANNEMER);
    expect(b.blokkeert).toBe(true);
    const bevinding = b.bevindingen.find((x) => x.regelId === "maat-binnen-grenzen");
    expect(bevinding).toBeDefined();
    expect(bevinding!.type).toBe("blokkade");
    // Regel 3 eist een begrijpelijke uitleg mét alternatief, geen generieke fout.
    expect(bevinding!.uitleg).toContain("5000");
    expect(bevinding!.alternatief).toBeTruthy();
  });

  it("blokkeert glas dat te dik is voor de sponning", () => {
    const b = bereken(
      config({ glas: { meegeleverd: true, glastypeId: "triple-06", afstandshouderId: "alu" } }, "aluplast-ideal-4000-aanslag"),
      AANNEMER
    );
    // IDEAL 4000 neemt maximaal 41 mm; Triple 0.6 is 48 mm.
    expect(b.bevindingen.some((x) => x.regelId === "glasdikte-past-in-sponning" || x.regelId === "glastype-toegestaan")).toBe(true);
    expect(b.blokkeert).toBe(true);
  });

  it("blokkeert een kleur van het verkeerde merk", () => {
    const gealanKleur = kleurenVanMerk("gealan")[0];
    const b = bereken(config({ kleurBuitenId: gealanKleur.id }, "aluplast-ideal-7000-aanslag"), AANNEMER);
    const bevinding = b.bevindingen.find((x) => x.regelId === "kleur-leverbaar");
    expect(bevinding?.type).toBe("blokkade");
  });

  it("escaleert naar een mens bij een configuratie ver buiten de grenzen", () => {
    const b = bereken(config({ breedte: 6000, hoogte: 4000 }), AANNEMER);
    const escalatie = b.bevindingen.find((x) => x.type === "escalatie");
    expect(escalatie).toBeDefined();
    expect(escalatie!.kop).toContain("buiten onze standaardmogelijkheden");
  });

  it("waarschuwt bij een grote vleugel zonder staalversterking", () => {
    const b = bereken(
      config({
        breedte: 1400,
        hoogte: 2000,
        indeling: nieuwVak("Groot", "draaikiep"),
      }),
      AANNEMER
    );
    expect(b.staalversterkingVerplicht).toBe(true);
    expect(b.bevindingen.some((x) => x.regelId === "staalversterking-verplicht")).toBe(true);
  });

  it("blokkeert een meegeleverde cilinder zonder gekozen beslag", () => {
    const b = bereken(config({ beslag: { beslagId: null, cilinderMeegeleverd: true } }), AANNEMER);
    const bevinding = b.bevindingen.find((x) => x.regelId === "cilinder-vereist-beslag");
    expect(bevinding?.type).toBe("blokkade");
    // De cilindermaat blijft ondanks de blokkade gewoon berekend (regel 2).
    expect(b.cilindermaat.binnen).toBeGreaterThan(0);
  });

  it("laat een eigen cilinder zonder beslag juist wél toe", () => {
    const b = bereken(config({ beslag: { beslagId: null, cilinderMeegeleverd: false } }), AANNEMER);
    expect(b.bevindingen.some((x) => x.regelId === "cilinder-vereist-beslag")).toBe(false);
    expect(b.blokkeert).toBe(false);
  });

  it("laat een geldige standaardconfiguratie ongemoeid", () => {
    const b = bereken(standaardConfiguratie(), AANNEMER);
    expect(b.blokkeert).toBe(false);
    expect(b.bevindingen.filter((x) => x.type === "blokkade")).toHaveLength(0);
  });

  it("geeft elke bevinding een stap waar de gebruiker het kan oplossen", () => {
    const b = bereken(config({ breedte: 5000, kleurBuitenId: "bestaat-niet" }), AANNEMER);
    for (const bevinding of b.bevindingen) {
      expect(bevinding.stap).toBeGreaterThanOrEqual(1);
      expect(bevinding.stap).toBeLessThanOrEqual(8);
      expect(bevinding.uitleg.length).toBeGreaterThan(20);
    }
  });
});

describe("prijsengine — gescheiden contexten", () => {
  it("toont een publieke bezoeker nooit een aannemersmarge", () => {
    const publiek = bereken(standaardConfiguratie(), { context: "publiek", aannemersmarge: 0.9 });
    expect(publiek.prijs.aannemersmargePercentage).toBeNull();
    expect(publiek.prijs.aannemersmargeBedrag).toBeNull();
    expect(publiek.prijs.isRichtprijs).toBe(true);
  });

  it("negeert de aannemersmarge volledig in de publieke context", () => {
    const laag = bereken(standaardConfiguratie(), { context: "publiek", aannemersmarge: 0.05 });
    const hoog = bereken(standaardConfiguratie(), { context: "publiek", aannemersmarge: 0.95 });
    expect(laag.prijs.klantprijsTotaal).toBe(hoog.prijs.klantprijsTotaal);
  });

  it("toont de inkoopprijs alleen wanneer daar expliciet om gevraagd wordt", () => {
    const aannemer = bereken(standaardConfiguratie(), AANNEMER);
    expect(aannemer.prijs.kostprijsPerStuk).toBeNull();
    expect(aannemer.prijs.kostprijsTotaal).toBeNull();
    // En ook de opbouwbedragen lekken niet.
    expect(aannemer.prijs.regels.every((r) => r.bedrag === 0)).toBe(true);

    const rebu = bereken(standaardConfiguratie(), { ...AANNEMER, toonKostprijs: true });
    expect(rebu.prijs.kostprijsPerStuk).toBeGreaterThan(0);
    expect(rebu.prijs.regels.some((r) => r.bedrag > 0)).toBe(true);
  });

  it("rekent de marge van de aannemer correct door", () => {
    const rebu = bereken(standaardConfiguratie(), {
      context: "aannemer",
      aannemersmarge: 0.25,
      toonKostprijs: true,
    });
    expect(rebu.prijs.aannemersmargePercentage).toBe(25);
    // Drie niveaus: kostprijs → +45% Rebu-marge → aannemersprijs → +25% eigen marge.
    expect(rebu.prijs.rebuMargePercentage).toBe(45);
    expect(rebu.prijs.aannemersprijsPerStuk).toBe(Math.round(rebu.prijs.kostprijsPerStuk! * 1.45));
    expect(rebu.prijs.klantprijsPerStuk).toBe(
      Math.round(rebu.prijs.aannemersprijsPerStuk! * 1.25)
    );
    // De aannemer ziet zijn eigen inkoop, maar nooit onze kostprijs.
    const alleenAannemer = bereken(standaardConfiguratie(), AANNEMER);
    expect(alleenAannemer.prijs.kostprijsPerStuk).toBeNull();
    expect(alleenAannemer.prijs.aannemersprijsPerStuk).toBeGreaterThan(0);
  });

  it("vermenigvuldigt met het aantal en rekent btw over het totaal", () => {
    const een = bereken(config({ aantal: 1 }), AANNEMER);
    const drie = bereken(config({ aantal: 3 }), AANNEMER);
    expect(drie.prijs.klantprijsTotaal).toBe(een.prijs.klantprijsPerStuk * 3);
    expect(drie.prijs.btwBedrag).toBe(Math.round((drie.prijs.klantprijsTotaal * 21) / 100));
    expect(drie.prijs.klantprijsTotaalInclBtw).toBe(drie.prijs.klantprijsTotaal + drie.prijs.btwBedrag);
  });

  it("houdt alle bedragen in hele centen", () => {
    const b = bereken(config({ aantal: 7, breedte: 1337 }), { ...AANNEMER, toonKostprijs: true });
    for (const bedrag of [
      b.prijs.klantprijsPerStuk,
      b.prijs.klantprijsTotaal,
      b.prijs.btwBedrag,
      b.prijs.klantprijsTotaalInclBtw,
      b.prijs.kostprijsPerStuk!,
    ]) {
      expect(Number.isInteger(bedrag)).toBe(true);
    }
  });
});

describe("productdatabase", () => {
  it("verwijst alleen naar bestaande glastypes en beslag", () => {
    const glasIds = new Set(GLASTYPES.map((g) => g.id));
    for (const profiel of PROFIELEN) {
      for (const id of profiel.toegestaneGlastypes) {
        expect(glasIds.has(id), `${profiel.id} verwijst naar onbekend glas ${id}`).toBe(true);
      }
    }
  });

  it("heeft voor elk merk een standaardkleur met swatch", () => {
    for (const merk of ["aluplast", "gealan", "kommerling"] as const) {
      const kleur = standaardKleur(merk);
      expect(kleur).toBeDefined();
      expect(kleur.swatch ?? kleur.hex).toBeTruthy();
    }
  });

  it("heeft unieke profiel-ids", () => {
    const ids = PROFIELEN.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("aanslag per zijde", () => {
  it("trekt alleen de zijden met aanslag van de stelmaat af", async () => {
    const { berekenStelmaat } = await import("../engine/maten");
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    const c = standaardConfiguratie(profiel.id, "vast");

    // Rondom aanslag van 20 mm: 1000 × 1200 wordt 960 × 1160.
    const rondom = berekenStelmaat({ ...c, breedte: 1000, hoogte: 1200 }, profiel);
    expect(rondom).toEqual({ breedte: 960, hoogte: 1160 });

    // Links weggelaten: die 20 mm telt weer mee in de sparingmaat.
    const zonderLinks = berekenStelmaat(
      {
        ...c,
        breedte: 1000,
        hoogte: 1200,
        kozijnzijden: { ...c.kozijnzijden, links: { aanslag: false, rubber: false, bijprofielId: null } },
      },
      profiel
    );
    expect(zonderLinks).toEqual({ breedte: 980, hoogte: 1160 });
  });

  it("tekent de aanslagband alleen op de zijden die hem hebben", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { bereken } = await import("../engine");
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    const c = standaardConfiguratie(profiel.id, "vast");
    const opties = { context: "aannemer" as const, aannemersmarge: 0.25 };

    const rondom = tekenAanzicht(bereken(c, opties), "binnen");
    const banden = (rondom.inhoud.match(/rgba\(0,0,0,0\.07\)/g) ?? []).length;
    expect(banden).toBe(4);

    const zonderBoven = tekenAanzicht(
      bereken({ ...c, kozijnzijden: { ...c.kozijnzijden, boven: { aanslag: false, rubber: false, bijprofielId: null } } }, opties),
      "binnen"
    );
    expect((zonderBoven.inhoud.match(/rgba\(0,0,0,0\.07\)/g) ?? []).length).toBe(3);
  });
});

describe("donkere folie", () => {
  it("tekent de constructie met een lichte lijn zodra de folie donker is", async () => {
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { bereken } = await import("../engine");
    const { kleurenVanMerk } = await import("../data/kleuren");
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    const opties = { context: "aannemer" as const, aannemersmarge: 0.25 };
    const basis = standaardConfiguratie(profiel.id, "draaikiep");

    const donker = kleurenVanMerk(profiel.merk).find((k) => k.code === "AP04");
    expect(donker?.hex).toBeTruthy();

    const licht = tekenAanzicht(bereken(basis, opties), "binnen");
    expect(licht.inhoud).toContain("#2a2f2c");

    const zwart = tekenAanzicht(
      bereken({ ...basis, kleurBinnenId: donker!.id, kleurBuitenId: donker!.id }, opties),
      "binnen"
    );
    // Op zwart wordt de contour licht, anders valt de hele constructie weg.
    expect(zwart.inhoud).toContain("#f4f3ef");
  });
});

describe("hefschuifpui — geijkt op AKUGT", () => {
  it("komt bij een 2-delige pui van 2000 uit op glasmaat 758", async () => {
    const { blancoIndeling, maakSchuifpui } = await import("../engine/indeling");
    const { bereken } = await import("../engine");
    const { wisselKozijnType, standaardConfiguratie } = await import("../data/standaard");

    const start = wisselKozijnType(standaardConfiguratie("gealan-s9000-aanslag", "vast"), "schuifpui");
    const basis = blancoIndeling("Pui");
    const c = {
      ...start,
      breedte: 2000,
      hoogte: 2000,
      indeling: maakSchuifpui(basis, basis.id, "2a-rechts-actief"),
    };
    const b = bereken(c, { context: "aannemer", aannemersmarge: 0.25 });

    expect(b.vakken.map((v) => v.glasBreedte)).toEqual([758, 758]);
  });

  it("geeft bij elke 4-delige pui exact de glasmaten van AKUGT", async () => {
    const { blancoIndeling, maakSchuifpui } = await import("../engine/indeling");
    const { bereken } = await import("../engine");
    const { wisselKozijnType, standaardConfiguratie } = await import("../data/standaard");

    /*
     * Vier puien uit AKUGT, allemaal 2000 hoog. De twee schuivende vleugels
     * krijgen steeds 13 mm meer glas dan de vaste delen ernaast: hun profielen
     * grijpen in elkaar waar ze elkaar ontmoeten. Dat verschil blijkt constant,
     * ongeacht de breedte.
     */
    const ijkpunten: [number, number[]][] = [
      [3600, [676, 689, 689, 676]],
      [4000, [776, 789, 789, 776]],
      [4400, [876, 889, 889, 876]],
    ];

    for (const [breedte, glasmaten] of ijkpunten) {
      const start = wisselKozijnType(
        standaardConfiguratie("gealan-s9000-aanslag", "vast"),
        "schuifpui"
      );
      const basis = blancoIndeling("Pui");
      const b = bereken(
        {
          ...start,
          breedte,
          hoogte: 2000,
          indeling: maakSchuifpui(basis, basis.id, "4-midden-actief"),
        },
        { context: "aannemer", aannemersmarge: 0.25 }
      );
      expect(b.vakken.map((v) => v.glasBreedte)).toEqual(glasmaten);
    }
  });
});

describe("maatvoering van een pui", () => {
  it("zet de dekkende maat van elke schuivende vleugel op de tekening", async () => {
    const { blancoIndeling, maakSchuifpui } = await import("../engine/indeling");
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { bereken } = await import("../engine");
    const { wisselKozijnType, standaardConfiguratie } = await import("../data/standaard");

    const start = wisselKozijnType(standaardConfiguratie("gealan-s9000-aanslag", "vast"), "schuifpui");
    const basis = blancoIndeling("Pui");
    const b = bereken(
      {
        ...start,
        breedte: 4000,
        hoogte: 2000,
        indeling: maakSchuifpui(basis, basis.id, "4-midden-actief"),
      },
      { context: "aannemer", aannemersmarge: 0.25 }
    );

    // AKUGT toont bij deze pui twee dekkende maten van 2000 — elke vleugel sluit
    // de helft af. Die maat hoort dus ook bij ons op de tekening te staan.
    const aanzicht = tekenAanzicht(b, "binnen", { maten: true });
    const dekkend = (aanzicht.inhoud.match(/>2000</g) ?? []).length;
    expect(dekkend).toBeGreaterThanOrEqual(2);
  });
});

describe("afstandshouder", () => {
  it("is standaard aluminium en kost dan niets extra", async () => {
    const { bereken } = await import("../engine");
    const { standaardConfiguratie } = await import("../data/standaard");
    const b = bereken(standaardConfiguratie(), { context: "aannemer", aannemersmarge: 0.25 });
    expect(b.afstandshouder?.id).toBe("alu");
    expect(b.prijs.regels.some((r) => r.omschrijving.startsWith("Afstandshouder"))).toBe(false);
  });

  it("rekent een warm edge per strekkende meter glasrand en tekent hem mee", async () => {
    const { bereken } = await import("../engine");
    const { tekenAanzicht } = await import("../engine/aanzicht");
    const { standaardConfiguratie } = await import("../data/standaard");
    const { AFSTANDSHOUDERS } = await import("../data/onderdelen");

    const basis = standaardConfiguratie();
    const zwart = AFSTANDSHOUDERS.find((a) => a.id === "warm-edge-zwart")!;
    const met = bereken(
      { ...basis, glas: { ...basis.glas, afstandshouderId: zwart.id } },
      { context: "aannemer", aannemersmarge: 0.25 }
    );
    const zonder = bereken(basis, { context: "aannemer", aannemersmarge: 0.25 });

    expect(met.prijs.regels.some((r) => r.omschrijving.startsWith("Afstandshouder warm edge zwart"))).toBe(
      true
    );
    expect(met.prijs.klantprijsTotaalInclBtw).toBeGreaterThan(zonder.prijs.klantprijsTotaalInclBtw);
    // Hij zit in het zicht, dus hij hoort ook in de tekening te staan.
    expect(tekenAanzicht(met, "binnen").inhoud).toContain(zwart.hex);
  });
});

describe("profielgegevens uit de technische catalogus", () => {
  it("kent de inbouwdiepte en glasdikte per uitvoering, niet per systeem", () => {
    // Het NL blokprofiel mét aanslag is een ander, dieper profiel dan de vlakke
    // uitvoering van hetzelfde systeem. Dat staat zo in de catalogus van
    // aluplast, mét doorsnede: 120 mm diep, beglazing tot 41 mm.
    const blok = profielOpId("aluplast-ideal-7000-aanslag")!;
    expect(blok.inbouwdiepte.waarde).toBe(120);
    expect(blok.maxGlasdikte.waarde).toBe(41);

    // De vlakke uitvoering van hetzelfde systeem houdt de systeemwaarden.
    const vlak = profielOpId("aluplast-ideal-7000-vlak")!;
    expect(vlak.inbouwdiepte.waarde).toBe(85);

    // Ideal 4000 vlak: 70 mm diep, beglazing tot 42 mm.
    const ideal4000 = profielOpId("aluplast-ideal-4000-vlak")!;
    expect(ideal4000.inbouwdiepte.waarde).toBe(70);
    expect(ideal4000.maxGlasdikte.waarde).toBe(42);

    // Gealan S 9000 NL met aanslag meet 120 mm in doorsnede.
    const gealan = profielOpId("gealan-s9000-aanslag")!;
    expect(gealan.inbouwdiepte.waarde).toBe(120);
  });

  it("weigert glas dat dikker is dan het profiel volgens de catalogus neemt", async () => {
    const { bereken } = await import("../engine");
    const { standaardConfiguratie } = await import("../data/standaard");

    // Triple 0.6 is 48 mm; het blokprofiel neemt 41 mm.
    const c = standaardConfiguratie("aluplast-ideal-7000-aanslag", "vast");
    const b = bereken(
      { ...c, glas: { ...c.glas, glastypeId: "triple-06" } },
      { context: "aannemer", aannemersmarge: 0.25 }
    );
    expect(
      b.bevindingen.some((x) => x.regelId === "glasdikte-past-in-sponning" && x.type === "blokkade")
    ).toBe(true);
  });
});

describe("grenzen van een pui", () => {
  it("rekent een pui van 5000 mm gewoon door", async () => {
    const { blancoIndeling, maakSchuifpui } = await import("../engine/indeling");
    const { bereken } = await import("../engine");
    const { wisselKozijnType, standaardConfiguratie } = await import("../data/standaard");

    const start = wisselKozijnType(standaardConfiguratie("gealan-s9000-aanslag", "vast"), "schuifpui");
    const basis = blancoIndeling("Pui");
    const b = bereken(
      {
        ...start,
        breedte: 5000,
        hoogte: 2300,
        indeling: maakSchuifpui(basis, basis.id, "4-midden-actief"),
      },
      { context: "aannemer", aannemersmarge: 0.25 }
    );

    // 11,5 m² is voor een hefschuifpui een gangbare maat, geen escalatie.
    expect(b.bevindingen.filter((x) => x.type === "escalatie")).toEqual([]);
    expect(b.bevindingen.filter((x) => x.type === "blokkade")).toEqual([]);
    expect(b.vakken).toHaveLength(4);
  });
});

describe("maten per uitvoering en per kader/vleugel-combinatie", () => {
  /**
   * De maxGlasdikte hangt aan de uitvoering, niet aan het systeem: het
   * blokprofiel van IDEAL 7000 neemt 41 mm, de vlakke uitvoering van hetzelfde
   * systeem 52 mm. De regelmotor moet dat verschil dus per uitvoering zien.
   */
  it("beoordeelt de glasdikte per uitvoering, niet per systeem", () => {
    const dik = { meegeleverd: true, glastypeId: "triple-06", afstandshouderId: "alu" };

    // Triple 0.6 is 48 mm: te dik voor het blokprofiel (41 mm)…
    const blok = bereken(config({ glas: dik }, "aluplast-ideal-7000-aanslag"), AANNEMER);
    expect(
      blok.bevindingen.some(
        (x) => x.regelId === "glasdikte-past-in-sponning" && x.type === "blokkade"
      )
    ).toBe(true);

    // …maar past prima in de vlakke uitvoering van hetzelfde systeem (52 mm).
    const vlak = bereken(config({ glas: dik }, "aluplast-ideal-7000-vlak"), AANNEMER);
    expect(vlak.bevindingen.some((x) => x.regelId === "glasdikte-past-in-sponning")).toBe(false);
  });

  /**
   * Kader en vleugel zijn een combinatie, geen systeemmaat: op kader 170054
   * levert aluplast zowel de raamvleugel van 77 mm als de zware deurvleugel van
   * 96 mm. Een deur krijgt dus minder glas dan een raam van dezelfde maat.
   */
  it("geeft een deur op hetzelfde kader de zware 96 mm-vleugel", () => {
    const profiel = profielOpId("aluplast-ideal-7000-aanslag")!;
    expect(profiel.geometrie.deurVleugelZichtbreedte?.waarde).toBe(96);

    const c = config(
      { breedte: 1000, hoogte: 2100, indeling: nieuwVak("Deur", "deur") },
      "aluplast-ideal-7000-aanslag"
    );
    const [vak] = berekenVakken(c, profiel, null);

    // 1000 − 2 × 84 = 832 sponning; glasaftrek 96 − 28 = 68 per zijde → 696.
    expect(vak.sponningBreedte).toBe(832);
    expect(vak.glasBreedte).toBe(696);

    // Een raam op datzelfde kader houdt de 77 mm-vleugel: 832 − 2 × 49 = 734.
    const raam = berekenVakken(
      config(
        { breedte: 1000, hoogte: 2100, indeling: nieuwVak("Raam", "draaikiep") },
        "aluplast-ideal-7000-aanslag"
      ),
      profiel,
      null
    )[0];
    expect(raam.glasBreedte).toBe(734);
  });
});

describe("hefschuifpui aluplast HST 85 — eigen maten uit schema C", () => {
  /**
   * De aluplast-hefschuif stond tot nu toe op de Gealan-maten (kader 177,
   * puistijl 130, ontmoetingsstijl 256). Schema C van de HST 85-catalogus geeft
   * de echte maten: schuifraam links/rechts/boven 100 mm, ontmoetingsstijl 63 mm.
   */
  async function aluplastPui(breedte: number) {
    const { blancoIndeling, maakSchuifpui } = await import("../engine/indeling");
    const { wisselKozijnType, standaardConfiguratie } = await import("../data/standaard");
    const start = wisselKozijnType(standaardConfiguratie("aluplast-hst85-vlak", "vast"), "schuifpui");
    const basis = blancoIndeling("Pui");
    return {
      ...start,
      breedte,
      hoogte: 2200,
      indeling: maakSchuifpui(basis, basis.id, "4-midden-actief"),
    };
  }

  it("zet de pui op 100 mm rondom en 63 mm ontmoetingsstijl", async () => {
    const { berekenGeometrie } = await import("../engine/maten");
    const profiel = profielOpId("aluplast-hst85-vlak")!;
    const c = await aluplastPui(4000);
    const geo = berekenGeometrie(c, profiel);

    // Kader rondom 100 mm: het eerste vak begint op x = 100.
    expect(profiel.geometrie.kozijnZichtbreedte.waarde).toBe(100);
    expect(geo.vakken[0].gebied.x).toBe(100);

    // vast | vleugel | vleugel | vast → puistijl, ontmoetingsstijl, puistijl.
    expect(geo.stijlen.map((s) => s.breedte)).toEqual([100, 63, 100]);
  });

  it("houdt de maatketen sluitend op de aluplast-maten", async () => {
    const profiel = profielOpId("aluplast-hst85-vlak")!;
    const c = await aluplastPui(4000);
    const b = bereken(c, AANNEMER);

    // Kader 2 × 100 + stijlen 100 + 63 + 100 = 463; de rest is glas.
    const glas = b.vakken.map((v) => v.glasBreedte);
    expect(glas.reduce((a, x) => a + x, 0)).toBe(4000 - 463);

    // Waar twee vleugels elkaar ontmoeten grijpen hun profielen in elkaar: de
    // vleugels winnen samen de 13 mm die de vaste delen inleveren.
    const [vast1, vleugel1, vleugel2, vast2] = glas;
    expect(vleugel1 + vleugel2 - (vast1 + vast2)).toBe(26);
  });

  it("laat de Gealan-hefschuif onveranderd op de geijkte AKUGT-maten", async () => {
    const { berekenGeometrie } = await import("../engine/maten");
    const { blancoIndeling, maakSchuifpui } = await import("../engine/indeling");
    const { wisselKozijnType, standaardConfiguratie } = await import("../data/standaard");

    const start = wisselKozijnType(standaardConfiguratie("gealan-s9000-aanslag", "vast"), "schuifpui");
    const basis = blancoIndeling("Pui");
    const c = {
      ...start,
      breedte: 4000,
      hoogte: 2000,
      indeling: maakSchuifpui(basis, basis.id, "4-midden-actief"),
    };
    // wisselKozijnType wisselt mee naar het hefschuifprofiel van hetzelfde merk.
    const profiel = profielOpId(c.profielId)!;
    expect(profiel.id).toBe("gealan-s9000-hefschuif-vlak");
    const geo = berekenGeometrie(c, profiel);
    expect(geo.stijlen.map((s) => s.breedte)).toEqual([130, 256, 130]);
  });
});

describe("letselveilig glas", () => {
  it("eist gelaagd of gehard glas onder 70 cm vanaf de vloer", async () => {
    const { bereken } = await import("../engine");
    const { standaardConfiguratie } = await import("../data/standaard");
    const opties = { context: "aannemer" as const, aannemersmarge: 0.25 };

    // Een raam op een borstwering van 900 mm mag gewoon isolatieglas hebben.
    const hoog = standaardConfiguratie("aluplast-ideal-7000-aanslag", "vast");
    expect(hoog.borstweringHoogte).toBe(900);
    expect(
      bereken(hoog, opties).bevindingen.some((x) => x.regelId === "veiligheidsglas-verplicht")
    ).toBe(false);

    // Zakt de borstwering onder de 700 mm, dan is het verplicht.
    const laag = bereken({ ...hoog, borstweringHoogte: 400 }, opties);
    expect(
      laag.bevindingen.some(
        (x) => x.regelId === "veiligheidsglas-verplicht" && x.type === "blokkade"
      )
    ).toBe(true);

    // Met gelaagd glas is het weer in orde.
    const metGelaagd = bereken(
      { ...hoog, borstweringHoogte: 400, glas: { ...hoog.glas, glastypeId: "gelaagd-binnen" } },
      opties
    );
    expect(
      metGelaagd.bevindingen.some((x) => x.regelId === "veiligheidsglas-verplicht")
    ).toBe(false);
  });

  it("geeft een pui en een deur meteen veilig glas en een borstwering van nul", async () => {
    const { bereken } = await import("../engine");
    const { wisselKozijnType, standaardConfiguratie } = await import("../data/standaard");
    const { glastypeOpId } = await import("../data/onderdelen");
    const opties = { context: "aannemer" as const, aannemersmarge: 0.25 };

    for (const type of ["schuifpui", "voordeur", "achterdeur"] as const) {
      const c = wisselKozijnType(standaardConfiguratie("aluplast-ideal-7000-aanslag", "vast"), type);
      expect(c.borstweringHoogte).toBe(0);
      expect(glastypeOpId(c.glas.glastypeId)?.veilig).toBe(true);
      // En dus geen blokkade op het veiligheidsglas.
      expect(
        bereken(c, opties).bevindingen.some((x) => x.regelId === "veiligheidsglas-verplicht")
      ).toBe(false);
    }
  });
});
