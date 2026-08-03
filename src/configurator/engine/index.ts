/**
 * De centrale doorrekening.
 *
 * Regel 1 uit het functioneel ontwerp — single source of truth — betekent in
 * code dat er precies één functie is die van een configuratie een volledig
 * resultaat maakt. Configurator, 3D-weergave, offerte, tekening, fabrieksorder,
 * order-lock en facturatie lezen allemaal uit de uitkomst van `bereken()`.
 * Geen enkele module rekent zelf iets na.
 */
import { profielOpId } from "../data/profielen";
import {
  STANDAARD_AFSTANDSHOUDER,
  afstandshouderOpId,
  afkitoptieOpId,
  beslagOpId,
  dorpelOpId,
  glastypeOpId,
  hortypeOpId,
  muuraansluitingOpId,
} from "../data/onderdelen";
import { kleurOpId } from "../data/kleuren";
import { berekenCilindermaat, berekenVakken } from "./maten";
import { evalueerRegels, heeftBlokkade } from "./regels";
import { berekenPrijs, type PrijsOpties } from "./prijs";
import type { Berekening, Configuratie } from "../types";

export class OnbekendProfielFout extends Error {
  constructor(profielId: string) {
    super(`Profiel '${profielId}' staat niet in de productdatabase`);
    this.name = "OnbekendProfielFout";
  }
}

/**
 * Rekent één configuratie volledig door: maten, regels en prijs.
 *
 * Werpt alleen wanneer het profiel onbekend is — dat is een programmeerfout,
 * geen gebruikersfout. Alle gebruikersfouten komen terug als bevindingen, zodat
 * de configurator ze als pop-up kan tonen in plaats van vast te lopen.
 */
export function bereken(configuratie: Configuratie, prijsOpties: PrijsOpties): Berekening {
  const profiel = profielOpId(configuratie.profielId);
  if (!profiel) throw new OnbekendProfielFout(configuratie.profielId);

  // Glas wordt óók opgezocht wanneer het niet wordt meegeleverd: het glastype
  // bepaalt dan nog steeds het gewicht en de controles, alleen niet de prijs.
  const glastype = glastypeOpId(configuratie.glas.glastypeId);
  const afstandshouder =
    afstandshouderOpId(configuratie.glas.afstandshouderId) ?? STANDAARD_AFSTANDSHOUDER;
  const beslag = beslagOpId(configuratie.beslag.beslagId);
  const hortype = hortypeOpId(configuratie.hortypeId);
  const dorpel = dorpelOpId(configuratie.dorpelId);
  const muuraansluiting = muuraansluitingOpId(configuratie.muuraansluitingId);
  const afkitoptie = afkitoptieOpId(configuratie.afkitoptieId);
  const kleurBinnen = kleurOpId(configuratie.kleurBinnenId);
  const kleurBuiten = kleurOpId(configuratie.kleurBuitenId);
  // Geen eigen vleugelkleur gekozen? Dan is de vleugel simpelweg het kader.
  const vleugelKleurBinnen = kleurOpId(configuratie.vleugelKleurBinnenId) ?? kleurBinnen;
  const vleugelKleurBuiten = kleurOpId(configuratie.vleugelKleurBuitenId) ?? kleurBuiten;

  // Maten. Deze stap kan niet falen op gebruikersinvoer — hij levert altijd een
  // volledig gevulde maatset op, ook bij een onmogelijke configuratie. Zo is er
  // altijd iets te tonen naast de foutmelding (regel 2).
  const vakken = berekenVakken(configuratie, profiel, glastype);
  const cilindermaat = berekenCilindermaat(configuratie, profiel, beslag);

  const totaalGlasOppervlakM2 =
    Math.round(vakken.reduce((som, v) => som + v.glasOppervlakM2, 0) * 1000) / 1000;
  const totaalGlasGewichtKg =
    glastype === null
      ? null
      : Math.round(vakken.reduce((som, v) => som + (v.glasGewichtKg ?? 0), 0) * 10) / 10;
  const kozijnOppervlakM2 =
    Math.round(((configuratie.breedte * configuratie.hoogte) / 1_000_000) * 1000) / 1000;

  const staalversterkingVerplicht = vakken.some(
    (v) => v.vleugelOppervlakM2 > profiel.grenzen.staalversterkingVanafM2.waarde
  );

  const bevindingen = evalueerRegels({
    configuratie,
    profiel,
    glastype,
    vakken,
    totaalGlasGewichtKg,
  });

  const prijs = berekenPrijs(
    {
      configuratie,
      profiel,
      glastype,
      afstandshouder,
      beslag,
      hortype,
      dorpel,
      muuraansluiting,
      afkitoptie,
      kleurBinnen,
      kleurBuiten,
      vakken,
      staalversterkingVerplicht,
    },
    prijsOpties
  );

  return {
    configuratie,
    profiel,
    glastype,
    afstandshouder,
    beslag,
    hortype,
    dorpel,
    muuraansluiting,
    afkitoptie,
    kleurBinnen,
    kleurBuiten,
    vleugelKleurBinnen,
    vleugelKleurBuiten,
    vakken,
    cilindermaat,
    totaalGlasOppervlakM2,
    totaalGlasGewichtKg,
    kozijnOppervlakM2,
    staalversterkingVerplicht,
    bevindingen,
    blokkeert: heeftBlokkade(bevindingen),
    prijs,
  };
}

export { berekenCilindermaat, berekenGeometrie, berekenVakken, verdeelBreedte } from "./maten";
export { cilindermaatTekst, glasmaatTekst, hormaatTekst, skgAdvies } from "./maten";
export { evalueerRegels, heeftBlokkade, heeftEscalatie, REGEL_IDS } from "./regels";
export { berekenPrijs, euroTekst } from "./prijs";
