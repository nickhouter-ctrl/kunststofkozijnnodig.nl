/**
 * Tests op de opslaglaag: snapshotversies, de audit trail en vooral
 * borgingslaag 4 — de database weigert een vak zonder maatvoering.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tijdelijk = mkdtempSync(join(tmpdir(), "configurator-test-"));
process.env.CONFIGURATOR_DB = join(tijdelijk, "test.db");

const { db, sluitDb } = await import("../opslag/db");
const {
  BlokkadeBijOpslagFout,
  auditTrail,
  bevriesSnapshot,
  maakProject,
  slaConfiguratieOp,
  slaEscalatieOp,
  slaLeadOp,
  snapshot,
  snapshotsVanProject,
} = await import("../opslag/repository");
const { standaardConfiguratie } = await import("../data/standaard");

const AANNEMER = { context: "aannemer" as const, aannemersmarge: 0.25 };

let projectId: string;

beforeAll(() => {
  projectId = maakProject({ naam: "Testproject", context: "aannemer" }).id;
});

afterAll(() => {
  sluitDb();
  rmSync(tijdelijk, { recursive: true, force: true });
});

describe("snapshots", () => {
  it("verhoogt het versienummer bij elke opslag onder dezelfde naam", () => {
    const c = standaardConfiguratie();
    const eerste = slaConfiguratieOp({ projectId, configuratie: c, prijsOpties: AANNEMER });
    expect(eerste.snapshot.versie).toBe(1);

    const gewijzigd = { ...c, breedte: 1300 };
    const tweede = slaConfiguratieOp({ projectId, configuratie: gewijzigd, prijsOpties: AANNEMER });
    expect(tweede.snapshot.versie).toBe(2);

    // De eerste versie is onaangeroerd gebleven.
    const bewaard = snapshot(eerste.snapshot.id);
    expect(bewaard!.configuratie.breedte).toBe(c.breedte);
    expect(bewaard!.versie).toBe(1);
  });

  it("weigert een configuratie met een blokkade op te slaan", () => {
    const c = standaardConfiguratie();
    c.breedte = 9000;
    expect(() => slaConfiguratieOp({ projectId, configuratie: c, prijsOpties: AANNEMER })).toThrow(
      BlokkadeBijOpslagFout
    );
  });

  it("laat na een mislukte opslag geen halve gegevens achter", () => {
    const voor = snapshotsVanProject(projectId).length;
    const c = standaardConfiguratie();
    c.breedte = 9000;
    try {
      slaConfiguratieOp({ projectId, configuratie: c, prijsOpties: AANNEMER });
    } catch {
      // verwacht
    }
    expect(snapshotsVanProject(projectId).length).toBe(voor);
  });

  it("bevriest een snapshot bij orderbevestiging", () => {
    const opslag = slaConfiguratieOp({
      projectId,
      configuratie: { ...standaardConfiguratie(), naam: "Te bevriezen" },
      prijsOpties: AANNEMER,
    });
    expect(opslag.snapshot.bevroren).toBe(false);
    bevriesSnapshot(opslag.snapshot.id, "tester");
    expect(snapshot(opslag.snapshot.id)!.bevroren).toBe(true);
  });

  it("bewaart de maten van een configuratie zonder glas, cilinder en hor", () => {
    const c = standaardConfiguratie();
    c.naam = "Kaal kozijn";
    c.glas = { meegeleverd: false, glastypeId: null, afstandshouderId: "alu" };
    c.beslag = { beslagId: null, cilinderMeegeleverd: false };
    c.hortypeId = null;

    const { snapshot: s, berekening } = slaConfiguratieOp({
      projectId,
      configuratie: c,
      prijsOpties: AANNEMER,
    });

    const vakken = db()
      .prepare(`SELECT * FROM vakken WHERE configuratie_id = ? ORDER BY volgorde`)
      .all(s.id) as unknown as { glas_breedte: number; hor_breedte: number }[];

    expect(vakken).toHaveLength(berekening.vakken.length);
    for (const [i, rij] of vakken.entries()) {
      expect(rij.glas_breedte).toBe(berekening.vakken[i].glasBreedte);
      expect(rij.hor_breedte).toBe(berekening.vakken[i].horBreedte);
    }
  });
});

describe("borgingslaag 4 — databaseconstraints", () => {
  it("weigert een vak zonder glasmaat, ook als de applicatielaag zou falen", () => {
    const rij = db().prepare(`SELECT id FROM configuraties LIMIT 1`).get() as unknown as {
      id: string;
    };

    expect(() =>
      db()
        .prepare(
          `INSERT INTO vakken (id, configuratie_id, volgorde, naam, invulling,
                               glas_breedte, glas_hoogte, hor_breedte, hor_hoogte)
           VALUES ('vak_kapot', ?, 99, 'Stiekem', 'vast', 0, 500, 500, 500)`
        )
        .run(rij.id)
    ).toThrow();
  });

  it("weigert een vak met een NULL-hormaat", () => {
    const rij = db().prepare(`SELECT id FROM configuraties LIMIT 1`).get() as unknown as {
      id: string;
    };
    expect(() =>
      db()
        .prepare(
          `INSERT INTO vakken (id, configuratie_id, volgorde, naam, invulling,
                               glas_breedte, glas_hoogte, hor_breedte, hor_hoogte)
           VALUES ('vak_kapot2', ?, 98, 'Stiekem', 'vast', 500, 500, NULL, 500)`
        )
        .run(rij.id)
    ).toThrow();
  });

  it("weigert een cilindermaat van nul", () => {
    expect(() =>
      db()
        .prepare(
          `INSERT INTO configuraties
             (id, project_id, naam, versie, bevroren, invoer_json, profiel_id, breedte, hoogte, aantal,
              glas_meegeleverd, cilinder_meegeleverd, hor_meegeleverd,
              cilinder_binnen, cilinder_buiten, verkoop_totaal, aangemaakt_op)
           VALUES ('cfg_kapot', ?, 'Kapot', 1, 0, '{}', 'x', 1000, 1000, 1, 0, 0, 0, 0, 0, 0, '2026-01-01')`
        )
        .run(projectId)
    ).toThrow();
  });
});

describe("leads, escalaties en audit trail", () => {
  it("slaat een lead op met herkomst", () => {
    const id = slaLeadOp({
      naam: "J. Jansen",
      telefoon: "0612345678",
      email: "j@example.nl",
      postcode: "3511AA",
      herkomst: "publiek",
    });
    expect(id).toMatch(/^lead_/);
  });

  it("slaat een escalatie op mét de volledige configuratie", () => {
    const c = standaardConfiguratie();
    c.breedte = 9000;
    const id = slaEscalatieOp({
      naam: "Aannemer B",
      contact: "b@example.nl",
      bericht: "Deze maat lukt niet in de configurator",
      configuratie: c,
      bevindingen: [{ type: "escalatie" }],
    });
    const rij = db().prepare(`SELECT invoer_json FROM escalaties WHERE id = ?`).get(id) as unknown as {
      invoer_json: string;
    };
    expect(JSON.parse(rij.invoer_json).breedte).toBe(9000);
  });

  it("legt elke handeling vast in de audit trail", () => {
    const regels = auditTrail(200);
    const acties = regels.map((r) => r.actie);
    expect(acties).toContain("project-aangemaakt");
    expect(acties).toContain("configuratie-opgeslagen");
    expect(acties).toContain("snapshot-bevroren");
    expect(acties).toContain("lead-aangemaakt");
    expect(acties).toContain("escalatie-aangemeld");
    for (const regel of regels) {
      expect(regel.tijdstip).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});

describe("oudere snapshots openen", () => {
  it("vult velden aan die er bij het opslaan nog niet waren", async () => {
    const { herstelConfiguratie, standaardConfiguratie } = await import("../data/standaard");
    const { bereken } = await import("../engine");
    const { tekenAanzicht } = await import("../engine/aanzicht");

    // Zoals een offerte van vóór de aanslag-, roeden- en bedieningsvelden er
    // in de database uitziet: die velden staan er simpelweg niet in.
    const volledig = standaardConfiguratie();
    const oud = JSON.parse(JSON.stringify(volledig)) as Record<string, unknown>;
    delete oud.kozijnzijden;
    delete oud.afwatering;
    delete oud.vleugelKleurBinnenId;
    delete oud.vleugelKleurBuitenId;
    const vak = (oud.indeling as Record<string, unknown>);
    delete vak.roeden;
    delete vak.krukBinnenId;
    delete vak.naarBuitenDraaiend;

    const hersteld = herstelConfiguratie(oud as never);
    expect(hersteld.kozijnzijden.links.aanslag).toBe(true);
    expect(hersteld.afwatering).toBe("zichtbaar");

    // En hij rekent en tekent gewoon weer door.
    const b = bereken(hersteld, { context: "aannemer", aannemersmarge: 0.25 });
    expect(b.vakken.length).toBeGreaterThan(0);
    expect(() => tekenAanzicht(b, "buiten", { maten: true })).not.toThrow();
  });
});
