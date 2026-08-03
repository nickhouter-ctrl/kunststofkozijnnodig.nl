/**
 * Opslag van projecten, configuratie-snapshots, leads en escalaties.
 *
 * ALLEEN SERVER — importeert de SQLite-laag.
 *
 * Hoofdstuk 15.2: een configuratie krijgt bij opslag een uniek id plus
 * versienummer. Een bestaande versie wordt nooit aangepast; opslaan onder
 * dezelfde naam maakt versie n+1. Zodra een order bevestigd is, wordt de
 * snapshot bevroren en levert een wijziging altijd een nieuwe, zichtbare versie.
 */
import { db, logAudit, nieuwId } from "./db";
import { bereken } from "../engine";
import { herstelConfiguratie } from "../data/standaard";
import { vullingsVakken } from "../engine/maten";
import type { PrijsOpties } from "../engine/prijs";
import type { Berekening, Configuratie, Prijscontext } from "../types";

export interface Project {
  id: string;
  naam: string;
  klantnaam: string;
  projectadres: string;
  /** De eindklant waar deze offerte bij hoort, als die gekoppeld is. */
  klantId: string | null;
  context: Prijscontext;
  /** De eigen marge van de aannemer op dit project, als factor (0.25 = 25%). */
  aannemersmarge: number;
  aangemaaktOp: string;
  gewijzigdOp: string;
}

export interface Snapshot {
  id: string;
  projectId: string;
  naam: string;
  versie: number;
  bevroren: boolean;
  configuratie: Configuratie;
  aangemaaktOp: string;
}

const nu = (): string => new Date().toISOString();

// ---------------------------------------------------------------------------
// Projecten
// ---------------------------------------------------------------------------

