export type ProductDetail = {
  slug: "kozijnen" | "deuren" | "schuifpuien";
  title: string;
  subtitle: string;
  intro: string;
  heroImage: string;
  gallery: string[];
  features: { title: string; body: string }[];
  options: { label: string; items: string[] }[];
  faqs: { q: string; a: string }[];
};

export const productDetails: Record<ProductDetail["slug"], ProductDetail> = {
  kozijnen: {
    slug: "kozijnen",
    title: "Kunststof kozijnen",
    subtitle: "Het duurzame raamwerk voor een comfortabele leefomgeving",
    intro:
      "Kunststof kozijnen zijn onderhoudsvrij, energiezuinig en naar wens vormgegeven. Of je nu een klassieke woning hebt of nieuwbouw — wij leveren kozijnen in elk profiel, kleur en maat, inclusief HR++ of triple glas.",
    heroImage: "/images/project-zaandam-1.jpg",
    gallery: [
      "/images/project-zaandam-1.jpg",
      "/images/project-zaandam-4.jpg",
      "/images/project-latten-5.webp",
      "/images/project-latten-4.webp",
      "/images/project-latten-8.webp",
    ],
    features: [
      { title: "Onderhoudsvrij", body: "Nooit meer schilderen — kunststof blijft decennia mooi." },
      { title: "Uitstekende isolatie", body: "Lagere energierekening dankzij meerkamerprofielen." },
      { title: "Inbraakwerend", body: "SKG 2-ster standaard, upgrade naar SKG 3 mogelijk." },
      { title: "Geluidsreductie", body: "Tot 45 dB stiller met triple glas en goede afdichting." },
    ],
    options: [
      {
        label: "Openingstypes",
        items: ["Vastglas", "Draaikiepraam", "Valraam", "Klepraam", "Uitzetraam"],
      },
      {
        label: "Profielen",
        items: ["Aluplast", "Schüco", "Gealan"],
      },
      { label: "Kleuren (met en zonder nerf)", items: ["Wit (9016) glad", "Crème wit (9001) glad/nerf", "Antraciet (7016) glad/nerf", "Zwart (9005) glad/nerf", "Houtlook diverse tinten (nerf)", "Grijs tinten (zilver, basalt, kwarts, venster)", "RAL kleur op maat", "Geborsteld aluminium"] },
      { label: "Glas", items: ["HR++ dubbel", "HR+++ triple", "Inbraakwerend", "Zonwerend", "Geluidsisolerend"] },
    ],
    faqs: [
      {
        q: "Hoe lang gaan kunststof kozijnen mee?",
        a: "Kwalitatieve kunststof kozijnen (zoals Aluplast, Schüco en Gealan) gaan minimaal 30 jaar mee zonder noemenswaardig onderhoud.",
      },
      {
        q: "Kan ik subsidie krijgen?",
        a: "Ja — via de ISDE-subsidie van de RVO kun je subsidie krijgen voor isolerende beglazing. Wij helpen je graag bij de aanvraag.",
      },
      {
        q: "Wat is de levertijd?",
        a: "Onze standaard levertijd is binnen 4 weken na opname. Spoed? Vraag naar onze spoedprocedure.",
      },
    ],
  },
  deuren: {
    slug: "deuren",
    title: "Kunststof deuren",
    subtitle: "De duurzame en onderhoudsvrije toegang tot jouw huis",
    intro:
      "Voordeuren, achterdeuren en openslaande deuren in kunststof — zonder verf, zonder zorgen. Warm, stil, inbraakwerend en met een uitstraling die past bij jouw woning. Uit voorraad leverbaar in de meest populaire kleuren.",
    heroImage: "/images/project-zaandam-4.jpg",
    gallery: [
      "/images/project-landsmeer.jpg",
      "/images/project-krommenie.jpg",
      "/images/project-1-7.jpg",
    ],
    features: [
      { title: "3-puntsvergrendeling", body: "Standaard op elke voordeur — extra inbraakwerend." },
      { title: "Warm en stil", body: "Massieve deurpanelen met thermisch onderbroken kern." },
      { title: "Ruime keuze", body: "Klassiek, strak, landelijk — wij hebben elke stijl." },
      { title: "Onderhoudsvrij", body: "Nooit meer schilderen of kitranden vervangen." },
    ],
    options: [
      { label: "Deurtypes", items: ["Voordeur", "Achterdeur", "Openslaande tuindeuren", "Bijzetdeur"] },
      { label: "Afwerking", items: ["Glad paneel", "Sierpaneel", "Met glas", "Met zijlicht", "Met bovenlicht"] },
      { label: "Kleuren (met en zonder nerf)", items: ["Wit (9016) glad", "Crème wit (9001) glad/nerf", "Antraciet (7016) glad/nerf", "Zwart (9005) glad/nerf", "Houtlook diverse tinten (nerf)", "Grijs tinten", "RAL kleur op maat"] },
      { label: "Hardware", items: ["RVS deurkrukken", "Lange greep", "Smart lock", "Videofoon"] },
    ],
    faqs: [
      {
        q: "Zijn de deuren inbraakwerend?",
        a: "Ja, standaard voorzien van 3-puntsvergrendeling en SKG 2-ster cilinder. Upgrade naar SKG 3 optioneel.",
      },
      {
        q: "Kunnen jullie mijn oude deur vervangen?",
        a: "Zeker — we verwijderen de oude deur, plaatsen het nieuwe kozijn en werken alles netjes af.",
      },
      {
        q: "Welke garantie krijg ik?",
        a: "10 jaar fabrieksgarantie op het profiel, 2 jaar op het beslag en 5 jaar op onze plaatsing.",
      },
    ],
  },
  schuifpuien: {
    slug: "schuifpuien",
    title: "Schuifpuien",
    subtitle: "De stijlvolle verbinding tussen binnen en buiten",
    intro:
      "Slanke profielen, groot glasoppervlak en soepele bediening — een schuifpui maakt je woonkamer ineens twee keer zo groot. Wij leveren 2-, 3- en 4-delige schuifpuien én luxe hefschuifdeuren voor het topsegment.",
    heroImage: "/images/project-landsmeer.jpg",
    gallery: [
      "/images/villa-kozijn.jpg",
      "/images/project-zaandam-3.jpg",
      "/images/project-zaandam-2.jpg",
    ],
    features: [
      { title: "Slanke profielen", body: "Maximaal glas, minimaal zichtbaar kozijn." },
      { title: "Soepel schuiven", body: "Premium beslag dat jaren probleemloos blijft lopen." },
      { title: "Drempelvrij", body: "Optionele lage drempel voor naadloze overgang naar de tuin." },
      { title: "Groot glasoppervlak", body: "Tot 3 m² glas per vleugel — meer licht, meer ruimte." },
    ],
    options: [
      { label: "Types", items: ["2-delig schuiven", "3-delig schuiven", "4-delig schuiven", "Hefschuifdeur"] },
      { label: "Profielen", items: ["Aluplast", "Schüco", "Gealan"] },
      { label: "Kleuren (met en zonder nerf)", items: ["Wit (9016) glad", "Crème wit (9001) glad/nerf", "Antraciet (7016) glad/nerf", "Zwart (9005) glad/nerf", "Houtlook diverse tinten (nerf)", "RAL kleur op maat"] },
      { label: "Opties", items: ["Verborgen rail", "Lage drempel", "Motorisch bediend", "Inbraakwerend SKG 2"] },
    ],
    faqs: [
      {
        q: "Hoe breed kan een schuifpui zijn?",
        a: "In kunststof leveren we schuifpuien tot circa 6 meter breed. Voor nog bredere openingen adviseren we aluminium.",
      },
      {
        q: "Kunnen schuifpuien ook drempelvrij?",
        a: "Ja — we leveren optioneel een verzonken rail met een overgang van slechts 2 cm. Ideaal bij rolstoel of kinderwagen.",
      },
      {
        q: "Is het veilig genoeg?",
        a: "Standaard SKG 2-ster inbraakwerend met meerpuntsvergrendeling. Upgrade naar klasse 3 mogelijk.",
      },
    ],
  },
};
