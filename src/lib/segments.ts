/**
 * Zakelijke doelgroepen.
 *
 * De inhoud beschrijft onze werkwijze en is afgeleid van wat elders op de site
 * al staat (levertijd, garantie, certificering). Commerciële condities —
 * betaaltermijnen, staffels, kredietlimieten — staan hier bewust NIET in:
 * die zijn nergens vastgelegd en horen niet verzonnen te worden. Zie
 * `openstaandeCondities` in /zakelijk/voorwaarden.
 */

export type Segment = {
  slug: string;
  naam: string;
  /** Meervoud zoals het in een zin loopt: "voor {aanhef}". */
  aanhef: string;
  kicker: string;
  intro: string;
  /** Waar deze doelgroep in de praktijk tegenaan loopt. */
  knelpunten: { titel: string; body: string }[];
  /** Wat wij daar concreet tegenover zetten. */
  aanpak: { titel: string; body: string }[];
  /** Korte feitelijke punten voor de zijbalk. */
  feiten: string[];
};

export const segments: Segment[] = [
  {
    slug: "aannemers",
    naam: "Aannemers",
    aanhef: "aannemers",
    kicker: "Levering die uw planning respecteert",
    intro:
      "Voor een aannemer is een kozijn zelden het probleem — de planning is dat. Een levering die twee weken schuift betekent stilstand voor de stelploeg, uitloop richting de opdrachtgever en een discussie over meerwerk. Wij werken daarom met een vaste levertijd en een opnameverslag waarop u kunt bouwen.",
    knelpunten: [
      {
        titel: "Levertijden die verschuiven",
        body: "Het marktgemiddelde ligt op 8 tot 12 weken en schuift regelmatig door. Uw stelploeg staat ingepland en kan niet verzet worden.",
      },
      {
        titel: "Maatvoering die niet klopt",
        body: "Een kozijn dat 5 mm afwijkt kost een dag inmeten, aanpassen en opnieuw stellen — en de discussie over wie dat betaalt.",
      },
      {
        titel: "Prijzen die tijdens het project bewegen",
        body: "Een offerte die halverwege wordt herzien maakt uw calculatie richting de opdrachtgever waardeloos.",
      },
    ],
    aanpak: [
      {
        titel: "Vier weken na opname",
        body: "Onze standaard levertijd is vier weken na opname, tegen een marktgemiddelde van acht tot twaalf. Die datum leggen wij vast bij de opdrachtbevestiging.",
      },
      {
        titel: "Wij nemen zelf op",
        body: "De maatvoering komt van ons, niet uit uw tekening. Daarmee ligt de verantwoordelijkheid voor de maat waar hij hoort — bij de leverancier.",
      },
      {
        titel: "Vaste projectprijs",
        body: "De prijs in de projectofferte is de prijs op de factuur. Geen indexering tussentijds, geen toeslagen achteraf.",
      },
      {
        titel: "Levering op afroep",
        body: "Bij een project in fases leveren wij per bouwdeel, zodat u niet de hele partij hoeft op te slaan op de bouwplaats.",
      },
    ],
    feiten: [
      "Levertijd 4 weken na opname",
      "Opname en maatvoering door ons",
      "Vaste projectprijs, geen tussentijdse indexering",
      "Levering op afroep per bouwdeel",
    ],
  },
  {
    slug: "vve",
    naam: "VvE's",
    aanhef: "VvE's",
    kicker: "Een traject dat de ledenvergadering doorstaat",
    intro:
      "Bij een VvE is de techniek meestal het makkelijkste deel. Het lastige is het besluit: een bestuur moet een voorstel voorleggen dat leden begrijpen, dat binnen de meerjarenonderhoudsbegroting past en waarover niet halverwege discussie ontstaat. Wij leveren daarom een offerte die per woning is uit te splitsen.",
    knelpunten: [
      {
        titel: "Het besluit duurt langer dan het werk",
        body: "Tussen eerste oriëntatie en akkoord van de ledenvergadering zit vaak een jaar. Een offerte van zes maanden oud is dan waardeloos.",
      },
      {
        titel: "Leden willen weten wat het hén kost",
        body: "Een totaalbedrag voor het hele complex zegt een individueel lid niets. Zonder uitsplitsing per woning komt er geen akkoord.",
      },
      {
        titel: "Bewoners blijven wonen tijdens de uitvoering",
        body: "Anders dan bij nieuwbouw wordt er gewerkt in bewoonde woningen. Dat vraagt planning per woning en communicatie vooraf.",
      },
    ],
    aanpak: [
      {
        titel: "Offerte per woning uitgesplitst",
        body: "U krijgt het totaalbedrag én de verdeling per woningtype, zodat het bestuur direct kan laten zien wat een lid bijdraagt.",
      },
      {
        titel: "Planning per woning",
        body: "Wij plannen per woning in plaats van per complex, met een vaste dag per bewoner. Kozijnen gaan er dezelfde dag uit en in.",
      },
      {
        titel: "Aansluiting op de MJOP",
        body: "Wij leveren de gegevens die uw beheerder nodig heeft om de vervanging in de meerjarenonderhoudsbegroting te verwerken: levensduur, garantietermijnen en onderhoudsbehoefte.",
      },
      {
        titel: "Toelichting op de vergadering",
        body: "Op verzoek komen wij het voorstel toelichten aan de ledenvergadering en de vragen van bewoners beantwoorden.",
      },
    ],
    feiten: [
      "Offerte uitgesplitst per woning",
      "Planning per woning, niet per complex",
      "Gegevens voor de MJOP",
      "Toelichting op de ledenvergadering",
    ],
  },
  {
    slug: "woningcorporaties",
    naam: "Woningcorporaties",
    aanhef: "woningcorporaties",
    kicker: "Verduurzaming in bewoonde staat",
    intro:
      "Corporaties vervangen kozijnen zelden om het kozijn zelf. Het gaat om een labelstap, om de verduurzamingsopgave en om onderhoudslasten die over dertig jaar worden gerekend. Dat vraagt een leverancier die kan onderbouwen wat een systeem daadwerkelijk doet met de U-waarde, en die kan werken in bewoonde woningen.",
    knelpunten: [
      {
        titel: "De labelstap moet aantoonbaar zijn",
        body: "Een kozijn dat 'goed isoleert' is geen onderbouwing. Voor de labelberekening zijn harde Uf- en Uw-waarden nodig per toegepast systeem.",
      },
      {
        titel: "Bewoners blijven zitten",
        body: "Werken in bewoonde staat stelt eisen aan doorlooptijd per woning, aan communicatie en aan het beperken van overlast.",
      },
      {
        titel: "Onderhoudslasten over de hele levensduur",
        body: "De inkoopprijs is maar een deel van de rekening. Wat telt is wat het onderhoud over dertig jaar kost.",
      },
    ],
    aanpak: [
      {
        titel: "Onderbouwde isolatiewaarden per systeem",
        body: "Wij leveren de Uf-waarde van het toegepaste profiel en rekenen de Uw-waarde door voor uw werkelijke element- en glasmaten — niet een algemeen systeemcijfer.",
      },
      {
        titel: "Keuze uit vier profielsystemen",
        body: "Wij zijn niet aan één fabrikant gebonden. Vraagt de opgave om een scherpe Uf-waarde, dan kiezen wij daarop; vraagt hij om een specifiek gevelbeeld, dan daarop.",
      },
      {
        titel: "Uitvoering per woning ingepland",
        body: "Kozijnen gaan er dezelfde dag uit en in, zodat de woning 's avonds weer dicht is.",
      },
      {
        titel: "Onderhoudsvrij over de levensduur",
        body: "Kunststof kozijnen hoeven niet geschilderd te worden. Waar een houten kozijn elke vijf tot zeven jaar schilderwerk vraagt, vervalt die post volledig.",
      },
    ],
    feiten: [
      "Uw-waarde doorgerekend op werkelijke maten",
      "Vier profielsystemen om uit te kiezen",
      "Uitvoering in bewoonde staat",
      "Geen schilderonderhoud over de levensduur",
    ],
  },
  {
    slug: "projectontwikkelaars",
    naam: "Projectontwikkelaars",
    aanhef: "projectontwikkelaars",
    kicker: "Van calculatiefase tot oplevering",
    intro:
      "Een ontwikkelaar heeft in de calculatiefase een prijs nodig die standhoudt, en in de uitvoeringsfase een leverancier die de BENG-onderbouwing kan aanleveren. Wij stappen daarom in bij de calculatie in plaats van pas bij de inkoop, zodat de kozijnpost realistisch in de begroting staat.",
    knelpunten: [
      {
        titel: "De kozijnpost in de calculatie is een schatting",
        body: "Wordt die te laag ingeschat, dan drukt het verschil op de marge zodra het echte werk wordt ingekocht.",
      },
      {
        titel: "BENG-onderbouwing komt te laat",
        body: "Als de energieprestatie pas bij de vergunningaanvraag wordt doorgerekend, blijkt soms dat het gekozen systeem niet voldoet.",
      },
      {
        titel: "Fasering over meerdere blokken",
        body: "Bij een project in fases moet de levering meebewegen met de bouwstroom, zonder dat de prijs per fase verschilt.",
      },
    ],
    aanpak: [
      {
        titel: "Meedenken in de calculatiefase",
        body: "Wij geven op basis van de gevelopeningen een realistische kozijnpost af voordat de begroting vastligt.",
      },
      {
        titel: "Systeemkeuze op de energieprestatie",
        body: "Voor een scherpe BENG-eis rekenen wij door welk profielsysteem de vereiste waarde haalt — voordat het bestek definitief is.",
      },
      {
        titel: "Eén prijs over alle fases",
        body: "Bij gefaseerde oplevering geldt dezelfde prijs voor blok één als voor het laatste blok.",
      },
      {
        titel: "Levering per bouwstroom",
        body: "Wij leveren mee met uw fasering in plaats van in één keer, zodat er geen opslagprobleem op de bouwplaats ontstaat.",
      },
    ],
    feiten: [
      "Kozijnpost al in de calculatiefase",
      "Systeemkeuze op de BENG-eis",
      "Eén prijs over alle fases",
      "Levering per bouwstroom",
    ],
  },
];

export function getSegment(slug: string): Segment | undefined {
  return segments.find((s) => s.slug === slug);
}
