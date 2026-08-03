/**
 * De tekeningenengine (hoofdstuk 12 van het functioneel ontwerp).
 *
 * Regel 5 uit hoofdstuk 1 luidt: een hoofdtekening wordt nooit los aangeleverd.
 * Dat is hier geen afspraak maar code — `genereerTekeningen()` geeft altijd de
 * hoofdtekening MET de verplichte details terug. Er is geen functie die alleen
 * de hoofdtekening oplevert, en de detailmatrix is niet uit te zetten.
 *
 * Alle tekeningen komen uit dezelfde `Berekening` als de offerte, de
 * fabrieksorder en de prijs (regel 1), zodat een detail niet kan afwijken van
 * het hoofdaanzicht. Het hoofdaanzicht deelt zijn tekencode bovendien met het
 * klikbare bewerkvlak in de configurator: wat je bewerkt is letterlijk wat er
 * getekend wordt.
 *
 * OVER DE DETAILDOORSNEDEN
 * De doorsneden worden parametrisch opgebouwd uit de gegevens in de
 * productdatabase: inbouwdiepte, aantal kamers, zichtbreedtes, aanslag,
 * glasinleg en glasdikte. Ze tonen de opbouw — meerkamerprofiel, stalen kern,
 * afdichtingsniveaus, glaslat — en de maatvoering van dít kozijn. Het zijn geen
 * exacte kopieën van de fabrikantsdoorsnede; elke detailtekening vermeldt dat
 * in de voettekst. Levert Rebu de leverancierstekeningen aan, dan kunnen de
 * constanten in de productdatabase erop gekalibreerd worden.
 */
import { tekenAanzicht } from "./aanzicht";
import {
  arceringPatroon,
  lijn,
  maatHorizontaal,
  maatVerticaal,
  rechthoek,
  stijlVoor,
  svgDocument,
  tekst,
  type Stijl,
} from "./svg";
import { AFWATERING, aantalAfwateringssleuven, roosterOpId } from "../data/onderdelen";
import type { Berekening, VakMaten } from "../types";

export type DetailCode = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface Tekening {
  id: "hoofd" | "buitenaanzicht" | DetailCode;
  titel: string;
  omschrijving: string;
  /** Waarom deze tekening verplicht is (hoofdstuk 12.2). */
  wanneerVerplicht: string;
  svg: string;
}

const LIJN = "#2a2f2c";
const GLAS = "#d7e6ec";
const STAAL = "#8d9298";
const RUBBER = "#3d4340";
const MAATKLEUR = "#00704b";

// ---------------------------------------------------------------------------
// Hoofdtekening
// ---------------------------------------------------------------------------

function hoofdtekening(b: Berekening, zijde: "binnen" | "buiten"): Tekening {
  const c = b.configuratie;
  // Exact hetzelfde aanzicht als in het bewerkvlak, inclusief dezelfde
  // maatlijnen en hartmaten (regel 1) — alleen met het onderschrift erbij.
  const aanzicht = tekenAanzicht(b, zijde, { maten: true });
  const m = aanzicht.marges;
  const stijl = stijlVoor(c.breedte + m.links, c.hoogte + m.onder);

  const delen: string[] = [aanzicht.inhoud];

  const kleur = zijde === "binnen" ? b.kleurBinnen : b.kleurBuiten;
  const kleurRegel = kleur
    ? `${zijde === "binnen" ? "Binnen" : "Buiten"}: ${kleur.code} ${kleur.naam}${kleur.ral ? ` (${kleur.ral})` : ""} — ${kleur.structuur ?? "structuur niet vermeld"}`
    : `${zijde === "binnen" ? "Binnen" : "Buiten"}: —`;
  const regels = [
    `${b.profiel.merkLabel} ${b.profiel.naam} — ${b.profiel.uitvoeringLabel}, aanslag ${b.profiel.geometrie.aanslag.waarde} mm`,
    kleurRegel,
    `Details: ${verplichteDetails(b).join(", ")}`,
  ];
  regels.forEach((regel, i) => {
    delen.push(
      tekst(0, c.hoogte + m.onder * 0.94 + i * stijl.tekst * 1.3, regel, {
        grootte: stijl.tekst * 0.78,
        anker: "start",
        kleur: "#565c58",
      })
    );
  });

  return {
    id: zijde === "binnen" ? "hoofd" : "buitenaanzicht",
    titel: `${zijde === "binnen" ? "Hoofdtekening" : "Buitenaanzicht"} — ${c.naam}`,
    omschrijving: `${b.profiel.merkLabel} ${b.profiel.naam} (${b.profiel.uitvoeringLabel}), ${c.breedte} × ${c.hoogte} mm, aanzicht vanaf de ${zijde}zijde.`,
    wanneerVerplicht: "Altijd",
    svg: svgDocument(
      {
        x: -m.links,
        y: -m.boven,
        breedte: c.breedte + m.links + m.rechts,
        hoogte: c.hoogte + m.boven + m.onder + stijl.tekst * 4,
      },
      delen.join(""),
      aanzicht.defs
    ),
  };
}

