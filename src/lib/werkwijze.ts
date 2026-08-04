/**
 * Het zakelijke projectproces — één bron voor zowel de samenvatting op de
 * homepage als de uitgebreide versie op /zakelijk/werkwijze.
 *
 * Niet te verwarren met `workflow` in lib/content.ts: dat is het montageproces
 * (glaslatten, spouwlatten, compriband, PUR) dat op /particulier hoort. Daar
 * meten wij wél zelf in; bij een projectlevering levert de opdrachtgever de
 * tekening aan.
 *
 * Het proces zoals Nick het beschrijft: klant mailt een tekening, wij werken
 * die uit tot een detailtekening met alle specificaties, die gaat terug ter
 * controle, en na akkoord leveren wij binnen vier weken.
 */

export type Fase = {
  fase: string;
  titel: string;
  /** Korte typering; géén doorlooptijd tenzij die echt is vastgelegd. */
  duur: string;
  body: string;
  /** Wat de opdrachtgever aan het eind van deze fase in handen heeft. */
  levert: string[];
};

export const fases: Fase[] = [
  {
    fase: "01",
    titel: "U mailt uw tekening",
    duur: "Uw tekening is het startpunt",
    body: "U stuurt uw tekening per e-mail. Een bestektekening, een gevelaanzicht of een overzicht van de gevelopeningen — wat u heeft. Wij hebben in dit stadium geen volledig uitgewerkt technisch dossier nodig.",
    levert: ["Beoordeling van uw tekening", "Advies over het passende profielsysteem"],
  },
  {
    fase: "02",
    titel: "Wij maken de detailtekening",
    duur: "Volledig uitgewerkt",
    body: "Wij werken uw tekening uit tot een gedetailleerde productietekening met alle specificaties erin: maatvoering per element, profielsysteem, beglazing, kleurstelling, draairichtingen en beslag. Dit is de tekening waarop straks geproduceerd wordt.",
    levert: [
      "Detailtekening met maatvoering per element",
      "Volledige specificatie: profiel, glas, kleur, beslag",
    ],
  },
  {
    fase: "03",
    titel: "U controleert en geeft akkoord",
    duur: "U heeft het laatste woord",
    body: "De detailtekening gaat terug naar u. U controleert of alles klopt met uw project en geeft akkoord — of u geeft aan wat er anders moet, dan passen wij het aan. Er wordt niets geproduceerd voordat u akkoord bent.",
    levert: ["Tekening ter controle", "Aanpassingen tot het klopt"],
  },
  {
    fase: "04",
    titel: "Levering binnen vier weken",
    duur: "4 weken na akkoord",
    body: "Zodra uw akkoord binnen is gaat het in productie en leveren wij binnen vier weken. Het marktgemiddelde ligt op acht tot twaalf weken, dus u kunt uw planning hierop bouwen.",
    levert: ["Levering binnen 4 weken na akkoord", "Levering door heel Nederland"],
  },
];
