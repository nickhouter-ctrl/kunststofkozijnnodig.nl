export const site = {
  name: "Kunststofkozijnnodig.nl",
  tagline: "Scherpe prijzen. Snelle levering.",
  description:
    "Kunststofkozijnnodig.nl levert en plaatst hoogwaardige kunststof kozijnen, deuren en schuifpuien. Binnen 4 weken geleverd, scherpe prijzen en persoonlijk advies van vakmensen.",
  url: "https://kunststofkozijnnodig.nl",
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
    { title: "Binnen 4 weken geleverd", description: "Korte levertijden dankzij eigen voorraad en directe lijnen met de fabriek." },
    { title: "Maatwerk voor elk project", description: "Van renovatie tot nieuwbouw — elk kozijn precies op maat." },
    { title: "Scherpe prijs, hoge kwaliteit", description: "Duitse topmerken zoals Schüco, Aluplast en Gealan tegen eerlijke prijzen." },
    { title: "SKG 2-ster gecertificeerd", description: "Inbraakwerend volgens Politiekeurmerk — upgrade naar SKG 3 mogelijk." },
  ],
  brands: [
    { name: "Schüco", logo: "/images/merk-schuco.jpg" },
    { name: "Aluplast", logo: "/images/merk-aluplast.jpg" },
    { name: "Gealan", logo: "/images/merk-gealan.jpg" },
  ],
} as const;

export const nav = [
  { label: "Particulier", href: "/particulier" },
  { label: "Zakelijk", href: "/zakelijk" },
  { label: "Producten", href: "/producten" },
  { label: "Projecten", href: "/projecten" },
  { label: "Prijzen", href: "/prijzen" },
  { label: "Besparing", href: "/besparing" },
  { label: "FAQ", href: "/veelgestelde-vragen" },
  { label: "Contact", href: "/contact" },
] as const;