// ---------------------------------------------------------------------------
// Gedeelde bouwstenen voor de detaildoorsneden
// ---------------------------------------------------------------------------

const D = { breedte: 340, hoogte: 230 };
const dStijl: Stijl = { lijn: 0.9, tekst: 9 };

function detailDocument(inhoud: string): string {
  return svgDocument(
    { x: -34, y: -28, breedte: D.breedte + 70, hoogte: D.hoogte + 64 },
    inhoud,
    arceringPatroon("arcering")
  );
}

function voettekst(y: number, extra?: string): string {
  const basis = "Parametrische doorsnede uit de productdatabase — maatvoering van dit kozijn";
  return tekst(0, y, extra ? `${basis} · ${extra}` : basis, {
    grootte: dStijl.tekst * 0.7,
    anker: "start",
    kleur: "#767b78",
  });
}

/**
 * Tekent een meerkamer-kunststofprofiel: buitenwand, kamerscheidingen en een
 * stalen versterkingskern in de hoofdkamer. Dit is de bouwsteen waar de
 * doorsneden A, B, C en D uit zijn opgebouwd.
 */
function kamerprofiel(
  x: number,
  y: number,
  breedte: number,
  hoogte: number,
  kamers: number,
  opties: { staal?: boolean; horizontaal?: boolean } = {}
): string {
  const delen: string[] = [];
  const wand = Math.min(breedte, hoogte) * 0.14;

  delen.push(rechthoek(x, y, breedte, hoogte, { vul: "#f6f5f1", lijn: LIJN, dikte: dStijl.lijn * 1.6 }));

  // Kamerscheidingen in de lengterichting van het profiel.
  const n = Math.max(2, Math.min(kamers, 7));
  if (opties.horizontaal) {
    const binnen = hoogte - 2 * wand;
    for (let i = 1; i < n; i++) {
      const yy = y + wand + (binnen * i) / n;
      delen.push(lijn(x + wand, yy, x + breedte - wand, yy, { kleur: LIJN, dikte: dStijl.lijn }));
    }
  } else {
    const binnen = breedte - 2 * wand;
    for (let i = 1; i < n; i++) {
      const xx = x + wand + (binnen * i) / n;
      delen.push(lijn(xx, y + wand, xx, y + hoogte - wand, { kleur: LIJN, dikte: dStijl.lijn }));
    }
  }
  // De binnenwand die de kamers omsluit.
  delen.push(
    rechthoek(x + wand, y + wand, breedte - 2 * wand, hoogte - 2 * wand, {
      vul: "none",
      lijn: LIJN,
      dikte: dStijl.lijn,
    })
  );

  if (opties.staal) {
    // De stalen kern zit in de grootste kamer, in het midden van het profiel.
    const sb = opties.horizontaal ? breedte * 0.55 : breedte * 0.3;
    const sh = opties.horizontaal ? hoogte * 0.3 : hoogte * 0.55;
    const sx = x + (breedte - sb) / 2;
    const sy = y + (hoogte - sh) / 2;
    delen.push(rechthoek(sx, sy, sb, sh, { vul: STAAL, lijn: LIJN, dikte: dStijl.lijn }));
    delen.push(
      rechthoek(sx + sb * 0.18, sy + sh * 0.18, sb * 0.64, sh * 0.64, {
        vul: "#f6f5f1",
        lijn: LIJN,
        dikte: dStijl.lijn * 0.7,
      })
    );
  }

  return delen.join("");
}

/** Een afdichtingsrubber als klein bolletje op de aanslag. */
function afdichting(x: number, y: number, straal: number): string {
  return `<circle cx="${x}" cy="${y}" r="${straal}" fill="${RUBBER}"/>`;
}

// ---------------------------------------------------------------------------
// Detail A — horizontale doorsnede door kozijn en vleugel
// ---------------------------------------------------------------------------

