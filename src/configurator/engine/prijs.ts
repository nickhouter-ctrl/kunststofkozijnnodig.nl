/**
 * De prijsengine.
 *
 * DRIE PRIJSNIVEAUS — en dat is geen detail, want elk niveau hoort bij een
 * ander document en een ander publiek:
 *
 *   1. kostprijs        wat Rebu zelf betaalt. Verlaat de server NOOIT richting
 *                       een aannemer of een particulier.
 *   2. aannemersprijs   kostprijs + de Rebu-marge (doorgaans 40–50%). Dit is
 *                       wat Rebu de aannemer factureert. De aannemer ziet dit,
 *                       want het is zijn inkoop.
 *   3. klantprijs       aannemersprijs + de eigen marge van de aannemer. Dit is
 *                       wat de eindklant betaalt.
 *
 * Een publieke bezoeker loopt langs een eigen pad: kostprijs + de door Rebu
 * ingestelde consumentenopslag. Daar komt geen aannemersmarge aan te pas, zodat
 * er nooit een marge van de één bij de ander op het scherm komt.
 */
import { PRIJSBASIS, STANDAARD_WIT } from "../data/prijzen";
import { isBasiskleur } from "../data/kleuren";
import { BEWEEGBAAR, GLASINVULLINGEN } from "./indeling";
import {
  STANDAARD_PANEEL,
  bijprofielOpId,
  STAPELDORPEL,
  glastypeOpId,
  krukOpId,
  paneeltypeOpId,
  roosterOpId,
} from "../data/onderdelen";
import type {
  Afkitoptie,
  Afstandshouder,
  Beslag,
  Configuratie,
  Dorpel,
  Eurocent,
  Glastype,
  Hortype,
  Kleur,
  Muuraansluiting,
  Prijs,
  Prijscontext,
  Profiel,
  VakMaten,
} from "../types";

export interface PrijsInvoer {
  configuratie: Configuratie;
  profiel: Profiel;
  glastype: Glastype | null;
  afstandshouder: Afstandshouder | null;
  beslag: Beslag | null;
  hortype: Hortype | null;
  dorpel: Dorpel | null;
  muuraansluiting: Muuraansluiting | null;
  afkitoptie: Afkitoptie | null;
  kleurBinnen: Kleur | null;
  kleurBuiten: Kleur | null;
  vakken: VakMaten[];
  staalversterkingVerplicht: boolean;
}

export interface PrijsOpties {
  context: Prijscontext;
  /**
   * De eigen marge van de aannemer als factor (0.25 = 25%), bovenop wat hij aan
   * Rebu betaalt. Wordt genegeerd in de publieke context.
   */
  aannemersmarge?: number;
  /**
   * De marge die Rebu op zijn kostprijs legt richting de aannemer, als factor.
   * Standaard komt die uit de prijsbasis (doorgaans 40–50%).
   */
  rebuMarge?: number;
  /**
   * Alleen voor Rebu-rollen: geeft de kostprijs vrij. Standaard onwaar, zodat
   * de kostprijs nooit per ongeluk in een aannemers- of klantdocument belandt.
   */
  toonKostprijs?: boolean;
}

/** Millimeter naar meter. */
const m = (mm: number): number => mm / 1000;

/**
 * Bouwt de kostprijsopbouw op — wat Rebu zelf kwijt is.
 * Deze functie kent geen enkele marge en geen enkele context.
 */