export function maakProject(invoer: {
  naam: string;
  klantnaam?: string;
  projectadres?: string;
  klantId?: string | null;
  context: Prijscontext;
  aannemersmarge?: number;
  gebruiker?: string;
}): Project {
  const project: Project = {
    id: nieuwId("prj"),
    naam: invoer.naam,
    klantnaam: invoer.klantnaam ?? "",
    projectadres: invoer.projectadres ?? "",
    klantId: invoer.klantId ?? null,
    context: invoer.context,
    aannemersmarge: invoer.aannemersmarge ?? 0.25,
    aangemaaktOp: nu(),
    gewijzigdOp: nu(),
  };

  db()
    .prepare(
      `INSERT INTO projecten (id, naam, klantnaam, projectadres, klant_id, context, aannemersmarge, aangemaakt_op, gewijzigd_op)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      project.id,
      project.naam,
      project.klantnaam,
      project.projectadres,
      project.klantId,
      project.context,
      project.aannemersmarge,
      project.aangemaaktOp,
      project.gewijzigdOp
    );

  logAudit({
    gebruiker: invoer.gebruiker ?? "onbekend",
    actie: "project-aangemaakt",
    entiteit: "project",
    entiteitId: project.id,
    nieuweWaarde: project,
  });

  return project;
}

interface ProjectRij {
  id: string;
  naam: string;
  klantnaam: string;
  projectadres: string;
  klant_id: string | null;
  context: string;
  aannemersmarge: number;
  aangemaakt_op: string;
  gewijzigd_op: string;
}

function naarProject(rij: ProjectRij): Project {
  return {
    id: rij.id,
    naam: rij.naam,
    klantnaam: rij.klantnaam,
    projectadres: rij.projectadres,
    klantId: rij.klant_id ?? null,
    context: rij.context as Prijscontext,
    aannemersmarge: rij.aannemersmarge,
    aangemaaktOp: rij.aangemaakt_op,
    gewijzigdOp: rij.gewijzigd_op,
  };
}

export function projecten(): Project[] {
  const rijen = db()
    .prepare(`SELECT * FROM projecten ORDER BY gewijzigd_op DESC`)
    .all() as unknown as ProjectRij[];
  return rijen.map(naarProject);
}

export function project(id: string): Project | null {
  const rij = db().prepare(`SELECT * FROM projecten WHERE id = ?`).get(id) as unknown as
    | ProjectRij
    | undefined;
  return rij ? naarProject(rij) : null;
}

// ---------------------------------------------------------------------------
// Configuratie-snapshots
// ---------------------------------------------------------------------------

export class BlokkadeBijOpslagFout extends Error {
  constructor(public readonly koppen: string[]) {
    super(`Configuratie kan niet worden opgeslagen: ${koppen.join("; ")}`);
    this.name = "BlokkadeBijOpslagFout";
  }
}

/**
 * Slaat een configuratie op als nieuwe snapshotversie.
 *
 * Weigert bij een blokkerende bevinding — borgingslaag 3 uit hoofdstuk 24: de
 * server herhaalt de validatie onafhankelijk van de client, zodat een
 * gemanipuleerd verzoek er niet langs komt.
 */
export function slaConfiguratieOp(invoer: {
  projectId: string;
  configuratie: Configuratie;
  prijsOpties: PrijsOpties;
  gebruiker?: string;
}): { snapshot: Snapshot; berekening: Berekening } {
  const berekening = bereken(invoer.configuratie, invoer.prijsOpties);

  if (berekening.blokkeert) {
    throw new BlokkadeBijOpslagFout(
      berekening.bevindingen.filter((b) => b.type === "blokkade").map((b) => b.kop)
    );
  }

  const vorige = db()
    .prepare(
      `SELECT MAX(versie) AS hoogste FROM configuraties WHERE project_id = ? AND naam = ?`
    )
    .get(invoer.projectId, invoer.configuratie.naam) as unknown as { hoogste: number | null };
  const versie = (vorige?.hoogste ?? 0) + 1;

  const snapshot: Snapshot = {
    id: nieuwId("cfg"),
    projectId: invoer.projectId,
    naam: invoer.configuratie.naam,
    versie,
    bevroren: false,
    configuratie: invoer.configuratie,
    aangemaaktOp: nu(),
  };

  const verbinding = db();
  verbinding.exec("BEGIN");
  try {
    verbinding
      .prepare(
        `INSERT INTO configuraties
           (id, project_id, naam, versie, bevroren, invoer_json, profiel_id, breedte, hoogte, aantal,
            glas_meegeleverd, cilinder_meegeleverd, hor_meegeleverd,
            cilinder_binnen, cilinder_buiten, verkoop_totaal, aangemaakt_op)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        snapshot.id,
        snapshot.projectId,
        snapshot.naam,
        versie,
        JSON.stringify(invoer.configuratie),
        invoer.configuratie.profielId,
        invoer.configuratie.breedte,
        invoer.configuratie.hoogte,
        invoer.configuratie.aantal,
        invoer.configuratie.glas.meegeleverd ? 1 : 0,
        invoer.configuratie.beslag.cilinderMeegeleverd ? 1 : 0,
        berekening.vakken.some((v) => v.horMeegeleverd) ? 1 : 0,
        berekening.cilindermaat.binnen,
        berekening.cilindermaat.buiten,
        berekening.prijs.klantprijsTotaal,
        snapshot.aangemaaktOp
      );

    // De maten per vak. De CHECK-constraints in het schema weigeren hier een
    // ontbrekende glas- of hormaat, ook als de applicatielaag ooit zou falen.
    const vakStatement = verbinding.prepare(
      `INSERT INTO vakken (id, configuratie_id, volgorde, naam, invulling,
                           glas_breedte, glas_hoogte, hor_breedte, hor_hoogte)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    vullingsVakken(berekening.vakken).forEach((vak, i) => {
      vakStatement.run(
        nieuwId("vak"),
        snapshot.id,
        i,
        vak.naam,
        vak.invulling,
        vak.glasBreedte,
        vak.glasHoogte,
        vak.horBreedte,
        vak.horHoogte
      );
    });

    verbinding
      .prepare(`UPDATE projecten SET gewijzigd_op = ? WHERE id = ?`)
      .run(nu(), invoer.projectId);

    verbinding.exec("COMMIT");
  } catch (fout) {
    verbinding.exec("ROLLBACK");
    throw fout;
  }

  logAudit({
    gebruiker: invoer.gebruiker ?? "onbekend",
    actie: "configuratie-opgeslagen",
    entiteit: "configuratie",
    entiteitId: snapshot.id,
    nieuweWaarde: { naam: snapshot.naam, versie, profiel: invoer.configuratie.profielId },
  });

  return { snapshot, berekening };
}

interface ConfiguratieRij {
  id: string;
  project_id: string;
  naam: string;
  versie: number;
  bevroren: number;
  invoer_json: string;
  aangemaakt_op: string;
}

function naarSnapshot(rij: ConfiguratieRij): Snapshot {
  return {
    id: rij.id,
    projectId: rij.project_id,
    naam: rij.naam,
    versie: rij.versie,
    bevroren: rij.bevroren === 1,
    // Oudere snapshots missen velden die er later bij zijn gekomen; die worden
    // hier aangevuld zodat een offerte van vorige week gewoon weer opent.
    configuratie: herstelConfiguratie(JSON.parse(rij.invoer_json) as Configuratie),
    aangemaaktOp: rij.aangemaakt_op,
  };
}

export function snapshot(id: string): Snapshot | null {
  const rij = db().prepare(`SELECT * FROM configuraties WHERE id = ?`).get(id) as unknown as
    | ConfiguratieRij
    | undefined;
  return rij ? naarSnapshot(rij) : null;
}

/** Alle snapshots van een project, nieuwste versie per naam bovenaan. */
export function snapshotsVanProject(projectId: string): Snapshot[] {
  const rijen = db()
    .prepare(`SELECT * FROM configuraties WHERE project_id = ? ORDER BY aangemaakt_op DESC`)
    .all(projectId) as unknown as ConfiguratieRij[];
  return rijen.map(naarSnapshot);
}

/**
 * Bevriest een snapshot bij orderbevestiging (hoofdstuk 15.2). Daarna leidt
 * elke wijziging tot een nieuwe versie in plaats van een stille aanpassing.
 */
export function bevriesSnapshot(id: string, gebruiker = "onbekend"): void {
  db().prepare(`UPDATE configuraties SET bevroren = 1 WHERE id = ?`).run(id);
  logAudit({
    gebruiker,
    actie: "snapshot-bevroren",
    entiteit: "configuratie",
    entiteitId: id,
    nieuweWaarde: { bevroren: true },
  });
}

// ---------------------------------------------------------------------------
// Leads en escalaties
// ---------------------------------------------------------------------------

export function slaLeadOp(invoer: {
  naam: string;
  telefoon: string;
  email: string;
  postcode?: string;
  herkomst: string;
  configuratieId?: string | null;
}): string {
  const id = nieuwId("lead");
  db()
    .prepare(
      `INSERT INTO leads (id, naam, telefoon, email, postcode, herkomst, configuratie_id, aangemaakt_op)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      invoer.naam,
      invoer.telefoon,
      invoer.email,
      invoer.postcode ?? "",
      invoer.herkomst,
      invoer.configuratieId ?? null,
      nu()
    );
  logAudit({
    gebruiker: invoer.email,
    actie: "lead-aangemaakt",
    entiteit: "lead",
    entiteitId: id,
    nieuweWaarde: { herkomst: invoer.herkomst },
  });
  return id;
}