function detailA(b: Berekening): Tekening {
  const p = b.profiel;
  const g = p.geometrie;
  const kamers = p.kamers.waarde;
  const glasdikte = b.glastype?.dikte ?? 28;

  // Schaal zo dat kozijn + vleugel + een stuk glas op het canvas passen.
  const mmBreed = g.kozijnZichtbreedte.waarde + g.vleugelZichtbreedte.waarde + 90;
  const s = (D.breedte * 0.72) / mmBreed;

  const y0 = 44;
  const diepte = p.inbouwdiepte.waarde * s;
  const x0 = 30;
  const kozijnB = g.kozijnZichtbreedte.waarde * s;

  const delen: string[] = [];

  // Kozijnprofiel met stalen kern.
  delen.push(kamerprofiel(x0, y0, kozijnB, diepte, kamers, { staal: true }));
  delen.push(tekst(x0 + kozijnB / 2, y0 + diepte + 15, "kozijn", { grootte: dStijl.tekst * 0.85 }));

  // Vleugelprofiel: valt met de aanslag over het kozijn heen.
  const aanslag = g.aanslag.waarde * s;
  const vleugelX = x0 + kozijnB - aanslag;
  const vleugelB = g.vleugelZichtbreedte.waarde * s;
  const vleugelY = y0 + diepte * 0.1;
  const vleugelH = diepte * 0.8;
  delen.push(kamerprofiel(vleugelX, vleugelY, vleugelB, vleugelH, Math.max(2, kamers - 1), { staal: true }));
  delen.push(tekst(vleugelX + vleugelB / 2, y0 + diepte + 15, "vleugel", { grootte: dStijl.tekst * 0.85 }));

  // Twee afdichtingsniveaus op de aanslag — dat is de verbinding.
  delen.push(afdichting(x0 + kozijnB - aanslag * 0.5, vleugelY, 3.4));
  delen.push(afdichting(x0 + kozijnB - aanslag * 0.5, vleugelY + vleugelH, 3.4));
  delen.push(
    tekst(x0 + kozijnB - aanslag * 0.5, vleugelY - 10, "afdichting", {
      grootte: dStijl.tekst * 0.68,
      kleur: RUBBER,
    })
  );

  // Glaspakket in de vleugel, met glaslat.
  const glasX = vleugelX + vleugelB;
  const glasH = Math.max(10, glasdikte * s);
  const glasY = vleugelY + (vleugelH - glasH) / 2;
  delen.push(rechthoek(glasX - 4, glasY, D.breedte - glasX + 4, glasH, { vul: GLAS, lijn: LIJN, dikte: dStijl.lijn }));
  delen.push(
    rechthoek(vleugelX + vleugelB - 12, glasY - 14, 12, 14, { vul: "#f6f5f1", lijn: LIJN, dikte: dStijl.lijn })
  );
  delen.push(
    tekst(glasX + 46, glasY - 8, `glas ${glasdikte} mm`, { grootte: dStijl.tekst * 0.78, anker: "start" })
  );

  // Maatvoering.
  delen.push(maatHorizontaal(x0, x0 + kozijnB, y0 - 16, `${g.kozijnZichtbreedte.waarde}`, dStijl, y0));
  delen.push(
    maatHorizontaal(x0 + kozijnB - aanslag, x0 + kozijnB, y0 - 32, `aanslag ${g.aanslag.waarde}`, dStijl, y0)
  );
  delen.push(maatHorizontaal(vleugelX, vleugelX + vleugelB, y0 - 16, `${g.vleugelZichtbreedte.waarde}`, dStijl, vleugelY));
  delen.push(maatVerticaal(y0, y0 + diepte, x0 - 16, `bouwdiepte ${p.inbouwdiepte.waarde}`, dStijl, x0));

  delen.push(
    tekst(0, D.hoogte + 6, `${p.merkLabel} ${p.naam} — ${p.uitvoeringLabel}, ${kamers} kamers`, {
      grootte: dStijl.tekst * 0.88,
      anker: "start",
      vet: true,
    })
  );
  delen.push(voettekst(D.hoogte + 20, "stalen kern en twee afdichtingsniveaus schematisch"));

  return {
    id: "A",
    titel: "Detail A — Profieldoorsnede",
    omschrijving:
      "Horizontale doorsnede door kozijn- en vleugelprofiel, met de aanslagverbinding, de afdichtingen en de stalen kern.",
    wanneerVerplicht: "Altijd",
    svg: detailDocument(delen.join("")),
  };
}

// ---------------------------------------------------------------------------
// Detail B — onderdorpel en waterkering
// ---------------------------------------------------------------------------

