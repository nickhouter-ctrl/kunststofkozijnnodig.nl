/**
 * Profielmerken die wij leveren.
 *
 * De specificaties komen van de officiële fabrikantendocumentatie (zie `bron`
 * per merk). Waar onze eigen catalogusdata uit EKO4U afwijkt van de algemene
 * systeemmaat staat dat expliciet bij `nlUitvoering`: de Duitse systeemmaat is
 * de bouwdiepte van het basissysteem, het Nederlandse kozijnprofiel is dieper.
 * Zie PROFIELGEGEVENS-EKO4U.md.
 *
 * Voeg hier geen waarden toe die niet uit een van beide bronnen komen.
 */

export type SpecRow = {
  label: string;
  value: string;
  /** Korte toelichting voor de zakelijke lezer. */
  note?: string;
};

export type Brand = {
  slug: string;
  name: string;
  /** Naam van het profielsysteem dat wij standaard voeren. */
  systeem: string;
  land: string;
  /** Null wanneer wij (nog) geen logo van dit merk hebben; de kaart valt dan terug op tekst. */
  logo: string | null;
  /** Eén zin die het merk positioneert. */
  kicker: string;
  intro: string;
  /** Waarom een zakelijke opdrachtgever hiervoor kiest. */
  sterkte: string[];
  specs: SpecRow[];
  /** Afwijkende maten van het Nederlandse kozijnprofiel, indien bekend. */
  nlUitvoering?: string;
  /** Waar dit systeem het beste tot zijn recht komt. */
  toepassing: string[];
  bron: string;
};