export function slaEscalatieOp(invoer: {
  naam: string;
  contact: string;
  bericht: string;
  configuratie: Configuratie;
  bevindingen: unknown;
}): string {
  const id = nieuwId("esc");
  db()
    .prepare(
      `INSERT INTO escalaties (id, naam, contact, bericht, invoer_json, bevindingen, aangemaakt_op)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      invoer.naam,
      invoer.contact,
      invoer.bericht,
      JSON.stringify(invoer.configuratie),
      JSON.stringify(invoer.bevindingen),
      nu()
    );
  logAudit({
    gebruiker: invoer.contact,
    actie: "escalatie-aangemeld",
    entiteit: "escalatie",
    entiteitId: id,
    nieuweWaarde: { bericht: invoer.bericht },
  });
  return id;
}

export interface Auditregel {
  id: number;
  tijdstip: string;
  gebruiker: string;
  actie: string;
  entiteit: string;
  entiteit_id: string;
  oude_waarde: string | null;
  nieuwe_waarde: string | null;
}

export function auditTrail(limiet = 100): Auditregel[] {
  return db()
    .prepare(`SELECT * FROM audit_log ORDER BY id DESC LIMIT ?`)
    .all(limiet) as unknown as Auditregel[];
}

// ---------------------------------------------------------------------------
// Klanten — de eindklanten van de aannemer
// ---------------------------------------------------------------------------

/**
 * Een klant van onze klant. De aannemer voert hem één keer in en kiest hem
 * daarna bij elke offerte; naam en adres komen zo automatisch op het document
 * te staan in plaats van dat ze telkens opnieuw getypt worden.
 */
export interface Klant {
  id: string;
  naam: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  adres: string;
  postcode: string;
  plaats: string;
  notitie: string;
  aangemaaktOp: string;
  gewijzigdOp: string;
}

export type Klantinvoer = Omit<Klant, "id" | "aangemaaktOp" | "gewijzigdOp">;

interface KlantRij {
  id: string;
  naam: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  adres: string;
  postcode: string;
  plaats: string;
  notitie: string;
  aangemaakt_op: string;
  gewijzigd_op: string;
}

function naarKlant(rij: KlantRij): Klant {
  return {
    id: rij.id,
    naam: rij.naam,
    contactpersoon: rij.contactpersoon,
    email: rij.email,
    telefoon: rij.telefoon,
    adres: rij.adres,
    postcode: rij.postcode,
    plaats: rij.plaats,
    notitie: rij.notitie,
    aangemaaktOp: rij.aangemaakt_op,
    gewijzigdOp: rij.gewijzigd_op,
  };
}

/** Het volledige adres op één regel, zoals het op een document komt. */
export function adresregel(klant: Klant): string {
  return [klant.adres, [klant.postcode, klant.plaats].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

export function klanten(): Klant[] {
  const rijen = db()
    .prepare(`SELECT * FROM klanten ORDER BY naam COLLATE NOCASE`)
    .all() as unknown as KlantRij[];
  return rijen.map(naarKlant);
}

export function klant(id: string): Klant | null {
  const rij = db().prepare(`SELECT * FROM klanten WHERE id = ?`).get(id) as unknown as
    | KlantRij
    | undefined;
  return rij ? naarKlant(rij) : null;
}

export function maakKlant(invoer: Klantinvoer, gebruiker = "onbekend"): Klant {
  const klant: Klant = { ...invoer, id: nieuwId("kln"), aangemaaktOp: nu(), gewijzigdOp: nu() };
  db()
    .prepare(
      `INSERT INTO klanten (id, naam, contactpersoon, email, telefoon, adres, postcode, plaats, notitie, aangemaakt_op, gewijzigd_op)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      klant.id,
      klant.naam,
      klant.contactpersoon,
      klant.email,
      klant.telefoon,
      klant.adres,
      klant.postcode,
      klant.plaats,
      klant.notitie,
      klant.aangemaaktOp,
      klant.gewijzigdOp
    );
  logAudit({ gebruiker, actie: "klant-aangemaakt", entiteit: "klant", entiteitId: klant.id, nieuweWaarde: klant });
  return klant;
}