function detailB(b: Berekening): Tekening {
  const p = b.profiel;
  const dorpelHoogte = b.dorpel?.hoogte.waarde ?? 40;
  const diepte = p.inbouwdiepte.waarde;
  const s = (D.breedte * 0.58) / diepte;

  const x0 = 44;
  const y0 = 62;
  const breedte = diepte * s;
  const hoogte = Math.max(28, dorpelHoogte * s * 1.7);

  const delen: string[] = [];
  delen.push(kamerprofiel(x0, y0, breedte, hoogte, 3, { staal: true, horizontaal: true }));

  // Afschot naar buiten met een waterhol en een afwateringsopening.
  delen.push(
    `<path d="M ${x0} ${y0} L ${x0 + breedte} ${y0 + hoogte * 0.3} L ${x0 + breedte} ${y0} Z" fill="#ffffff" stroke="${LIJN}" stroke-width="${dStijl.lijn}"/>`
  );
  delen.push(
    `<path d="M ${x0 + breedte * 0.74} ${y0 + hoogte * 0.22} a 5.5 5.5 0 1 0 0.1 0" fill="#ffffff" stroke="${LIJN}" stroke-width="${dStijl.lijn}"/>`
  );
  delen.push(tekst(x0 + breedte + 10, y0 + hoogte * 0.2, "waterhol", { grootte: dStijl.tekst * 0.75, anker: "start" }));

  // Afwateringssleuf naar buiten — met de werkelijk gekozen uitvoering erbij,
  // zodat de tekening en de fabrieksorder hetzelfde zeggen.
  const afw = b.configuratie.afwatering;
  if (afw === "verdekt") {
    // Onderlangs: het water verlaat de regel aan de onderkant, uit het zicht.
    delen.push(
      lijn(x0 + breedte * 0.55, y0 + hoogte * 0.55, x0 + breedte * 0.55, y0 + hoogte + 10, {
        kleur: "#0f7ab0",
        dikte: dStijl.lijn * 1.5,
      })
    );
    delen.push(
      `<path d="M ${x0 + breedte * 0.55} ${y0 + hoogte + 10} l -4 -7 l 8 0 z" fill="#0f7ab0"/>`
    );
    delen.push(
      tekst(
        x0 + breedte * 0.6,
        y0 + hoogte + 8,
        `${aantalAfwateringssleuven(b.configuratie.breedte)} × verdekte afwatering onderlangs`,
        { grootte: dStijl.tekst * 0.7, anker: "start", kleur: "#0f7ab0" }
      )
    );
  } else if (afw === "geen") {
    delen.push(
      tekst(x0 + breedte + 16, y0 + hoogte * 0.6, "geen afwatering gekozen", {
        grootte: dStijl.tekst * 0.7,
        anker: "start",
        kleur: "#c0392b",
      })
    );
  } else {
    delen.push(
      lijn(x0 + breedte * 0.55, y0 + hoogte * 0.55, x0 + breedte + 12, y0 + hoogte * 0.55, {
        kleur: "#0f7ab0",
        dikte: dStijl.lijn * 1.5,
      })
    );
    delen.push(`<path d="M ${x0 + breedte + 12} ${y0 + hoogte * 0.55} l -7 -4 l 0 8 z" fill="#0f7ab0"/>`);
    if (afw === "afdekkap") {
      // Het kapje zit vóór de sleuf, aan de buitenzijde van de onderregel.
      delen.push(
        rechthoek(x0 + breedte - 4, y0 + hoogte * 0.42, 8, hoogte * 0.26, {
          vul: "#ffffff",
          lijn: LIJN,
          dikte: dStijl.lijn,
        })
      );
    }
    delen.push(
      tekst(
        x0 + breedte + 16,
        y0 + hoogte * 0.72,
        `${aantalAfwateringssleuven(b.configuratie.breedte)} × afwatering ${AFWATERING.sleufBreedte.waarde}×${AFWATERING.sleufHoogte.waarde}${afw === "afdekkap" ? " met kap" : ""}`,
        { grootte: dStijl.tekst * 0.7, anker: "start", kleur: "#0f7ab0" }
      )
    );
  }

  delen.push(rechthoek(x0 - 10, y0 + hoogte, breedte + 20, 16, { vul: "#efece4", lijn: LIJN, dikte: dStijl.lijn }));
  delen.push(tekst(x0 + breedte / 2, y0 + hoogte + 12, "aansluiting op de dagkant", { grootte: dStijl.tekst * 0.72 }));

  delen.push(tekst(x0, y0 - 26, "binnen", { grootte: dStijl.tekst * 0.78, anker: "start", kleur: "#565c58" }));
  delen.push(tekst(x0 + breedte, y0 - 26, "buiten", { grootte: dStijl.tekst * 0.78, anker: "end", kleur: "#565c58" }));

  delen.push(maatVerticaal(y0, y0 + hoogte, x0 - 18, `dorpel ${dorpelHoogte}`, dStijl, x0));
  delen.push(maatHorizontaal(x0, x0 + breedte, y0 - 14, `${diepte}`, dStijl, y0));

  delen.push(
    tekst(0, D.hoogte + 6, b.dorpel ? b.dorpel.naam : "Kozijnonderdorpel (geen aparte dorpel gekozen)", {
      grootte: dStijl.tekst * 0.88,
      anker: "start",
      vet: true,
    })
  );
  delen.push(voettekst(D.hoogte + 20));

  return {
    id: "B",
    titel: "Detail B — Onderdorpel en waterkering",
    omschrijving: "Verticale doorsnede door de onderdorpel met het afschot en de waterafvoer naar buiten.",
    wanneerVerplicht: "Altijd bij buitenkozijnen en deuren",
    svg: detailDocument(delen.join("")),
  };
}

