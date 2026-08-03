/**
 * Exporteren van tekeningen naar een los bestand.
 *
 * In de browser verwijzen de foliepatronen naar een swatch onder /configurator/kleuren/…
 * Dat pad bestaat alleen binnen de site: zodra de SVG als los bestand op de schijf
 * staat en met file:// geopend wordt, kan de viewer die afbeelding niet vinden en
 * toont hij het bekende "kapotte afbeelding"-icoon over het hele kozijn.
 *
 * Bij export worden alle verwijzingen daarom vervangen door de afbeelding zelf,
 * als data-URI. Het bestand is daarna volledig zelfstandig — ook als bijlage bij
 * een offerte of fabrieksorder.
 */

const cache = new Map<string, string>();

/** Haalt één afbeelding op en geeft hem terug als data-URI. */
async function alsDataUri(pad: string): Promise<string | null> {
  const bestaand = cache.get(pad);
  if (bestaand) return bestaand;
  try {
    const antwoord = await fetch(pad);
    if (!antwoord.ok) return null;
    const blob = await antwoord.blob();
    const uri = await new Promise<string>((klaar, mislukt) => {
      const lezer = new FileReader();
      lezer.onload = () => klaar(String(lezer.result));
      lezer.onerror = () => mislukt(lezer.error);
      lezer.readAsDataURL(blob);
    });
    cache.set(pad, uri);
    return uri;
  } catch {
    return null;
  }
}

/**
 * Vervangt elke href naar een afbeelding door de afbeelding zelf. Lukt dat niet,
 * dan wordt het <image>-element verwijderd: een leeg patroon oogt nog altijd
 * beter dan een raster van kapotte-afbeelding-iconen.
 */
export async function maakZelfstandig(svg: string): Promise<string> {
  const paden = new Set<string>();
  const patroon = /<image\b[^>]*\bhref="([^"]+)"[^>]*>/g;
  for (const treffer of svg.matchAll(patroon)) {
    const pad = treffer[1];
    if (!pad.startsWith("data:")) paden.add(pad);
  }
  if (paden.size === 0) return svg;

  const vertaling = new Map<string, string | null>();
  await Promise.all(
    [...paden].map(async (pad) => {
      vertaling.set(pad, await alsDataUri(pad));
    })
  );

  return svg.replace(patroon, (heel, pad: string) => {
    if (pad.startsWith("data:")) return heel;
    const uri = vertaling.get(pad);
    if (!uri) return "";
    return heel.replace(`href="${pad}"`, `href="${uri}"`);
  });
}

/** Downloadt een tekening als zelfstandig SVG-bestand. */
export async function downloadTekening(naam: string, svg: string): Promise<void> {
  const zelfstandig = await maakZelfstandig(svg);
  const blob = new Blob([zelfstandig], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${naam.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Pas opruimen nadat de browser het bestand heeft opgepakt.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