export function wijzigKlant(id: string, invoer: Klantinvoer, gebruiker = "onbekend"): Klant | null {
  const bestaand = klant(id);
  if (!bestaand) return null;
  const bijgewerkt: Klant = { ...bestaand, ...invoer, gewijzigdOp: nu() };
  db()
    .prepare(
      `UPDATE klanten SET naam = ?, contactpersoon = ?, email = ?, telefoon = ?, adres = ?,
       postcode = ?, plaats = ?, notitie = ?, gewijzigd_op = ? WHERE id = ?`
    )
    .run(
      bijgewerkt.naam,
      bijgewerkt.contactpersoon,
      bijgewerkt.email,
      bijgewerkt.telefoon,
      bijgewerkt.adres,
      bijgewerkt.postcode,
      bijgewerkt.plaats,
      bijgewerkt.notitie,
      bijgewerkt.gewijzigdOp,
      id
    );
  logAudit({
    gebruiker,
    actie: "klant-gewijzigd",
    entiteit: "klant",
    entiteitId: id,
    oudeWaarde: bestaand,
    nieuweWaarde: bijgewerkt,
  });
  return bijgewerkt;
}

/**
 * Verwijdert een klant. Bestaande offertes blijven bestaan — hun klantnaam en
 * adres staan al in het project zelf, zodat een verstuurd document nooit
 * verandert doordat er later iets in de klantenlijst wordt opgeruimd.
 */