// ---------------------------------------------------------------------------
// Detail C — hoekverbinding
// ---------------------------------------------------------------------------

function detailC(b: Berekening): Tekening {
  const p = b.profiel;
  const zicht = p.geometrie.kozijnZichtbreedte.waarde;
  const s = 1.5;
  const dikte = zicht * s;
  const lengte = 150;
  const x0 = 44;
  const y0 = 34;

  const delen: string[] = [];
  delen.push(
    `<path d="M ${x0} ${y0} L ${x0 + lengte} ${y0} L ${x0 + lengte} ${y0 + dikte} L ${x0 + dikte} ${y0 + dikte} L ${x0 + dikte} ${y0 + lengte} L ${x0} ${y0 + lengte} Z" fill="url(#arcering)" stroke="${LIJN}" stroke-width="${dStijl.lijn * 1.6}"/>`
  );
  if (b.configuratie.hoekverbinding === "houtlook") {
    // Houtlook: de horizontale regel loopt door en de stijl sluit er haaks
    // tegenaan. De naad staat dus verticaal, niet onder 45°.
    delen.push(lijn(x0 + dikte, y0, x0 + dikte, y0 + dikte, { kleur: "#c0392b", dikte: dStijl.lijn * 1.8 }));
    delen.push(
      tekst(x0 + dikte + 14, y0 + dikte + 18, "houtlook — haakse verbinding, de regel loopt door", {
        grootte: dStijl.tekst * 0.78,
        anker: "start",
        kleur: "#c0392b",
      })
    );
  } else {
    // De versteknaad onder 45°, met de lasrups.
    delen.push(lijn(x0 + dikte, y0 + dikte, x0, y0, { kleur: "#c0392b", dikte: dStijl.lijn * 1.8 }));
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const cx = x0 + dikte * (1 - t);
      const cy = y0 + dikte * (1 - t);
      delen.push(`<circle cx="${cx}" cy="${cy}" r="2.2" fill="none" stroke="#c0392b" stroke-width="0.8"/>`);
    }
    delen.push(
      tekst(x0 + dikte + 14, y0 + dikte + 18, "verstek 45° — fabrieksmatig gelast en genaad", {
        grootte: dStijl.tekst * 0.78,
        anker: "start",
        kleur: "#c0392b",
      })
    );
  }

  delen.push(maatHorizontaal(x0, x0 + dikte, y0 - 16, `${zicht}`, dStijl, y0));
  delen.push(
    tekst(0, D.hoogte + 6, `Hoekverbinding ${p.merkLabel} ${p.naam}`, {
      grootte: dStijl.tekst * 0.88,
      anker: "start",
      vet: true,
    })
  );
  delen.push(voettekst(D.hoogte + 20));

  return {
    id: "C",
    titel: "Detail C — Hoekverbinding",
    omschrijving:
      b.configuratie.hoekverbinding === "houtlook"
        ? "Detail van de haakse houtlookverbinding in de hoek van het kozijn."
        : "Detail van de verstek-/lasverbinding in de hoek van het kozijn.",
    wanneerVerplicht: "Altijd",
    svg: detailDocument(delen.join("")),
  };
}

// ---------------------------------------------------------------------------
// Detail D — glaslat en beglazing, met de glasmaat
// ---------------------------------------------------------------------------