export const brands: Brand[] = [
  {
    slug: "aluplast",
    name: "Aluplast",
    systeem: "IDEAL 7000",
    land: "Duitsland",
    logo: "/images/merk-aluplast.jpg",
    kicker: "Ons standaardsysteem voor nieuwbouw en renovatie",
    intro:
      "Aluplast is een Duitse profielfabrikant uit Karlsruhe en levert met de IDEAL-serie het systeem dat wij op de meeste projecten inzetten. De IDEAL 7000 combineert een bouwdiepte van 85 mm met een 6-kamerprofiel, wat een gunstige verhouding geeft tussen isolatiewaarde, stabiliteit en prijs. Voor projecten waar de kozijnen in het zicht blijven is er het NL-blokprofiel met de klassieke Nederlandse aanslag.",
    sterkte: [
      "Breed leverbaar, waardoor levertijden voorspelbaar blijven bij grotere series",
      "Zowel vlak als verdiept (NL-blokprofiel) uit hetzelfde systeem",
      "aluskin® aluminium schalen mogelijk voor een aluminium aanzicht aan de buitenzijde",
      "Geluidsisolatie tot 46 dB haalbaar — relevant bij projecten aan drukke wegen",
    ],
    specs: [
      { label: "Bouwdiepte", value: "85 mm", note: "basissysteem, kozijn en vleugel" },
      { label: "Kamers", value: "6-kamerprofiel" },
      { label: "Uf-waarde", value: "1,1 W/m²K" },
      {
        label: "Uw-waarde",
        value: "0,86 W/m²K",
        note: "met standaard triple beglazing Ug 0,6; tot 0,70 met Ug 0,4",
      },
      { label: "Beglazing", value: "tot 51 mm" },
      { label: "Inbraakwerendheid", value: "tot RC2" },
      { label: "Geluidsisolatie", value: "tot 46 dB", note: "geluidsklasse 4" },
    ],
    nlUitvoering:
      "Het NL-blokprofiel met aanslag heeft een kozijndiepte van 120 mm in plaats van de 85 mm van het basissysteem, en neemt beglazing tot 41 mm op. Bij dezelfde kader hoort zowel een raamvleugel van 77 mm als een zware deurvleugel van 96 mm.",
    toepassing: [
      "Seriematige nieuwbouw waar prijs en levertijd doorslaggevend zijn",
      "Renovatieprojecten met een klassiek gevelbeeld (NL-blokprofiel)",
      "Projecten met een geluidseis aan de gevel",
    ],
    bron: "aluplast.net",
  },
  {
    slug: "gealan",
    name: "Gealan",
    systeem: "S 9000",
    land: "Duitsland",
    logo: "/images/merk-gealan.jpg",
    kicker: "De hoogste isolatiewaarde van ons assortiment",
    intro:
      "Gealan is onderdeel van de VEKA-groep en levert met de S 9000 een systeemplatform waarop ramen, deuren en hefschuifpuien in één profielfamilie te maken zijn. Met een Uf-waarde tot 0,89 W/m²K is dit het sterkste systeem dat wij voeren op het gebied van thermische isolatie — passiefhuisgeschikt met standaardprofielen.",
    sterkte: [
      "Uf tot 0,89 W/m²K — passiefhuisgeschikt zonder speciale profielen",
      "Ramen, deuren en hefschuifpuien uit één systeemplatform",
      "Afdichtingsconcept met tot drie niveaus",
      "Neemt triple beglazing tot 56 mm op, met STV®-lijmtechniek tot 58 mm",
    ],
    specs: [
      { label: "Bouwdiepte", value: "82,5 mm", note: "systeemmaat" },
      { label: "Kamers", value: "6-kamer (ramen), 5-kamer (deuren)" },
      { label: "Uf-waarde", value: "tot 0,89 W/m²K" },
      { label: "Afdichting", value: "tot 3 niveaus" },
      { label: "Beglazing", value: "tot 56 mm", note: "tot 58 mm met STV®" },
      { label: "Varianten", value: "FUTURA®, LUMAXX®" },
    ],
    nlUitvoering:
      "Het Nederlandse S 9000 NL Base-kozijnprofiel is 120 mm diep in plaats van de 82,5 mm systeemmaat, met een zichtbreedte van 66 mm en een afschuining van 15° aan de buitenzijde.",
    toepassing: [
      "Projecten met een scherpe EPC- of BENG-eis",
      "Passiefhuis- en nul-op-de-meterprojecten",
      "Hefschuifpuien in combinatie met ramen uit hetzelfde systeem",
    ],
    bron: "gealan.de",
  },
  {
    slug: "schuco",
    name: "Schüco",
    systeem: "LivIng 82",
    land: "Duitsland",
    logo: "/images/merk-schuco.jpg",
    kicker: "Zeven kamers en een keuze in afdichtingsprincipe",
    intro:
      "Schüco is in Nederland vooral bekend van aluminium gevels, maar levert met LivIng ook een kunststof profielsysteem. Het onderscheidt zich met een 7-kamerprofiel en het zogeheten Twin-System: hetzelfde systeem is uit te voeren met aanslagdichting of met middendichting. Die keuze bepaalt de isolatiewaarde en maakt het systeem geschikt voor uiteenlopende eisen.",
    sterkte: [
      "7-kamerprofiel — het meeste aantal kamers in ons assortiment",
      "Twin-System: aanslagdichting én middendichting uit één systeem",
      "Met middendichting ift-gecertificeerd passiefhuisgeschikt",
      "Sterke merkherkenning richting opdrachtgevers en architecten",
    ],
    specs: [
      { label: "Bouwdiepte", value: "82 mm" },
      { label: "Kamers", value: "7-kamerprofiel" },
      {
        label: "Uf-waarde",
        value: "tot 0,96 W/m²K",
        note: "aanslagdichting, 2 afdichtingsniveaus",
      },
      {
        label: "Uf-waarde (middendichting)",
        value: "tot 0,79 W/m²K",
        note: "3 afdichtingsniveaus, passiefhuisgeschikt",
      },
      { label: "Beglazing", value: "16 – 54 mm" },
      { label: "Afdichting", value: "Twin-System" },
    ],
    toepassing: [
      "Projecten waar de architect een specifiek merk voorschrijft",
      "Utiliteitsbouw en hoogwaardige woningbouw",
      "Situaties waarin per gevel een ander afdichtingsprincipe gewenst is",
    ],
    bron: "schueco.com",
  },
  {
    slug: "k-vision",
    name: "K-Vision",
    systeem: "Kömmerling K-VISION",
    land: "Duitsland",
    // K-VISION is een systeemnaam van Kömmerling en heeft geen eigen beeldmerk;
    // dit is het corporate logo van Kömmerling zelf.
    logo: "/images/merk-kommerling.jpg",
    kicker: "Speciaal ontworpen voor de Nederlandse markt",
    intro:
      "K-VISION is het systeem dat Kömmerling (onderdeel van de profine-groep) specifiek voor de Nederlandse markt heeft ontwikkeld. Waar andere systemen een Duitse basis hebben die voor Nederland wordt aangepast, is dit systeem vanaf de tekentafel op het Nederlandse gevelbeeld ontworpen — inclusief de karakteristieke overslagschuinte van 15°. Het kozijn is 120 mm diep, de vleugel 76 mm.",
    sterkte: [
      "Vanaf de basis voor de Nederlandse markt ontworpen, geen aangepast Duits profiel",
      "Karakteristieke 15° overslagschuinte die aansluit op het Nederlandse gevelbeeld",
      "Grotere vleugeldiepte van 76 mm werkt gunstig voor geluid en isolatie",
      "Gebouwd op de beproefde Kömmerling 76-techniek",
    ],
    specs: [
      { label: "Bouwdiepte kozijn", value: "120 mm" },
      { label: "Bouwdiepte vleugel", value: "76 mm" },
      { label: "Kamers", value: "5-kamertechnologie" },
      { label: "Uf-waarde", value: "1,4 W/m²K", note: "standaard" },
      { label: "Uf-waarde (thermostaal)", value: "1,0 W/m²K" },
      { label: "Beglazing", value: "16 – 50 mm" },
      { label: "Afdichting", value: "aanslagdichting" },
    ],
    toepassing: [
      "Renovatie waar het gevelbeeld exact moet aansluiten op het bestaande",
      "Woningbouwprojecten met een traditioneel Nederlands kozijnbeeld",
      "Projecten waar de 15° schuinte in het bestek staat",
    ],
    bron: "koemmerling.com",
  },
];

export function getBrand(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}
