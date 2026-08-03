/**
 * Lokale opslag voor de configurator (hoofdstuk 15 en 22).
 *
 * ALLEEN SERVER. Dit bestand importeert `node:sqlite` en mag nooit vanuit een
 * client component geïmporteerd worden — gebruik de API-routes onder
 * /api/configurator.
 *
 * Draait op de SQLite die in Node zelf zit (`node:sqlite`), zodat de
 * configurator op localhost werkt zonder database-account, keys of migraties.
 * Er is bewust GEEN koppeling met de bestaande Supabase van het CRM: die komt
 * pas als het systeem bewezen werkt.
 *
 * Dit is tegelijk borgingslaag 4 uit hoofdstuk 24: de NOT NULL-constraints op
 * glas_breedte, glas_hoogte, hor_breedte, hor_hoogte, cilinder_binnen en
 * cilinder_buiten maken het op databaseniveau onmogelijk om een vak zonder
 * maatvoering weg te schrijven — ook als er ooit een fout in de applicatielaag
 * zou sluipen.
 */
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const BESTAND = process.env.CONFIGURATOR_DB ?? join(process.cwd(), ".data", "configurator.db");

let verbinding: DatabaseSync | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Projecten bundelen meerdere kozijnen, zoals in het zakelijk portaal.
CREATE TABLE IF NOT EXISTS projecten (
  id            TEXT PRIMARY KEY,
  naam          TEXT NOT NULL,
  klantnaam     TEXT NOT NULL DEFAULT '',
  projectadres  TEXT NOT NULL DEFAULT '',
  context       TEXT NOT NULL CHECK (context IN ('publiek','aannemer')),
  -- De marge van de aannemer hoort bij het project, niet bij het scherm. Zonder
  -- deze kolom zou een later gegenereerde offerte met de standaardmarge rekenen
  -- en een ander bedrag tonen dan de aannemer zag (regel 7).
  aannemersmarge REAL NOT NULL DEFAULT 0.25,
  aangemaakt_op TEXT NOT NULL,
  gewijzigd_op  TEXT NOT NULL
);

-- Elke opslag maakt een nieuwe versie; een bestaande versie wordt nooit
-- overschreven (hoofdstuk 15.2 — de configuratie-snapshot).
CREATE TABLE IF NOT EXISTS configuraties (
  id            TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL REFERENCES projecten(id) ON DELETE CASCADE,
  naam          TEXT NOT NULL,
  versie        INTEGER NOT NULL,
  bevroren      INTEGER NOT NULL DEFAULT 0,
  invoer_json   TEXT NOT NULL,
  profiel_id    TEXT NOT NULL,
  breedte       INTEGER NOT NULL,
  hoogte        INTEGER NOT NULL,
  aantal        INTEGER NOT NULL CHECK (aantal >= 1),
  glas_meegeleverd     INTEGER NOT NULL,
  cilinder_meegeleverd INTEGER NOT NULL,
  hor_meegeleverd      INTEGER NOT NULL,
  -- Regel 2 op databaseniveau: de cilindermaat mag nooit leeg zijn.
  cilinder_binnen INTEGER NOT NULL CHECK (cilinder_binnen > 0),
  cilinder_buiten INTEGER NOT NULL CHECK (cilinder_buiten > 0),
  verkoop_totaal  INTEGER NOT NULL,
  aangemaakt_op   TEXT NOT NULL
);

-- Per vak de afgeleide maten. De CHECK-constraints zijn de harde ondergrens
-- van regel 2: een vak zonder glasmaat of hormaat kán niet bestaan.
CREATE TABLE IF NOT EXISTS vakken (
  id               TEXT PRIMARY KEY,
  configuratie_id  TEXT NOT NULL REFERENCES configuraties(id) ON DELETE CASCADE,
  volgorde         INTEGER NOT NULL,
  naam             TEXT NOT NULL,
  invulling        TEXT NOT NULL,
  glas_breedte     INTEGER NOT NULL CHECK (glas_breedte > 0),
  glas_hoogte      INTEGER NOT NULL CHECK (glas_hoogte  > 0),
  hor_breedte      INTEGER NOT NULL CHECK (hor_breedte  > 0),
  hor_hoogte       INTEGER NOT NULL CHECK (hor_hoogte   > 0)
);

-- De klanten van onze klant: de eindklanten van de aannemer. Ze staan hier zodat
-- een aannemer ze één keer invoert en daarna bij elke offerte kan kiezen.
CREATE TABLE IF NOT EXISTS klanten (
  id             TEXT PRIMARY KEY,
  naam           TEXT NOT NULL,
  contactpersoon TEXT NOT NULL DEFAULT '',
  email          TEXT NOT NULL DEFAULT '',
  telefoon       TEXT NOT NULL DEFAULT '',
  adres          TEXT NOT NULL DEFAULT '',
  postcode       TEXT NOT NULL DEFAULT '',
  plaats         TEXT NOT NULL DEFAULT '',
  notitie        TEXT NOT NULL DEFAULT '',
  aangemaakt_op  TEXT NOT NULL,
  gewijzigd_op   TEXT NOT NULL
);