function detailD(b: Berekening): Tekening {
  const g = b.profiel.geometrie;
  const glasinleg = g.glasinleg.waarde;
  const speling = 0;
  const glasdikte = b.glastype?.dikte ?? 28;
  const vak = b.vakken.find((v) => v.vulsoort === "glas") ?? b.vakken[0];

  const s = 3.0;
  const x0 = 56;
  const y0 = 46;
  const profielB = 52;
  const profielH = 96;

  const delen: string[] = [];
  delen.push(kamerprofiel(x0, y0, profielB, profielH, 3, { staal: true }));

  // Glaslat, met de klikverbinding naar het profiel.
  const latB = 18;
  const latH = profielH * 0.32;
  delen.push(rechthoek(x0 + profielB, y0, latB, latH, { vul: "#f6f5f1", lijn: LIJN, dikte: dStijl.lijn * 1.3 }));
  delen.push(lijn(x0 + profielB + 4, y0 + latH * 0.6, x0 + profielB + latB - 3, y0 + latH * 0.6, { kleur: LIJN, dikte: dStijl.lijn * 0.7 }));
  delen.push(tekst(x0 + profielB + latB / 2, y0 - 10, "glaslat", { grootte: dStijl.tekst * 0.72 }));

  // Beglazingsrubbers boven en onder het glas.
  const glasY = y0 + profielH * 0.42;
  const glasH = Math.max(9, glasdikte * s * 0.42);
  const glasX = x0 + profielB - glasinleg * s * 0.5;
  delen.push(afdichting(glasX + 5, glasY - 2, 2.8));
  delen.push(afdichting(glasX + 5, glasY + glasH + 2, 2.8));

  delen.push(
    rechthoek(glasX, glasY, D.breedte - glasX - 8, glasH, {
      vul: b.configuratie.glas.meegeleverd ? GLAS : "#f4f4f1",
      lijn: LIJN,
      dikte: dStijl.lijn,
      streep: b.configuratie.glas.meegeleverd ? undefined : "5,4",
    })
  );
  // Beglazingsblokje onder het glas — hoort in elke doorsnede.
  delen.push(rechthoek(glasX + 16, glasY + glasH, 22, 5, { vul: "#c8ccc6", lijn: LIJN, dikte: dStijl.lijn * 0.7 }));
  delen.push(
    tekst(glasX + 44, glasY + glasH + 14, "beglazingsblokje", { grootte: dStijl.tekst * 0.65, anker: "start" })
  );

  delen.push(maatHorizontaal(glasX, x0 + profielB, glasY - 24, `inleg ${glasinleg}`, dStijl, glasY));


  const glasmaat =
    vak.glasHoogteLaag === null
      ? `${vak.glasBreedte} × ${vak.glasHoogte} mm`
      : `${vak.glasBreedte} × ${vak.glasHoogteLaag}–${vak.glasHoogte} mm`;

  delen.push(
    tekst(0, D.hoogte - 4, `GLASMAAT ${vak.naam}: ${glasmaat}`, {
      grootte: dStijl.tekst * 1.05,
      anker: "start",
      vet: true,
      kleur: MAATKLEUR,
    })
  );
  delen.push(
    tekst(
      0,
      D.hoogte + 10,
      b.configuratie.glas.meegeleverd
        ? `${b.glastype?.naam ?? "glas"} — ${glasdikte} mm`
        : "Glas NIET meegeleverd — bovenstaande maat is de te bestellen glasmaat",
      {
        grootte: dStijl.tekst * 0.85,
        anker: "start",
        kleur: b.configuratie.glas.meegeleverd ? "#565c58" : "#c0392b",
      }
    )
  );
  delen.push(voettekst(D.hoogte + 24));

  return {
    id: "D",
    titel: "Detail D — Glaslat en beglazing",
    omschrijving: "Doorsnede van de beglazing met glaslat, rubbers en beglazingsblokje, met de glasmaat geannoteerd.",
    wanneerVerplicht: "Altijd, ook zonder glasproduct",
    svg: detailDocument(delen.join("")),
  };
}

// ---------------------------------------------------------------------------
// Detail E — hang- en sluitwerk met de cilindermaat
// ---------------------------------------------------------------------------

