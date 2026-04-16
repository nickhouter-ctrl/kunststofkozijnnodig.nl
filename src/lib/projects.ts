export type Project = {
  slug: string;
  title: string;
  location: string;
  year: string;
  category: "Renovatie" | "Nieuwbouw" | "Levering" | "Villa";
  products: string[];
  summary: string;
  description: string;
  cover: string;
  gallery: string[];
};

export const projects: Project[] = [
  {
    slug: "complete-renovatie-zaandam",
    title: "Complete woningrenovatie Zaandam",
    location: "Zaandam",
    year: "2025",
    category: "Renovatie",
    products: ["Kozijnen", "Deuren", "Schuifpuien"],
    summary:
      "Volledige gevel vernieuwd met kunststof kozijnen in antraciet, inclusief schuifpui en voordeur.",
    description:
      "Voor deze particuliere klant in Zaandam hebben we de complete gevel vernieuwd. Alle bestaande houten kozijnen zijn vervangen door onderhoudsvrije kunststof kozijnen van Aluplast, inclusief een brede schuifpui in de achtergevel en een nieuwe voordeur. De woning is nu een stuk energiezuiniger, stiller en mooier — helemaal naar wens van de bewoners.",
    cover: "/images/project-zaandam-1.jpg",
    gallery: [
      "/images/project-zaandam-1.jpg",
      "/images/project-zaandam-2.jpg",
      "/images/project-zaandam-3.jpg",
      "/images/project-zaandam-4.jpg",
    ],
  },
  {
    slug: "monumentale-lattenstructuur",
    title: "Monumentaal project met lattenstructuur",
    location: "Zaanstreek",
    year: "2024",
    category: "Renovatie",
    products: ["Kozijnen", "Deuren"],
    summary:
      "Karakteristieke woning met houtlook kozijnen en strakke latten-detaillering in antraciet.",
    description:
      "Deze Zaanse woning kreeg een complete gevelrenovatie waarbij we het oude karakter hebben bewaard. Kozijnen in houtlook, boeidelen in antraciet trespa en verticale lattenstructuur zorgen voor een warme maar strakke uitstraling. Alles volledig onderhoudsvrij.",
    cover: "/images/project-latten-5.webp",
    gallery: [
      "/images/project-latten-4.webp",
      "/images/project-latten-5.webp",
      "/images/project-latten-8.webp",
      "/images/project-latten-8.jpg",
    ],
  },
  {
    slug: "showcase-leveringen",
    title: "Showcase leveringen & montage",
    location: "Heel Nederland",
    year: "2024",
    category: "Levering",
    products: ["Kozijnen", "Deuren", "Schuifpuien"],
    summary:
      "Een greep uit onze leveringen op locatie — van kleine bijzetdeuren tot volledige gevelpakketten.",
    description:
      "Bij Rebu komt elk kozijn rechtstreeks uit de fabriek, wordt zorgvuldig ingepakt en op locatie geleverd. Deze showcase laat zien hoe onze leveringen eruit zien: kozijnen per stuk beschermd, eerlijke labels, en onze monteurs die alles direct klaarzetten voor plaatsing.",
    cover: "/images/showcase-leveringen-3.webp",
    gallery: [
      "/images/showcase-leveringen-3.webp",
      "/images/showcase-leveringen-6.webp",
      "/images/showcase-leveringen-9.webp",
      "/images/project-1-7.jpg",
    ],
  },
  {
    slug: "villa-landsmeer",
    title: "Villa renovatie Landsmeer",
    location: "Landsmeer",
    year: "2025",
    category: "Villa",
    products: ["Kozijnen", "Schuifpuien"],
    summary:
      "Villa voorzien van slanke kunststof kozijnen met groot glasoppervlak en hefschuifpui.",
    description:
      "Deze villa in Landsmeer wilde meer licht en uitzicht. We hebben alle kozijnen vervangen door slanke profielen met HR++ glas en een grote hefschuifpui in de tuingevel. Het resultaat: een ruimere beleving, meer licht en een flinke energiebesparing.",
    cover: "/images/project-landsmeer.jpg",
    gallery: [
      "/images/project-landsmeer.jpg",
      "/images/villa-kozijn.jpg",
      "/images/kleur-rebu.jpg",
    ],
  },
  {
    slug: "gevelrenovatie-krommenie",
    title: "Gevelrenovatie Krommenie",
    location: "Krommenie",
    year: "2024",
    category: "Renovatie",
    products: ["Kozijnen", "Deuren"],
    summary:
      "Klassieke woning volledig voorzien van nieuwe kunststof kozijnen en een voordeur met zijlicht.",
    description:
      "Klassieke woning in Krommenie waar we de hele gevel hebben aangepakt. Van hoek tot hoek nieuwe kozijnen in wit, een voordeur met zijlicht voor extra daglicht in de hal, en HR++ beglazing rondom. De bewoners merken direct verschil — stiller, warmer en geen schilderwerk meer.",
    cover: "/images/project-krommenie.jpg",
    gallery: [
      "/images/project-krommenie.jpg",
      "/images/project-zaandam-2.jpg",
      "/images/project-zaandam-3.jpg",
    ],
  },
  {
    slug: "woning-mijdrecht",
    title: "Woning Mijdrecht",
    location: "Mijdrecht",
    year: "2024",
    category: "Renovatie",
    products: ["Kozijnen", "Schuifpuien"],
    summary:
      "Eengezinswoning met nieuwe kozijnen in houtlook en een ruime schuifpui naar de tuin.",
    description:
      "Voor deze woning in Mijdrecht kozen de bewoners voor houtlook kozijnen aan de buitenzijde en wit aan de binnenzijde — het beste van twee werelden. De achtergevel kreeg een brede schuifpui zodat tuin en woonkamer één geheel worden.",
    cover: "/images/project-mijdrecht.webp",
    gallery: [
      "/images/project-mijdrecht.webp",
      "/images/project-zaandam-4.jpg",
      "/images/villa-kozijn.jpg",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
