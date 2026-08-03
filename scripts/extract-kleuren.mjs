#!/usr/bin/env node
/**
 * Haalt de kleurdata uit de drie statische kleurencatalogi in public/kleuren/
 * en zet die om naar:
 *   - src/configurator/data/kleuren.json  (metadata, één genormaliseerd formaat)
 *   - public/configurator/kleuren/<merk>/<code>.<ext>  (swatch-afbeeldingen)
 *
 * De catalogi zijn de bron van waarheid. Dit script overschrijft alleen zijn
 * eigen output en raakt de catalogi zelf nooit aan.
 *
 * Draaien:  node scripts/extract-kleuren.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Catalogi met hun merkaanduiding en veldnamen. */
const BRONNEN = [
  { bestand: "aluplast.html", merk: "aluplast", merkLabel: "Aluplast", codeVeld: "ap" },
  { bestand: "gealan.html", merk: "gealan", merkLabel: "Gealan", codeVeld: "code" },
  { bestand: "kvision.html", merk: "kommerling", merkLabel: "Kömmerling K-Vision", codeVeld: "code" },
];

/** Knipt de KLEUREN-array uit een catalogus-HTML en parseert die als JSON. */
function leesKleurenArray(pad) {
  const html = readFileSync(pad, "utf8");
  const start = html.indexOf("[", html.indexOf("KLEUREN"));
  if (start === -1) throw new Error(`Geen KLEUREN-array gevonden in ${pad}`);
  let diepte = 0;
  let eind = -1;
  for (let i = start; i < html.length; i++) {
    if (html[i] === "[") diepte++;
    else if (html[i] === "]") {
      diepte--;
      if (diepte === 0) {
        eind = i;
        break;
      }
    }
  }
  if (eind === -1) throw new Error(`Onafgesloten KLEUREN-array in ${pad}`);
  return JSON.parse(html.slice(start, eind + 1));
}

/** Maakt van een leverancierscode een veilige bestandsnaam. */
function slug(code) {
  return String(code)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** Schrijft een data:-URI weg als bestand en geeft het publieke pad terug. */
function schrijfSwatch(dataUri, merk, bestandsnaam) {
  const match = /^data:image\/([a-z+]+);base64,(.*)$/is.exec(dataUri ?? "");
  if (!match) return null;
  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const map = join(root, "public", "configurator", "kleuren", merk);
  mkdirSync(map, { recursive: true });
  writeFileSync(join(map, `${bestandsnaam}.${ext}`), Buffer.from(match[2], "base64"));
  return `/configurator/kleuren/${merk}/${bestandsnaam}.${ext}`;
}

/**
 * De catalogi gebruiken hun eigen familie-aanduidingen. De configurator groepeert
 * kleuren in drie presentatiegroepen (hoofdstuk 8.2).
 */
function bepaalGroep(familie) {
  const f = (familie ?? "").toLowerCase();
  if (f === "houtlook") return "houtlook";
  if (f === "metallic") return "metallic";
  return "effen";
}

/**
 * Het oppervlak van de folie, genormaliseerd uit de structuurtekst van de
 * catalogus. Alleen Aluplast levert dit aan; bij Gealan en Kömmerling staat het
 * niet in de catalogus en blijft het `null`.
 *
 * Het onderscheid is niet cosmetisch: 'Nerf' is een houtnerfreliëf, terwijl
 * 'Zandstructuur / Glad' juist géén nerf heeft. Die twee mogen nooit op één
 * hoop, want de klant ziet en voelt het verschil.
 */
function bepaalOppervlak(structuur) {
  if (!structuur) return null;
  const s = structuur.toLowerCase();
  if (s.includes("nerf")) return "nerf";
  if (s.includes("brush")) return "brush";
  if (s.includes("zandstructuur")) return "zandstructuur";
  if (s.includes("print")) return "print";
  if (s.includes("glad")) return "glad";
  return "overig";
}

const alle = [];
let zonderSwatch = 0;

// Oude output weggooien zodat verwijderde kleuren niet blijven rondslingeren.
rmSync(join(root, "public", "configurator", "kleuren"), { recursive: true, force: true });

for (const bron of BRONNEN) {
  const records = leesKleurenArray(join(root, "public", "kleuren", bron.bestand));
  const gezien = new Set();

  for (const r of records) {
    const code = String(r[bron.codeVeld] ?? "").trim();
    const naam = String(r.kleur ?? "").trim();
    if (!naam) continue;

    // Codes zijn niet altijd uniek (bv. Gealan '—'); val terug op de naam.
    let basis = slug(code) || slug(naam);
    if (gezien.has(basis)) basis = `${basis}-${slug(naam)}`;
    let uniek = basis;
    let n = 2;
    while (gezien.has(uniek)) uniek = `${basis}-${n++}`;
    gezien.add(uniek);

    const swatch = schrijfSwatch(r.t ?? r.b, bron.merk, uniek);
    if (!swatch && !r.hex) zonderSwatch++;

    alle.push({
      id: `${bron.merk}:${uniek}`,
      merk: bron.merk,
      merkLabel: bron.merkLabel,
      code: code || "—",
      naam,
      ral: r.ral && r.ral !== "—" ? String(r.ral).trim() : null,
      structuur: r.struct ? String(r.struct).trim() : null,
      oppervlak: bepaalOppervlak(r.struct),
      // `null` betekent: de catalogus zegt er niets over — niet 'geen nerf'.
      houtnerf: r.struct ? bepaalOppervlak(r.struct) === "nerf" : null,
      familie: r.fam ? String(r.fam).trim() : "overig",
      groep: bepaalGroep(r.fam),
      leverancierscode: r.lev ? String(r.lev).trim() : null,
      catalogusgroep: r.groepVol ?? r.groep ?? null,
      swatch,
      hex: r.hex ?? null,
    });
  }
}

const uitvoer = {
  gegenereerdDoor: "scripts/extract-kleuren.mjs",
  bron: "public/kleuren/{aluplast,gealan,kvision}.html",
  aantal: alle.length,
  kleuren: alle,
};

const doel = join(root, "src", "configurator", "data", "kleuren.json");
mkdirSync(dirname(doel), { recursive: true });
writeFileSync(doel, `${JSON.stringify(uitvoer, null, 2)}\n`);

const perMerk = alle.reduce((acc, k) => ({ ...acc, [k.merk]: (acc[k.merk] ?? 0) + 1 }), {});
const metNerf = alle.filter((k) => k.houtnerf === true).length;
const zonderNerf = alle.filter((k) => k.houtnerf === false).length;
const onbekend = alle.filter((k) => k.houtnerf === null).length;

console.log(`${alle.length} kleuren weggeschreven naar src/configurator/data/kleuren.json`);
console.log(`  per merk: ${JSON.stringify(perMerk)}`);
console.log(`  houtnerf: ${metNerf} wel, ${zonderNerf} niet, ${onbekend} niet vermeld in de catalogus`);
console.log(`  zonder swatch of hex: ${zonderSwatch}`);