function detailE(b: Berekening): Tekening {
  const dikte = b.profiel.vleugeldikte.waarde;
  const cil = b.cilindermaat;
  const s = 1.6;

  const midden = D.breedte / 2;
  const y0 = 66;
  const deurH = 84;
  const deurB = dikte * s;
  const x0 = midden - deurB / 2;

  const delen: string[] = [];
  delen.push(kamerprofiel(x0, y0, deurB, deurH, 4, { staal: true, horizontaal: true }));
  delen.push(
    tekst(midden, y0 - 32, "binnen ← vleugel/deur → buiten", { grootte: dStijl.tekst * 0.75, kleur: "#565c58" })
  );

  const asY = y0 + deurH / 2;
  const binnenX = x0 - cil.binnen * s * 0.5;
  const buitenX = x0 + deurB + cil.buiten * s * 0.5;

  // De cilinder zelf, met de kern.
  delen.push(rechthoek(binnenX, asY - 9, buitenX - binnenX, 18, { vul: "#ffffff", lijn: LIJN, dikte: dStijl.lijn * 1.3 }));
  delen.push(`<circle cx="${midden}" cy="${asY}" r="7" fill="#ffffff" stroke="${LIJN}" stroke-width="${dStijl.lijn}"/>`);
  delen.push(lijn(midden, y0 - 8, midden, y0 + deurH + 8, { kleur: "#c0392b", dikte: dStijl.lijn, streep: "6,4" }));
  delen.push(
    tekst(midden, y0 + deurH + 22, "hart bevestigingsschroef", { grootte: dStijl.tekst * 0.7, kleur: "#c0392b" })
  );

  // Schilden binnen en buiten.
  delen.push(rechthoek(x0 - 8, asY - 24, 8, 48, { vul: "#e0ddd4", lijn: LIJN, dikte: dStijl.lijn }));
  delen.push(rechthoek(x0 + deurB, asY - 24, 8, 48, { vul: "#e0ddd4", lijn: LIJN, dikte: dStijl.lijn }));

  delen.push(maatHorizontaal(binnenX, midden, asY - 42, `a = ${cil.binnen}`, dStijl, asY - 9));
  delen.push(maatHorizontaal(midden, buitenX, asY - 42, `b = ${cil.buiten}`, dStijl, asY - 9));
  delen.push(maatVerticaal(y0, y0 + deurH, binnenX - 28, `dikte ${dikte}`, dStijl, x0));

  delen.push(
    tekst(0, D.hoogte - 4, `CILINDERMAAT: ${cil.notatie} mm — ${cil.skgAdvies} geadviseerd`, {
      grootte: dStijl.tekst * 1.05,
      anker: "start",
      vet: true,
      kleur: MAATKLEUR,
    })
  );
  delen.push(
    tekst(
      0,
      D.hoogte + 10,
      b.configuratie.beslag.cilinderMeegeleverd
        ? b.beslag
          ? `${b.beslag.naam} — cilinder meegeleverd`
          : "Cilinder meegeleverd — beslag nog niet gekozen"
        : "Cilinder NIET meegeleverd — bovenstaande maat is de te bestellen cilindermaat",
      {
        grootte: dStijl.tekst * 0.85,
        anker: "start",
        kleur: b.configuratie.beslag.cilinderMeegeleverd ? "#565c58" : "#c0392b",
      }
    )
  );
  delen.push(
    voettekst(D.hoogte + 24, cil.gebaseerdOpFabrieksstandaard ? "fabrieksstandaard rozet" : "rozet uit beslagdatabase")
  );

  return {
    id: "E",
    titel: "Detail E — Hang- en sluitwerk",
    omschrijving: "Positionering van beslag en cilinder met de cilindermaat geannoteerd.",
    wanneerVerplicht: "Altijd, ook zonder cilinderproduct",
    svg: detailDocument(delen.join("")),
  };
}

// ---------------------------------------------------------------------------
// Detail F — ventilatierooster (alleen bij een gekozen rooster)
// ---------------------------------------------------------------------------

function roostervakken(b: Berekening): VakMaten[] {
  return b.vakken.filter((v) => v.roosterId !== null);
}

function detailF(b: Berekening): Tekening | null {
  const vakken = roostervakken(b);
  if (vakken.length === 0) return null;
  const vak = vakken[0];
  const rooster = roosterOpId(vak.roosterId);
  if (!rooster) return null;

  const hoogte = rooster.bouwhoogte.waarde;
  const diepte = b.profiel.inbouwdiepte.waarde;
  const s = (D.breedte * 0.5) / diepte;

  const x0 = 56;
  const y0 = 62;
  const breedte = diepte * s;
  const h = Math.max(26, hoogte * s * 1.5);

  const delen: string[] = [];
  delen.push(kamerprofiel(x0, y0, breedte, h, 3, { horizontaal: true }));

  // Luchtdoorlaat: een pijl dwars door het rooster, met de lamellen.
  delen.push(lijn(x0 + breedte + 26, y0 + h / 2, x0 - 26, y0 + h / 2, { kleur: "#0f7ab0", dikte: dStijl.lijn * 1.7 }));
  delen.push(`<path d="M ${x0 - 26} ${y0 + h / 2} l 9 -4.5 l 0 9 z" fill="#0f7ab0"/>`);
  for (let i = 1; i <= 3; i++) {
    const xx = x0 + (breedte * i) / 4;
    delen.push(lijn(xx, y0 + h * 0.2, xx + 6, y0 + h * 0.8, { kleur: LIJN, dikte: dStijl.lijn }));
  }
  delen.push(
    tekst(x0 + breedte / 2, y0 - 12, "luchtdoorlaat", { grootte: dStijl.tekst * 0.72, kleur: "#0f7ab0" })
  );

  delen.push(maatVerticaal(y0, y0 + h, x0 - 18, `bouwhoogte ${hoogte}`, dStijl, x0));
  delen.push(maatHorizontaal(x0, x0 + breedte, y0 - 14, `${diepte}`, dStijl, y0));

  const plaatsing = vak.vulsoort === "rooster" ? "tussen stijlen" : "in de beglazing";
  delen.push(
    tekst(0, D.hoogte - 4, `${rooster.naam} — ${plaatsing}, ${vak.naam}`, {
      grootte: dStijl.tekst * 0.95,
      anker: "start",
      vet: true,
    })
  );
  delen.push(
    tekst(
      0,
      D.hoogte + 10,
      `Roosterlengte ${vak.sponningBreedte} mm · capaciteit ${rooster.capaciteit} dm³/s per meter`,
      { grootte: dStijl.tekst * 0.82, anker: "start", kleur: "#565c58" }
    )
  );
  delen.push(voettekst(D.hoogte + 24));

  return {
    id: "F",
    titel: "Detail F — Ventilatie",
    omschrijving: "Doorsnede van het ventilatierooster en de luchtdoorlaat.",
    wanneerVerplicht: "Alleen indien rooster gekozen",
    svg: detailDocument(delen.join("")),
  };
}