function berekenKostregels(invoer: PrijsInvoer): { omschrijving: string; bedrag: Eurocent }[] {
  const {
    configuratie,
    profiel,
    glastype,
    afstandshouder,
    beslag,
    hortype,
    dorpel,
    muuraansluiting,
    afkitoptie,
    vakken,
  } = invoer;
  const basis = PRIJSBASIS;
  const regels: { omschrijving: string; bedrag: Eurocent }[] = [];

  // Profiel: op basis van het volledige kozijnoppervlak. Een tarief op de
  // uitvoering zelf (bijv. het diepere NL-blokprofiel) gaat vóór het
  // systeemtarief; zonder eigen tarief geldt dat van het systeem.
  const kozijnM2 = (configuratie.breedte * configuratie.hoogte) / 1_000_000;
  const perM2 = basis.profielPerM2[profiel.id] ?? basis.profielPerM2[profiel.systeemId] ?? 0;
  const profielBedrag = Math.round(perM2 * kozijnM2);
  regels.push({
    omschrijving: `${profiel.merkLabel} ${profiel.naam} (${profiel.uitvoeringLabel}) — ${Math.round(kozijnM2 * 100) / 100} m²`,
    bedrag: profielBedrag,
  });

  /**
   * Folietoeslag. Een basiskleur — wit RAL 9016 of crèmewit RAL 9001 — is het
   * profiel zelf, daar zit geen folie op en dus ook geen toeslag. Elke andere
   * kleur is een folie die op het profiel geplakt wordt.
   */
  const witIds = STANDAARD_WIT[profiel.merk] ?? [];
  const gefolied = (kleur: typeof invoer.kleurBinnen) =>
    kleur !== null && !isBasiskleur(kleur) && !witIds.includes(kleur.id);
  const binnenGekleurd = gefolied(invoer.kleurBinnen);
  const buitenGekleurd = gefolied(invoer.kleurBuiten);
  const zijden = (binnenGekleurd ? 1 : 0) + (buitenGekleurd ? 1 : 0);
  if (zijden > 0) {
    const factor = zijden === 2 ? basis.folieToeslag.tweezijdig : basis.folieToeslag.eenzijdig;
    regels.push({
      omschrijving: zijden === 2 ? "Folie binnen én buiten" : "Folie eenzijdig",
      bedrag: Math.round(profielBedrag * factor),
    });
  }

  // Beweegbare vleugels.
  const beweegbaar = vakken.filter((v) => BEWEEGBAAR.includes(v.invulling)).length;
  if (beweegbaar > 0) {
    regels.push({
      omschrijving: `${beweegbaar} beweegbare vleugel${beweegbaar > 1 ? "s" : ""}`,
      bedrag: basis.vleugelToeslag * beweegbaar,
    });
  }

  // Glas — alleen wanneer het daadwerkelijk wordt meegeleverd. De glasmaat
  // wordt altijd berekend, maar niet-geleverd glas wordt niet gefactureerd.
  if (configuratie.glas.meegeleverd && glastype) {
    /**
     * Per glassoort een eigen regel. Een vak mag van het kozijnglas afwijken —
     * gelaagd in een deur, zonwerend aan de zuidkant — en dan hoort dat ook als
     * aparte regel op de offerte te staan, tegen zijn eigen tarief.
     */
    const glasvakken = vakken
      .flatMap((v) => (v.binnenVakken.length > 0 ? v.binnenVakken : [v]))
      .filter((v) => v.vulsoort === "glas" && v.invulling !== "geen");
    const perSoort = new Map<string, number>();
    for (const vak of glasvakken) {
      const soort = glastypeOpId(vak.glastypeId) ?? glastype;
      perSoort.set(soort.id, (perSoort.get(soort.id) ?? 0) + vak.glasOppervlakM2);
    }
    for (const [glasId, m2] of perSoort) {
      if (m2 <= 0) continue;
      const soort = glastypeOpId(glasId) ?? glastype;
      regels.push({
        omschrijving: `${soort.naam} — ${Math.round(m2 * 100) / 100} m²`,
        bedrag: Math.round((basis.glasPerM2[glasId] ?? 0) * m2),
      });
    }
  }

  // Dichte panelen worden per m² gerekend, per dikte apart: een 48 mm paneel
  // kost aanzienlijk meer dan een 24 mm vulpaneel.
  const paneelvakken = vakken.flatMap((v) => [v, ...v.binnenVakken]).filter((v) => v.vulsoort === "paneel");
  const perDikte = new Map<string, number>();
  for (const vak of paneelvakken) {
    const paneel = paneeltypeOpId(vak.paneeltypeId) ?? STANDAARD_PANEEL;
    perDikte.set(paneel.id, (perDikte.get(paneel.id) ?? 0) + vak.glasOppervlakM2);
  }
  for (const [paneelId, m2] of perDikte) {
    const paneel = paneeltypeOpId(paneelId) ?? STANDAARD_PANEEL;
    regels.push({
      omschrijving: `${paneel.naam} — ${Math.round(m2 * 100) / 100} m²`,
      bedrag: Math.round((basis.paneelPerM2[paneelId] ?? 0) * m2),
    });
  }

  /**
   * De afstandshouder loopt langs de hele glasrand en wordt daarom per
   * strekkende meter omtrek gerekend. Aluminium zit in de glasprijs en levert
   * geen regel op; een warm edge-houder is een echte meerprijs.
   */
  if (configuratie.glas.meegeleverd && afstandshouder) {
    const tarief = basis.afstandshouderPerMeter[afstandshouder.id] ?? 0;
    if (tarief > 0) {
      const omtrek = vakken
        .flatMap((v) => (v.binnenVakken.length > 0 ? v.binnenVakken : [v]))
        .filter((v) => v.vulsoort === "glas")
        .reduce((som, v) => som + (2 * (v.glasBreedte + v.glasHoogte)) / 1000, 0);
      if (omtrek > 0) {
        regels.push({
          omschrijving: `Afstandshouder ${afstandshouder.naam.toLowerCase()} — ${Math.round(omtrek * 10) / 10} m`,
          bedrag: Math.round(tarief * omtrek),
        });
      }
    }
  }

  /**
   * Roeden worden per strekkende meter gerekend: de lengte van elke lat samen.
   * Een verticale roede is zo hoog als de ruit, een horizontale zo breed.
   */
  const roedeMeters = vakken
    .flatMap((v) => (v.binnenVakken.length > 0 ? v.binnenVakken : [v]))
    .filter((v) => v.vulsoort === "glas" && v.roeden)
    .reduce((som, v) => {
      const r = v.roeden!;
      const hoogte = v.glasHoogte / 1000;
      const breedte = v.glasBreedte / 1000;
      return som + r.verticaal * hoogte + r.horizontaal * breedte;
    }, 0);
  if (roedeMeters > 0) {
    regels.push({
      omschrijving: `Roeden — ${Math.round(roedeMeters * 10) / 10} m`,
      bedrag: Math.round(basis.roedePerMeter * roedeMeters),
    });
  }

  /**
   * De bediening per vleugel: elke kruk, greep of trekker apart. Zo staat er op
   * de offerte wat er daadwerkelijk gemonteerd wordt, en niet één post 'beslag'.
   */
  const bedieningen = new Map<string, number>();
  for (const vak of vakken) {
    for (const id of [vak.krukBinnenId, vak.krukBuitenId]) {
      if (!id) continue;
      bedieningen.set(id, (bedieningen.get(id) ?? 0) + 1);
    }
  }
  for (const [krukId, aantal] of bedieningen) {
    const kruk = krukOpId(krukId);
    if (!kruk) continue;
    regels.push({
      omschrijving: `${kruk.naam} — ${aantal}×`,
      bedrag: Math.round((basis.krukPerStuk[krukId] ?? 0) * aantal),
    });
  }

  // Stapeldorpels zitten onder een enkele vleugel en gaan per strekkende meter.
  const stapelMeters = vakken
    .filter((v) => v.stapeldorpel)
    .reduce((som, v) => som + v.breedte / 1000, 0);
  if (stapelMeters > 0) {
    regels.push({
      omschrijving: `Stapeldorpel — ${Math.round(stapelMeters * 10) / 10} m`,
      bedrag: Math.round(STAPELDORPEL.prijsPerMeter * stapelMeters),
    });
  }

  /**
   * De aansluiting op het metselwerk loopt rondom het kozijn, dus per
   * strekkende meter omtrek. Het afkitten gaat over dezelfde omtrek, maar dan
   * per zijde die daadwerkelijk gekit wordt.
   */
  const omtrekM = (2 * (configuratie.breedte + configuratie.hoogte)) / 1000;
  if (muuraansluiting && muuraansluiting.prijsPerMeter > 0) {
    regels.push({
      omschrijving: `${muuraansluiting.naam} — ${Math.round(omtrekM * 10) / 10} m`,
      bedrag: Math.round(muuraansluiting.prijsPerMeter * omtrekM),
    });
  }
  /**
   * Bijprofielen zitten op één zijde en gaan per strekkende meter van díe zijde:
   * links en rechts over de hoogte, boven en onder over de breedte.
   */
  for (const zijde of ["boven", "onder", "links", "rechts"] as const) {
    const bij = bijprofielOpId(configuratie.kozijnzijden[zijde].bijprofielId);
    if (!bij) continue;
    const lengteM =
      (zijde === "boven" || zijde === "onder" ? configuratie.breedte : configuratie.hoogte) / 1000;
    regels.push({
      omschrijving: `${bij.naam} (${zijde}) — ${Math.round(lengteM * 10) / 10} m`,
      bedrag: Math.round(bij.prijsPerMeter * lengteM),
    });
  }

  if (afkitoptie) {
    const zijden = (afkitoptie.binnen ? 1 : 0) + (afkitoptie.buiten ? 1 : 0);
    if (zijden > 0) {
      regels.push({
        omschrijving: `${afkitoptie.naam} — ${Math.round(omtrekM * zijden * 10) / 10} m kitvoeg`,
        bedrag: Math.round(basis.afkitPerMeter * omtrekM * zijden),
      });
    }
  }

  // Beslag — de cilinder zit in het beslagtarief; zonder meegeleverde cilinder
  // vervalt een deel daarvan.
  if (beslag) {
    const beslagBedrag = basis.beslag[beslag.id] ?? 0;
    if (configuratie.beslag.cilinderMeegeleverd) {
      regels.push({ omschrijving: beslag.naam, bedrag: beslagBedrag });
    } else {
      regels.push({
        omschrijving: `${beslag.naam} (zonder cilinder)`,
        bedrag: Math.round(beslagBedrag * 0.75),
      });
    }
  }

  // Horren — per vak waar er daadwerkelijk één meegaat. De hormaat van álle
  // vakken wordt berekend, maar alleen geleverde horren worden gefactureerd.
  if (hortype) {
    const horM2 = vakken
      .filter((v) => v.horMeegeleverd)
      .reduce((som, v) => som + m(v.horBreedte) * m(v.horHoogte), 0);
    if (horM2 > 0) {
      regels.push({
        omschrijving: `${hortype.naam} — ${Math.round(horM2 * 100) / 100} m²`,
        bedrag: Math.round((basis.horPerM2[hortype.id] ?? 0) * horM2),
      });
    }
  }

  // Roosters: per rooster, op de breedte van het vak waar het in zit.
  const roostervakken = vakken.filter((v) => v.roosterId !== null);
  for (const vak of roostervakken) {
    const rooster = roosterOpId(vak.roosterId);
    if (!rooster) continue;
    regels.push({
      omschrijving: `${rooster.naam} — ${vak.naam}`,
      bedrag: Math.round((basis.roosterPerMeter[rooster.id] ?? 0) * m(vak.sponningBreedte)),
    });
  }

  if (dorpel) {
    regels.push({
      omschrijving: dorpel.naam,
      bedrag: Math.round((basis.dorpelPerMeter[dorpel.id] ?? 0) * m(configuratie.breedte)),
    });
  }

  if (configuratie.staalversterking || invoer.staalversterkingVerplicht) {
    const omtrek = vakken.reduce((som, v) => som + 2 * (m(v.vleugelBreedte) + m(v.vleugelHoogte)), 0);
    regels.push({
      omschrijving: "Staalversterking",
      bedrag: Math.round(basis.staalPerMeter * omtrek),
    });
  }

  return regels;
}

