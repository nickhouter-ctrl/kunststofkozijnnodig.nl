export const site = {
  name: "Kunststofkozijnnodig.nl",
  tagline: "Uw zakelijke partner in kunststof kozijnen",
  description:
    "Kunststofkozijnnodig.nl is de projectleverancier van kunststof kozijnen, deuren en schuifpuien voor aannemers, VvE's, woningcorporaties en projectontwikkelaars. Vaste projectprijzen, betrouwbare planning en levering door heel Nederland.",
  url: "https://www.kunststofkozijnnodig.nl",
  locale: "nl-NL",
  address: {
    street: "Samsonweg 26F",
    postalCode: "1521 RM",
    city: "Wormerveer",
    country: "Nederland",
  },
  phone: "+31 6 58 86 60 70",
  phoneHref: "tel:+31658866070",
  whatsapp: "https://wa.me/31658866070",
  email: "info@kunststofkozijnnodig.nl",
  emailHref: "mailto:info@kunststofkozijnnodig.nl",
  kvk: "42075957",
  btw: "NL869595313B01",
  iban: "NL69 INGB 0119 2791 93",
  social: {
    // Instagram/Facebook/LinkedIn stonden nog op de Rebu-profielen; teruggezet
    // zodra het nieuwe bedrijf eigen accounts heeft.
    whatsapp: "https://wa.me/31658866070",
  },
  hours: [
    { day: "Maandag – Vrijdag", time: "08:00 – 17:00" },
    { day: "Zaterdag", time: "Op afspraak" },
    { day: "Zondag", time: "Gesloten" },
  ],
  usps: [
    { title: "Vaste projectprijzen", description: "Eén heldere prijs per project — scherp gecalculeerd, zonder verrassingen achteraf." },
    { title: "Betrouwbare planning", description: "Voorspelbare levertijden zodat uw bouwplanning blijft staan." },
    { title: "Levering door heel NL", description: "Van losse posten tot complete gevelpakketten, op locatie geleverd." },
    { title: "Duitse topmerken", description: "Schüco, Aluplast, Gealan en K-Vision — SKG-gecertificeerd en onderhoudsvrij." },
  ],
  // Zakelijke doelgroepen — de kern van de positionering.
  // Verwijst naar de doelgroeppagina's onder /zakelijk; houd de slugs gelijk
  // aan die in lib/segments.ts.
  audiences: [
    {
      title: "Aannemers",
      body: "Projectlevering met vaste prijzen en een leverdatum die vastligt, zodat uw stelploeg niet voor niets staat ingepland.",
      href: "/zakelijk/aannemers",
    },
    {
      title: "VvE's",
      body: "Een offerte die per woning is uitgesplitst, zodat het bestuur de ledenvergadering kan laten zien wat een lid bijdraagt.",
      href: "/zakelijk/vve",
    },
    {
      title: "Woningcorporaties",
      body: "Verduurzaming in bewoonde staat, met isolatiewaarden die de labelstap daadwerkelijk onderbouwen.",
      href: "/zakelijk/woningcorporaties",
    },
    {
      title: "Projectontwikkelaars",
      body: "Meedenken in de calculatiefase, zodat de kozijnpost realistisch in de begroting staat voordat die vastligt.",
      href: "/zakelijk/projectontwikkelaars",
    },
  ],
  // Kengetallen voor de vertrouwensstrook.
  stats: [
    { value: "15.000+", label: "Kozijnen per jaar geleverd" },
    { value: "4 wk", label: "Gemiddelde levertijd" },
    { value: "100%", label: "SKG-gecertificeerd" },
    { value: "NL", label: "Levering door heel Nederland" },
  ],
  brands: [
    { name: "Schüco", logo: "/images/merk-schuco.jpg" },
    { name: "Aluplast", logo: "/images/merk-aluplast.jpg" },
    { name: "Gealan", logo: "/images/merk-gealan.jpg" },
  ],
} as const;

export const nav = [
  { label: "Zakelijk", href: "/zakelijk" },
  { label: "Producten", href: "/producten" },
  { label: "Merken", href: "/merken" },
  { label: "Projecten", href: "/projecten" },
  { label: "Prijzen", href: "/prijzen" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Contact", href: "/contact" },
] as const;