// ---------------------------------------------------------------------------
// Detail G — hor-aansluiting met de hormaat
// ---------------------------------------------------------------------------

function detailG(b: Berekening): Tekening {
  const vak = b.vakken.find((v) => v.horMeegeleverd) ?? b.vakken[0];
  const aansluit = b.profiel.horAansluitmaat.waarde + (b.hortype?.extraAftrek.waarde ?? 0);

  const x0 = 52;
  const y0 = 58;
  const kozijnB = 62;
  const kozijnH = 96;

  const delen: string[] = [];
  delen.push(kamerprofiel(x0, y0, kozijnB, kozijnH, b.profiel.kamers.waarde, { staal: true }));
  delen.push(tekst(x0 + kozijnB / 2, y0 + kozijnH + 15, "kozijn", { grootte: dStijl.tekst * 0.8 }));

  // Horkader in de dagopening, met gaas.
  const horX = x0 + kozijnB + aansluit * 2.6;
  delen.push(
    rechthoek(horX, y0 + 14, 20, kozijnH - 28, {
      vul: "#ffffff",
      lijn: LIJN,
      dikte: dStijl.lijn * 1.3,
      streep: vak.horMeegeleverd ? undefined : "5,4",
    })
  );
  for (let i = 0; i < 8; i++) {
    const y = y0 + 20 + i * ((kozijnH - 40) / 7);
    delen.push(lijn(horX + 20, y, horX + 44, y, { kleur: "#9aa39e", dikte: dStijl.lijn * 0.5 }));
  }
  delen.push(tekst(horX + 10, y0 + 8, "hor", { grootte: dStijl.tekst * 0.8 }));

  delen.push(
    maatHorizontaal(x0 + kozijnB, horX, y0 + kozijnH + 36, `aansluitmaat ${aansluit}`, dStijl, y0 + kozijnH)
  );

  delen.push(
    tekst(0, D.hoogte - 4, `HORMAAT ${vak.naam}: ${vak.horBreedte} × ${vak.horHoogte} mm`, {
      grootte: dStijl.tekst * 1.05,
      anker: "start",
      vet: true,
      kleur: MAATKLEUR,
    })
  );
  delen.push(
    tekst(
      0,
      D.hoogte + 10,
      vak.horMeegeleverd
        ? `${b.hortype?.naam ?? "hor"} — meegeleverd`
        : "Hor NIET meegeleverd — bovenstaande maat is de te bestellen hormaat",
      {
        grootte: dStijl.tekst * 0.85,
        anker: "start",
        kleur: vak.horMeegeleverd ? "#565c58" : "#c0392b",
      }
    )
  );
  delen.push(voettekst(D.hoogte + 24));

  return {
    id: "G",
    titel: "Detail G — Hor",
    omschrijving: "Hor-aansluiting met de hormaat geannoteerd.",
    wanneerVerplicht: "Altijd, ook zonder hor",
    svg: detailDocument(delen.join("")),
  };
}

// ---------------------------------------------------------------------------
// Publieke ingang
// ---------------------------------------------------------------------------

/** Welke details bij deze configuratie horen (de matrix uit hoofdstuk 12.2). */
export function verplichteDetails(b: Berekening): DetailCode[] {
  const details: DetailCode[] = ["A", "B", "C", "D", "E"];
  if (roostervakken(b).length > 0) details.push("F");
  details.push("G");
  return details;
}

/**
 * Genereert de hoofdtekening MET alle verplichte detailtekeningen.
 *
 * Dit is bewust de enige publieke functie van deze module: er bestaat geen weg
 * om een hoofdtekening zonder details te krijgen (regel 5).
 */
export function genereerTekeningen(b: Berekening): Tekening[] {
  const details: Tekening[] = [detailA(b), detailB(b), detailC(b), detailD(b), detailE(b)];
  const f = detailF(b);
  if (f) details.push(f);
  details.push(detailG(b));

  const codes = verplichteDetails(b);
  const aanwezig = details.map((d) => d.id);
  for (const code of codes) {
    if (!aanwezig.includes(code)) {
      throw new Error(
        `Detailtekening ${code} is verplicht maar niet gegenereerd — dit mag nooit voorkomen (regel 5)`
      );
    }
  }

  return [hoofdtekening(b, "binnen"), hoofdtekening(b, "buiten"), ...details];
}