export function verwijderKlant(id: string, gebruiker = "onbekend"): boolean {
  const bestaand = klant(id);
  if (!bestaand) return false;
  db().prepare(`UPDATE projecten SET klant_id = NULL WHERE klant_id = ?`).run(id);
  db().prepare(`DELETE FROM klanten WHERE id = ?`).run(id);
  logAudit({ gebruiker, actie: "klant-verwijderd", entiteit: "klant", entiteitId: id, oudeWaarde: bestaand });
  return true;
}

// ---------------------------------------------------------------------------
// Offerteoverzicht
// ---------------------------------------------------------------------------

/** Eén regel in het offerteoverzicht van het dashboard. */
export interface Offerteregel {
  project: Project;
  /** Aantal kozijnen (laatste versie per naam) en het totaalbedrag. */
  aantalKozijnen: number;
  totaalInclBtw: number;
  laatsteVersie: number;
  laatstGewijzigd: string;
}

/**
 * Alle opgeslagen offertes, nieuwste eerst.
 *
 * Per kozijn telt alleen de laatste versie mee: elke opslag maakt een nieuwe
 * versie, en anders zou een offerte die drie keer is bijgewerkt drie keer zo
 * duur lijken.
 */
export function offerteoverzicht(): Offerteregel[] {
  return projecten().map((project) => {
    const alle = snapshotsVanProject(project.id);
    const laatstePerNaam = new Map<string, Snapshot>();
    for (const s of alle) {
      const bestaand = laatstePerNaam.get(s.naam);
      if (!bestaand || s.versie > bestaand.versie) laatstePerNaam.set(s.naam, s);
    }
    const laatste = [...laatstePerNaam.values()];
    const bedragen = db()
      .prepare(`SELECT id, verkoop_totaal FROM configuraties WHERE project_id = ?`)
      .all(project.id) as unknown as { id: string; verkoop_totaal: number }[];
    const perId = new Map(bedragen.map((r) => [r.id, r.verkoop_totaal]));

    return {
      project,
      aantalKozijnen: laatste.length,
      totaalInclBtw: laatste.reduce((som, s) => som + (perId.get(s.id) ?? 0), 0),
      laatsteVersie: laatste.reduce((hoog, s) => Math.max(hoog, s.versie), 0),
      laatstGewijzigd: alle.reduce(
        (nieuwste, s) => (s.aangemaaktOp > nieuwste ? s.aangemaaktOp : nieuwste),
        project.aangemaaktOp
      ),
    };
  });
}

/** Koppelt een offerte aan een klant en neemt naam en adres over. */
export function koppelKlantAanProject(
  projectId: string,
  klantId: string | null,
  gebruiker = "onbekend"
): Project | null {
  const bestaand = project(projectId);
  if (!bestaand) return null;
  const gekozen = klantId ? klant(klantId) : null;
  if (klantId && !gekozen) return null;

  db()
    .prepare(`UPDATE projecten SET klant_id = ?, klantnaam = ?, projectadres = ?, gewijzigd_op = ? WHERE id = ?`)
    .run(
      klantId,
      gekozen ? gekozen.naam : bestaand.klantnaam,
      gekozen ? adresregel(gekozen) : bestaand.projectadres,
      nu(),
      projectId
    );

  logAudit({
    gebruiker,
    actie: "klant-gekoppeld",
    entiteit: "project",
    entiteitId: projectId,
    oudeWaarde: bestaand.klantId,
    nieuweWaarde: klantId,
  });
  return project(projectId);
}
