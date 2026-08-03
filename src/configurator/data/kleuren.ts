/**
 * Kleurdata, ingelezen uit de drie kleurencatalogi van kunststofkozijnnodig.nl.
 * Het JSON-bestand wordt gegenereerd door scripts/extract-kleuren.mjs.
 */
import bestand from "./kleuren.json";
import type { Kleur, MerkId } from "../types";

/**
 * De twee basiskleuren waarin het profiel zelf geëxtrudeerd wordt: wit RAL 9016
 * en crèmewit RAL 9001. Daar zit geen folie op — de kleur zit in het materiaal.
 * Ze staan niet in de foliecatalogi (die gaan over folies) maar zijn wél de
 * standaard: verreweg de meeste kozijnen worden hierin geleverd, en ze zijn het
 * snelst leverbaar en het goedkoopst.
 */
const BASISKLEUREN: Kleur[] = (["aluplast", "gealan", "kommerling"] as MerkId[]).flatMap((merk) => {
  const merkLabel = { aluplast: "Aluplast", gealan: "Gealan", kommerling: "Kömmerling" }[merk];
  return [
    {
      id: `${merk}:basis-9016`,
      merk,
      merkLabel,
      code: "RAL 9016",
      naam: "Wit (zonder folie)",
      ral: "RAL 9016",
      structuur: "Glad, ongefolied",
      oppervlak: "glad",
      houtnerf: false,
      familie: "wit",
      groep: "effen",
      leverancierscode: null,
      catalogusgroep: null,
      swatch: null,
      hex: "#f2f2ef",
    },
    {
      id: `${merk}:basis-9001`,
      merk,
      merkLabel,
      code: "RAL 9001",
      naam: "Crèmewit (zonder folie)",
      ral: "RAL 9001",
      structuur: "Glad, ongefolied",
      oppervlak: "glad",
      houtnerf: false,
      familie: "wit",
      groep: "effen",
      leverancierscode: null,
      catalogusgroep: null,
      swatch: null,
      hex: "#f0eadb",
    },
  ];
});

/** De basiskleuren voorop, daarna de folies uit de catalogi. */
export const KLEUREN: Kleur[] = [...BASISKLEUREN, ...(bestand.kleuren as Kleur[])];

export function kleurOpId(id: string | null): Kleur | null {
  if (!id) return null;
  return KLEUREN.find((k) => k.id === id) ?? null;
}

/** Kleuren van één merk — een kozijn wordt in de folie van zijn eigen merk geleverd. */
export function kleurenVanMerk(merk: MerkId): Kleur[] {
  return KLEUREN.filter((k) => k.merk === merk);
}

export const GROEP_LABEL: Record<Kleur["groep"], string> = {
  effen: "Effen kleuren",
  metallic: "Metallic",
  houtlook: "Houtlook",
};

export const GROEP_VOLGORDE: Kleur["groep"][] = ["effen", "houtlook", "metallic"];

/** Leesbare omschrijving van het oppervlak, voor op het scherm en in documenten. */
export const OPPERVLAK_LABEL: Record<NonNullable<Kleur["oppervlak"]>, string> = {
  nerf: "houtnerf",
  brush: "geborsteld",
  zandstructuur: "zandstructuur",
  print: "print",
  glad: "glad",
  overig: "structuur",
};

/**
 * Korte aanduiding van het oppervlak. Geeft expliciet aan wanneer de catalogus
 * er niets over zegt, zodat 'onbekend' niet als 'geen nerf' gelezen wordt.
 */
export function oppervlakTekst(kleur: Kleur): string {
  if (kleur.structuur) return kleur.structuur;
  return "structuur niet vermeld in de catalogus";
}

/** Kleuren gegroepeerd voor de kleurselector (hoofdstuk 8.2). */
export function gegroepeerdeKleuren(merk: MerkId): { groep: Kleur["groep"]; label: string; kleuren: Kleur[] }[] {
  return GROEP_VOLGORDE.map((groep) => ({
    groep,
    label: GROEP_LABEL[groep],
    kleuren: kleurenVanMerk(merk).filter((k) => k.groep === groep),
  })).filter((g) => g.kleuren.length > 0);
}

/** Zoeken op naam of RAL-code, zoals hoofdstuk 8.2 vraagt. */
export function zoekKleuren(merk: MerkId, term: string): Kleur[] {
  const t = term.trim().toLowerCase();
  const basis = kleurenVanMerk(merk);
  if (!t) return basis;
  return basis.filter(
    (k) =>
      k.naam.toLowerCase().includes(t) ||
      (k.ral ?? "").toLowerCase().includes(t) ||
      k.code.toLowerCase().includes(t) ||
      (k.structuur ?? "").toLowerCase().includes(t)
  );
}

/**
 * De standaardkleur per merk: wit RAL 9016 zonder folie. Dat is de kleur waarin
 * het profiel zelf gemaakt wordt — geen folie, dus geen folietoeslag en de
 * kortste levertijd. Crèmewit RAL 9001 staat er direct naast.
 */
export function standaardKleur(merk: MerkId): Kleur {
  const vanMerk = kleurenVanMerk(merk);
  return (
    vanMerk.find((k) => k.id === `${merk}:basis-9016`) ??
    vanMerk.find((k) => k.familie === "wit") ??
    vanMerk[0]
  );
}

/** Is dit een basiskleur — dus het profiel zelf, zonder folie? */
export function isBasiskleur(kleur: Kleur | null): boolean {
  return kleur !== null && kleur.swatch === null && /^RAL 90(16|01)$/.test(kleur.code);
}