/**
 * Berekent de prijs voor één configuratie.
 *
 * De twee contexten zijn hier fysiek gescheiden: in de publieke tak bestaat de
 * variabele `aannemersmarge` niet, in de aannemerstak bestaat de publieke
 * consumentenopslag niet.
 */
export function berekenPrijs(invoer: PrijsInvoer, opties: PrijsOpties): Prijs {
  const basis = PRIJSBASIS;
  const regels = berekenKostregels(invoer);
  const kostprijsPerStuk = regels.reduce((som, r) => som + r.bedrag, 0);
  const aantal = Math.max(1, Math.floor(invoer.configuratie.aantal));
  const toonKostprijs = opties.toonKostprijs === true;

  const rebuMarge = opties.rebuMarge ?? basis.rebuMarge;
  // Niveau 2: wat Rebu de aannemer factureert.
  const aannemersprijsPerStuk = Math.round(kostprijsPerStuk * (1 + rebuMarge));

  let klantprijsPerStuk: Eurocent;
  let aannemersmargePercentage: number | null;
  let isRichtprijs: boolean;

  if (opties.context === "publiek") {
    // Publieke tak — uitsluitend het door Rebu ingestelde consumententarief.
    // Geen enkele aannemersmarge raakt dit pad.
    klantprijsPerStuk = Math.round(kostprijsPerStuk * (1 + basis.publiekeRichtprijsOpslag));
    aannemersmargePercentage = null;
    isRichtprijs = true;
  } else {
    // Aannemerstak — niveau 3: zijn eigen marge bovenop wat hij aan Rebu betaalt.
    const marge = opties.aannemersmarge ?? basis.standaardAannemersmarge;
    klantprijsPerStuk = Math.round(aannemersprijsPerStuk * (1 + marge));
    aannemersmargePercentage = Math.round(marge * 1000) / 10;
    isRichtprijs = false;
  }

  const klantprijsTotaal = klantprijsPerStuk * aantal;
  const aannemersprijsTotaal = aannemersprijsPerStuk * aantal;
  const btw = (bedrag: number) => Math.round((bedrag * basis.btwPercentage) / 100);

  return {
    context: opties.context,

    kostprijsPerStuk: toonKostprijs ? kostprijsPerStuk : null,
    kostprijsTotaal: toonKostprijs ? kostprijsPerStuk * aantal : null,
    rebuMargePercentage: toonKostprijs ? Math.round(rebuMarge * 1000) / 10 : null,

    // De aannemersprijs is in de publieke context niet van toepassing: een
    // particulier koopt niet bij Rebu in.
    aannemersprijsPerStuk: opties.context === "aannemer" ? aannemersprijsPerStuk : null,
    aannemersprijsTotaal: opties.context === "aannemer" ? aannemersprijsTotaal : null,
    aannemersprijsBtw: opties.context === "aannemer" ? btw(aannemersprijsTotaal) : null,
    aannemersprijsTotaalInclBtw:
      opties.context === "aannemer" ? aannemersprijsTotaal + btw(aannemersprijsTotaal) : null,

    klantprijsPerStuk,
    klantprijsTotaal,
    btwBedrag: btw(klantprijsTotaal),
    klantprijsTotaalInclBtw: klantprijsTotaal + btw(klantprijsTotaal),
    btwPercentage: basis.btwPercentage,

    aannemersmargePercentage,
    aannemersmargeBedrag:
      aannemersmargePercentage === null ? null : klantprijsTotaal - aannemersprijsTotaal,

    // De opbouw draagt bedragen alleen wanneer de kostprijs vrijgegeven is.
    regels: toonKostprijs ? regels : regels.map((r) => ({ omschrijving: r.omschrijving, bedrag: 0 })),
    isRichtprijs,
  };
}

/** Formatteert eurocenten als '€ 1.234,56'. */
export function euroTekst(centen: Eurocent): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(centen / 100);
}
