/**
 * Hulpfuncties voor de tekeningenengine.
 *
 * Alle tekeningen worden opgebouwd uit deze bouwstenen, zodat maatlijnen,
 * arceringen en teksten er op elke tekening precies hetzelfde uitzien. Dat is
 * geen cosmetiek: een productietekening waarop de maatvoering per detail anders
 * oogt, wordt verkeerd gelezen.
 *
 * Coördinaten zijn millimeters. De schaal wordt geregeld via de viewBox, niet
 * via transformaties, zodat een maat in de tekening altijd de echte maat is.
 */

/** Escapet tekst zodat een kozijnnaam met '&' of '<' de SVG niet breekt. */
export function esc(tekst: string): string {
  return tekst
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Afgerond op 2 decimalen, voor compacte SVG-coördinaten. */
const n = (waarde: number): string => String(Math.round(waarde * 100) / 100);

export interface Stijl {
  /** Lijndikte van de tekening, in mm van de tekening zelf. */
  lijn: number;
  /** Teksthoogte in mm. */
  tekst: number;
}

/** Bepaalt lijndikte en teksthoogte op basis van de grootte van de tekening. */
export function stijlVoor(breedte: number, hoogte: number): Stijl {
  const maat = Math.max(breedte, hoogte);
  return { lijn: maat / 400, tekst: maat / 45 };
}

export function rechthoek(
  x: number,
  y: number,
  breedte: number,
  hoogte: number,
  opties: { vul?: string; lijn?: string; dikte?: number; streep?: string } = {}
): string {
  const vul = opties.vul ?? "none";
  const lijn = opties.lijn ?? "#141917";
  const dikte = opties.dikte ?? 1;
  const streep = opties.streep ? ` stroke-dasharray="${opties.streep}"` : "";
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(breedte)}" height="${n(hoogte)}" fill="${vul}" stroke="${lijn}" stroke-width="${n(dikte)}"${streep}/>`;
}

export function lijn(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opties: { kleur?: string; dikte?: number; streep?: string } = {}
): string {
  const kleur = opties.kleur ?? "#141917";
  const dikte = opties.dikte ?? 1;
  const streep = opties.streep ? ` stroke-dasharray="${opties.streep}"` : "";
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${kleur}" stroke-width="${n(dikte)}"${streep}/>`;
}

export function tekst(
  x: number,
  y: number,
  inhoud: string,
  opties: {
    grootte?: number;
    anker?: "start" | "middle" | "end";
    kleur?: string;
    vet?: boolean;
    rotatie?: number;
  } = {}
): string {
  const grootte = opties.grootte ?? 10;
  const anker = opties.anker ?? "middle";
  const kleur = opties.kleur ?? "#141917";
  const gewicht = opties.vet ? ' font-weight="600"' : "";
  const rotatie =
    opties.rotatie === undefined ? "" : ` transform="rotate(${n(opties.rotatie)} ${n(x)} ${n(y)})"`;
  return `<text x="${n(x)}" y="${n(y)}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${n(grootte)}" fill="${kleur}" text-anchor="${anker}"${gewicht}${rotatie}>${esc(inhoud)}</text>`;
}

const MAATKLEUR = "#00704b";

/**
 * Horizontale maatlijn met pijltjes en aanhaallijnen naar het gemeten object.
 * `y` is de hoogte van de maatlijn; `vanaf` de hoogte waar het object staat.
 */
export function maatHorizontaal(
  x1: number,
  x2: number,
  y: number,
  label: string,
  stijl: Stijl,
  vanaf?: number
): string {
  const pijl = stijl.tekst * 0.45;
  const delen: string[] = [];

  if (vanaf !== undefined) {
    delen.push(lijn(x1, vanaf, x1, y, { kleur: MAATKLEUR, dikte: stijl.lijn * 0.6, streep: `${pijl},${pijl}` }));
    delen.push(lijn(x2, vanaf, x2, y, { kleur: MAATKLEUR, dikte: stijl.lijn * 0.6, streep: `${pijl},${pijl}` }));
  }
  delen.push(lijn(x1, y, x2, y, { kleur: MAATKLEUR, dikte: stijl.lijn }));
  delen.push(
    `<path d="M ${n(x1)} ${n(y)} l ${n(pijl)} ${n(-pijl * 0.5)} l 0 ${n(pijl)} z" fill="${MAATKLEUR}"/>`
  );
  delen.push(
    `<path d="M ${n(x2)} ${n(y)} l ${n(-pijl)} ${n(-pijl * 0.5)} l 0 ${n(pijl)} z" fill="${MAATKLEUR}"/>`
  );
  delen.push(
    tekst((x1 + x2) / 2, y - stijl.tekst * 0.4, label, {
      grootte: stijl.tekst,
      kleur: MAATKLEUR,
      vet: true,
    })
  );
  return delen.join("");
}

/** Verticale maatlijn met pijltjes en aanhaallijnen. */
export function maatVerticaal(
  y1: number,
  y2: number,
  x: number,
  label: string,
  stijl: Stijl,
  vanaf?: number
): string {
  const pijl = stijl.tekst * 0.45;
  const delen: string[] = [];

  if (vanaf !== undefined) {
    delen.push(lijn(vanaf, y1, x, y1, { kleur: MAATKLEUR, dikte: stijl.lijn * 0.6, streep: `${pijl},${pijl}` }));
    delen.push(lijn(vanaf, y2, x, y2, { kleur: MAATKLEUR, dikte: stijl.lijn * 0.6, streep: `${pijl},${pijl}` }));
  }
  delen.push(lijn(x, y1, x, y2, { kleur: MAATKLEUR, dikte: stijl.lijn }));
  delen.push(
    `<path d="M ${n(x)} ${n(y1)} l ${n(-pijl * 0.5)} ${n(pijl)} l ${n(pijl)} 0 z" fill="${MAATKLEUR}"/>`
  );
  delen.push(
    `<path d="M ${n(x)} ${n(y2)} l ${n(-pijl * 0.5)} ${n(-pijl)} l ${n(pijl)} 0 z" fill="${MAATKLEUR}"/>`
  );
  delen.push(
    tekst(x - stijl.tekst * 0.4, (y1 + y2) / 2, label, {
      grootte: stijl.tekst,
      kleur: MAATKLEUR,
      vet: true,
      rotatie: -90,
    })
  );
  return delen.join("");
}

/** Arcering voor doorgesneden kunststof in een detaildoorsnede. */
export function arceringPatroon(id: string, kleur = "#9aa39e"): string {
  return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${kleur}" stroke-width="1.4"/></pattern>`;
}

/** Bouwt het complete SVG-document. */
export function svgDocument(
  viewBox: { x: number; y: number; breedte: number; hoogte: number },
  inhoud: string,
  defs = ""
): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(viewBox.x)} ${n(viewBox.y)} ${n(viewBox.breedte)} ${n(viewBox.hoogte)}" width="100%" preserveAspectRatio="xMidYMid meet" role="img">`,
    defs ? `<defs>${defs}</defs>` : "",
    `<rect x="${n(viewBox.x)}" y="${n(viewBox.y)}" width="${n(viewBox.breedte)}" height="${n(viewBox.hoogte)}" fill="#ffffff"/>`,
    inhoud,
    "</svg>",
  ].join("");
}
