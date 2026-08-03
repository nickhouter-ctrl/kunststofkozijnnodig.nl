/**
 * Berekent per folie de gemiddelde kleur uit de swatch-afbeelding.
 *
 * De tekening moet weten hoe donker een folie is: op een antracieten kozijn is
 * een zwarte contourlijn niet te zien, op een wit kozijn een witte niet. Met een
 * representatieve kleur per folie kan de tekening dat zelf bepalen.
 *
 * Draaien met: node scripts/kleur-gemiddelde.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BESTAND = join(process.cwd(), "src/configurator/data/kleuren.json");
const catalogus = JSON.parse(await readFile(BESTAND, "utf8"));

let bijgewerkt = 0;
for (const kleur of catalogus.kleuren) {
  if (!kleur.swatch) continue;
  const pad = join(process.cwd(), "public", kleur.swatch);
  try {
    // Terugbrengen tot één pixel: dat ís het gemiddelde.
    const { data } = await sharp(pad).resize(1, 1, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
    const [r, g, b] = data;
    kleur.hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    bijgewerkt++;
  } catch (fout) {
    console.warn(`Geen gemiddelde voor ${kleur.id}: ${fout.message}`);
  }
}

await writeFile(BESTAND, `${JSON.stringify(catalogus, null, 2)}\n`);
console.log(`Gemiddelde kleur gezet voor ${bijgewerkt} van ${catalogus.kleuren.length} folies.`);