-- Leads uit de publieke flow (hoofdstuk 14).
CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY,
  naam            TEXT NOT NULL,
  telefoon        TEXT NOT NULL,
  email           TEXT NOT NULL,
  postcode        TEXT NOT NULL DEFAULT '',
  herkomst        TEXT NOT NULL,
  configuratie_id TEXT REFERENCES configuraties(id) ON DELETE SET NULL,
  aangemaakt_op   TEXT NOT NULL
);

-- Escalaties naar een mens (regel 4).
CREATE TABLE IF NOT EXISTS escalaties (
  id            TEXT PRIMARY KEY,
  naam          TEXT NOT NULL,
  contact       TEXT NOT NULL,
  bericht       TEXT NOT NULL,
  invoer_json   TEXT NOT NULL,
  bevindingen   TEXT NOT NULL,
  aangemaakt_op TEXT NOT NULL
);

-- Audit trail (hoofdstuk 15.3 en 24.1): niets wordt stilzwijgend overschreven.
CREATE TABLE IF NOT EXISTS audit_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tijdstip      TEXT NOT NULL,
  gebruiker     TEXT NOT NULL,
  actie         TEXT NOT NULL,
  entiteit      TEXT NOT NULL,
  entiteit_id   TEXT NOT NULL,
  oude_waarde   TEXT,
  nieuwe_waarde TEXT
);

CREATE INDEX IF NOT EXISTS idx_conf_project ON configuraties(project_id);
CREATE INDEX IF NOT EXISTS idx_klant_naam   ON klanten(naam);
CREATE INDEX IF NOT EXISTS idx_vak_conf     ON vakken(configuratie_id);
CREATE INDEX IF NOT EXISTS idx_audit_ent    ON audit_log(entiteit, entiteit_id);
`;

/**
 * Kolommen die later zijn bijgekomen. `CREATE TABLE IF NOT EXISTS` voegt niets
 * toe aan een tabel die al bestaat, dus een bestaande database moet apart worden
 * bijgewerkt. Dit blijft bewust een simpele lijst: zolang de configurator op
 * localhost draait is een migratieframework overdreven.
 */
const EXTRA_KOLOMMEN: { tabel: string; kolom: string; definitie: string }[] = [
  // Aan welke eindklant deze offerte hangt.
  { tabel: "projecten", kolom: "klant_id", definitie: "TEXT REFERENCES klanten(id) ON DELETE SET NULL" },
];

function migreer(verbinding: DatabaseSync): void {
  for (const { tabel, kolom, definitie } of EXTRA_KOLOMMEN) {
    const kolommen = verbinding.prepare(`PRAGMA table_info(${tabel})`).all() as { name: string }[];
    if (kolommen.some((k) => k.name === kolom)) continue;
    verbinding.exec(`ALTER TABLE ${tabel} ADD COLUMN ${kolom} ${definitie}`);
  }
}

/** Geeft de databaseverbinding; maakt het schema aan bij de eerste aanroep. */
export function db(): DatabaseSync {
  if (verbinding) return verbinding;
  mkdirSync(dirname(BESTAND), { recursive: true });
  verbinding = new DatabaseSync(BESTAND);
  verbinding.exec(SCHEMA);
  migreer(verbinding);
  return verbinding;
}

/** Sluit de verbinding — alleen nodig in tests. */
export function sluitDb(): void {
  verbinding?.close();
  verbinding = null;
}

/** Korte, leesbare id. `crypto.randomUUID` is beschikbaar in Node en de browser. */
export function nieuwId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

/** Schrijft een regel in de audit trail. */
export function logAudit(regel: {
  gebruiker: string;
  actie: string;
  entiteit: string;
  entiteitId: string;
  oudeWaarde?: unknown;
  nieuweWaarde?: unknown;
}): void {
  db()
    .prepare(
      `INSERT INTO audit_log (tijdstip, gebruiker, actie, entiteit, entiteit_id, oude_waarde, nieuwe_waarde)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      new Date().toISOString(),
      regel.gebruiker,
      regel.actie,
      regel.entiteit,
      regel.entiteitId,
      regel.oudeWaarde === undefined ? null : JSON.stringify(regel.oudeWaarde),
      regel.nieuweWaarde === undefined ? null : JSON.stringify(regel.nieuweWaarde)
    );
}
